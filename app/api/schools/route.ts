import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { schoolSchema } from "@/app/lib/validations";
import { getCurrentUser } from "@/app/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Hanya admin yang bisa melihat semua sekolah
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    const schools = await prisma.school.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    
    return NextResponse.json(schools);
  } catch (error) {
    console.error("Error fetching schools:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil data sekolah" },
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
    
    // Hanya admin yang bisa menambahkan sekolah
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
    
    // Periksa apakah sekolah dengan nama yang sama sudah ada
    const existingSchool = await prisma.school.findFirst({
      where: {
        name: validatedData.name,
      },
    });
    
    if (existingSchool) {
      return NextResponse.json(
        { error: "Sekolah dengan nama tersebut sudah ada" },
        { status: 400 }
      );
    }
    
    // Buat sekolah baru
    const newSchool = await prisma.school.create({
      data: validatedData,
    });
    
    return NextResponse.json(newSchool, { status: 201 });
  } catch (error) {
    console.error("Error creating school:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat membuat sekolah" },
      { status: 500 }
    );
  }
}
