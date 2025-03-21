import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/auth";

// GET /api/assessments/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const assessment = await prisma.assessment.findUnique({
      where: {
        id: id,
      },
      include: {
        student: true,
        subject: true,
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { message: "Penilaian tidak ditemukan" },
        { status: 404 }
      );
    }

    // Pastikan hanya guru yang bersangkutan yang dapat mengakses penilaian
    if (assessment.teacherId !== user.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json(assessment);
  } catch (error: any) {
    console.error("Error fetching assessment:", error);
    
    // Log error details
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    
    // Cek apakah error dari Prisma
    if (error.code) {
      console.error("Prisma error code:", error.code);
      
      // Handle specific Prisma errors
      if (error.code === 'P2025') {
        return NextResponse.json(
          { message: "Penilaian tidak ditemukan" },
          { status: 404 }
        );
      }
    }
    
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PUT /api/assessments/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log("PUT request received");
    const user = await getCurrentUser();
    const { id } = await params;
    console.log("Processing update for assessment ID:", id);

    if (!user) {
      console.log("Unauthorized: No user found");
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    console.log("User authenticated:", user.id);

    const assessment = await prisma.assessment.findUnique({
      where: {
        id: id,
      },
    });

    if (!assessment) {
      console.log("Assessment not found with ID:", id);
      return NextResponse.json(
        { message: "Penilaian tidak ditemukan" },
        { status: 404 }
      );
    }
    console.log("Assessment found:", assessment.id);

    // Pastikan hanya guru yang bersangkutan yang dapat mengupdate penilaian
    if (assessment.teacherId !== user.id) {
      console.log("Unauthorized: Teacher ID mismatch", {
        assessmentTeacherId: assessment.teacherId,
        currentUserId: user.id
      });
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await req.json();
    console.log("Request body:", body);

    // Validasi data
    const { studentId, subjectId, value, type, semester, academicYear, assessmentDate } = body;

    console.log("Extracted values:", {
      studentId,
      subjectId,
      value: typeof value === 'undefined' ? 'undefined' : value,
      valueType: typeof value,
      type,
    });

    if (!studentId || !subjectId || value === undefined || !type) {
      console.log("Invalid data:", { studentId, subjectId, value, type });
      return NextResponse.json(
        { message: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    // Pastikan value adalah number
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(numericValue)) {
      console.log("Invalid value (not a number):", value);
      return NextResponse.json(
        { message: "Nilai harus berupa angka" },
        { status: 400 }
      );
    }

    console.log("Updating assessment with data:", {
      studentId,
      subjectId,
      value: numericValue,
      type,
      semester,
      academicYear,
      assessmentDate
    });

    // Update penilaian
    const updatedAssessment = await prisma.assessment.update({
      where: {
        id: id,
      },
      data: {
        studentId,
        subjectId,
        value: numericValue,
        type,
        semester,
        academicYear,
        assessmentDate: assessmentDate ? new Date(assessmentDate) : undefined,
      },
    });

    console.log("Assessment updated successfully:", updatedAssessment.id);
    return NextResponse.json(updatedAssessment);
  } catch (error: any) {
    console.error("Error updating assessment:", error);
    
    // Log error details
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    
    // Cek apakah error dari Prisma
    if (error.code) {
      console.error("Prisma error code:", error.code);
      
      // Handle specific Prisma errors
      if (error.code === 'P2025') {
        return NextResponse.json(
          { message: "Penilaian tidak ditemukan" },
          { status: 404 }
        );
      }
    }
    
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE /api/assessments/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const assessment = await prisma.assessment.findUnique({
      where: {
        id: id,
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { message: "Penilaian tidak ditemukan" },
        { status: 404 }
      );
    }

    // Pastikan hanya guru yang bersangkutan yang dapat menghapus penilaian
    if (assessment.teacherId !== user.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Hapus penilaian
    await prisma.assessment.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json({ message: "Penilaian berhasil dihapus" });
  } catch (error: any) {
    console.error("Error deleting assessment:", error);
    
    // Log error details
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    
    // Cek apakah error dari Prisma
    if (error.code) {
      console.error("Prisma error code:", error.code);
      
      // Handle specific Prisma errors
      if (error.code === 'P2025') {
        return NextResponse.json(
          { message: "Penilaian tidak ditemukan" },
          { status: 404 }
        );
      }
    }
    
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
