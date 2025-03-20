import Link from "next/link";
import { Button } from "@/components/ui/button";
import { prisma } from "../lib/prisma";
import { getCurrentUser } from "../lib/auth";
import { formatDate } from "../lib/utils";
import { ClipboardList, Plus, Eye, Pencil } from "lucide-react";
import { Breadcrumb } from "@/components/breadcrumb";

// Fungsi untuk mendapatkan label tipe penilaian
function getAssessmentTypeLabel(type: string) {
  switch (type) {
    case 'WEEKLY':
      return 'Mingguan';
    case 'DAILY':
      return 'Harian';
    case 'MIDTERM':
      return 'Tengah Semester';
    case 'FINAL':
      return 'Akhir Semester';
    default:
      return type;
  }
}

export default async function AssessmentsPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }
  
  // Ambil data penilaian beserta relasi ke siswa dan mata pelajaran
  const assessments = await prisma.assessment.findMany({
    where: { 
      teacherId: user.id
    },
    include: {
      student: true,
      subject: true
    },
    orderBy: { createdAt: "desc" },
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
          <Link href="/assessments/new" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>Tambah Penilaian</span>
          </Link>
        </Button>
      </div>
      
      {/* Card untuk tampilan mobile */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {assessments.length > 0 ? (
          assessments.map((assessment) => (
            <div key={assessment.id} className="bg-card rounded-lg border shadow-sm p-4">
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg">{assessment.student.name}</h3>
                  <div className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                    Nilai: {assessment.value}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Mata Pelajaran: {assessment.subject.name}
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
          ))
        ) : (
          <div className="bg-card rounded-lg border shadow-sm p-4 text-center text-muted-foreground">
            Belum ada data penilaian
          </div>
        )}
      </div>
      
      {/* Tabel untuk tampilan desktop */}
      <div className="rounded-md border shadow-sm hidden md:block">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="h-12 px-4 text-left align-middle font-medium">Siswa</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Mata Pelajaran</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Nilai</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Tipe</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Semester</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Tahun Ajaran</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {assessments.length > 0 ? (
                assessments.map((assessment) => (
                  <tr
                    key={assessment.id}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    <td className="p-4 align-middle font-medium">{assessment.student.name}</td>
                    <td className="p-4 align-middle">{assessment.subject.name}</td>
                    <td className="p-4 align-middle">
                      <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                        {assessment.value}
                      </span>
                    </td>
                    <td className="p-4 align-middle">
                      {getAssessmentTypeLabel(assessment.type)}
                    </td>
                    <td className="p-4 align-middle">
                      {assessment.semester}
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
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-muted-foreground">
                    Belum ada data penilaian
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
