import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/app/lib/prisma";
import { loginSchema } from "@/app/lib/validations";
import { signJWT } from "@/app/lib/auth";

// Log the JWT_SECRET (hanya untuk debugging, jangan lakukan ini di production)
console.log("JWT_SECRET in login route:", process.env.JWT_SECRET ? "exists" : "not found");

export async function POST(request: NextRequest) {
  try {
    console.log("Login API called");
    const body = await request.json();
    console.log("Login request body:", body);
    
    const validatedData = loginSchema.parse(body);
    console.log("Validated data:", validatedData);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    console.log("User found:", !!user);

    if (!user) {
      console.log("User not found");
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(
      validatedData.password,
      user.password
    );

    console.log("Password match:", passwordMatch);

    if (!passwordMatch) {
      console.log("Password does not match");
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = await signJWT({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    console.log("JWT token created, length:", token.length);

    // Create response
    const response = NextResponse.json(
      { user: { id: user.id, name: user.name, email: user.email, role: user.role } },
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
