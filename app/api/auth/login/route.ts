import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { encrypt, createToken, loginSchema } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [validatedData.email]
    );

    const user = result.rows[0];
console.log(user,'user')
    if (!user || user.password_hash !== await encrypt(validatedData.password)) {
      return NextResponse.json(
        { error: 'Invalid credentials',user:user },
        { status: 401 }
      );
    }

    const token = await createToken(user.id);

    const response = NextResponse.json(
      { message: 'Login successful' },
      { status: 200 }
    );

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}