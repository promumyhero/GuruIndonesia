import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/auth";
import { Breadcrumb } from "@/components/breadcrumb";
import { NotificationForm } from "../_components/notification-form";

export default async function NewNotificationPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }
  
  // Hanya admin dan guru yang bisa mengirim notifikasi
  if (user.role !== "ADMIN" && user.role !== "TEACHER") {
    redirect("/dashboard");
  }
  
  // Ambil daftar penerima potensial berdasarkan peran pengirim
  let recipients = [];
  
  if (user.role === "ADMIN") {
    // Admin dapat mengirim ke semua pengguna
    recipients = await prisma.user.findMany({
      where: {
        id: {
          not: user.id, // Kecuali diri sendiri
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  } else if (user.role === "TEACHER") {
    // Guru hanya dapat mengirim ke orang tua dari siswa yang diajarnya
    const students = await prisma.student.findMany({
      where: {
        teacherId: user.id,
      },
      include: {
        parents: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });
    
    // Ekstrak pengguna orang tua yang unik
    const parentUsers = new Map();
    students.forEach((student) => {
      student.parents.forEach((parent) => {
        if (parent.user && !parentUsers.has(parent.user.id)) {
          parentUsers.set(parent.user.id, parent.user);
        }
      });
    });
    
    recipients = Array.from(parentUsers.values());
  }
  
  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Notifikasi", href: "/notifications" },
            { label: "Kirim Notifikasi", href: "/notifications/new" },
          ]}
        />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Kirim Notifikasi Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <NotificationForm recipients={recipients} />
        </CardContent>
      </Card>
    </div>
  );
}
