import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/auth";
import { z } from "zod";

// Validation schema
const addChildSchema = z.object({
  nisn: z.string().min(10).max(20),
  birthDate: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Only parents can add children
    if (user.role !== "PARENT") {
      return NextResponse.json(
        { message: "Hanya orang tua yang dapat menambahkan anak" },
        { status: 403 }
      );
    }
    
    // Get parent
    const parent = await prisma.parent.findUnique({
      where: { userId: user.id },
    });
    
    if (!parent) {
      return NextResponse.json(
        { message: "Data orang tua tidak ditemukan" },
        { status: 404 }
      );
    }
    
    // Parse and validate request body
    const body = await request.json();
    const validationResult = addChildSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { message: "Data tidak valid", errors: validationResult.error.flatten() },
        { status: 400 }
      );
    }
    
    const { nisn, birthDate } = validationResult.data;
    
    // Find student by NISN
    const student = await prisma.student.findUnique({
      where: { nisn },
      include: {
        parents: true,
      },
    });
    
    if (!student) {
      return NextResponse.json(
        { message: "Siswa dengan NISN tersebut tidak ditemukan" },
        { status: 404 }
      );
    }
    
    // Check if student is already linked to this parent
    const isAlreadyLinked = student.parents.some(p => p.id === parent.id);
    
    if (isAlreadyLinked) {
      return NextResponse.json(
        { message: "Anak sudah terhubung dengan akun Anda" },
        { status: 400 }
      );
    }
    
    // Parse birth date
    const birthDateObj = new Date(birthDate);
    const isValidDate = !isNaN(birthDateObj.getTime());
    
    if (!isValidDate) {
      return NextResponse.json(
        { message: "Tanggal lahir tidak valid" },
        { status: 400 }
      );
    }
    
    // Verification logic
    // If student has birthDate, verify it matches
    if (student.birthDate) {
      const studentBirthDate = new Date(student.birthDate);
      const inputBirthDate = new Date(birthDate);
      
      // Compare only year, month, day (ignore time)
      const studentDateString = studentBirthDate.toISOString().split('T')[0];
      const inputDateString = inputBirthDate.toISOString().split('T')[0];
      
      if (studentDateString !== inputDateString) {
        return NextResponse.json(
          { message: "Tanggal lahir tidak sesuai dengan data siswa" },
          { status: 400 }
        );
      }
    } else {
      // If student doesn't have birthDate, update it
      await prisma.student.update({
        where: { id: student.id },
        data: {
          // @ts-ignore - We know birthDate is a valid Date field in the database
          birthDate: birthDateObj,
        },
      });
    }
    
    // Link student to parent
    await prisma.parent.update({
      where: { id: parent.id },
      data: {
        students: {
          connect: { id: student.id },
        },
      },
    });
    
    return NextResponse.json(
      { message: "Anak berhasil ditambahkan", studentId: student.id },
      { status: 200 }
    );
    
  } catch (error) {
    console.error("Error adding child:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat menambahkan anak" },
      { status: 500 }
    );
  }
}
