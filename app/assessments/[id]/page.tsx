import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil } from "lucide-react";
import { Breadcrumb } from "@/components/breadcrumb";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/auth";
import { formatDate, getAssessmentTypeLabel } from "@/app/lib/utils";

export default async function AssessmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  const { id } = await params;
  
  if (!user) {
    return null;
  }
  
  // Ambil data penilaian
  const assessment = await prisma.assessment.findUnique({
    where: {
      id: id,
    },
    include: {
      student: true,
      subject: true,
      teacher: {
        select: {
          name: true,
        },
      },
    },
  });
  
  if (!assessment) {
    notFound();
  }
  
  // Pastikan hanya guru yang bersangkutan yang dapat melihat penilaian
  if (assessment.teacherId !== user.id) {
    return (
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <h1 className="text-2xl font-bold mb-4">Akses Ditolak</h1>
          <p className="text-muted-foreground mb-6">
            Anda tidak memiliki akses untuk melihat penilaian ini.
          </p>
          <Button asChild>
            <Link href="/assessments">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Daftar Penilaian
            </Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Penilaian", href: "/assessments" },
          { label: "Detail Penilaian", href: "#" },
        ]}
      />
      
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Detail Penilaian</h1>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/assessments">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/assessments/${id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Informasi Penilaian</CardTitle>
          <CardDescription>
            Detail lengkap penilaian siswa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Siswa</h3>
                <p className="text-lg font-medium">{assessment.student?.name || "N/A"}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Mata Pelajaran</h3>
                <p className="text-lg font-medium">{assessment.subject?.name || "N/A"}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Nilai</h3>
                <p className="text-lg font-medium">
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full">
                    {assessment.value}
                  </span>
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Tipe Penilaian</h3>
                <p className="text-lg font-medium">
                  <span className="px-3 py-1 bg-secondary/50 text-secondary-foreground rounded-full text-sm">
                    {getAssessmentTypeLabel(assessment.type)}
                  </span>
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Semester</h3>
                <p className="text-lg font-medium">Semester {assessment.semester}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Tahun Ajaran</h3>
                <p className="text-lg font-medium">{assessment.academicYear}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Tanggal Penilaian</h3>
                <p className="text-lg font-medium">
                  {assessment.assessmentDate ? formatDate(assessment.assessmentDate) : "N/A"}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Guru</h3>
                <p className="text-lg font-medium">{assessment.teacher?.name || "N/A"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
