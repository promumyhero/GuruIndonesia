import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/auth";
import { formatDate } from "@/app/lib/utils";
import { DeleteSubjectButton } from "../_components/delete-subject-button";

interface SubjectDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SubjectDetailPage({ params }: SubjectDetailPageProps) {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }
  
  // Ekstrak ID dari params dengan await
  const { id } = await params;
  
  const subject = await prisma.subject.findUnique({
    where: { id },
  });
  
  if (!subject || subject.teacherId !== user.id) {
    notFound();
  }
  
  // Get assessments for this subject
  const assessments = await prisma.assessment.findMany({
    where: { subjectId: subject.id },
    include: { student: true },
    orderBy: [
      { academicYear: "desc" },
      { semester: "desc" },
      { student: { name: "asc" } },
    ],
  });
  
  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Detail Mata Pelajaran</h1>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/subjects">Kembali</Link>
          </Button>
          <Button asChild>
            <Link href={`/subjects/${subject.id}/edit`}>Edit</Link>
          </Button>
          <DeleteSubjectButton id={subject.id} name={subject.name} />
        </div>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Informasi Mata Pelajaran</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Nama</dt>
              <dd className="mt-1 text-lg">{subject.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Kode</dt>
              <dd className="mt-1 text-lg">{subject.code}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Tanggal Dibuat</dt>
              <dd className="mt-1 text-lg">{formatDate(subject.createdAt)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Penilaian</CardTitle>
        </CardHeader>
        <CardContent>
          {assessments.length > 0 ? (
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 text-left align-middle font-medium">Siswa</th>
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
                      <td className="p-4 align-middle">{assessment.student.name}</td>
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
              <Link href={`/assessments/new?subjectId=${subject.id}`}>
                Tambah Penilaian
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
