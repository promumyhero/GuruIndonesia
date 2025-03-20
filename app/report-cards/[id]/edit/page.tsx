import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/auth";
import { Breadcrumb } from "@/components/breadcrumb";
import { FormError } from "@/components/form-error";

interface EditReportCardPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditReportCardPage({ 
  params 
}: EditReportCardPageProps) {
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
    }
  });
  
  if (!reportCard || reportCard.teacherId !== user.id) {
    notFound();
  }
  
  // Ambil daftar siswa untuk dropdown
  const students = await prisma.student.findMany({
    where: { teacherId: user.id },
    orderBy: { name: "asc" },
  });
  
  // Fungsi untuk mengupdate rapor (akan dijalankan saat form disubmit)
  async function updateReportCard(formData: FormData) {
    "use server";
    
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }
    
    const reportCardId = formData.get("reportCardId") as string;
    const studentId = formData.get("studentId") as string;
    const semester = parseInt(formData.get("semester") as string);
    const academicYear = formData.get("academicYear") as string;
    const finalGrade = parseFloat(formData.get("finalGrade") as string);
    const description = formData.get("description") as string;
    
    // Validasi input
    if (!reportCardId || !studentId || !semester || !academicYear || !finalGrade || !description) {
      throw new Error("Semua field harus diisi");
    }
    
    // Cek apakah rapor milik guru ini
    const existingReportCard = await prisma.reportCard.findUnique({
      where: { id: reportCardId },
    });
    
    if (!existingReportCard || existingReportCard.teacherId !== user.id) {
      throw new Error("Rapor tidak ditemukan");
    }
    
    // Cek apakah siswa milik guru ini
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });
    
    if (!student || student.teacherId !== user.id) {
      throw new Error("Siswa tidak ditemukan");
    }
    
    // Update rapor
    await prisma.reportCard.update({
      where: { id: reportCardId },
      data: {
        semester,
        academicYear,
        finalGrade,
        description,
        studentId,
      },
    });
    
    // Redirect ke halaman detail rapor
    redirect(`/report-cards/${reportCardId}`);
  }
  
  return (
    <div className="container p-4 md:p-6">
      <Breadcrumb
        items={[
          { label: "Rapor", href: "/report-cards" },
          { label: reportCard.student.name, href: `/report-cards/${reportCard.id}` },
          { label: "Edit", href: `/report-cards/${reportCard.id}/edit` },
        ]}
      />
      
      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Edit Rapor</h1>
      </div>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Form Edit Rapor</CardTitle>
        </CardHeader>
        <form action={updateReportCard}>
          <input type="hidden" name="reportCardId" value={reportCard.id} />
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="studentId">Siswa</Label>
              <Select name="studentId" defaultValue={reportCard.studentId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih siswa" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} - Kelas {student.class}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <Select name="semester" defaultValue={reportCard.semester.toString()} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Semester 1</SelectItem>
                    <SelectItem value="2">Semester 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="academicYear">Tahun Ajaran</Label>
                <Input 
                  id="academicYear" 
                  name="academicYear" 
                  defaultValue={reportCard.academicYear}
                  placeholder="Contoh: 2024/2025"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="finalGrade">Nilai Akhir</Label>
              <Input 
                id="finalGrade" 
                name="finalGrade" 
                type="number" 
                min="0" 
                max="100" 
                step="0.01"
                defaultValue={reportCard.finalGrade}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea 
                id="description" 
                name="description" 
                placeholder="Masukkan deskripsi rapor"
                defaultValue={reportCard.description}
                rows={5}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-6 border-t">
            <Button variant="outline" asChild>
              <Link href={`/report-cards/${reportCard.id}`}>Batal</Link>
            </Button>
            <Button type="submit">Simpan Perubahan</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
