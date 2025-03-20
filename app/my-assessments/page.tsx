import { getCurrentUser } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ClipboardList } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function MyAssessmentsPage() {
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
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle>Nilai Saya</CardTitle>
            <CardDescription>
              Data siswa tidak ditemukan. Silakan hubungi administrator.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Get all assessments for the student
  const assessments = await prisma.assessment.findMany({
    where: {
      studentId: student.id,
    },
    include: {
      subject: true,
    },
    orderBy: [
      { academicYear: "desc" },
      { semester: "desc" },
      { createdAt: "desc" },
    ],
  });

  // Group assessments by academic year and semester
  const groupedAssessments: Record<
    string,
    Record<string, typeof assessments>
  > = {};

  assessments.forEach((assessment) => {
    if (!groupedAssessments[assessment.academicYear]) {
      groupedAssessments[assessment.academicYear] = {};
    }

    if (!groupedAssessments[assessment.academicYear][assessment.semester]) {
      groupedAssessments[assessment.academicYear][assessment.semester] = [];
    }

    groupedAssessments[assessment.academicYear][assessment.semester].push(
      assessment
    );
  });

  // Sort academic years and semesters
  const sortedYears = Object.keys(groupedAssessments).sort().reverse();

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Nilai Saya</h1>
        <Link
          href="/dashboard"
          className="text-sm text-primary hover:underline"
        >
          Kembali ke Dashboard
        </Link>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Informasi Siswa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Nama:</p>
              <p className="text-sm">{student.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium">NISN:</p>
              <p className="text-sm">{student.nisn}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Kelas:</p>
              <p className="text-sm">{student.class}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Wali Kelas:</p>
              <p className="text-sm">{student.teacher?.name}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {sortedYears.length > 0 ? (
        sortedYears.map((year) => (
          <div key={year} className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Tahun Ajaran {year}</h2>

            {Object.keys(groupedAssessments[year])
              .sort()
              .reverse()
              .map((semester) => (
                <Card key={`${year}-${semester}`} className="mb-4">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Semester {semester}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4">
                              Mata Pelajaran
                            </th>
                            <th className="text-left py-3 px-4">
                              Jenis Penilaian
                            </th>
                            <th className="text-left py-3 px-4">Nilai</th>
                            <th className="text-left py-3 px-4">Tanggal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {groupedAssessments[year][semester].map(
                            (assessment) => (
                              <tr key={assessment.id} className="border-b">
                                <td className="py-3 px-4">
                                  {assessment.subject.name}
                                </td>
                                <td className="py-3 px-4">{assessment.type}</td>
                                <td className="py-3 px-4 font-medium">
                                  {assessment.value}
                                </td>
                                <td className="py-3 px-4 text-muted-foreground">
                                  {new Date(
                                    assessment.createdAt
                                  ).toLocaleDateString("id-ID")}
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        ))
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-1">Belum Ada Nilai</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Anda belum memiliki nilai yang tercatat dalam sistem. Nilai akan
            muncul setelah guru menginput nilai Anda.
          </p>
        </div>
      )}
    </div>
  );
}
