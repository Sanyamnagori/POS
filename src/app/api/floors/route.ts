import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/backend/database/prisma';

export async function GET() {
  try {
    const floors = await prisma.floor.findMany({ include: { tables: { orderBy: { number: 'asc' } } } });
    return NextResponse.json(floors);
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();
    const floor = await prisma.floor.create({ data: { name }, include: { tables: true } });
    return NextResponse.json(floor);
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
