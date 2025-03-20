import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/auth";
import { Breadcrumb } from "@/components/breadcrumb";
import { FileText, Download, Pencil } from "lucide-react";

interface ReportCardDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ReportCardDetailPage({ 
  params 
}: ReportCardDetailPageProps) {
  // Dalam Next.js 15, params perlu di-await
  const { id } = await params;
  
  if (!id) {
    notFound();
  }
  
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }
  
  const reportCard = await prisma.reportCard.findUnique({
    where: { id },
    include: {
      student: true,
      assessments: {
        include: {
          subject: true
        }
      }
    }
  });
  
  if (!reportCard || reportCard.teacherId !== user.id) {
    notFound();
  }
  
  return (
    <div className="container p-4 md:p-6">
      <Breadcrumb
        items={[
          { label: "Rapor", href: "/report-cards" },
          { label: reportCard.student.name, href: `/report-cards/${reportCard.id}` },
        ]}
      />
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold">Detail Rapor</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href={`/report-cards/${reportCard.id}/edit`} className="flex items-center gap-1">
              <Pencil className="h-4 w-4" />
              <span>Edit Rapor</span>
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/report-cards/${reportCard.id}/download`} className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              <span>Unduh PDF</span>
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Informasi Siswa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nama Siswa</p>
              <p className="text-lg font-semibold">{reportCard.student.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">NISN</p>
              <p>{reportCard.student.nisn}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Kelas</p>
              <p>{reportCard.student.class}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tahun Ajaran</p>
              <p>{reportCard.academicYear}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Semester</p>
              <p>Semester {reportCard.semester}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Nilai Akhir dan Deskripsi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nilai Akhir</p>
              <div className="flex items-center mt-1">
                <div className="bg-primary text-primary-foreground text-2xl font-bold rounded-md px-4 py-2">
                  {reportCard.finalGrade}
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Deskripsi</p>
              <div className="mt-1 p-4 bg-muted rounded-md">
                <p className="whitespace-pre-wrap">{reportCard.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {reportCard.assessments.length > 0 && (
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Rincian Penilaian</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="h-12 px-4 text-left align-middle font-medium">Mata Pelajaran</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Nilai</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Tipe Penilaian</th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      {reportCard.assessments.map((assessment) => (
                        <tr
                          key={assessment.id}
                          className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                        >
                          <td className="p-4 align-middle font-medium">{assessment.subject.name}</td>
                          <td className="p-4 align-middle">
                            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                              {assessment.value}
                            </span>
                          </td>
                          <td className="p-4 align-middle">{assessment.type}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
