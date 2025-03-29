import { z } from 'zod';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

// Schema for registration validation
export const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(30),
  fullName: z.string().min(2).max(100),
  password: z.string().min(8)
});

// Add login schema
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required")
});

// Password encryption
export async function encrypt(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Token creation
export async function createToken(userId: number): Promise<string> {
  const secret = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-fallback-secret'
  );
  
  const token = await new SignJWT({ id: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);
  
  return token;
}

// Token verification
export async function verifyToken(token: string): Promise<any> {
  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'your-fallback-secret'
    );
    
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// Password verification
export async function verifyPassword(
  password: string, 
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}