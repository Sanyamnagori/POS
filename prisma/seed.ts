import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Deterministic ID generator for reproducibility
function makeId(prefix: string, idx: number): string {
  return `${prefix}-${String(idx).padStart(3, '0')}`;
}

// ──────────────────────────────────────────────
// CATEGORY DEFINITIONS (15 categories)
// ──────────────────────────────────────────────
const CATEGORIES = [
  { id: 'cat-coffee',       name: 'Coffee',           color: '#6F4E37', order: 0 },
  { id: 'cat-tea',          name: 'Tea & Infusions',  color: '#2E8B57', order: 1 },
  { id: 'cat-smoothies',    name: 'Smoothies & Juices', color: '#FF6347', order: 2 },
  { id: 'cat-softdrinks',   name: 'Soft Drinks',      color: '#1E90FF', order: 3 },
  { id: 'cat-breakfast',    name: 'Breakfast',         color: '#FFD700', order: 4 },
  { id: 'cat-starters',     name: 'Starters',         color: '#FF8C00', order: 5 },
  { id: 'cat-burgers',      name: 'Burgers',          color: '#DC143C', order: 6 },
  { id: 'cat-pizza',        name: 'Pizza',            color: '#FF4500', order: 7 },
  { id: 'cat-pasta',        name: 'Pasta',            color: '#CD853F', order: 8 },
  { id: 'cat-maincourse',   name: 'Main Course',      color: '#8B0000', order: 9 },
  { id: 'cat-salads',       name: 'Salads & Bowls',   color: '#228B22', order: 10 },
  { id: 'cat-sandwiches',   name: 'Sandwiches & Wraps', color: '#DAA520', order: 11 },
  { id: 'cat-snacks',       name: 'Sides & Snacks',   color: '#F4A460', order: 12 },
  { id: 'cat-desserts',     name: 'Desserts',         color: '#FF69B4', order: 13 },
  { id: 'cat-specials',     name: "Chef's Specials",  color: '#9400D3', order: 14 },
];

// ──────────────────────────────────────────────
// PRODUCT DEFINITIONS (100 products)
// ──────────────────────────────────────────────
interface ProductDef {
  id: string; name: string; categoryId: string; price: number; tax: number; description: string; uom?: string;
  variants?: Array<{ attribute: string; value: string; extraPrice: number }>;
}

const PRODUCTS: ProductDef[] = [
  // ── Coffee (8) ──
  { id: 'prod-001', name: 'Espresso',              categoryId: 'cat-coffee', price: 80,   tax: 5, description: 'Rich single-shot Italian espresso' },
  { id: 'prod-002', name: 'Americano',             categoryId: 'cat-coffee', price: 100,  tax: 5, description: 'Espresso with hot water' },
  { id: 'prod-003', name: 'Cappuccino',            categoryId: 'cat-coffee', price: 140,  tax: 5, description: 'Espresso with steamed milk foam',
    variants: [{ attribute: 'Size', value: 'Regular', extraPrice: 0 }, { attribute: 'Size', value: 'Large', extraPrice: 30 }] },
  { id: 'prod-004', name: 'Latte',                 categoryId: 'cat-coffee', price: 150,  tax: 5, description: 'Espresso with creamy steamed milk',
    variants: [{ attribute: 'Size', value: 'Regular', extraPrice: 0 }, { attribute: 'Size', value: 'Large', extraPrice: 30 }] },
  { id: 'prod-005', name: 'Mocha',                 categoryId: 'cat-coffee', price: 170,  tax: 5, description: 'Espresso with chocolate and milk' },
  { id: 'prod-006', name: 'Cold Brew',             categoryId: 'cat-coffee', price: 160,  tax: 5, description: '24-hour cold-steeped coffee' },
  { id: 'prod-007', name: 'Caramel Macchiato',     categoryId: 'cat-coffee', price: 180,  tax: 5, description: 'Espresso with vanilla and caramel drizzle' },
  { id: 'prod-008', name: 'Irish Coffee',          categoryId: 'cat-coffee', price: 220,  tax: 5, description: 'Coffee with cream and whiskey flavoring' },

  // ── Tea (7) ──
  { id: 'prod-009', name: 'Classic Masala Chai',    categoryId: 'cat-tea', price: 60,   tax: 5, description: 'Traditional Indian spiced tea' },
  { id: 'prod-010', name: 'Green Tea',             categoryId: 'cat-tea', price: 70,   tax: 5, description: 'Japanese-style sencha' },
  { id: 'prod-011', name: 'Earl Grey',             categoryId: 'cat-tea', price: 80,   tax: 5, description: 'Bergamot-infused black tea' },
  { id: 'prod-012', name: 'Chamomile Infusion',    categoryId: 'cat-tea', price: 90,   tax: 5, description: 'Caffeine-free herbal blend' },
  { id: 'prod-013', name: 'Matcha Latte',          categoryId: 'cat-tea', price: 160,  tax: 5, description: 'Ceremonial-grade matcha with milk' },
  { id: 'prod-014', name: 'Iced Lemon Tea',        categoryId: 'cat-tea', price: 90,   tax: 5, description: 'Chilled tea with fresh lemon' },
  { id: 'prod-015', name: 'Rose Petal Tea',        categoryId: 'cat-tea', price: 110,  tax: 5, description: 'Fragrant rose and black tea blend' },

  // ── Smoothies & Juices (7) ──
  { id: 'prod-016', name: 'Mixed Berry Smoothie',  categoryId: 'cat-smoothies', price: 180, tax: 5, description: 'Blueberry, strawberry, raspberry blend' },
  { id: 'prod-017', name: 'Mango Lassi',           categoryId: 'cat-smoothies', price: 140, tax: 5, description: 'Indian-style yogurt mango drink' },
  { id: 'prod-018', name: 'Avocado Shake',         categoryId: 'cat-smoothies', price: 190, tax: 5, description: 'Creamy avocado with honey' },
  { id: 'prod-019', name: 'Watermelon Mint Juice', categoryId: 'cat-smoothies', price: 120, tax: 5, description: 'Fresh-pressed watermelon with mint' },
  { id: 'prod-020', name: 'Orange Juice',          categoryId: 'cat-smoothies', price: 100, tax: 5, description: 'Freshly squeezed Valencia oranges' },
  { id: 'prod-021', name: 'Green Detox',           categoryId: 'cat-smoothies', price: 170, tax: 5, description: 'Spinach, kale, apple, ginger' },
  { id: 'prod-022', name: 'Tropical Paradise',     categoryId: 'cat-smoothies', price: 190, tax: 5, description: 'Pineapple, coconut, passion fruit' },

  // ── Soft Drinks (6) ──
  { id: 'prod-023', name: 'Sparkling Water',       categoryId: 'cat-softdrinks', price: 60,  tax: 12, description: 'Carbonated mineral water' },
  { id: 'prod-024', name: 'Cola',                  categoryId: 'cat-softdrinks', price: 50,  tax: 12, description: 'Classic cola, 330ml can' },
  { id: 'prod-025', name: 'Lemonade',              categoryId: 'cat-softdrinks', price: 80,  tax: 12, description: 'House-made citrus lemonade' },
  { id: 'prod-026', name: 'Iced Mojito (Non-Alc)', categoryId: 'cat-softdrinks', price: 110, tax: 12, description: 'Lime, mint, soda – virgin' },
  { id: 'prod-027', name: 'Ginger Ale',            categoryId: 'cat-softdrinks', price: 70,  tax: 12, description: 'Spicy ginger fizz' },
  { id: 'prod-028', name: 'Blue Lagoon',           categoryId: 'cat-softdrinks', price: 130, tax: 12, description: 'Blue curaçao syrup with lemon soda' },

  // ── Breakfast (8) ──
  { id: 'prod-029', name: 'Classic Eggs Benedict',  categoryId: 'cat-breakfast', price: 220, tax: 5, description: 'Poached eggs, hollandaise, English muffin' },
  { id: 'prod-030', name: 'Avocado Toast',         categoryId: 'cat-breakfast', price: 180, tax: 5, description: 'Sourdough with smashed avocado & seeds' },
  { id: 'prod-031', name: 'Pancake Stack',         categoryId: 'cat-breakfast', price: 200, tax: 5, description: 'Fluffy pancakes with maple syrup & berries' },
  { id: 'prod-032', name: 'Granola Bowl',          categoryId: 'cat-breakfast', price: 160, tax: 5, description: 'Greek yogurt, granola, fresh fruit' },
  { id: 'prod-033', name: 'French Toast',          categoryId: 'cat-breakfast', price: 190, tax: 5, description: 'Brioche with cinnamon and cream' },
  { id: 'prod-034', name: 'Omelette',              categoryId: 'cat-breakfast', price: 170, tax: 5, description: 'Three-egg omelette, choice of fillings' },
  { id: 'prod-035', name: 'English Breakfast',     categoryId: 'cat-breakfast', price: 290, tax: 5, description: 'Full English with beans, toast, eggs, sausage' },
  { id: 'prod-036', name: 'Croissant',             categoryId: 'cat-breakfast', price: 90,  tax: 5, description: 'Freshly baked butter croissant' },

  // ── Starters (7) ──
  { id: 'prod-037', name: 'Bruschetta',            categoryId: 'cat-starters', price: 160, tax: 5, description: 'Toasted bread with tomato and basil' },
  { id: 'prod-038', name: 'Garlic Bread',          categoryId: 'cat-starters', price: 120, tax: 5, description: 'Crispy garlic butter baguette' },
  { id: 'prod-039', name: 'Chicken Wings (6pc)',   categoryId: 'cat-starters', price: 240, tax: 5, description: 'Buffalo-style with ranch dip',
    variants: [{ attribute: 'Spice', value: 'Mild', extraPrice: 0 }, { attribute: 'Spice', value: 'Hot', extraPrice: 0 }, { attribute: 'Spice', value: 'Extra Hot', extraPrice: 20 }] },
  { id: 'prod-040', name: 'Soup of the Day',       categoryId: 'cat-starters', price: 130, tax: 5, description: 'Chef\'s daily selection with croutons' },
  { id: 'prod-041', name: 'Spring Rolls (4pc)',    categoryId: 'cat-starters', price: 140, tax: 5, description: 'Crispy vegetable spring rolls' },
  { id: 'prod-042', name: 'Hummus Platter',        categoryId: 'cat-starters', price: 180, tax: 5, description: 'Chickpea hummus with pita and olives' },
  { id: 'prod-043', name: 'Nachos Grande',         categoryId: 'cat-starters', price: 220, tax: 5, description: 'Loaded tortilla chips with cheese and salsa' },

  // ── Burgers (7) ──
  { id: 'prod-044', name: 'Classic Beef Burger',   categoryId: 'cat-burgers', price: 280, tax: 10, description: 'Angus patty, lettuce, tomato, pickles' },
  { id: 'prod-045', name: 'Chicken Burger',        categoryId: 'cat-burgers', price: 260, tax: 10, description: 'Grilled chicken breast with mayo' },
  { id: 'prod-046', name: 'Veggie Burger',         categoryId: 'cat-burgers', price: 240, tax: 10, description: 'Black bean and corn patty' },
  { id: 'prod-047', name: 'Double Smash Burger',   categoryId: 'cat-burgers', price: 350, tax: 10, description: 'Two smashed patties, American cheese' },
  { id: 'prod-048', name: 'BBQ Bacon Burger',      categoryId: 'cat-burgers', price: 320, tax: 10, description: 'Smoked bacon, BBQ sauce, onion ring' },
  { id: 'prod-049', name: 'Fish Burger',           categoryId: 'cat-burgers', price: 270, tax: 10, description: 'Crispy fish fillet with tartar sauce' },
  { id: 'prod-050', name: 'Mushroom Swiss Burger', categoryId: 'cat-burgers', price: 300, tax: 10, description: 'Sautéed mushrooms and Swiss cheese' },

  // ── Pizza (7) ──
  { id: 'prod-051', name: 'Margherita',            categoryId: 'cat-pizza', price: 250, tax: 10, description: 'Classic tomato, mozzarella, basil',
    variants: [{ attribute: 'Size', value: 'Medium', extraPrice: 0 }, { attribute: 'Size', value: 'Large', extraPrice: 80 }] },
  { id: 'prod-052', name: 'Pepperoni',             categoryId: 'cat-pizza', price: 300, tax: 10, description: 'Loaded pepperoni and mozzarella',
    variants: [{ attribute: 'Size', value: 'Medium', extraPrice: 0 }, { attribute: 'Size', value: 'Large', extraPrice: 80 }] },
  { id: 'prod-053', name: 'BBQ Chicken Pizza',     categoryId: 'cat-pizza', price: 320, tax: 10, description: 'Smoky BBQ with grilled chicken' },
  { id: 'prod-054', name: 'Veggie Supreme',        categoryId: 'cat-pizza', price: 280, tax: 10, description: 'Bell peppers, mushroom, olives, onion' },
  { id: 'prod-055', name: 'Four Cheese',           categoryId: 'cat-pizza', price: 310, tax: 10, description: 'Mozzarella, cheddar, parmesan, gouda' },
  { id: 'prod-056', name: 'Hawaiian',              categoryId: 'cat-pizza', price: 290, tax: 10, description: 'Ham and pineapple on tomato base' },
  { id: 'prod-057', name: 'Truffle Mushroom',      categoryId: 'cat-pizza', price: 380, tax: 10, description: 'Wild mushroom with truffle oil drizzle' },

  // ── Pasta (7) ──
  { id: 'prod-058', name: 'Spaghetti Bolognese',   categoryId: 'cat-pasta', price: 240, tax: 10, description: 'Classic meat ragù sauce' },
  { id: 'prod-059', name: 'Penne Arrabbiata',      categoryId: 'cat-pasta', price: 220, tax: 10, description: 'Spicy chili tomato sauce' },
  { id: 'prod-060', name: 'Alfredo Fettuccine',    categoryId: 'cat-pasta', price: 260, tax: 10, description: 'Creamy parmesan white sauce' },
  { id: 'prod-061', name: 'Aglio E Olio',          categoryId: 'cat-pasta', price: 210, tax: 10, description: 'Garlic, olive oil, chili flakes' },
  { id: 'prod-062', name: 'Carbonara',             categoryId: 'cat-pasta', price: 270, tax: 10, description: 'Egg, pecorino, guanciale' },
  { id: 'prod-063', name: 'Mac & Cheese',          categoryId: 'cat-pasta', price: 200, tax: 10, description: 'Baked three-cheese macaroni' },
  { id: 'prod-064', name: 'Pesto Pasta',           categoryId: 'cat-pasta', price: 230, tax: 10, description: 'Fresh basil pesto with pine nuts' },

  // ── Main Course (8) ──
  { id: 'prod-065', name: 'Grilled Chicken',       categoryId: 'cat-maincourse', price: 320, tax: 10, description: 'Herb-marinated chicken breast with sides' },
  { id: 'prod-066', name: 'Fish & Chips',          categoryId: 'cat-maincourse', price: 290, tax: 10, description: 'Beer-battered cod with fries and tartar' },
  { id: 'prod-067', name: 'Steak (200g)',          categoryId: 'cat-maincourse', price: 550, tax: 10, description: 'Ribeye steak with mashed potatoes',
    variants: [{ attribute: 'Doneness', value: 'Medium Rare', extraPrice: 0 }, { attribute: 'Doneness', value: 'Medium', extraPrice: 0 }, { attribute: 'Doneness', value: 'Well Done', extraPrice: 0 }]},
  { id: 'prod-068', name: 'Lamb Chops',            categoryId: 'cat-maincourse', price: 480, tax: 10, description: 'Rosemary-glazed NZ lamb with veggies' },
  { id: 'prod-069', name: 'Butter Chicken',        categoryId: 'cat-maincourse', price: 280, tax: 10, description: 'Creamy tomato curry with naan' },
  { id: 'prod-070', name: 'Paneer Tikka Masala',   categoryId: 'cat-maincourse', price: 250, tax: 10, description: 'Cottage cheese in spiced gravy' },
  { id: 'prod-071', name: 'Thai Green Curry',      categoryId: 'cat-maincourse', price: 270, tax: 10, description: 'Coconut curry with jasmine rice' },
  { id: 'prod-072', name: 'Seafood Risotto',       categoryId: 'cat-maincourse', price: 380, tax: 10, description: 'Arborio rice with prawns and calamari' },

  // ── Salads & Bowls (6) ──
  { id: 'prod-073', name: 'Caesar Salad',          categoryId: 'cat-salads', price: 200, tax: 5, description: 'Romaine, croutons, parmesan dressing' },
  { id: 'prod-074', name: 'Greek Salad',           categoryId: 'cat-salads', price: 180, tax: 5, description: 'Feta, olives, cucumber, tomato' },
  { id: 'prod-075', name: 'Quinoa Buddha Bowl',    categoryId: 'cat-salads', price: 240, tax: 5, description: 'Quinoa, roasted veggies, tahini' },
  { id: 'prod-076', name: 'Poke Bowl',             categoryId: 'cat-salads', price: 290, tax: 5, description: 'Salmon, avocado, edamame, sushi rice' },
  { id: 'prod-077', name: 'Chicken Protein Bowl',  categoryId: 'cat-salads', price: 260, tax: 5, description: 'Grilled chicken with brown rice and greens' },
  { id: 'prod-078', name: 'Mediterranean Bowl',    categoryId: 'cat-salads', price: 230, tax: 5, description: 'Falafel, hummus, tabbouleh, pita' },

  // ── Sandwiches & Wraps (7) ──
  { id: 'prod-079', name: 'Club Sandwich',         categoryId: 'cat-sandwiches', price: 200, tax: 5, description: 'Triple-decker with chicken, bacon, egg' },
  { id: 'prod-080', name: 'Grilled Cheese',        categoryId: 'cat-sandwiches', price: 150, tax: 5, description: 'Sourdough with cheddar and mozzarella' },
  { id: 'prod-081', name: 'Chicken Shawarma Wrap', categoryId: 'cat-sandwiches', price: 190, tax: 5, description: 'Spiced chicken with garlic sauce' },
  { id: 'prod-082', name: 'Falafel Wrap',          categoryId: 'cat-sandwiches', price: 170, tax: 5, description: 'Crispy falafel with tahini and veggies' },
  { id: 'prod-083', name: 'BLT Sandwich',          categoryId: 'cat-sandwiches', price: 180, tax: 5, description: 'Bacon, lettuce, tomato on toasted bread' },
  { id: 'prod-084', name: 'Panini Caprese',        categoryId: 'cat-sandwiches', price: 190, tax: 5, description: 'Mozzarella, tomato, pesto on ciabatta' },
  { id: 'prod-085', name: 'Veggie Sub',            categoryId: 'cat-sandwiches', price: 160, tax: 5, description: 'Assorted grilled vegetables on sub roll' },

  // ── Sides & Snacks (7) ──
  { id: 'prod-086', name: 'French Fries',          categoryId: 'cat-snacks', price: 100, tax: 5, description: 'Crispy golden potato fries' },
  { id: 'prod-087', name: 'Sweet Potato Fries',    categoryId: 'cat-snacks', price: 120, tax: 5, description: 'Oven-baked sweet potato wedges' },
  { id: 'prod-088', name: 'Onion Rings',           categoryId: 'cat-snacks', price: 110, tax: 5, description: 'Beer-battered crispy rings' },
  { id: 'prod-089', name: 'Mozzarella Sticks',     categoryId: 'cat-snacks', price: 140, tax: 5, description: 'Breaded mozzarella with marinara' },
  { id: 'prod-090', name: 'Loaded Potato Skins',   categoryId: 'cat-snacks', price: 160, tax: 5, description: 'Bacon, cheese, sour cream' },
  { id: 'prod-091', name: 'Coleslaw',              categoryId: 'cat-snacks', price: 60,  tax: 5, description: 'Creamy cabbage slaw' },
  { id: 'prod-092', name: 'Masala Papad',          categoryId: 'cat-snacks', price: 50,  tax: 5, description: 'Crispy papad with onion topping' },

  // ── Desserts (8) ──
  { id: 'prod-093', name: 'Chocolate Lava Cake',   categoryId: 'cat-desserts', price: 200, tax: 5, description: 'Warm molten chocolate center' },
  { id: 'prod-094', name: 'Tiramisu',              categoryId: 'cat-desserts', price: 220, tax: 5, description: 'Italian mascarpone and coffee layers' },
  { id: 'prod-095', name: 'Cheesecake',            categoryId: 'cat-desserts', price: 210, tax: 5, description: 'New York style with berry compote' },
  { id: 'prod-096', name: 'Gelato (2 Scoops)',     categoryId: 'cat-desserts', price: 140, tax: 5, description: 'Italian gelato, choose your flavors',
    variants: [{ attribute: 'Flavor', value: 'Vanilla', extraPrice: 0 }, { attribute: 'Flavor', value: 'Chocolate', extraPrice: 0 }, { attribute: 'Flavor', value: 'Pistachio', extraPrice: 20 }, { attribute: 'Flavor', value: 'Mango', extraPrice: 10 }] },
  { id: 'prod-097', name: 'Brownie Sundae',        categoryId: 'cat-desserts', price: 190, tax: 5, description: 'Warm brownie with ice cream and fudge' },
  { id: 'prod-098', name: 'Gulab Jamun',           categoryId: 'cat-desserts', price: 100, tax: 5, description: 'Traditional Indian milk-solid dessert' },
  { id: 'prod-099', name: 'Crème Brûlée',          categoryId: 'cat-desserts', price: 230, tax: 5, description: 'Caramelized custard' },
  { id: 'prod-100', name: 'Fruit Platter',         categoryId: 'cat-desserts', price: 150, tax: 5, description: 'Seasonal fresh fruit selection' },

  // ── Chef's Specials (5) ──
  { id: 'prod-101', name: 'Lobster Thermidor',     categoryId: 'cat-specials', price: 850, tax: 18, description: 'Half lobster with creamy gruyère sauce' },
  { id: 'prod-102', name: 'Wagyu Sliders (3pcs)',  categoryId: 'cat-specials', price: 650, tax: 18, description: 'A5 wagyu mini burgers with truffle aioli' },
  { id: 'prod-103', name: 'Saffron Risotto',       categoryId: 'cat-specials', price: 420, tax: 18, description: 'Saffron-infused arborio with gold leaf' },
  { id: 'prod-104', name: 'Tasting Platter',       categoryId: 'cat-specials', price: 580, tax: 18, description: 'Chef\'s 5-course miniature selection' },
  { id: 'prod-105', name: 'Truffle Mac & Cheese',  categoryId: 'cat-specials', price: 360, tax: 18, description: 'Mac & cheese with black truffle shavings' },
];

// ──────────────────────────────────────────────
// HELPER: Seeded random number generator
// ──────────────────────────────────────────────
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rng = seededRandom(42);

function pick<T>(arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function pickN<T>(arr: T[], min: number, max: number): T[] {
  const n = min + Math.floor(rng() * (max - min + 1));
  const shuffled = [...arr].sort(() => rng() - 0.5);
  return shuffled.slice(0, n);
}

async function main() {
  console.log('🚀 Seeding database with comprehensive data...\n');

  // ═══════════════════════════════════════════
  // 1. ADMIN USER
  // ═══════════════════════════════════════════
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@posca.fe' },
    update: {},
    create: { name: 'Admin', email: 'admin@posca.fe', password: hashedPassword, role: 'ADMIN' },
  });
  console.log('✅ Admin user:', admin.email);

  // ═══════════════════════════════════════════
  // 2. CATEGORIES (15)
  // ═══════════════════════════════════════════
  for (const cat of CATEGORIES) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: { name: cat.name, color: cat.color, order: cat.order },
      create: cat,
    });
  }
  console.log(`✅ Categories: ${CATEGORIES.length}`);

  // ═══════════════════════════════════════════
  // 3. PRODUCTS (105) + Variants
  // ═══════════════════════════════════════════
  for (const prod of PRODUCTS) {
    const { variants, ...productData } = prod;
    await prisma.product.upsert({
      where: { id: prod.id },
      update: { name: prod.name, price: prod.price, tax: prod.tax, description: prod.description, categoryId: prod.categoryId },
      create: productData,
    });

    if (variants && variants.length > 0) {
      // Delete existing variants for this product to avoid duplicates on re-seed
      await prisma.productVariant.deleteMany({ where: { productId: prod.id } });
      for (let vi = 0; vi < variants.length; vi++) {
        await prisma.productVariant.create({
          data: {
            id: `var-${prod.id}-${vi}`,
            productId: prod.id,
            attribute: variants[vi].attribute,
            value: variants[vi].value,
            extraPrice: variants[vi].extraPrice,
          },
        });
      }
    }
  }
  console.log(`✅ Products: ${PRODUCTS.length} (with variants)`);

  // ═══════════════════════════════════════════
  // 4. FLOORS & TABLES
  // ═══════════════════════════════════════════
  await prisma.table.deleteMany({});
  await prisma.floor.deleteMany({});

  const groundFloor = await prisma.floor.create({
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
    include: { tables: true },
  });

  const firstFloor = await prisma.floor.create({
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
    include: { tables: true },
  });

  const allTables = [...groundFloor.tables, ...firstFloor.tables];
  console.log(`✅ Floors: 2, Tables: ${allTables.length}`);

  // ═══════════════════════════════════════════
  // 5. POS CONFIG
  // ═══════════════════════════════════════════
  await prisma.pOSConfig.upsert({
    where: { id: 'default-config' },
    update: {},
    create: { id: 'default-config', cashEnabled: true, digitalEnabled: true, upiEnabled: true },
  });
  console.log('✅ POS Config');

  // ═══════════════════════════════════════════
  // 6. SESSION
  // ═══════════════════════════════════════════
  // Delete old orders, payments, items to avoid FK conflicts
  await prisma.payment.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.session.deleteMany({});

  const session = await prisma.session.create({
    data: { userId: admin.id, openingCash: 5000 },
  });
  console.log('✅ Session created');

  // ═══════════════════════════════════════════
  // 7. GENERATE 300 REALISTIC ORDERS
  // ═══════════════════════════════════════════
  console.log('\n📦 Generating 300 orders (this may take a moment)...');

  const ORDER_COUNT = 300;
  const paymentMethods: Array<'CASH' | 'DIGITAL' | 'UPI'> = ['CASH', 'DIGITAL', 'UPI'];
  const now = new Date();

  // Spread orders across the last 30 days
  for (let i = 0; i < ORDER_COUNT; i++) {
    const table = pick(allTables);
    const orderProducts = pickN(PRODUCTS, 1, 5);

    // Random date within last 30 days, weighted towards recent
    const daysAgo = Math.floor(rng() * 30);
    const hoursOffset = 8 + Math.floor(rng() * 14); // 8 AM to 10 PM
    const minutes = Math.floor(rng() * 60);
    const orderDate = new Date(now);
    orderDate.setDate(orderDate.getDate() - daysAgo);
    orderDate.setHours(hoursOffset, minutes, 0, 0);

    // Build items
    const items = orderProducts.map(p => {
      const qty = 1 + Math.floor(rng() * 3); // 1-3 quantity
      return {
        productId: p.id,
        quantity: qty,
        price: p.price,
        isPrepared: true,
      };
    });

    const orderTotal = items.reduce((sum, it) => {
      const prod = PRODUCTS.find(p => p.id === it.productId)!;
      return sum + it.price * it.quantity * (1 + prod.tax / 100);
    }, 0);

    // 90% are PAID, 5% READY, 3% PREPARING, 2% SENT
    const statusRoll = rng();
    let status: 'PAID' | 'READY' | 'PREPARING' | 'SENT' = 'PAID';
    if (statusRoll > 0.98) status = 'SENT';
    else if (statusRoll > 0.95) status = 'PREPARING';
    else if (statusRoll > 0.90) status = 'READY';

    const order = await prisma.order.create({
      data: {
        tableId: table.id,
        sessionId: session.id,
        userId: admin.id,
        status,
        total: Math.round(orderTotal * 100) / 100,
        createdAt: orderDate,
        updatedAt: orderDate,
        items: { create: items },
      },
    });

    // Create payment for PAID orders
    if (status === 'PAID') {
      const method = pick(paymentMethods);
      await prisma.payment.create({
        data: {
          orderId: order.id,
          method,
          amount: order.total,
          paidAt: orderDate,
        },
      });
    }

    if ((i + 1) % 50 === 0) console.log(`   📦 ${i + 1}/${ORDER_COUNT} orders created...`);
  }
  console.log(`\n✅ Orders: ${ORDER_COUNT} generated across 30 days`);

  // ═══════════════════════════════════════════
  // 8. SUMMARY
  // ═══════════════════════════════════════════
  const counts = {
    categories: await prisma.category.count(),
    products: await prisma.product.count(),
    orders: await prisma.order.count(),
    payments: await prisma.payment.count(),
    tables: await prisma.table.count(),
  };
  console.log('\n═══════════════════════════════════════');
  console.log('🎉 SEED COMPLETE');
  console.log(`   Categories:  ${counts.categories}`);
  console.log(`   Products:    ${counts.products}`);
  console.log(`   Orders:      ${counts.orders}`);
  console.log(`   Payments:    ${counts.payments}`);
  console.log(`   Tables:      ${counts.tables}`);
  console.log('═══════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
