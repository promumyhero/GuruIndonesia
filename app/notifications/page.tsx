import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/auth";
import { formatDate } from "@/app/lib/utils";
import { Breadcrumb } from "@/components/breadcrumb";
import { PlusIcon, CheckIcon } from "lucide-react";

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
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Notifikasi", href: "/notifications" },
          ]}
        />
        {(user.role === "ADMIN" || user.role === "TEACHER") && (
          <Link href="/notifications/new">
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Kirim Notifikasi
            </Button>
          </Link>
        )}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Notifikasi</CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">Belum ada notifikasi.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Judul</TableHead>
                    <TableHead>Pengirim</TableHead>
                    {user.role === "ADMIN" && <TableHead>Penerima</TableHead>}
                    <TableHead>Tanggal</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
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
