import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { variants, ...data } = await req.json();
    if (data.price) data.price = parseFloat(data.price);
    if (data.tax) data.tax = parseFloat(data.tax);
    const product = await prisma.product.update({
      where: { id: params.id },
      data,
      include: { category: true, variants: true },
    });
    return NextResponse.json(product);
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
