import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const tables = await prisma.table.findMany({
      include: { floor: true, qrTokens: { orderBy: { createdAt: 'desc' }, take: 1 } },
      orderBy: { number: 'asc' },
    });
    return NextResponse.json(tables);
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { floorId, number, seats } = await req.json();
    const table = await prisma.table.create({
      data: { floorId, number, seats: parseInt(seats) || 4 },
      include: { floor: true },
    });
    return NextResponse.json(table);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
