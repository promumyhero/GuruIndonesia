import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/auth";
import { z } from "zod";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

// Schema untuk validasi update user
const updateUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  role: z.enum(["ADMIN", "TEACHER", "PARENT", "STUDENT"]).optional(),
  schoolId: z.string().nullable().optional(),
});

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { id } = await params;
    
    // Hanya admin atau user itu sendiri yang bisa melihat data user
    if (currentUser.role !== "ADMIN" && currentUser.id !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        schoolId: true,
        createdAt: true,
        updatedAt: true,
        school: {
          select: {
            id: true,
            name: true,
            type: true,
            address: true,
          },
        },
      },
    });
    
    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil data user" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { id } = await params;
    
    // Hanya admin atau user itu sendiri yang bisa mengupdate data user
    if (currentUser.role !== "ADMIN" && currentUser.id !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    const body = await request.json();
    const validatedData = updateUserSchema.parse(body);
    
    // Jika ada schoolId, pastikan sekolah valid
    if (validatedData.schoolId) {
      const school = await prisma.school.findUnique({
        where: { id: validatedData.schoolId },
      });
      
      if (!school) {
        return NextResponse.json(
          { error: "Sekolah tidak ditemukan" },
          { status: 400 }
        );
      }
    }
    
    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: validatedData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        schoolId: true,
        createdAt: true,
        updatedAt: true,
        school: {
          select: {
            id: true,
            name: true,
            type: true,
            address: true,
          },
        },
      },
    });
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Data tidak valid", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengupdate user" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { id } = await params;
    
    // Hanya admin yang bisa menghapus user
    if (currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    // Periksa apakah user ada
    const user = await prisma.user.findUnique({
      where: { id },
    });
    
    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }
    
    // Hapus user
    await prisma.user.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menghapus user" },
      { status: 500 }
    );
  }
}
