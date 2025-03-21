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
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
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
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Nilai Saya</h1>
        <Link
          href="/dashboard"
          className="text-sm text-primary hover:underline flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="m15 18-6-6 6-6"/></svg>
          Kembali ke Dashboard
        </Link>
      </div>

      <Card className="mb-6 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            <CardTitle>Informasi Siswa</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nama</p>
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

      {sortedYears.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Belum Ada Nilai</CardTitle>
            <CardDescription>
              Belum ada data nilai yang tersedia saat ini.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        sortedYears.map((year) => {
          const semesters = Object.keys(groupedAssessments[year]).sort();
          return (
            <div key={year} className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Tahun Ajaran {year}</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {semesters.map((semester) => (
                  <Card key={`${year}-${semester}`} className="shadow-sm">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Semester {semester}</CardTitle>
                        <span className="text-sm text-muted-foreground">
                          {groupedAssessments[year][semester].length} nilai
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="rounded-md border overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-muted/50">
                                <th className="h-10 px-4 text-left font-medium">Mata Pelajaran</th>
                                <th className="h-10 px-4 text-left font-medium">Tipe</th>
                                <th className="h-10 px-4 text-left font-medium">Nilai</th>
                                <th className="h-10 px-4 text-left font-medium">Tanggal</th>
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
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
