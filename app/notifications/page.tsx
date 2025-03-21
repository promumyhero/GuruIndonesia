import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/auth";
import { formatDate } from "@/app/lib/utils";
import { PlusIcon, CheckIcon, Bell } from "lucide-react";

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }
  
  // Ambil notifikasi berdasarkan peran
  let notifications;
  
  if (user.role === "ADMIN") {
    // Admin dapat melihat semua notifikasi
    notifications = await prisma.notification.findMany({
      include: {
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
        recipient: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } else {
    // Pengguna lain hanya melihat notifikasi yang diterima
    notifications = await prisma.notification.findMany({
      where: {
        recipientId: user.id,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
        // Tambahkan recipient untuk konsistensi tipe data
        recipient: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
  
  return (
    <div className="container py-6 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div className="flex items-center gap-2 mb-4 sm:mb-0">
          <Bell className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Notifikasi</h1>
        </div>
        
        {(user.role === "ADMIN" || user.role === "TEACHER") && (
          <Link href="/notifications/new">
            <Button className="self-start sm:self-auto">
              <PlusIcon className="h-4 w-4 mr-2" />
              Kirim Notifikasi
            </Button>
          </Link>
        )}
      </div>
      
      <Card className="shadow-sm border-2">
        <CardHeader className="bg-muted/10">
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2 text-primary" />
            Daftar Notifikasi
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 bg-muted/5 rounded-lg border-2 border-dashed">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-1">Belum Ada Notifikasi</h3>
              <p className="text-muted-foreground text-center max-w-md px-4">
                Anda belum memiliki notifikasi. Notifikasi akan muncul di sini.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/5">
                    <TableHead className="font-medium">Status</TableHead>
                    <TableHead className="font-medium">Judul</TableHead>
                    <TableHead className="font-medium">Pengirim</TableHead>
                    {user.role === "ADMIN" && <TableHead className="font-medium">Penerima</TableHead>}
                    <TableHead className="font-medium">Tanggal</TableHead>
                    <TableHead className="text-right font-medium">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.map((notification) => (
                    <TableRow key={notification.id} className={notification.isRead ? "" : "bg-muted/20"}>
                      <TableCell>
                        {notification.isRead ? (
                          <CheckIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <div className="h-2 w-2 rounded-full bg-blue-500" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{notification.title}</TableCell>
                      <TableCell>{notification.sender.name}</TableCell>
                      {user.role === "ADMIN" && (
                        <TableCell>{notification.recipient.name}</TableCell>
                      )}
                      <TableCell>{formatDate(notification.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/notifications/${notification.id}`}>
                            <Button variant="outline" size="sm">
                              Lihat
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
