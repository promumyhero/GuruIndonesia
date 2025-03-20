import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/app/lib/prisma";
import { registerSchema } from "@/app/lib/validations";
import { signJWT } from "@/app/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 400 }
      );
    }

    // Jika role adalah TEACHER, periksa apakah schoolId valid
    if (validatedData.role === "TEACHER" && validatedData.schoolId) {
      const school = await prisma.school.findUnique({
        where: { id: validatedData.schoolId },
      });

      if (!school) {
        return NextResponse.json(
          { error: "Sekolah tidak ditemukan" },
          { status: 400 }
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Buat user dengan data yang sesuai berdasarkan peran
    const userData = {
      name: validatedData.name,
      email: validatedData.email,
      password: hashedPassword,
      role: validatedData.role,
      ...(validatedData.role === "TEACHER" && validatedData.schoolId
        ? { schoolId: validatedData.schoolId }
        : {}),
    };

    // Create user
    const user = await prisma.user.create({
      data: userData,
    });

    // Jika user adalah PARENT, buat entri Parent
    if (validatedData.role === "PARENT") {
      await prisma.parent.create({
        data: {
          userId: user.id,
        },
      });
    }

    // Create JWT token
    const token = await signJWT({
      id: user.id,
      email: user.email,
      role: user.role,
      hasSchool: user.role === "TEACHER" ? !!user.schoolId : true,
    });

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    
    const response = NextResponse.json(userWithoutPassword, { status: 201 });
    
    // Set cookie in the response
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
    console.error("Registration error:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mendaftar" },
      { status: 500 }
    );
  }
}
