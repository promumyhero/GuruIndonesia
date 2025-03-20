import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/auth";

// Schema validasi untuk pembuatan penilaian
const assessmentSchema = z.object({
  studentId: z.string(),
  subjectId: z.string(),
  value: z.number().min(0).max(100),
  type: z.enum(["WEEKLY", "DAILY", "MIDTERM", "FINAL"]),
  semester: z.number().min(1).max(2),
  academicYear: z.string(),
});

export async function POST(request: Request) {
  try {
    // Dapatkan user saat ini
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Parse body request
    const body = await request.json();
    
    // Validasi data
    const validatedData = assessmentSchema.parse(body);
    
    // Buat penilaian baru
    const assessment = await prisma.assessment.create({
      data: {
        ...validatedData,
        teacherId: user.id,
      },
    });
    
    return NextResponse.json(assessment, { status: 201 });
  } catch (error) {
    console.error("Error creating assessment:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validasi gagal", errors: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: "Terjadi kesalahan saat membuat penilaian" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Dapatkan user saat ini
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Ambil semua penilaian milik guru saat ini
    const assessments = await prisma.assessment.findMany({
      where: {
        teacherId: user.id,
      },
      include: {
        student: true,
        subject: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    
    return NextResponse.json(assessments);
  } catch (error) {
    console.error("Error fetching assessments:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat mengambil data penilaian" },
      { status: 500 }
    );
  }
}
