import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const tokens = await prisma.qRToken.findMany({
      include: { table: { include: { floor: true } } },
    });
    return NextResponse.json(tokens);
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { tableId } = await req.json();
    const existing = await prisma.qRToken.findFirst({ where: { tableId } });
    if (existing) {
      return NextResponse.json(existing);
    }
    const token = await prisma.qRToken.create({
      data: { tableId },
      include: { table: true },
    });
    return NextResponse.json(token);
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
