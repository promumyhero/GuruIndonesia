import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from 'jose';

// Paths that don't require authentication
const publicPaths = [
  "/",
  "/auth/login",
  "/auth/register",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
];

// Log the JWT_SECRET (hanya untuk debugging, jangan lakukan ini di production)
console.log("JWT_SECRET in middleware:", process.env.JWT_SECRET ? "exists" : "not found");

// Define JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'guru_indonesia_secret_key_2025';
// Convert the secret to Uint8Array for jose
const secretKey = new TextEncoder().encode(JWT_SECRET);

// Verify JWT token
async function verifyJWT(token: string) {
  try {
    console.log("Verifying JWT with secret length:", JWT_SECRET.length);
    
    // Verify the JWT using jose
    const { payload } = await jose.jwtVerify(token, secretKey);
    return payload;
  } catch (error) {
    console.error("JWT verification error:", error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log("Middleware checking path:", pathname);
  
  // Check if the path is public
  if (publicPaths.some(path => pathname === path || pathname.startsWith(path + "/"))) {
    console.log("Public path, allowing access");
    return NextResponse.next();
  }
  
  // Check if it's an API route
  const isApiRoute = pathname.startsWith("/api");
  
  // Get token from cookies
  const token = request.cookies.get("token")?.value;
  
  console.log("Token exists:", !!token);
  
  // If no token, redirect to login
  if (!token) {
    console.log("No token, redirecting to login");
    if (isApiRoute) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
  
  try {
    // Verify token
    const payload = await verifyJWT(token);
    console.log("Token payload:", payload ? "valid" : "invalid");
    
    if (!payload) {
      console.log("Invalid token, redirecting to login");
      if (isApiRoute) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    
    // Continue with the request
    console.log("Authentication successful, proceeding with user:", payload.email);
    return NextResponse.next();
  } catch (error) {
    console.error("Error in middleware:", error);
    if (isApiRoute) {
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
}

// Configure which paths should be processed by the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
