import Link from "next/link";
import { Button } from "@/components/ui/button";
import { prisma } from "../lib/prisma";
import { getCurrentUser } from "../lib/auth";
import { formatDate } from "../lib/utils";
import { UsersRound, Plus, Eye, Pencil, Search, Filter } from "lucide-react";
import { Breadcrumb } from "@/components/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams?: {
    search?: string;
    class?: string;
  };
}) {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }
  
  // Menggunakan React.use untuk unwrap Promise dari searchParams di Next.js 15
  const params = searchParams ? await searchParams : {};
  const search = params.search || "";
  const classFilter = params.class || "";
  
  // Ambil semua kelas yang dimiliki siswa
  const classes = await prisma.student.findMany({
    where: { teacherId: user.id },
    select: { class: true },
    distinct: ['class'],
    orderBy: { class: 'asc' }
  });
  
  // Buat kondisi filter
  const whereCondition: any = { teacherId: user.id };
  
  if (search) {
    whereCondition.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { nisn: { contains: search, mode: 'insensitive' } }
    ];
  }
  
  if (classFilter) {
    whereCondition.class = classFilter;
  }
  
  const students = await prisma.student.findMany({
    where: whereCondition,
    orderBy: { name: "asc" },
  });
  
  return (
    <div className="container p-4 md:p-6">
      <Breadcrumb items={[{ label: "Siswa", href: "/students" }]} />
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-2">
          <UsersRound className="h-6 w-6 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold">Daftar Siswa</h1>
        </div>
        <Button asChild>
          <Link href="/students/new" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>Tambah Siswa</span>
          </Link>
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Filter Siswa</CardTitle>
          <CardDescription>Cari dan filter data siswa</CardDescription>
        </CardHeader>
        <CardContent>
          <form action="/students" method="GET">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  name="search"
                  placeholder="Cari nama atau NISN"
                  defaultValue={search}
                  className="flex-1"
                />
              </div>
              
              <div>
                <Select name="class" defaultValue={classFilter || "all"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kelas</SelectItem>
                    {classes.map((c, index) => (
                      <SelectItem key={index} value={c.class}>
                        {c.class}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end">
                <Button type="reset" variant="outline" className="mr-2">
                  Reset
                </Button>
                <Button type="submit" className="w-full md:w-auto">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      
      {/* Card untuk tampilan mobile */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {students.length > 0 ? (
          students.map((student) => (
            <div key={student.id} className="bg-card rounded-lg border shadow-sm p-4">
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg">{student.name}</h3>
                  <div className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                    {student.class}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">NISN: {student.nisn}</p>
                <p className="text-xs text-muted-foreground">Dibuat: {formatDate(student.createdAt)}</p>
                <div className="flex items-center gap-2 pt-2">
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href={`/students/${student.id}`} className="flex items-center justify-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>Lihat</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href={`/students/${student.id}/edit`} className="flex items-center justify-center gap-1">
                      <Pencil className="h-3 w-3" />
                      <span>Edit</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-card rounded-lg border shadow-sm p-4 text-center text-muted-foreground">
            Belum ada data siswa
          </div>
        )}
      </div>
      
      {/* Tabel untuk tampilan desktop */}
      <div className="rounded-md border shadow-sm hidden md:block">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="h-12 px-4 text-left align-middle font-medium">Nama</th>
                <th className="h-12 px-4 text-left align-middle font-medium">NISN</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Kelas</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Tanggal Dibuat</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {students.length > 0 ? (
                students.map((student) => (
                  <tr
                    key={student.id}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    <td className="p-4 align-middle font-medium">{student.name}</td>
                    <td className="p-4 align-middle">{student.nisn}</td>
                    <td className="p-4 align-middle">
                      <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                        {student.class}
                      </span>
                    </td>
                    <td className="p-4 align-middle text-muted-foreground">{formatDate(student.createdAt)}</td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/students/${student.id}`} className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>Lihat</span>
                          </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/students/${student.id}/edit`} className="flex items-center gap-1">
                            <Pencil className="h-3 w-3" />
                            <span>Edit</span>
                          </Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-muted-foreground">
                    Belum ada data siswa
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
