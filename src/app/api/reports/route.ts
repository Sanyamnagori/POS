import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/backend/database/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'today';
    const sessionId = searchParams.get('sessionId');

    let startDate = new Date();
    if (period === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'weekly') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'monthly') {
      startDate.setDate(startDate.getDate() - 30);
    } else if (period === 'custom') {
      const from = searchParams.get('from');
      if (from) startDate = new Date(from);
    }

    const where: Record<string, unknown> = {
      status: 'PAID',
      createdAt: { gte: startDate },
    };
    if (sessionId) where.sessionId = sessionId;

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: { include: { product: { include: { category: true } } } },
        payment: true,
      },
    });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Top products
    const productMap: Record<string, { name: string; qty: number; revenue: number }> = {};
    const categoryMap: Record<string, { name: string; revenue: number }> = {};

    orders.forEach((o) => {
      o.items.forEach((item) => {
        const pid = item.productId;
        if (!productMap[pid]) productMap[pid] = { name: item.product.name, qty: 0, revenue: 0 };
        productMap[pid].qty += item.quantity;
        productMap[pid].revenue += item.price * item.quantity;

        const cat = item.product.category;
        if (cat) {
          if (!categoryMap[cat.id]) categoryMap[cat.id] = { name: cat.name, revenue: 0 };
          categoryMap[cat.id].revenue += item.price * item.quantity;
        }
      });
    });

    const topProducts = Object.values(productMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    const topCategories = Object.values(categoryMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Daily sales for chart (last 7 days)
    const dailySales: Record<string, number> = {};
    orders.forEach((o) => {
      const day = new Date(o.createdAt).toLocaleDateString('en-IN');
      if (!dailySales[day]) dailySales[day] = 0;
      dailySales[day] += o.total;
    });

    return NextResponse.json({
      totalOrders,
      totalRevenue,
      avgOrderValue,
      topProducts,
      topCategories,
      dailySales,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
