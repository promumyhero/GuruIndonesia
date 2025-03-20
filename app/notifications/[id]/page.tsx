import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/auth";
import { formatDate } from "@/app/lib/utils";
import { Breadcrumb } from "@/components/breadcrumb";
import { DeleteNotification } from "../_components/delete-notification";

interface NotificationDetailPageProps {
  params: {
    id: string;
  };
}

export default async function NotificationDetailPage({ params }: NotificationDetailPageProps) {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }
  
  const notification = await prisma.notification.findUnique({
    where: { id: params.id },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      recipient: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
  
  if (!notification) {
    redirect("/notifications");
  }
  
  // Hanya admin, pengirim, atau penerima yang bisa melihat notifikasi
  if (
    user.role !== "ADMIN" &&
    notification.senderId !== user.id &&
    notification.recipientId !== user.id
  ) {
    redirect("/dashboard");
  }
  
  // Jika pengguna adalah penerima dan notifikasi belum dibaca, tandai sebagai telah dibaca
  if (notification.recipientId === user.id && !notification.isRead) {
    await prisma.notification.update({
      where: { id: params.id },
      data: { isRead: true },
    });
  }
  
  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Notifikasi", href: "/notifications" },
            { label: notification.title, href: `/notifications/${notification.id}` },
          ]}
        />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{notification.title}</CardTitle>
          <div className="text-sm text-muted-foreground mt-2">
            <p>
              Dari: <span className="font-medium">{notification.sender.name}</span>
            </p>
            <p>
              Kepada: <span className="font-medium">{notification.recipient.name}</span>
            </p>
            <p>
              Tanggal: <span className="font-medium">{formatDate(notification.createdAt)}</span>
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap">{notification.message}</div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => window.history.back()}>
            Kembali
          </Button>
          <DeleteNotification id={notification.id} />
        </CardFooter>
      </Card>
    </div>
  );
}
