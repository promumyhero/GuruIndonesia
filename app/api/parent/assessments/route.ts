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
    
    if (user.role !== "PARENT") {
      return new NextResponse(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
      });
    }
    
    // Ambil data anak dari parent
    const parent = await prisma.parent.findUnique({
      where: { userId: user.id },
      include: { students: true },
    });
    
    if (!parent || !parent.students.length) {
      return NextResponse.json([]);
    }
    
    // Ambil ID semua anak
    const childrenIds = parent.students.map(child => child.id);
    
    // Ambil semua penilaian untuk anak-anak tersebut
    const assessments = await prisma.assessment.findMany({
      where: {
        studentId: {
          in: childrenIds,
        },
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
          },
        },
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
    console.error("Error fetching parent assessments:", error);
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
