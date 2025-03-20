import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/auth";
import { SubjectForm } from "../../_components/subject-form";

interface EditSubjectPageProps {
  params: {
    id: string;
  };
}

export default async function EditSubjectPage({ params }: EditSubjectPageProps) {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }
  
  const subject = await prisma.subject.findUnique({
    where: { id: params.id },
  });
  
  if (!subject || subject.teacherId !== user.id) {
    notFound();
  }
  
  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Edit Mata Pelajaran</h1>
        <Button asChild variant="outline">
          <Link href={`/subjects/${subject.id}`}>Kembali</Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Form Mata Pelajaran</CardTitle>
          <CardDescription>
            Edit informasi mata pelajaran
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SubjectForm initialData={subject} />
        </CardContent>
      </Card>
    </div>
  );
}
