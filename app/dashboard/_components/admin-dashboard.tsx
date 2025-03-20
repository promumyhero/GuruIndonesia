import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { School, User, GraduationCap, Bell } from "lucide-react";
import { prisma } from "@/app/lib/prisma";

export async function AdminDashboard() {
  const schoolsCount = await prisma.school.count();
  const teachersCount = await prisma.user.count({
    where: { role: "TEACHER" },
  });
  const parentsCount = await prisma.user.count({
    where: { role: "PARENT" },
  });
  const studentsCount = await prisma.student.count();
  
  // Get recent users
  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });
  
  return (
    <>
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Sekolah</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schoolsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <Link href="/schools" className="text-primary hover:underline">
                Kelola sekolah
              </Link>
            </p>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Guru</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teachersCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <Link href="/teachers" className="text-primary hover:underline">
                Kelola guru
              </Link>
            </p>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Orang Tua</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{parentsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <Link href="/parents" className="text-primary hover:underline">
                Kelola orang tua
              </Link>
            </p>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Siswa</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <Link href="/students" className="text-primary hover:underline">
                Kelola siswa
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8 grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold">Pengguna Terbaru</CardTitle>
              <Link href="/users" className="text-sm text-primary hover:underline">
                Lihat semua
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.length > 0 ? (
                recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center p-3 rounded-lg border">
                    <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-sm font-medium">{user.role}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-40">
                  <div className="text-center">
                    <User className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">Belum ada pengguna</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Aktivitas Sistem</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-[300px]">
              <div className="text-center">
                <Bell className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Log aktivitas akan segera tersedia</p>
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
