import Link from "next/link";
import { redirect } from "next/navigation";
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

export default async function NewReportCardPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }
  
  // Ambil daftar siswa untuk dropdown
  const students = await prisma.student.findMany({
    where: { teacherId: user.id },
    orderBy: { name: "asc" },
  });
  
  // Ambil daftar penilaian untuk referensi
  const assessments = await prisma.assessment.findMany({
    where: { teacherId: user.id },
    include: { student: true, subject: true },
    orderBy: [
      { studentId: "asc" },
      { academicYear: "desc" },
      { semester: "desc" },
    ],
  });
  
  // Fungsi untuk membuat rapor (akan dijalankan saat form disubmit)
  async function createReportCard(formData: FormData) {
    "use server";
    
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }
    
    const studentId = formData.get("studentId") as string;
    const semester = parseInt(formData.get("semester") as string);
    const academicYear = formData.get("academicYear") as string;
    const finalGrade = parseFloat(formData.get("finalGrade") as string);
    const description = formData.get("description") as string;
    
    // Validasi input
    if (!studentId || !semester || !academicYear || !finalGrade || !description) {
      throw new Error("Semua field harus diisi");
    }
    
    // Cek apakah siswa milik guru ini
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });
    
    if (!student || student.teacherId !== user.id) {
      throw new Error("Siswa tidak ditemukan");
    }
    
    // Buat rapor baru
    const reportCard = await prisma.reportCard.create({
      data: {
        semester,
        academicYear,
        finalGrade,
        description,
        studentId,
        teacherId: user.id,
      },
    });
    
    // Redirect ke halaman detail rapor
    redirect(`/report-cards/${reportCard.id}`);
  }
  
  return (
    <div className="container p-4 md:p-6">
      <Breadcrumb
        items={[
          { label: "Rapor", href: "/report-cards" },
          { label: "Buat Rapor Baru", href: "/report-cards/new" },
        ]}
      />
      
      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Buat Rapor Baru</h1>
      </div>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Form Rapor Baru</CardTitle>
        </CardHeader>
        <form action={createReportCard}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="studentId">Siswa</Label>
              <Select name="studentId" required>
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
                <Select name="semester" required>
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
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea 
                id="description" 
                name="description" 
                placeholder="Masukkan deskripsi rapor"
                rows={5}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-6 border-t">
            <Button variant="outline" asChild>
              <Link href="/report-cards">Batal</Link>
            </Button>
            <Button type="submit">Simpan Rapor</Button>
          </CardFooter>
        </form>
      </Card>
      
      {assessments.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Referensi Penilaian</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="h-12 px-4 text-left align-middle font-medium">Siswa</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Mata Pelajaran</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Nilai</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Semester</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Tahun Ajaran</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {assessments.map((assessment) => (
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
                        <td className="p-4 align-middle">{assessment.semester}</td>
                        <td className="p-4 align-middle">{assessment.academicYear}</td>
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
  );
}
