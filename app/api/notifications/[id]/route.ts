import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/auth";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Ekstrak ID dari params dengan await
    const { id } = await params;
    
    const notification = await prisma.notification.findUnique({
      where: { id },
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
      return NextResponse.json({ error: "Notifikasi tidak ditemukan" }, { status: 404 });
    }
    
    // Hanya admin, pengirim, atau penerima yang bisa melihat notifikasi
    if (
      user.role !== "ADMIN" &&
      notification.senderId !== user.id &&
      notification.recipientId !== user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    // Jika pengguna adalah penerima dan notifikasi belum dibaca, tandai sebagai telah dibaca
    if (notification.recipientId === user.id && !notification.isRead) {
      await prisma.notification.update({
        where: { id },
        data: { isRead: true },
      });
    }
    
    return NextResponse.json(notification);
  } catch (error) {
    console.error("Error fetching notification:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil data notifikasi" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Ekstrak ID dari params dengan await
    const { id } = await params;
    
    const notification = await prisma.notification.findUnique({
      where: { id },
    });
    
    if (!notification) {
      return NextResponse.json({ error: "Notifikasi tidak ditemukan" }, { status: 404 });
    }
    
    // Hanya admin, pengirim, atau penerima yang bisa menghapus notifikasi
    if (
      user.role !== "ADMIN" &&
      notification.senderId !== user.id &&
      notification.recipientId !== user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    // Hapus notifikasi
    await prisma.notification.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menghapus notifikasi" },
      { status: 500 }
    );
  }
}
