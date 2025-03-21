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
    
    if (!parent) {
      return NextResponse.json([]);
    }
    
    return NextResponse.json(parent.students);
  } catch (error) {
    console.error("Error fetching parent's children:", error);
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
