import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser, signJWT } from "@/app/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Tidak terautentikasi" },
        { status: 401 }
      );
    }

    if (user.role !== "TEACHER") {
      return NextResponse.json(
        { error: "Hanya guru yang dapat membuat sekolah" },
        { status: 403 }
      );
    }

    const { schoolName, schoolAddress, schoolType } = await request.json();

    if (!schoolName || !schoolAddress || !schoolType) {
      return NextResponse.json(
        { error: "Semua field diperlukan" },
        { status: 400 }
      );
    }

    // Create the school
    const school = await prisma.school.create({
      data: {
        name: schoolName,
        address: schoolAddress,
        type: schoolType,
      },
    });

    // Update the user with the school ID
    await prisma.user.update({
      where: { id: user.id },
      data: { schoolId: school.id },
    });

    // Create a new JWT token with updated hasSchool value
    const token = await signJWT({
      id: user.id,
      email: user.email,
      role: user.role,
      hasSchool: true, // Now the user has a school
    });

    const response = NextResponse.json({
      success: true,
      school,
    });

    // Set the updated token in the cookie
    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
    });

    return response;
  } catch (error) {
    console.error("Error creating school:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat membuat sekolah" },
      { status: 500 }
    );
  }
}
