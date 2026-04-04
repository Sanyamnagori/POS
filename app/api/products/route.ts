import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: { category: true, variants: true },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(products);
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, categoryId, price, tax, description, variants } = await req.json();
    const product = await prisma.product.create({
      data: {
        name,
        categoryId,
        price: parseFloat(price),
        tax: parseFloat(tax || 0),
        description,
        variants: variants?.length
          ? { create: variants.map((v: { attribute: string; value: string; extraPrice: number }) => ({
              attribute: v.attribute,
              value: v.value,
              extraPrice: parseFloat(v.extraPrice || 0),
            })) }
          : undefined,
      },
      include: { category: true, variants: true },
    });
    return NextResponse.json(product);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
