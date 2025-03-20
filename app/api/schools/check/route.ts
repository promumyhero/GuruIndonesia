import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const schoolName = searchParams.get("name");

    if (!schoolName) {
      return NextResponse.json(
        { error: "Nama sekolah diperlukan" },
        { status: 400 }
      );
    }

    // Check if school exists
    const school = await prisma.school.findFirst({
      where: {
        name: {
          equals: schoolName,
          mode: "insensitive", // Case insensitive search
        },
      },
    });

    return NextResponse.json({
      exists: !!school,
      schoolId: school?.id || null,
    });
  } catch (error) {
    console.error("Error checking school:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memeriksa sekolah" },
      { status: 500 }
    );
  }
}
