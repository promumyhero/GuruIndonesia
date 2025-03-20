import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { studentSchema } from "@/app/lib/validations";
import { getCurrentUser } from "@/app/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const students = await prisma.student.findMany({
      where: { teacherId: user.id },
      orderBy: { name: "asc" },
    });
    
    return NextResponse.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil data siswa" },
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
    
    const body = await request.json();
    const validatedData = studentSchema.parse(body);
    
    // Check if NISN already exists
    const existingStudent = await prisma.student.findUnique({
      where: { nisn: validatedData.nisn },
    });
    
    if (existingStudent) {
      return NextResponse.json(
        { error: "NISN sudah terdaftar" },
        { status: 400 }
      );
    }
    
    // Create student
    const student = await prisma.student.create({
      data: {
        ...validatedData,
        teacherId: user.id,
      },
    });
    
    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error("Error creating student:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Terjadi kesalahan saat membuat data siswa" },
      { status: 500 }
    );
  }
}
