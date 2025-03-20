import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { subjectSchema } from "@/app/lib/validations";
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
    
    const subject = await prisma.subject.findUnique({
      where: { id },
    });
    
    if (!subject) {
      return NextResponse.json({ error: "Mata pelajaran tidak ditemukan" }, { status: 404 });
    }
    
    // Check if the subject belongs to the current user
    if (subject.teacherId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    
    return NextResponse.json(subject);
  } catch (error) {
    console.error("Error fetching subject:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil data mata pelajaran" },
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
    
    // Check if subject exists and belongs to the current user
    const existingSubject = await prisma.subject.findUnique({
      where: { id },
    });
    
    if (!existingSubject) {
      return NextResponse.json({ error: "Mata pelajaran tidak ditemukan" }, { status: 404 });
    }
    
    if (existingSubject.teacherId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    
    const body = await request.json();
    const validatedData = subjectSchema.parse(body);
    
    // Check if code already exists (excluding the current subject)
    if (validatedData.code !== existingSubject.code) {
      const subjectWithCode = await prisma.subject.findUnique({
        where: { code: validatedData.code },
      });
      
      if (subjectWithCode) {
        return NextResponse.json(
          { error: "Kode mata pelajaran sudah terdaftar" },
          { status: 400 }
        );
      }
    }
    
    // Update subject
    const updatedSubject = await prisma.subject.update({
      where: { id },
      data: validatedData,
    });
    
    return NextResponse.json(updatedSubject);
  } catch (error) {
    console.error("Error updating subject:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memperbarui data mata pelajaran" },
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
    
    // Check if subject exists and belongs to the current user
    const subject = await prisma.subject.findUnique({
      where: { id },
    });
    
    if (!subject) {
      return NextResponse.json({ error: "Mata pelajaran tidak ditemukan" }, { status: 404 });
    }
    
    if (subject.teacherId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    
    // Check if subject has assessments
    const assessmentsCount = await prisma.assessment.count({
      where: { subjectId: id },
    });
    
    if (assessmentsCount > 0) {
      return NextResponse.json(
        { error: "Tidak dapat menghapus mata pelajaran yang memiliki penilaian" },
        { status: 400 }
      );
    }
    
    // Delete subject
    await prisma.subject.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting subject:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menghapus data mata pelajaran" },
      { status: 500 }
    );
  }
}
