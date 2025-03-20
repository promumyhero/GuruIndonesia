import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/auth";
import { StudentForm } from "../../_components/student-form";
import { Breadcrumb } from "@/components/breadcrumb";

interface EditStudentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditStudentPage({ params }: EditStudentPageProps) {
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
  
  return (
    <div className="container p-4 md:p-6">
      <Breadcrumb
        items={[
          { label: "Siswa", href: "/students" },
          { label: student.name, href: `/students/${student.id}` },
          { label: "Edit", href: `/students/${student.id}/edit` },
        ]}
      />
      
      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Edit Siswa</h1>
      </div>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Form Edit Siswa</CardTitle>
        </CardHeader>
        <CardContent>
          <StudentForm initialData={student} />
        </CardContent>
      </Card>
    </div>
  );
}
