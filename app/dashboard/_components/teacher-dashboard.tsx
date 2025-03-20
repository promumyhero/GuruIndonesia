import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersRound, BookOpen, ClipboardList, FileText, Calendar } from "lucide-react";
import { prisma } from "@/app/lib/prisma";

interface TeacherDashboardProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export async function TeacherDashboard({ user }: TeacherDashboardProps) {
  // Get counts for dashboard
  const studentsCount = await prisma.student.count({
    where: { teacherId: user.id },
  });
  
  const subjectsCount = await prisma.subject.count({
    where: { teacherId: user.id },
  });
  
  const assessmentsCount = await prisma.assessment.count({
    where: { teacherId: user.id },
  });
  
  const reportCardsCount = await prisma.reportCard.count({
    where: { teacherId: user.id },
  });
  
  // Get recent report cards
  const recentReportCards = await prisma.reportCard.findMany({
    where: { teacherId: user.id },
    include: { student: true },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });
  
  return (
    <>
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Siswa</CardTitle>
            <UsersRound className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <Link href="/students" className="text-primary hover:underline">
                Lihat semua siswa
              </Link>
            </p>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Mata Pelajaran</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subjectsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <Link href="/subjects" className="text-primary hover:underline">
                Lihat semua mata pelajaran
              </Link>
            </p>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Penilaian</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assessmentsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <Link href="/assessments" className="text-primary hover:underline">
                Lihat semua penilaian
              </Link>
            </p>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Rapor</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportCardsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <Link href="/report-cards" className="text-primary hover:underline">
                Lihat semua rapor
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8 grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold">Rapor Terbaru</CardTitle>
              <Link href="/report-cards" className="text-sm text-primary hover:underline">
                Lihat semua
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentReportCards.length > 0 ? (
                recentReportCards.map((report) => (
                  <div key={report.id} className="flex items-center p-3 rounded-lg border">
                    <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{report.student.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Semester {report.semester}, Tahun Ajaran {report.academicYear}
                      </p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-sm font-medium">Nilai: {report.finalGrade}</p>
                      <p className="text-xs text-muted-foreground">Kelas: {report.student.class}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-40">
                  <div className="text-center">
                    <FileText className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">Belum ada rapor</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Kalender Akademik</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-[300px]">
              <div className="text-center">
                <Calendar className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Kalender akan segera tersedia</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Fitur ini sedang dalam pengembangan
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
