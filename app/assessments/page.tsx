import Link from "next/link";
import { Button } from "@/components/ui/button";
import { prisma } from "../lib/prisma";
import { getCurrentUser } from "../lib/auth";
import { formatDate } from "../lib/utils";
import { ClipboardList, Plus, Eye, Pencil, Search, Filter } from "lucide-react";
import { Breadcrumb } from "@/components/breadcrumb";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { getAssessmentTypes, getAssessmentTypeLabel } from "@/app/lib/utils";

export default async function AssessmentsPage({
  searchParams,
}: {
  searchParams?: {
    search?: string;
    type?: string;
    subject?: string;
    date?: string;
  };
}) {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }
  
  // Menggunakan React.use untuk unwrap Promise dari searchParams di Next.js 15
  const params = searchParams ? await searchParams : {};
  const search = params.search || "";
  const typeFilter = params.type === "all" ? "" : params.type || "";
  const subjectFilter = params.subject === "all" ? "" : params.subject || "";
  const dateFilter = params.date || "";
  
  // Ambil data penilaian beserta relasi ke siswa dan mata pelajaran
  const assessments = await prisma.assessment.findMany({
    where: { 
      teacherId: user.id,
      ...(search ? {
        OR: [
          { student: { name: { contains: search, mode: 'insensitive' } } },
          { subject: { name: { contains: search, mode: 'insensitive' } } },
        ],
      } : {}),
      ...(typeFilter ? { type: typeFilter as any } : {}),
      ...(subjectFilter ? { subject: { name: { equals: subjectFilter } } } : {}),
      ...(dateFilter ? { 
        assessmentDate: {
          gte: new Date(`${dateFilter}T00:00:00Z`),
          lt: new Date(`${dateFilter}T23:59:59Z`),
        } 
      } : {}),
    },
    include: {
      student: true,
      subject: true
    },
    orderBy: {
      createdAt: 'desc'
    },
  });
  
  // Dapatkan daftar unik mata pelajaran untuk filter
  const subjects = await prisma.subject.findMany({
    where: {
      teacherId: user.id
    },
    orderBy: {
      name: "asc"
    }
  });
  
  return (
    <div className="container p-4 md:p-6">
      <Breadcrumb items={[{ label: "Penilaian", href: "/assessments" }]} />
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold">Daftar Penilaian</h1>
        </div>
        
        <Button asChild>
          <Link href="/assessments/create">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Penilaian
          </Link>
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Filter Penilaian</CardTitle>
          <CardDescription>Cari dan filter data penilaian</CardDescription>
        </CardHeader>
        <CardContent>
          <form action="/assessments" className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                name="search"
                placeholder="Cari nama siswa atau mapel"
                defaultValue={search}
                className="flex-1"
              />
            </div>
            
            <div>
              <Select name="type" defaultValue={typeFilter || "all"}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipe Penilaian" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tipe</SelectItem>
                  {getAssessmentTypes().map((type) => (
                    <SelectItem key={type} value={type}>
                      {getAssessmentTypeLabel(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select name="subject" defaultValue={subjectFilter || "all"}>
                <SelectTrigger>
                  <SelectValue placeholder="Mata Pelajaran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Mapel</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.name}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Input
                type="date"
                name="date"
                defaultValue={dateFilter}
                className="w-full"
              />
            </div>
            
            <div className="md:col-span-4 flex justify-end">
              <Button type="submit" className="w-full md:w-auto">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      {assessments.length === 0 ? (
        <div className="bg-muted rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium mb-2">Belum ada data penilaian</h3>
          <p className="text-muted-foreground mb-4">
            Tambahkan penilaian baru untuk melihat data di sini.
          </p>
          <Button asChild>
            <Link href="/assessments/create">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Penilaian
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {assessments.map((assessment) => (
            <div key={assessment.id} className="bg-card rounded-lg border shadow-sm p-4">
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg">{assessment.student?.name || "N/A"}</h3>
                  <div className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                    Nilai: {assessment.value}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Mata Pelajaran: {assessment.subject?.name || "N/A"}
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  <span className="px-2 py-0.5 bg-secondary/50 text-secondary-foreground text-xs rounded-full">
                    {getAssessmentTypeLabel(assessment.type)}
                  </span>
                  <span className="px-2 py-0.5 bg-secondary/50 text-secondary-foreground text-xs rounded-full">
                    Semester {assessment.semester}
                  </span>
                  <span className="px-2 py-0.5 bg-secondary/50 text-secondary-foreground text-xs rounded-full">
                    TA {assessment.academicYear}
                  </span>
                  <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">
                    {assessment.assessmentDate ? formatDate(assessment.assessmentDate) : "N/A"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Dibuat: {formatDate(assessment.createdAt)}
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href={`/assessments/${assessment.id}`} className="flex items-center justify-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>Lihat</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href={`/assessments/${assessment.id}/edit`} className="flex items-center justify-center gap-1">
                      <Pencil className="h-3 w-3" />
                      <span>Edit</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {assessments.length > 0 && (
        <div className="rounded-md border shadow-sm hidden md:block">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="h-12 px-4 text-left align-middle font-medium">Siswa</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Mata Pelajaran</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Nilai</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Tipe</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Tanggal</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Semester</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Tahun Ajaran</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {assessments.map((assessment) => (
                  <tr
                    key={assessment.id}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    <td className="p-4 align-middle">
                      {assessment.student?.name || "N/A"}
                    </td>
                    <td className="p-4 align-middle">
                      {assessment.subject?.name || "N/A"}
                    </td>
                    <td className="p-4 align-middle">
                      <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                        {assessment.value}
                      </span>
                    </td>
                    <td className="p-4 align-middle">
                      <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-full">
                        {getAssessmentTypeLabel(assessment.type)}
                      </span>
                    </td>
                    <td className="p-4 align-middle">
                      {assessment.assessmentDate ? formatDate(assessment.assessmentDate) : "N/A"}
                    </td>
                    <td className="p-4 align-middle">
                      Semester {assessment.semester}
                    </td>
                    <td className="p-4 align-middle">
                      {assessment.academicYear}
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/assessments/${assessment.id}`} className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>Lihat</span>
                          </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/assessments/${assessment.id}/edit`} className="flex items-center gap-1">
                            <Pencil className="h-3 w-3" />
                            <span>Edit</span>
                          </Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
