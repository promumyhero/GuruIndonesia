import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { schoolSchema } from "@/app/lib/validations";
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
    
    const school = await prisma.school.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
    
    if (!school) {
      return NextResponse.json({ error: "Sekolah tidak ditemukan" }, { status: 404 });
    }
    
    // Jika bukan admin, hanya bisa melihat sekolah sendiri
    if (user.role !== "ADMIN" && user.schoolId !== school.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    return NextResponse.json(school);
  } catch (error) {
    console.error("Error fetching school:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil data sekolah" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Hanya admin yang bisa mengubah sekolah
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    // Ekstrak ID dari params dengan await
    const { id } = await params;
    
    // Periksa apakah sekolah ada
    const existingSchool = await prisma.school.findUnique({
      where: { id },
    });
    
    if (!existingSchool) {
      return NextResponse.json({ error: "Sekolah tidak ditemukan" }, { status: 404 });
    }
    
    const body = await request.json();
    
    // Validasi data
    const validationResult = schoolSchema.safeParse(body);
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((err) => ({
        path: err.path.join("."),
        message: err.message,
      }));
      
      return NextResponse.json({ errors }, { status: 400 });
    }
    
    const validatedData = validationResult.data;
    
    // Periksa apakah ada sekolah lain dengan nama yang sama
    const duplicateSchool = await prisma.school.findFirst({
      where: {
        name: validatedData.name,
        NOT: {
          id,
        },
      },
    });
    
    if (duplicateSchool) {
      return NextResponse.json(
        { error: "Sekolah dengan nama tersebut sudah ada" },
        { status: 400 }
      );
    }
    
    // Update sekolah
    const updatedSchool = await prisma.school.update({
      where: { id },
      data: validatedData,
    });
    
    return NextResponse.json(updatedSchool);
  } catch (error) {
    console.error("Error updating school:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memperbarui sekolah" },
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
    
    // Hanya admin yang bisa menghapus sekolah
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    // Ekstrak ID dari params dengan await
    const { id } = await params;
    
    // Periksa apakah sekolah ada
    const school = await prisma.school.findUnique({
      where: { id },
      include: {
        users: true,
      },
    });
    
    if (!school) {
      return NextResponse.json({ error: "Sekolah tidak ditemukan" }, { status: 404 });
    }
    
    // Periksa apakah sekolah memiliki pengguna
    if (school.users.length > 0) {
      return NextResponse.json(
        { error: "Tidak dapat menghapus sekolah yang memiliki pengguna" },
        { status: 400 }
      );
    }
    
    // Hapus sekolah
    await prisma.school.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting school:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menghapus sekolah" },
      { status: 500 }
    );
  }
}
