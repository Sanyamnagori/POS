import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Adding new categories and items...');

  // 1. Create Categories
  const catSpecials = await prisma.category.upsert({
    where: { id: 'cat_specials' },
    update: {},
    create: { id: 'cat_specials', name: 'Cafe Specials', color: '#8b5cf6', order: 4 }
  });

  const catBreakfast = await prisma.category.upsert({
    where: { id: 'cat_breakfast' },
    update: {},
    create: { id: 'cat_breakfast', name: 'Breakfast', color: '#f59e0b', order: 5 }
  });

  const catBakery = await prisma.category.upsert({
    where: { id: 'cat_bakery' },
    update: {},
    create: { id: 'cat_bakery', name: 'Bakery', color: '#ec4899', order: 6 }
  });

  // 2. Add Products
  const products = [
    { name: 'Signature Latte', price: 240, tax: 5, categoryId: catSpecials.id, description: 'Our house special with double shot espresso' },
    { name: 'Classic Cold Brew', price: 210, tax: 5, categoryId: catSpecials.id, description: '12-hour steeped smooth coffee' },
    { name: 'Avocado Toast', price: 320, tax: 5, categoryId: catBreakfast.id, description: 'Smashed avocado with sourdough and poached egg' },
    { name: 'Pancake Stack', price: 280, tax: 5, categoryId: catBreakfast.id, description: 'Fluffy pancakes with maple syrup' },
    { name: 'Blueberry Muffin', price: 180, tax: 12, categoryId: catBakery.id, description: 'Warm muffin with fresh blueberries' },
    { name: 'Chocolate Croissant', price: 160, tax: 12, categoryId: catBakery.id, description: 'Flaky buttery croissant with dark chocolate' },
  ];

  for (const p of products) {
    await prisma.product.create({ data: p });
  }

  console.log('Menu items added successfully!');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
