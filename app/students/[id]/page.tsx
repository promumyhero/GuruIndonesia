import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/auth";
import { formatDate } from "@/app/lib/utils";
import { DeleteStudentButton } from "../_components/delete-student-button";
import { Breadcrumb } from "@/components/breadcrumb";

interface StudentDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function StudentDetailPage({ 
  params 
}: StudentDetailPageProps) {
  // Dalam Next.js 15, params perlu di-await
  const { id } = await params;
  
  if (!id) {
    notFound();
  }
  
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }
  
  const student = await prisma.student.findUnique({
    where: { id },
  });
  
  if (!student || student.teacherId !== user.id) {
    notFound();
  }
  
  // Get assessments for this student
  const assessments = await prisma.assessment.findMany({
    where: { studentId: student.id },
    include: { subject: true },
    orderBy: [
      { academicYear: "desc" },
      { semester: "desc" },
      { subject: { name: "asc" } },
    ],
  });
  
  // Get report cards for this student
  const reportCards = await prisma.reportCard.findMany({
    where: { studentId: student.id },
    orderBy: [
      { academicYear: "desc" },
      { semester: "desc" },
    ],
  });
  
  return (
    <div className="container p-4 md:p-6">
      <Breadcrumb
        items={[
          { label: "Siswa", href: "/students" },
          { label: student.name, href: `/students/${student.id}` },
        ]}
      />
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Detail Siswa</h1>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href={`/students/${student.id}/progress`}>Lihat Perkembangan</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/students/${student.id}/edit`}>Edit</Link>
          </Button>
          <DeleteStudentButton id={student.id} name={student.name} />
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Siswa</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Nama</dt>
                <dd className="mt-1 text-lg">{student.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">NISN</dt>
                <dd className="mt-1 text-lg">{student.nisn}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Kelas</dt>
                <dd className="mt-1 text-lg">{student.class}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Tanggal Dibuat</dt>
                <dd className="mt-1 text-lg">{formatDate(student.createdAt)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Rapor</CardTitle>
          </CardHeader>
          <CardContent>
            {reportCards.length > 0 ? (
              <ul className="space-y-2">
                {reportCards.map((report) => (
                  <li key={report.id} className="rounded-md border p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          Semester {report.semester}, {report.academicYear}
                        </p>
                        <p className="text-sm text-gray-500">
                          Nilai Akhir: {report.finalGrade}
                        </p>
                      </div>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/report-cards/${report.id}`}>Lihat</Link>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">Belum ada rapor</p>
            )}
            
            <div className="mt-4">
              <Button asChild size="sm">
                <Link href={`/report-cards/new?studentId=${student.id}`}>
                  Buat Rapor Baru
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Penilaian</CardTitle>
        </CardHeader>
        <CardContent>
          {assessments.length > 0 ? (
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 text-left align-middle font-medium">Mata Pelajaran</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Nilai</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Jenis</th>
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
                      <td className="p-4 align-middle">{assessment.subject.name}</td>
                      <td className="p-4 align-middle">{assessment.value}</td>
                      <td className="p-4 align-middle">{assessment.type}</td>
                      <td className="p-4 align-middle">{assessment.semester}</td>
                      <td className="p-4 align-middle">{assessment.academicYear}</td>
                      <td className="p-4 align-middle">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/assessments/${assessment.id}/edit`}>Edit</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">Belum ada penilaian</p>
          )}
          
          <div className="mt-4">
            <Button asChild size="sm">
              <Link href={`/assessments/new?studentId=${student.id}`}>
                Tambah Penilaian
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
