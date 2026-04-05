import { NextRequest, NextResponse } from 'next/server';
import { queryCustom } from '@/backend/database/direct';

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

    const startDateStr = startDate.toISOString();
    
    // Fetch paid orders within the period
    let orderQuery = 'SELECT * FROM "Order" WHERE status = \'PAID\' AND "createdAt" >= $1';
    const queryParams: any[] = [startDateStr];

    if (sessionId) {
      orderQuery += ' AND "sessionId" = $2';
      queryParams.push(sessionId);
    }

    const orders = await queryCustom(orderQuery, queryParams);

    // Fetch order items with product and category info
    const items = await queryCustom(`
      SELECT i.*, p.name as "productName", c.name as "categoryName", c.id as "categoryId"
      FROM "OrderItem" i
      JOIN "Product" p ON i."productId" = p.id
      LEFT JOIN "Category" c ON p."categoryId" = c.id
      WHERE i."orderId" IN (SELECT id FROM "Order" WHERE status = 'PAID' AND "createdAt" >= $1 ${sessionId ? 'AND "sessionId" = $2' : ''})
    `, queryParams);

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum: number, o: any) => sum + o.total, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const productMap: Record<string, { name: string; qty: number; revenue: number }> = {};
    const categoryMap: Record<string, { name: string; revenue: number }> = {};

    items.forEach((item: any) => {
      const pid = item.productId;
      if (!productMap[pid]) productMap[pid] = { name: item.productName, qty: 0, revenue: 0 };
      productMap[pid].qty += item.quantity;
      productMap[pid].revenue += item.price * item.quantity;

      if (item.categoryId) {
        if (!categoryMap[item.categoryId]) categoryMap[item.categoryId] = { name: item.categoryName, revenue: 0 };
        categoryMap[item.categoryId].revenue += item.price * item.quantity;
      }
    });

    const topProducts = Object.values(productMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    const topCategories = Object.values(categoryMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const dailySales: Record<string, number> = {};
    orders.forEach((o: any) => {
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
  } catch (e: any) {
    console.error('REPORTS_GET_ERROR:', e);
    return NextResponse.json({ error: e.message || 'Database execution failed' }, { status: 500 });
  }
}
