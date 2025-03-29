import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { encrypt, createToken, registerSchema } from '@/lib/auth';

// Remove the dynamic export since it's not compatible with static export
// export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // Log the request method and URL for debugging
    console.log(`Processing ${request.method} request`);
    
    let body;
    try {
      body = await request.json();
      console.log('Request body received:', JSON.stringify(body, null, 2));
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError);
      // Log the actual content received to debug
      const textContent = await request.text().catch(() => 'Could not read request body as text');
      console.log('Received non-JSON content:', textContent.substring(0, 200)); // Log first 200 chars
      
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    try {
      const validatedData = registerSchema.parse(body);
      console.log('Data validation successful');
      
      // Check if user already exists
      const existingUser = await query(
        'SELECT * FROM users WHERE email = $1 OR username = $2',
        [validatedData.email, validatedData.username]
      );

      if (existingUser.rows.length > 0) {
        console.log('User already exists');
        return NextResponse.json(
          { error: 'Email or username already exists' },
          { status: 400 }
        );
      }

      // Insert new user
      const result = await query(
        `INSERT INTO users (email, username, full_name, password_hash)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [
          validatedData.email,
          validatedData.username,
          validatedData.fullName,
          await encrypt(validatedData.password)
        ]
      );

      const user = result.rows[0];
      console.log('User created successfully:', user.id);
      const token = await createToken(user.id);

      const response = NextResponse.json(
        { message: 'Registration successful' },
        { status: 201 }
      );

      // Set authentication token in cookie
      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 24 hours
      });

      return response;
    } catch (validationError) {
      console.error('Validation error:', validationError);
      return NextResponse.json(
        { error: 'Invalid input data', details: (validationError as Error).message },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed', details: (error as Error).message },
      { status: 500 }
    );
  }
}