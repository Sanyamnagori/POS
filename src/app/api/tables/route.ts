import { NextRequest, NextResponse } from 'next/server';
import { queryCustom } from '@/backend/database/direct';

export async function GET() {
  try {
    const tables = await queryCustom(`
      SELECT t.*, f.name as "floorName" 
      FROM "Table" t
      LEFT JOIN "Floor" f ON t."floorId" = f.id
      ORDER BY t.number ASC
    `);

    const qrTokens = await queryCustom('SELECT * FROM "QRToken" ORDER BY "createdAt" DESC');

    const enrichedTables = tables.map((t: any) => ({
      ...t,
      floor: t.floorId ? { id: t.floorId, name: t.floorName } : null,
      qrTokens: qrTokens.filter((q: any) => q.tableId === t.id).slice(0, 1)
    }));

    return NextResponse.json(enrichedTables);
  } catch (e: any) {
    console.error('TABLES_GET_ERROR:', e);
    return NextResponse.json({ error: e.message || 'Database execution failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { floorId, number, seats, tableType } = await req.json();
    if (!floorId || !number) return NextResponse.json({ error: 'Floor and number are required' }, { status: 400 });

    const newTable = await queryCustom(
      'INSERT INTO "Table" (id, "floorId", number, seats, "tableType", "isActive", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING *',
      [
        Math.random().toString(36).substring(2, 15),
        floorId,
        number,
        parseInt(seats) || 4,
        tableType || 'Table',
        true
      ]
    );

    const table = newTable[0];
    const floorRows = await queryCustom('SELECT * FROM "Floor" WHERE id = $1', [floorId]);
    table.floor = floorRows[0];

    return NextResponse.json(table);
  } catch (e: any) {
    console.error('TABLES_POST_ERROR:', e);
    return NextResponse.json({ error: e.message || 'Database execution failed' }, { status: 500 });
  }
}
