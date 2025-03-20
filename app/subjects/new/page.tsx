import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SubjectForm } from "../_components/subject-form";

export default function NewSubjectPage() {
  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Tambah Mata Pelajaran Baru</h1>
        <Button asChild variant="outline">
          <Link href="/subjects">Kembali</Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Form Mata Pelajaran</CardTitle>
          <CardDescription>
            Masukkan informasi mata pelajaran baru
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SubjectForm />
        </CardContent>
      </Card>
    </div>
  );
}
