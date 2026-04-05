import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/backend/database/prisma';
import { signToken } from '@/backend/database/auth';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { name, email, username, password } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check existing by email or username
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: username || undefined }
        ]
      }
    });

    if (existing) {
      const msg = existing.email === email ? 'Email already registered' : 'Username already taken';
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);
    
    // Create new user using Prisma (auto-generates CUID based on schema default)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        username: username || null,
        password: hashed,
        role: 'CASHIER' // Default role for signups
      }
    });

    const token = await signToken({ userId: user.id, email: user.email, role: user.role });
    const res = NextResponse.json({ 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        username: user.username, 
        role: user.role 
      } 
    });

    res.cookies.set('auth-token', token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, 
      path: '/' 
    });

    return res;
  } catch (e: any) {
    console.error('SIGNUP_ERROR:', e);
    return NextResponse.json({ error: e.message || 'Identity registration failed' }, { status: 500 });
  }
}
