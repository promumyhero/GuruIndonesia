import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { notificationSchema } from "@/app/lib/validations";
import { getCurrentUser } from "@/app/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
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
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }
    
    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil data notifikasi" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Hanya admin dan guru yang bisa mengirim notifikasi
    if (user.role !== "ADMIN" && user.role !== "TEACHER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    const body = await request.json();
    
    // Validasi data
    const validationResult = notificationSchema.safeParse(body);
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((err) => ({
        path: err.path.join("."),
        message: err.message,
      }));
      
      return NextResponse.json({ errors }, { status: 400 });
    }
    
    const validatedData = validationResult.data;
    
    // Periksa apakah penerima ada
    const recipient = await prisma.user.findUnique({
      where: { id: validatedData.recipientId },
    });
    
    if (!recipient) {
      return NextResponse.json(
        { error: "Penerima tidak ditemukan" },
        { status: 404 }
      );
    }
    
    // Jika pengirim adalah guru, periksa apakah penerima adalah orang tua dari siswa yang diajarnya
    if (user.role === "TEACHER" && recipient.role === "PARENT") {
      const parent = await prisma.parent.findUnique({
        where: { userId: recipient.id },
        include: {
          students: true,
        },
      });
      
      if (!parent) {
        return NextResponse.json(
          { error: "Data orang tua tidak ditemukan" },
          { status: 404 }
        );
      }
      
      // Periksa apakah ada siswa yang diajar oleh guru ini
      const hasStudentTaughtByTeacher = parent.students.some(
        (student) => student.teacherId === user.id
      );
      
      if (!hasStudentTaughtByTeacher) {
        return NextResponse.json(
          { error: "Anda tidak dapat mengirim notifikasi ke orang tua ini" },
          { status: 403 }
        );
      }
    }
    
    // Buat notifikasi baru
    const newNotification = await prisma.notification.create({
      data: {
        title: validatedData.title,
        message: validatedData.message,
        sender: {
          connect: { id: user.id },
        },
        recipient: {
          connect: { id: validatedData.recipientId },
        },
      },
    });
    
    return NextResponse.json(newNotification, { status: 201 });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat membuat notifikasi" },
      { status: 500 }
    );
  }
}
