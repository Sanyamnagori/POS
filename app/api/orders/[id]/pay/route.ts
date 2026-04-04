import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Pay an order
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { method, amount } = await req.json();
    const [order, payment] = await prisma.$transaction([
      prisma.order.update({
        where: { id: params.id },
        data: { status: 'PAID' },
        include: { table: true, items: { include: { product: true } } },
      }),
      prisma.payment.create({
        data: { orderId: params.id, method, amount: parseFloat(amount) },
      }),
    ]);
    return NextResponse.json({ order, payment });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
