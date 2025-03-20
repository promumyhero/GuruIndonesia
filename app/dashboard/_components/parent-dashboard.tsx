import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, FileText, Bell, BookOpen, ClipboardList, UserPlus } from "lucide-react";
import { prisma } from "@/app/lib/prisma";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { SubjectBarChart, DailyProgressChart } from "./charts/student-charts";

interface ParentDashboardProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export async function ParentDashboard({ user }: ParentDashboardProps) {
  // Get parent data
  const parent = await prisma.parent.findUnique({
    where: { userId: user.id },
    include: {
      students: {
        include: {
          teacher: true,
          assessments: {
            include: {
              subject: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          },
          reportCards: {
            orderBy: {
              updatedAt: "desc",
            },
            take: 5,
          },
        },
      },
    },
  });
  
  const studentsCount = parent?.students?.length || 0;
  
  // Get all report cards for parent's children
  const allReportCards = parent?.students?.flatMap(student => student.reportCards) || [];
  
  // Get all assessments for parent's children
  const allAssessments = parent?.students?.flatMap(student => student.assessments) || [];

  // Prepare data for charts
  const prepareSubjectChartData = (studentId: string) => {
    const student = parent?.students?.find(s => s.id === studentId);
    if (!student) return [];

    // Group assessments by subject
    const subjectGroups = student.assessments.reduce((acc, assessment) => {
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
  const prepareDailyProgressData = (studentId: string) => {
    const student = parent?.students?.find(s => s.id === studentId);
    if (!student || student.assessments.length === 0) return [];

    // Group assessments by date
    const assessmentsByDate = student.assessments.reduce((acc, assessment) => {
      const date = format(new Date(assessment.createdAt), 'dd MMM', { locale: id });
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
            <CardTitle className="text-sm font-medium">Jumlah Anak</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <Link href="/children" className="text-primary hover:underline">
                Lihat semua anak
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
            <div className="text-2xl font-bold">{allReportCards.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <Link href="/children/report-cards" className="text-primary hover:underline">
                Lihat semua rapor
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Nilai</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allAssessments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <Link href="/children/assessments" className="text-primary hover:underline">
                Lihat semua nilai
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
      
      {parent?.students && parent.students.length > 0 && (
        <div className="mt-8 grid gap-4 md:gap-6 grid-cols-1">
          <Card className="col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold">Perkembangan Nilai Anak</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={parent.students[0].id} className="w-full">
                <TabsList className="mb-4">
                  {parent.students.map((student) => (
                    <TabsTrigger key={student.id} value={student.id}>
                      {student.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {parent.students.map((student) => (
                  <TabsContent key={student.id} value={student.id} className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium mb-2">Nilai Per Mata Pelajaran</h3>
                        <SubjectBarChart data={prepareSubjectChartData(student.id)} />
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-2">Perkembangan Nilai Harian</h3>
                        <DailyProgressChart data={prepareDailyProgressData(student.id)} />
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">Daftar Nilai Terbaru</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-muted">
                              <th className="p-2 text-left font-medium">Mata Pelajaran</th>
                              <th className="p-2 text-left font-medium">Jenis</th>
                              <th className="p-2 text-left font-medium">Tanggal</th>
                              <th className="p-2 text-left font-medium">Nilai</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {student.assessments.slice(0, 5).map((assessment) => (
                              <tr key={assessment.id} className="hover:bg-muted/50">
                                <td className="p-2">{assessment.subject.name}</td>
                                <td className="p-2">{assessment.type}</td>
                                <td className="p-2">
                                  {format(new Date(assessment.createdAt), 'dd MMM yyyy', { locale: id })}
                                </td>
                                <td className="p-2 font-medium">{assessment.value}</td>
                              </tr>
                            ))}
                            {student.assessments.length === 0 && (
                              <tr>
                                <td colSpan={4} className="p-4 text-center text-muted-foreground">
                                  Belum ada data nilai
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Link 
                          href={`/children/${student.id}/assessments`} 
                          className="text-sm text-primary hover:underline"
                        >
                          Lihat semua nilai
                        </Link>
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
      
      <div className="mt-8 grid gap-4 md:gap-6 grid-cols-1">
        <Card className="col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold">Daftar Anak</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {parent?.students && parent.students.length > 0 ? (
                parent.students.map((student) => (
                  <div key={student.id} className="p-4 rounded-lg border">
                    <div className="flex items-center mb-4">
                      <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <GraduationCap className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">{student.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          NISN: {student.nisn} | Kelas: {student.class}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center">
                          <FileText className="h-4 w-4 mr-1" /> Rapor Terbaru
                        </h4>
                        {student.reportCards.length > 0 ? (
                          <div className="space-y-2">
                            {student.reportCards.slice(0, 2).map((report) => (
                              <div key={report.id} className="flex items-center p-2 rounded border">
                                <div className="flex-1">
                                  <p className="text-sm">Semester {report.semester}, {report.academicYear}</p>
                                </div>
                                <div className="ml-auto">
                                  <p className="text-sm font-medium">Nilai: {report.finalGrade}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Belum ada rapor</p>
                        )}
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center">
                          <ClipboardList className="h-4 w-4 mr-1" /> Nilai Terbaru
                        </h4>
                        {student.assessments.length > 0 ? (
                          <div className="space-y-2">
                            {student.assessments.slice(0, 2).map((assessment) => (
                              <div key={assessment.id} className="flex items-center p-2 rounded border">
                                <div className="flex-1">
                                  <p className="text-sm">{assessment.subject.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {assessment.type}, Semester {assessment.semester}
                                  </p>
                                </div>
                                <div className="ml-auto">
                                  <p className="text-sm font-medium">Nilai: {assessment.value}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Belum ada nilai</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <Link 
                        href={`/children/${student.id}`} 
                        className="text-sm text-primary hover:underline"
                      >
                        Lihat detail
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-60 p-6">
                  <div className="text-center">
                    <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Belum ada anak terdaftar</h3>
                    <p className="text-muted-foreground mb-6">
                      Tambahkan anak Anda untuk melihat perkembangan belajarnya
                    </p>
                    <Link 
                      href="/children/add" 
                      className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Tambah Anak
                    </Link>
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
