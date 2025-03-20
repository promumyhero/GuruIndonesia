import { notFound, redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/auth";

interface DownloadReportCardPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DownloadReportCardPage({ 
  params 
}: DownloadReportCardPageProps) {
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
  
  // Redirect kembali ke halaman detail rapor
  // Dalam implementasi sebenarnya, di sini akan ada kode untuk generate PDF
  // dan mendownloadnya, tapi untuk sekarang kita redirect saja
  redirect(`/report-cards/${id}`);
  
  // Placeholder untuk konten halaman jika tidak redirect
  return null;
}
