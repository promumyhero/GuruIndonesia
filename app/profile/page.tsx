import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TeacherSchoolInfo } from "./_components/teacher-school-info";
import { School } from "@prisma/client";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/auth/login");
  }
  
  // Ambil data sekolah jika user adalah guru
  let schools: School[] = [];
  if (user.role === "TEACHER") {
    schools = await prisma.school.findMany({
      orderBy: {
        name: "asc",
      },
    });
  }
  
  // Ambil data parent jika user adalah parent
  let parentData = null;
  if (user.role === "PARENT") {
    parentData = await prisma.parent.findUnique({
      where: { userId: user.id },
      include: {
        students: {
          select: {
            id: true,
            name: true,
            nisn: true,
            class: true,
          },
        },
      },
    });
  }
  
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Profil Pengguna</h1>
      
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="info">Informasi Umum</TabsTrigger>
          {user.role === "TEACHER" && (
            <TabsTrigger value="school">Sekolah</TabsTrigger>
          )}
          {user.role === "PARENT" && (
            <TabsTrigger value="students">Siswa</TabsTrigger>
          )}
          <TabsTrigger value="security">Keamanan</TabsTrigger>
        </TabsList>
        
        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Pengguna</CardTitle>
              <CardDescription>
                Detail informasi akun Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nama</p>
                  <p>{user.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p>{user.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Peran</p>
                  <p>{user.role}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Bergabung Sejak</p>
                  <p>{new Date(user.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {user.role === "TEACHER" && (
          <TabsContent value="school">
            <TeacherSchoolInfo 
              userId={user.id} 
              schoolId={user.schoolId} 
              schools={schools} 
            />
          </TabsContent>
        )}
        
        {user.role === "PARENT" && (
          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle>Siswa Terdaftar</CardTitle>
                <CardDescription>
                  Daftar siswa yang terhubung dengan akun Anda
                </CardDescription>
              </CardHeader>
              <CardContent>
                {parentData?.students && parentData.students.length > 0 ? (
                  <div className="space-y-4">
                    {parentData.students.map((student) => (
                      <div key={student.id} className="rounded-lg border p-4">
                        <h3 className="font-semibold">{student.name}</h3>
                        <p className="text-sm text-muted-foreground">NISN: {student.nisn}</p>
                        <p className="text-sm text-muted-foreground">Kelas: {student.class}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    Belum ada siswa yang terhubung dengan akun Anda.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Keamanan Akun</CardTitle>
              <CardDescription>
                Kelola keamanan akun Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Fitur untuk mengubah password akan segera tersedia.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
