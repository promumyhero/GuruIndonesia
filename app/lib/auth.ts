import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from './prisma';
import * as jose from 'jose';

// Log the JWT_SECRET (hanya untuk debugging, jangan lakukan ini di production)
console.log("JWT_SECRET in auth.ts:", process.env.JWT_SECRET ? "exists" : "not found");

const JWT_SECRET = process.env.JWT_SECRET || 'guru_indonesia_secret_key_2025';
// Convert the secret to Uint8Array for jose
const secretKey = new TextEncoder().encode(JWT_SECRET);

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
  hasSchool?: boolean;
  [key: string]: string | number | boolean | undefined; // Add index signature for jose compatibility
}

export async function signJWT(payload: JWTPayload): Promise<string> {
  console.log("Signing JWT with secret length:", JWT_SECRET.length);
  
  // Create a JWT using jose
  const token = await new jose.SignJWT(payload as jose.JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(secretKey);
  
  return token;
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    console.log("Verifying JWT with secret length:", JWT_SECRET.length);
    
    // Verify the JWT using jose
    const { payload } = await jose.jwtVerify(token, secretKey);
    console.log("JWT verification successful, payload:", JSON.stringify(payload));
    
    // Ensure the payload has the required fields
    if (typeof payload.id !== 'string' || 
        typeof payload.email !== 'string' || 
        typeof payload.role !== 'string') {
      console.error("JWT payload missing required fields");
      return null;
    }
    
    return payload as unknown as JWTPayload;
  } catch (error) {
    console.error("JWT verification error:", error);
    return null;
  }
}

export async function getSession() {
  const token = (await cookies()).get('token')?.value;
  
  if (!token) {
    return null;
  }
  
  const payload = await verifyJWT(token);
  if (!payload) {
    return null;
  }
  
  return payload;
}

export async function getCurrentUser() {
  const session = await getSession();
  
  if (!session) {
    return null;
  }
  
  const user = await prisma.user.findUnique({
    where: { id: session.id },
  });
  
  if (!user) {
    return null;
  }
  
  return {
    ...user,
    password: undefined,
  };
}

export async function isAuthenticated(
  request: NextRequest,
  roles: string[] = []
) {
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    return false;
  }
  
  const payload = await verifyJWT(token);
  if (!payload) {
    return false;
  }
  
  if (roles.length > 0 && !roles.includes(payload.role)) {
    return false;
  }
  
  return true;
}

export function withAuth(roles: string[] = []) {
  return async function (request: NextRequest) {
    const isAuth = await isAuthenticated(request, roles);
    
    if (!isAuth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return null;
  };
}
