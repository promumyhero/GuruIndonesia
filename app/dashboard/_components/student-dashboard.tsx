import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, FileText, Bell, BookOpen, GraduationCap } from "lucide-react";
import { prisma } from "@/app/lib/prisma";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { SubjectBarChart, DailyProgressChart } from "./charts/student-charts";

interface StudentDashboardProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export async function StudentDashboard({ user }: StudentDashboardProps) {
  // Get student data
  let student;
  
  if (user.role === "STUDENT") {
    // For student users, find the student record directly
    student = await prisma.student.findFirst({
      where: { 
        name: user.name // Assuming the student name matches the user name
      },
      include: {
        teacher: true
      }
    });
  } else if (user.role === "PARENT") {
    // For parent users, find the student through the parent relationship
    student = await prisma.student.findFirst({
      where: { 
        parents: {
          some: {
            userId: user.id
          }
        }
      },
      include: {
        teacher: true
      }
    });
  }
  
  // Get recent assessments
  const recentAssessments = await prisma.assessment.findMany({
    where: { 
      studentId: student?.id,
    },
    include: { 
      subject: true,
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });
  
  // Get recent report cards
  const recentReportCards = await prisma.reportCard.findMany({
    where: { 
      studentId: student?.id,
    },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });

  // Get subjects
  const subjects = await prisma.subject.findMany({
    where: {
      assessments: {
        some: {
          studentId: student?.id
        }
      }
    },
    take: 5,
  });

  // Get all assessments for charts
  const allAssessments = await prisma.assessment.findMany({
    where: { 
      studentId: student?.id,
    },
    include: { 
      subject: true,
    },
    orderBy: { createdAt: "desc" },
  });
  
  // Prepare data for subject chart
  const prepareSubjectChartData = () => {
    if (!allAssessments || allAssessments.length === 0) return [];

    // Group assessments by subject
    const subjectGroups = allAssessments.reduce((acc, assessment) => {
      const subjectName = assessment.subject.name;
      if (!acc[subjectName]) {
        acc[subjectName] = [];
      }
      acc[subjectName].push(assessment);
      return acc;
    }, {} as Record<string, any[]>);

    // Calculate average score per subject
    return Object.entries(subjectGroups).map(([subject, assessments]) => {
      const totalScore = assessments.reduce((sum, assessment) => sum + assessment.value, 0);
      const averageScore = totalScore / assessments.length;
      
      return {
        subject,
        nilai: Math.round(averageScore * 10) / 10, // Round to 1 decimal place
      };
    });
  };

  // Prepare data for daily progress chart
  const prepareDailyProgressData = () => {
    if (!allAssessments || allAssessments.length === 0) return [];

    // Group assessments by date
    const assessmentsByDate = allAssessments.reduce((acc, assessment) => {
      const date = format(new Date(assessment.assessmentDate), 'dd MMM', { locale: id });
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(assessment);
      return acc;
    }, {} as Record<string, any[]>);

    // Calculate average score per date
    return Object.entries(assessmentsByDate).map(([date, assessments]) => {
      const totalScore = assessments.reduce((sum, assessment) => sum + assessment.value, 0);
      const averageScore = totalScore / assessments.length;
      
      return {
        tanggal: date,
        nilai: Math.round(averageScore * 10) / 10, // Round to 1 decimal place
      };
    }).slice(-7); // Get last 7 days
  };
  
  return (
    <>
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Nilai Terbaru</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentAssessments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <Link href="/my-assessments" className="text-primary hover:underline">
                Lihat semua nilai
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
            <div className="text-2xl font-bold">{recentReportCards.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <Link href="/my-report-cards" className="text-primary hover:underline">
                Lihat semua rapor
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
            <div className="text-2xl font-bold">{subjects.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <Link href="/my-subjects" className="text-primary hover:underline">
                Lihat semua mata pelajaran
              </Link>
            </p>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Notifikasi</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">
              <Link href="/notifications" className="text-primary hover:underline">
                Lihat semua notifikasi
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Siswa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium">Nama:</span>
                  <span className="text-sm">{student?.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium">NISN:</span>
                  <span className="text-sm">{student?.nisn}</span>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium">Kelas:</span>
                  <span className="text-sm">{student?.class}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium">Wali Kelas:</span>
                  <span className="text-sm">{student?.teacher?.name}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-4 md:gap-6 grid-cols-1">
        <Card className="col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold">Perkembangan Nilai</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium mb-2">Nilai Per Mata Pelajaran</h3>
                <SubjectBarChart data={prepareSubjectChartData()} />
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Perkembangan Nilai Harian</h3>
                <DailyProgressChart data={prepareDailyProgressData()} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8 grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold">Nilai Terbaru</CardTitle>
              <Link href="/my-assessments" className="text-sm text-primary hover:underline">
                Lihat semua
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAssessments.length > 0 ? (
                recentAssessments.map((assessment) => (
                  <div key={assessment.id} className="flex items-center p-3 rounded-lg border">
                    <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <ClipboardList className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{assessment.subject.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Tipe: {assessment.type}, Semester: {assessment.semester}
                      </p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-sm font-medium">Nilai: {assessment.value}</p>
                      <p className="text-xs text-muted-foreground">{assessment.academicYear}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-40">
                  <div className="text-center">
                    <ClipboardList className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">Belum ada nilai</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold">Rapor Terbaru</CardTitle>
              <Link href="/my-report-cards" className="text-sm text-primary hover:underline">
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
                      <p className="text-sm font-medium leading-none">
                        Semester {report.semester}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Tahun Ajaran {report.academicYear}
                      </p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-sm font-medium">Nilai: {report.finalGrade}</p>
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
      </div>
    </>
  );
}
