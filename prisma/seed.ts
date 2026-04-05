import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@posca.fe' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@posca.fe',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });
  console.log('Admin user created:', admin.email);

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { id: 'cat-beverages' },
      update: {},
      create: { id: 'cat-beverages', name: 'Beverages', color: '#3b82f6', order: 0 },
    }),
    prisma.category.upsert({
      where: { id: 'cat-food' },
      update: {},
      create: { id: 'cat-food', name: 'Food', color: '#10b981', order: 1 },
    }),
    prisma.category.upsert({
      where: { id: 'cat-snacks' },
      update: {},
      create: { id: 'cat-snacks', name: 'Snacks', color: '#f59e0b', order: 2 },
    }),
    prisma.category.upsert({
      where: { id: 'cat-desserts' },
      update: {},
      create: { id: 'cat-desserts', name: 'Desserts', color: '#ec4899', order: 3 },
    }),
  ]);
  console.log('Categories created:', categories.length);

  // Create products
  const products = await Promise.all([
    prisma.product.upsert({
      where: { id: 'prod-espresso' },
      update: {},
      create: {
        id: 'prod-espresso',
        name: 'Espresso',
        categoryId: 'cat-beverages',
        price: 80,
        tax: 5,
        description: 'Strong Italian coffee',
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod-cappuccino' },
      update: {},
      create: {
        id: 'prod-cappuccino',
        name: 'Cappuccino',
        categoryId: 'cat-beverages',
        price: 120,
        tax: 5,
        description: 'Espresso with steamed milk foam',
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod-latte' },
      update: {},
      create: {
        id: 'prod-latte',
        name: 'Latte',
        categoryId: 'cat-beverages',
        price: 130,
        tax: 5,
        description: 'Espresso with steamed milk',
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod-burger' },
      update: {},
      create: {
        id: 'prod-burger',
        name: 'Classic Burger',
        categoryId: 'cat-food',
        price: 250,
        tax: 10,
        description: 'Beef patty with lettuce, tomato, onion',
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod-pasta' },
      update: {},
      create: {
        id: 'prod-pasta',
        name: 'Penne Arrabbiata',
        categoryId: 'cat-food',
        price: 220,
        tax: 10,
        description: 'Penne with spicy tomato sauce',
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod-sandwich' },
      update: {},
      create: {
        id: 'prod-sandwich',
        name: 'Club Sandwich',
        categoryId: 'cat-snacks',
        price: 180,
        tax: 5,
        description: 'Toasted sandwich with chicken and veggies',
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod-fries' },
      update: {},
      create: {
        id: 'prod-fries',
        name: 'French Fries',
        categoryId: 'cat-snacks',
        price: 100,
        tax: 5,
        description: 'Crispy golden fries',
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod-cake' },
      update: {},
      create: {
        id: 'prod-cake',
        name: 'Chocolate Cake',
        categoryId: 'cat-desserts',
        price: 160,
        tax: 5,
        description: 'Rich chocolate layer cake',
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod-icecream' },
      update: {},
      create: {
        id: 'prod-icecream',
        name: 'Ice Cream Scoop',
        categoryId: 'cat-desserts',
        price: 90,
        tax: 5,
        description: 'Choice of vanilla, chocolate, or strawberry',
      },
    }),
  ]);
  console.log('Products created:', products.length);

  // 1. Clear existing floors and tables to ensure a fresh layout
  await prisma.table.deleteMany({});
  await prisma.floor.deleteMany({});

  // 2. Create Ground Floor (6 tables)
  await prisma.floor.create({
    data: {
      name: 'Ground Floor',
      tables: {
        create: [
          { number: 'G1', seats: 2, isActive: true },
          { number: 'G2', seats: 4, isActive: true },
          { number: 'G3', seats: 4, isActive: true },
          { number: 'G4', seats: 6, isActive: true },
          { number: 'G5', seats: 8, isActive: true },
          { number: 'G6', seats: 4, isActive: true },
        ],
      },
    },
  });

  // 3. Create First Floor (8 tables)
  await prisma.floor.create({
    data: {
      name: 'First Floor',
      tables: {
        create: [
          { number: 'F1', seats: 2, isActive: true },
          { number: 'F2', seats: 2, isActive: true },
          { number: 'F3', seats: 4, isActive: true },
          { number: 'F4', seats: 4, isActive: true },
          { number: 'F5', seats: 6, isActive: true },
          { number: 'F6', seats: 6, isActive: true },
          { number: 'F7', seats: 8, isActive: true },
          { number: 'F8', seats: 4, isActive: true },
        ],
      },
    },
  });
  console.log('Floors and tables reset success!');


  // Create POS config
  await prisma.pOSConfig.upsert({
    where: { id: 'default-config' },
    update: {},
    create: {
      id: 'default-config',
      cashEnabled: true,
      digitalEnabled: true,
      upiEnabled: false,
    },
  });
  console.log('POS config created');

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
