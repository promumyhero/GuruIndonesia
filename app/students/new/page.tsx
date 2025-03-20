import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StudentForm } from "../_components/student-form";

export default function NewStudentPage() {
  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Tambah Siswa Baru</h1>
        <Button asChild variant="outline">
          <Link href="/students">Kembali</Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Form Siswa</CardTitle>
          <CardDescription>
            Masukkan informasi siswa baru
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StudentForm />
        </CardContent>
      </Card>
    </div>
  );
}
