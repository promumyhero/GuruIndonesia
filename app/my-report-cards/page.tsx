import { getCurrentUser } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function MyReportCardsPage() {
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
            <CardTitle>Rapor Saya</CardTitle>
            <CardDescription>
              Data siswa tidak ditemukan. Silakan hubungi administrator.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }
  
  // Get all report cards for the student
  const reportCards = await prisma.reportCard.findMany({
    where: { 
      studentId: student.id,
    },
    orderBy: [
      { academicYear: "desc" },
      { semester: "desc" },
      { updatedAt: "desc" }
    ],
  });
  
  // Group report cards by academic year
  const groupedReportCards: Record<string, typeof reportCards> = {};
  
  reportCards.forEach(report => {
    if (!groupedReportCards[report.academicYear]) {
      groupedReportCards[report.academicYear] = [];
    }
    
    groupedReportCards[report.academicYear].push(report);
  });
  
  // Sort academic years
  const sortedYears = Object.keys(groupedReportCards).sort().reverse();
  
  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Rapor Saya</h1>
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
            <FileText className="h-5 w-5 text-primary" />
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
            <CardTitle>Belum Ada Rapor</CardTitle>
            <CardDescription>
              Belum ada data rapor yang tersedia saat ini.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        sortedYears.map((year) => {
          const semesters = groupedReportCards[year].map((report) => report.semester).sort((a, b) => parseInt(b.toString()) - parseInt(a.toString()));
          return (
            <div key={year} className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Tahun Ajaran {year}</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {semesters.map((semester) => (
                  <Card key={`${year}-${semester}`} className="shadow-sm">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Semester {semester}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        {groupedReportCards[year].filter((reportCard) => reportCard.semester === semester).map((reportCard) => (
                          <div key={reportCard.id} className="border rounded-md p-4 hover:bg-muted/50 transition-colors">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                              <div className="font-medium">Rapor Semester {reportCard.semester}</div>
                              <div className="text-sm text-muted-foreground">
                                Diperbarui: {new Date(reportCard.updatedAt).toLocaleDateString("id-ID")}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <Button asChild size="sm" variant="outline" className="gap-1">
                                <Link href={`/my-report-cards/${reportCard.id}`}>
                                  <FileText className="h-4 w-4 mr-1" />
                                  Lihat Detail Rapor
                                </Link>
                              </Button>
                            </div>
                            <div className="space-y-4">
                              <div>
                                <p className="text-sm font-medium">Nilai Akhir:</p>
                                <p className="text-2xl font-bold">{reportCard.finalGrade}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Peringkat Kelas:</p>
                                <p className="text-lg">{reportCard.classRank ? reportCard.classRank : "-"}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Komentar Guru:</p>
                                <p className="text-sm mt-1">{reportCard.teacherComment ? reportCard.teacherComment : reportCard.description}</p>
                              </div>
                            </div>
                          </div>
                        ))}
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
