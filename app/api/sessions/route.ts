import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const sessions = await prisma.session.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { openedAt: 'desc' },
      take: 10,
    });
    return NextResponse.json(sessions);
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token')?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { openingCash } = await req.json();
    const session = await prisma.session.create({
      data: { userId: payload.userId, openingCash: parseFloat(openingCash) || 0 },
      include: { user: { select: { name: true, email: true } } },
    });
    return NextResponse.json(session);
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
