import { NextResponse } from "next/server";
import { getCurrentUser } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }
    
    if (user.role !== "STUDENT") {
      return new NextResponse(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
      });
    }
    
    // Ambil data siswa berdasarkan NISN yang sama dengan bagian email sebelum @
    const nisn = user.email.split('@')[0];
    const student = await prisma.student.findUnique({
      where: { nisn: nisn },
    });
    
    if (!student) {
      return NextResponse.json([]);
    }
    
    // Ambil semua penilaian untuk siswa tersebut
    const assessments = await prisma.assessment.findMany({
      where: {
        studentId: student.id,
      },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        assessmentDate: "desc",
      },
    });
    
    return NextResponse.json(assessments);
  } catch (error) {
    console.error("Error fetching student assessments:", error);
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
