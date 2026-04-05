import { NextRequest, NextResponse } from 'next/server';
import { queryCustom } from '@/backend/database/direct';

export async function GET() {
  try {
    // Fetch products with their categories
    const products = await queryCustom(`
      SELECT p.*, c.name as "categoryName", c.color as "categoryColor"
      FROM "Product" p
      LEFT JOIN "Category" c ON p."categoryId" = c.id
      ORDER BY p.name ASC
    `);

    // Fetch all variants and group them by productId
    const variantsList = await queryCustom('SELECT * FROM "ProductVariant"');
    
    const enrichedProducts = products.map((p: any) => ({
      ...p,
      category: p.categoryId ? { id: p.categoryId, name: p.categoryName, color: p.categoryColor } : null,
      variants: variantsList.filter((v: any) => v.productId === p.id)
    }));

    return NextResponse.json(enrichedProducts);
  } catch (e: any) {
    console.error('PRODUCTS_GET_ERROR:', e);
    return NextResponse.json({ error: e.message || 'Database execution failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, categoryId, price, tax, uom, priceTaxIncluded, description, variants } = await req.json();
    if (!name || !categoryId) return NextResponse.json({ error: 'Missing mandatory fields' }, { status: 400 });

    const productId = Math.random().toString(36).substring(2, 15);
    
    // Insert modern product via raw SQL
    const productRows = await queryCustom(
      'INSERT INTO "Product" (id, name, "categoryId", price, tax, uom, "priceTaxIncluded", description, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) RETURNING *',
      [
        productId, 
        name, 
        categoryId, 
        parseFloat(String(price)), 
        parseFloat(String(tax || 0)), 
        uom || 'Unit', 
        Boolean(priceTaxIncluded), 
        description || null
      ]
    );

    // Insert variants if provided
    if (variants && Array.isArray(variants) && variants.length > 0) {
      for (const v of variants) {
        await queryCustom(
          'INSERT INTO "ProductVariant" (id, "productId", attribute, value, "extraPrice") VALUES ($1, $2, $3, $4, $5)',
          [
            Math.random().toString(36).substring(2, 15),
            productId,
            v.attribute,
            v.value,
            parseFloat(String(v.extraPrice || 0))
          ]
        );
      }
    }

    return NextResponse.json(productRows[0]);
  } catch (e: any) {
    console.error('PRODUCTS_POST_ERROR:', e);
    return NextResponse.json({ error: e.message || 'Database execution failed' }, { status: 500 });
  }
}
