import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, FileText, ClipboardList, UserPlus } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Anak Saya | Guru Indonesia",
  description: "Daftar anak dan informasi akademik",
};

export default async function ChildrenPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/login");
  }
  
  if (user.role !== "PARENT") {
    redirect("/dashboard");
  }
  
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
            take: 5,
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
  
  if (!parent) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-6">Anak Saya</h1>
        <div className="flex items-center justify-center h-60">
          <div className="text-center">
            <GraduationCap className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Data orang tua tidak ditemukan</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Anak Saya</h1>
        <Link href="/children/add">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Tambah Anak
          </Button>
        </Link>
      </div>
      
      {parent.students.length > 0 ? (
        <Tabs defaultValue={parent.students[0].id} className="w-full">
          <TabsList className="mb-6">
            {parent.students.map((student) => (
              <TabsTrigger key={student.id} value={student.id}>
                {student.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {parent.students.map((student) => (
            <TabsContent key={student.id} value={student.id} className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Siswa</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full bg-primary"></div>
                        <span className="font-medium">Nama:</span>
                        <span>{student.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full bg-primary"></div>
                        <span className="font-medium">NISN:</span>
                        <span>{student.nisn}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full bg-primary"></div>
                        <span className="font-medium">Kelas:</span>
                        <span>{student.class}</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full bg-primary"></div>
                        <span className="font-medium">Wali Kelas:</span>
                        <span>{student.teacher?.name || "Belum ditentukan"}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full bg-primary"></div>
                        <span className="font-medium">Tahun Ajaran:</span>
                        <span>{new Date().getFullYear()}/{new Date().getFullYear() + 1}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full bg-primary"></div>
                        <span className="font-medium">Status:</span>
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          Aktif
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Nilai Terbaru</CardTitle>
                      <Link 
                        href={`/children/${student.id}/assessments`} 
                        className="text-sm text-primary hover:underline"
                      >
                        Lihat semua
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {student.assessments.length > 0 ? (
                        student.assessments.map((assessment) => (
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
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(assessment.createdAt), 'dd MMM yyyy', { locale: id })}
                              </p>
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
                
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Rapor Terbaru</CardTitle>
                      <Link 
                        href={`/children/${student.id}/report-cards`} 
                        className="text-sm text-primary hover:underline"
                      >
                        Lihat semua
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {student.reportCards.length > 0 ? (
                        student.reportCards.map((report) => (
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
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(report.updatedAt), 'dd MMM yyyy', { locale: id })}
                              </p>
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
              
              <Card>
                <CardHeader>
                  <CardTitle>Kehadiran</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg border bg-green-50">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">95%</p>
                        <p className="text-sm text-green-700">Hadir</p>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg border bg-yellow-50">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-600">3%</p>
                        <p className="text-sm text-yellow-700">Izin</p>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg border bg-orange-50">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">2%</p>
                        <p className="text-sm text-orange-700">Sakit</p>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg border bg-red-50">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">0%</p>
                        <p className="text-sm text-red-700">Alpha</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="flex items-center justify-center h-60">
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
  );
}
