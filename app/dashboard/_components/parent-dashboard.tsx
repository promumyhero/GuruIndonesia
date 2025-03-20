import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, FileText, Bell, BookOpen, ClipboardList } from "lucide-react";
import { prisma } from "@/app/lib/prisma";

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
            take: 10,
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
                <div className="flex items-center justify-center h-40">
                  <div className="text-center">
                    <GraduationCap className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">Belum ada anak terdaftar</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Hubungi pihak sekolah untuk mendaftarkan anak Anda
                    </p>
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
