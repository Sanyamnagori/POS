import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/backend/database/prisma';
import { verifyToken } from '@/backend/database/auth';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const tableId = searchParams.get('tableId');
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (tableId) where.tableId = tableId;

    const orders = await prisma.order.findMany({
      where,
      include: {
        table: true,
        items: { include: { product: { include: { category: true } }, variant: true } },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(orders);
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token')?.value;
    const payload = token ? await verifyToken(token) : null;

    const { tableId, sessionId, items, note, isQrOrder } = await req.json();

    const total = items.reduce(
      (sum: number, item: { price: number; tax: number; quantity: number }) =>
        sum + (item.price * item.quantity * (1 + (item.tax || 0) / 100)),
      0
    );

    const order = await prisma.order.create({
      data: {
        tableId,
        sessionId,
        userId: payload?.userId,
        total,
        note,
        isQrOrder: isQrOrder || false,
        items: {
          create: items.map((item: { productId: string; variantId?: string; quantity: number; price: number; note?: string }) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
            note: item.note,
          })),
        },
      },
      include: {
        table: true,
        items: { include: { product: { include: { category: true } }, variant: true } },
      },
    });
    return NextResponse.json(order);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
