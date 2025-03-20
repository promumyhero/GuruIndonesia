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
      <div className="container py-10">
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
    <div className="container py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Rapor Saya</h1>
        <Link href="/dashboard" className="text-sm text-primary hover:underline">
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
        sortedYears.map(year => (
          <div key={year} className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Tahun Ajaran {year}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groupedReportCards[year]
                .sort((a, b) => parseInt(b.semester.toString()) - parseInt(a.semester.toString()))
                .map(report => (
                  <Card key={report.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Semester {report.semester}</CardTitle>
                      <CardDescription>
                        Diperbarui: {new Date(report.updatedAt).toLocaleDateString("id-ID")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium">Nilai Akhir:</p>
                          <p className="text-2xl font-bold">{report.finalGrade}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium">Peringkat Kelas:</p>
                          <p className="text-lg">{report.classRank ? report.classRank : "-"}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium">Komentar Guru:</p>
                          <p className="text-sm mt-1">{report.teacherComment ? report.teacherComment : report.description}</p>
                        </div>
                        
                        <div className="pt-2">
                          <Button variant="outline" className="w-full" asChild>
                            <Link href={`/my-report-cards/${report.id}`}>
                              <FileText className="h-4 w-4 mr-2" />
                              Lihat Detail Rapor
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        ))
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-1">Belum Ada Rapor</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Anda belum memiliki rapor yang tercatat dalam sistem. Rapor akan muncul setelah guru menginput nilai akhir semester Anda.
          </p>
        </div>
      )}
    </div>
  );
}
