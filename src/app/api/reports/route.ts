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
    const queryParams: any[] = [startDateStr];
    const sessionFilter = sessionId ? ` AND "sessionId" = $2` : '';
    if (sessionId) queryParams.push(sessionId);

    // ── 1. Aggregate order-level stats in a single query ──
    const summaryRows = await queryCustom(`
      SELECT 
        COUNT(*)::int AS "totalOrders",
        COALESCE(SUM(total), 0) AS "totalRevenue",
        COALESCE(AVG(total), 0) AS "avgOrderValue"
      FROM "Order"
      WHERE status = 'PAID' AND "createdAt" >= $1 ${sessionFilter}
    `, queryParams);

    const { totalOrders, totalRevenue, avgOrderValue } = summaryRows[0] || { totalOrders: 0, totalRevenue: 0, avgOrderValue: 0 };

    // ── 2. Top products by revenue (SQL aggregation) ──
    const topProducts = await queryCustom(`
      SELECT 
        p.name,
        SUM(i.quantity)::int AS qty,
        SUM(i.price * i.quantity) AS revenue
      FROM "OrderItem" i
      JOIN "Product" p ON i."productId" = p.id
      WHERE i."orderId" IN (
        SELECT id FROM "Order" WHERE status = 'PAID' AND "createdAt" >= $1 ${sessionFilter}
      )
      GROUP BY p.id, p.name
      ORDER BY revenue DESC
      LIMIT 10
    `, queryParams);

    // ── 3. Top categories by revenue (SQL aggregation) ──
    const topCategories = await queryCustom(`
      SELECT 
        c.name,
        SUM(i.price * i.quantity) AS revenue
      FROM "OrderItem" i
      JOIN "Product" p ON i."productId" = p.id
      LEFT JOIN "Category" c ON p."categoryId" = c.id
      WHERE i."orderId" IN (
        SELECT id FROM "Order" WHERE status = 'PAID' AND "createdAt" >= $1 ${sessionFilter}
      )
      GROUP BY c.id, c.name
      ORDER BY revenue DESC
      LIMIT 10
    `, queryParams);

    // ── 4. Daily sales aggregation (SQL) ──
    const dailySalesRows = await queryCustom(`
      SELECT 
        TO_CHAR("createdAt" AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM-DD') AS day,
        SUM(total) AS revenue
      FROM "Order"
      WHERE status = 'PAID' AND "createdAt" >= $1 ${sessionFilter}
      GROUP BY day
      ORDER BY day ASC
    `, queryParams);

    const dailySales: Record<string, number> = {};
    dailySalesRows.forEach((row: any) => {
      dailySales[row.day] = parseFloat(row.revenue) || 0;
    });

    // ── 5. Hourly distribution (for enhanced reports) ──
    const hourlyRows = await queryCustom(`
      SELECT 
        EXTRACT(HOUR FROM "createdAt" AT TIME ZONE 'Asia/Kolkata')::int AS hour,
        COUNT(*)::int AS orders,
        SUM(total) AS revenue
      FROM "Order"
      WHERE status = 'PAID' AND "createdAt" >= $1 ${sessionFilter}
      GROUP BY hour
      ORDER BY hour ASC
    `, queryParams);

    const hourlyDistribution: Record<string, { orders: number; revenue: number }> = {};
    hourlyRows.forEach((row: any) => {
      const label = `${String(row.hour).padStart(2, '0')}:00`;
      hourlyDistribution[label] = { orders: row.orders, revenue: parseFloat(row.revenue) || 0 };
    });

    // ── 6. Payment method breakdown ──
    const paymentBreakdown = await queryCustom(`
      SELECT 
        pm.method,
        COUNT(*)::int AS count,
        SUM(pm.amount) AS total
      FROM "Payment" pm
      JOIN "Order" o ON pm."orderId" = o.id
      WHERE o.status = 'PAID' AND o."createdAt" >= $1 ${sessionFilter}
      GROUP BY pm.method
      ORDER BY total DESC
    `, queryParams);

    return NextResponse.json({
      totalOrders: parseInt(totalOrders) || 0,
      totalRevenue: parseFloat(totalRevenue) || 0,
      avgOrderValue: parseFloat(avgOrderValue) || 0,
      topProducts,
      topCategories,
      dailySales,
      hourlyDistribution,
      paymentBreakdown,
    });
  } catch (e: any) {
    console.error('REPORTS_GET_ERROR:', e);
    return NextResponse.json({ error: e.message || 'Database execution failed' }, { status: 500 });
  }
}
