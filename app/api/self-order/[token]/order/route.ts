import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Customer submits order via QR
export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  try {
    const qr = await prisma.qRToken.findUnique({
      where: { token: params.token },
    });
    if (!qr) return NextResponse.json({ error: 'Invalid QR token' }, { status: 404 });

    const config = await prisma.pOSConfig.findFirst();
    if (!config?.selfOrderEnabled) {
      return NextResponse.json({ error: 'Self ordering is disabled' }, { status: 403 });
    }

    const { items, note } = await req.json();
    const total = items.reduce(
      (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity,
      0
    );

    const order = await prisma.order.create({
      data: {
        tableId: qr.tableId,
        total,
        note,
        isQrOrder: true,
        status: 'DRAFT',
        items: {
          create: items.map((item: { productId: string; variantId?: string; quantity: number; price: number }) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: { table: true, items: { include: { product: true } } },
    });
    return NextResponse.json(order);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
