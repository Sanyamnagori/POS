import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/backend/database/prisma';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({ orderBy: { order: 'asc' } });
    return NextResponse.json(categories);
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, color } = await req.json();
    const last = await prisma.category.findFirst({ orderBy: { order: 'desc' } });
    const category = await prisma.category.create({
      data: { name, color: color || '#3b82f6', order: (last?.order ?? -1) + 1 },
    });
    return NextResponse.json(category);
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
