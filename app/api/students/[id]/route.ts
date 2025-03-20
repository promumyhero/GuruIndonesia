import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { studentSchema } from "@/app/lib/validations";
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
    
    const student = await prisma.student.findUnique({
      where: { id },
    });
    
    if (!student) {
      return NextResponse.json({ error: "Siswa tidak ditemukan" }, { status: 404 });
    }
    
    // Check if the student belongs to the current user
    if (student.teacherId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    
    return NextResponse.json(student);
  } catch (error) {
    console.error("Error fetching student:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil data siswa" },
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
    
    // Ekstrak ID dari params dengan await
    const { id } = await params;
    
    // Check if student exists and belongs to the current user
    const existingStudent = await prisma.student.findUnique({
      where: { id },
    });
    
    if (!existingStudent) {
      return NextResponse.json({ error: "Siswa tidak ditemukan" }, { status: 404 });
    }
    
    if (existingStudent.teacherId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    
    const body = await request.json();
    const validatedData = studentSchema.parse(body);
    
    // Check if NISN already exists (excluding the current student)
    if (validatedData.nisn !== existingStudent.nisn) {
      const studentWithNisn = await prisma.student.findUnique({
        where: { nisn: validatedData.nisn },
      });
      
      if (studentWithNisn) {
        return NextResponse.json(
          { error: "NISN sudah terdaftar" },
          { status: 400 }
        );
      }
    }
    
    // Update student
    const updatedStudent = await prisma.student.update({
      where: { id },
      data: {
        ...validatedData,
        // @ts-ignore - We know birthDate is a valid Date field in the database
        ...(validatedData.birthDate ? { birthDate: new Date(validatedData.birthDate) } : {})
      },
    });
    
    return NextResponse.json(updatedStudent);
  } catch (error) {
    console.error("Error updating student:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memperbarui data siswa" },
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
    
    // Check if student exists and belongs to the current user
    const student = await prisma.student.findUnique({
      where: { id },
    });
    
    if (!student) {
      return NextResponse.json({ error: "Siswa tidak ditemukan" }, { status: 404 });
    }
    
    if (student.teacherId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    
    // Check if student has assessments or report cards
    const assessmentsCount = await prisma.assessment.count({
      where: { studentId: id },
    });
    
    const reportCardsCount = await prisma.reportCard.count({
      where: { studentId: id },
    });
    
    if (assessmentsCount > 0 || reportCardsCount > 0) {
      return NextResponse.json(
        { error: "Tidak dapat menghapus siswa yang memiliki penilaian atau rapor" },
        { status: 400 }
      );
    }
    
    // Delete student
    await prisma.student.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting student:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menghapus data siswa" },
      { status: 500 }
    );
  }
}
