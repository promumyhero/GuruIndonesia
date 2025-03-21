import { getCurrentUser } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function MySubjectsPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/auth/login");
  }
  
  if (user.role !== "STUDENT") {
    redirect("/dashboard");
  }
  
  // Get student data
  const student = await prisma.student.findFirst({
    where: { 
      name: user.name
    },
    include: {
      teacher: true
    }
  });
  
  if (!student) {
    return (
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Mata Pelajaran Saya</CardTitle>
            <CardDescription>
              Data siswa tidak ditemukan. Silakan hubungi administrator.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }
  
  // Get all subjects for the student's class
  const subjects = await prisma.subject.findMany({
    where: {
      OR: [
        // Mata pelajaran yang memiliki assessment untuk siswa ini
        {
          assessments: {
            some: {
              studentId: student.id
            }
          }
        },
        // Mata pelajaran yang diajarkan oleh guru wali kelas siswa
        {
          teacherId: student.teacher?.id || ''
        }
      ]
    },
    include: {
      teacher: true
    },
    orderBy: {
      name: "asc"
    }
  });
  
  // Get student's assessments for each subject
  const assessments = await prisma.assessment.findMany({
    where: {
      studentId: student.id
    },
    include: {
      subject: true
    }
  });
  
  // Group assessments by subject
  const subjectAssessments: Record<string, any[]> = {};
  
  assessments.forEach(assessment => {
    if (!subjectAssessments[assessment.subjectId]) {
      subjectAssessments[assessment.subjectId] = [];
    }
    
    subjectAssessments[assessment.subjectId].push(assessment);
  });
  
  // Calculate average score for each subject
  const subjectAverages: Record<string, number> = {};
  
  Object.entries(subjectAssessments).forEach(([subjectId, assessments]) => {
    const total = assessments.reduce((sum, assessment) => sum + assessment.value, 0);
    subjectAverages[subjectId] = total / assessments.length;
  });
  
  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Mata Pelajaran Saya</h1>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Kembali ke Dashboard
        </Link>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <CardTitle>Informasi Siswa</CardTitle>
              <CardDescription>Data siswa dan kelas</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nama Siswa</p>
              <p className="font-medium">{student.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">NISN</p>
              <p className="font-medium">{student.nisn}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Kelas</p>
              <p className="font-medium">{student.class}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Wali Kelas</p>
              <p className="font-medium">{student.teacher?.name || "-"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-semibold mb-4">Daftar Mata Pelajaran</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Belum Ada Mata Pelajaran</CardTitle>
                <CardDescription>
                  Belum ada data mata pelajaran yang tersedia untuk kelas Anda.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            subjects.map((subject) => {
              const hasAssessments = !!subjectAssessments[subject.id];
              const averageScore = hasAssessments ? subjectAverages[subject.id] : null;
              
              return (
                <Card key={subject.id} className="overflow-hidden shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{subject.name}</CardTitle>
                    </div>
                    <CardDescription>
                      Kode: {subject.code}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Guru Pengajar</p>
                        <p className="font-medium">{subject.teacher?.name || "-"}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Nilai Rata-rata</p>
                        <p className="text-2xl font-bold">
                          {averageScore !== null ? Math.round(averageScore) : "-"}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Jumlah Penilaian</p>
                        <p className="font-medium">
                          {hasAssessments ? subjectAssessments[subject.id].length : 0}
                        </p>
                      </div>
                      
                      <div className="pt-2">
                        <Link 
                          href={`/students/${student.id}/progress?subject=${subject.name}`}
                          className="text-sm text-primary hover:underline"
                        >
                          Lihat Perkembangan Nilai
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
