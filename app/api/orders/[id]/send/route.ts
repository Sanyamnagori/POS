import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Send order to kitchen (status → SENT)
export async function PUT(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const order = await prisma.order.update({
      where: { id: params.id },
      data: { status: 'SENT' },
      include: { table: true, items: { include: { product: true } } },
    });
    return NextResponse.json(order);
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
