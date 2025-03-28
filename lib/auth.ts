import { SignJWT, jwtVerify } from 'jose';
import { z } from 'zod';
import crypto from 'crypto';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function encrypt(password: string): Promise<string> {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function createToken(userId: string): Promise<string> {
  return await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(secret);
}

export async function verifyToken(token: string) {
  try {
    const verified = await jwtVerify(token, secret);
    return verified.payload as { userId: string };
  } catch (err) {
    return null;
  }
}

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(20),
  fullName: z.string().min(2).max(50),
  password: z.string().min(8),
});

export const updateProfileSchema = z.object({
  username: z.string().min(3).max(20).optional(),
  fullName: z.string().min(2).max(50).optional(),
  currentPassword: z.string().min(8).optional(),
  newPassword: z.string().min(8).optional(),
});