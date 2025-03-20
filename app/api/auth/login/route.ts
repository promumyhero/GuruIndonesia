import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/app/lib/prisma";
import { loginSchema } from "@/app/lib/validations";
import { signJWT } from "@/app/lib/auth";
import { School } from "@prisma/client";

// Log the JWT_SECRET (hanya untuk debugging, jangan lakukan ini di production)
console.log("JWT_SECRET in login route:", process.env.JWT_SECRET ? "exists" : "not found");

// Definisikan tipe untuk userData
interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  schoolId: string | null;
  school?: {
    id: string;
    name: string;
    type: string;
  };
  parent?: any;
}

export async function POST(request: NextRequest) {
  try {
    console.log("Login API called");
    const body = await request.json();
    console.log("Login request body:", body);
    
    const validatedData = loginSchema.parse(body);
    console.log("Validated data:", validatedData);

    // Find user by email (basic info first)
    const basicUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    console.log("User found:", !!basicUser);

    if (!basicUser) {
      console.log("User not found");
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(
      validatedData.password,
      basicUser.password
    );

    console.log("Password match:", passwordMatch);

    if (!passwordMatch) {
      console.log("Password does not match");
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

    // Now get the full user data with related information based on role
    const userData: UserData = {
      id: basicUser.id,
      name: basicUser.name,
      email: basicUser.email,
      role: basicUser.role,
      schoolId: basicUser.schoolId,
    };

    // Get additional data based on role
    if (basicUser.role === "TEACHER" && basicUser.schoolId) {
      // Get teacher with school info
      const school = await prisma.school.findUnique({
        where: { id: basicUser.schoolId },
        select: {
          id: true,
          name: true,
          type: true,
        }
      });
      
      if (school) {
        userData.school = school;
      }
    } else if (basicUser.role === "PARENT") {
      // Get parent with students info
      const parent = await prisma.parent.findUnique({
        where: { userId: basicUser.id },
        include: {
          students: {
            select: {
              id: true,
              name: true,
              nisn: true,
              class: true,
            },
          },
        },
      });
      
      if (parent) {
        userData.parent = parent;
      }
    }

    // Create JWT token
    const token = await signJWT({
      id: basicUser.id,
      email: basicUser.email,
      role: basicUser.role,
      hasSchool: basicUser.role === "TEACHER" ? !!basicUser.schoolId : true,
    });

    console.log("JWT token created, length:", token.length);

    const response = NextResponse.json(
      { user: userData },
      { status: 200 }
    );

    // Set cookie in the response
    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
    });

    console.log("Cookie set, returning response");
    return response;
  } catch (error) {
    console.error("Login error:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Terjadi kesalahan saat login" },
      { status: 500 }
    );
  }
}
