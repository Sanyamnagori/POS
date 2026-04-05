import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/backend/database/prisma';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const floor = await prisma.floor.update({ where: { id: params.id }, data, include: { tables: true } });
    return NextResponse.json(floor);
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.floor.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
