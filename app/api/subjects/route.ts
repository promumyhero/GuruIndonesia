import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { subjectSchema } from "@/app/lib/validations";
import { getCurrentUser } from "@/app/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const subjects = await prisma.subject.findMany({
      where: { teacherId: user.id },
      orderBy: { name: "asc" },
    });
    
    return NextResponse.json(subjects);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil data mata pelajaran" },
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
    const validatedData = subjectSchema.parse(body);
    
    // Check if code already exists
    const existingSubject = await prisma.subject.findUnique({
      where: { code: validatedData.code },
    });
    
    if (existingSubject) {
      return NextResponse.json(
        { error: "Kode mata pelajaran sudah terdaftar" },
        { status: 400 }
      );
    }
    
    // Create subject
    const subject = await prisma.subject.create({
      data: {
        ...validatedData,
        teacherId: user.id,
      },
    });
    
    return NextResponse.json(subject, { status: 201 });
  } catch (error) {
    console.error("Error creating subject:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Terjadi kesalahan saat membuat data mata pelajaran" },
      { status: 500 }
    );
  }
}
