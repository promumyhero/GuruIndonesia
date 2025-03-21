import Link from "next/link";
import { Button } from "@/components/ui/button";
import { prisma } from "../lib/prisma";
import { getCurrentUser } from "../lib/auth";
import { formatDate } from "../lib/utils";
import { FileText, Plus, Eye, Pencil, Download, Search, Filter } from "lucide-react";
import { Breadcrumb } from "@/components/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default async function ReportCardsPage({
  searchParams,
}: {
  searchParams?: {
    search?: string;
    semester?: string;
    academicYear?: string;
  };
}) {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }
  
  // Menggunakan React.use untuk unwrap Promise dari searchParams di Next.js 15
  const params = searchParams ? await searchParams : {};
  const search = params.search || "";
  const semesterFilter = params.semester || "";
  const academicYearFilter = params.academicYear || "";
  
  // Ambil semua tahun akademik dan semester yang tersedia
  const academicYears = await prisma.reportCard.findMany({
    where: { 
      student: {
        teacherId: user.id
      } 
    },
    select: { academicYear: true },
    distinct: ['academicYear'],
    orderBy: { academicYear: 'desc' }
  });
  
  const semesters = await prisma.reportCard.findMany({
    where: { 
      student: {
        teacherId: user.id
      } 
    },
    select: { semester: true },
    distinct: ['semester'],
    orderBy: { semester: 'asc' }
  });
  
  // Buat kondisi filter
  const whereCondition: any = { 
    student: {
      teacherId: user.id
    } 
  };
  
  if (search) {
    whereCondition.student = {
      ...whereCondition.student,
      name: { contains: search, mode: 'insensitive' }
    };
  }
  
  if (semesterFilter) {
    whereCondition.semester = parseInt(semesterFilter);
  }
  
  if (academicYearFilter) {
    whereCondition.academicYear = academicYearFilter;
  }
  
  // Ambil data rapor beserta relasi ke siswa
  const reportCards = await prisma.reportCard.findMany({
    where: whereCondition,
    include: {
      student: true,
    },
    orderBy: { createdAt: "desc" },
  });
  
  return (
    <div className="container p-4 md:p-6">
      <Breadcrumb items={[{ label: "Rapor", href: "/report-cards" }]} />
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold">Daftar Rapor</h1>
        </div>
        <Button asChild>
          <Link href="/report-cards/new" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>Buat Rapor Baru</span>
          </Link>
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Filter Rapor</CardTitle>
          <CardDescription>Cari dan filter data rapor siswa</CardDescription>
        </CardHeader>
        <CardContent>
          <form action="/report-cards" method="GET">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  name="search"
                  placeholder="Cari nama siswa"
                  defaultValue={search}
                  className="flex-1"
                />
              </div>
              
              <div>
                <Select name="semester" defaultValue={semesterFilter || "all"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Semester</SelectItem>
                    {semesters.map((s, index) => (
                      <SelectItem key={index} value={s.semester.toString()}>
                        Semester {s.semester}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Select name="academicYear" defaultValue={academicYearFilter || "all"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Tahun Akademik" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Tahun</SelectItem>
                    {academicYears.map((year, index) => (
                      <SelectItem key={index} value={year.academicYear}>
                        {year.academicYear}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="md:col-span-3 flex justify-end">
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
        {reportCards.length > 0 ? (
          reportCards.map((reportCard) => (
            <div key={reportCard.id} className="bg-card rounded-lg border shadow-sm p-4">
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg">{reportCard.student.name}</h3>
                  <div className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                    {reportCard.student.class}
                  </div>
                </div>
                <div className="flex gap-2 text-sm text-muted-foreground">
                  <span>Semester {reportCard.semester}</span>
                  <span>•</span>
                  <span>{reportCard.academicYear}</span>
                </div>
                <p className="text-xs text-muted-foreground">Dibuat: {formatDate(reportCard.createdAt)}</p>
                <div className="flex items-center gap-2 pt-2">
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href={`/report-cards/${reportCard.id}`} className="flex items-center justify-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>Lihat</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href={`/report-cards/${reportCard.id}/edit`} className="flex items-center justify-center gap-1">
                      <Pencil className="h-3 w-3" />
                      <span>Edit</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href={`/report-cards/${reportCard.id}/download`} className="flex items-center justify-center gap-1">
                      <Download className="h-3 w-3" />
                      <span>Unduh</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-card rounded-lg border shadow-sm p-4 text-center text-muted-foreground">
            Belum ada data rapor
          </div>
        )}
      </div>
      
      {/* Tabel untuk tampilan desktop */}
      <div className="rounded-md border shadow-sm hidden md:block">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="h-12 px-4 text-left align-middle font-medium">Nama Siswa</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Kelas</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Semester</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Tahun Akademik</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Tanggal Dibuat</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {reportCards.length > 0 ? (
                reportCards.map((reportCard) => (
                  <tr
                    key={reportCard.id}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    <td className="p-4 align-middle font-medium">{reportCard.student.name}</td>
                    <td className="p-4 align-middle">
                      <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                        {reportCard.student.class}
                      </span>
                    </td>
                    <td className="p-4 align-middle">Semester {reportCard.semester}</td>
                    <td className="p-4 align-middle">{reportCard.academicYear}</td>
                    <td className="p-4 align-middle text-muted-foreground">{formatDate(reportCard.createdAt)}</td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/report-cards/${reportCard.id}`} className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>Lihat</span>
                          </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/report-cards/${reportCard.id}/edit`} className="flex items-center gap-1">
                            <Pencil className="h-3 w-3" />
                            <span>Edit</span>
                          </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/report-cards/${reportCard.id}/download`} className="flex items-center gap-1">
                            <Download className="h-3 w-3" />
                            <span>Unduh</span>
                          </Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-muted-foreground">
                    Belum ada data rapor
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
