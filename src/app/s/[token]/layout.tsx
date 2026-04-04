'use client';
import { useState, useEffect, createContext, useContext } from 'react';

interface Product {
  id: string; name: string; price: number; tax: number; description?: string;
  category: { id: string; name: string; color: string };
  variants: Array<{ id: string; attribute: string; value: string; extraPrice: number }>;
}
interface Category { id: string; name: string; color: string; }
interface TableInfo { id: string; number: string; floor: { name: string }; }
interface Config { selfOrderEnabled: boolean; selfOrderMode: string; }

interface SelfOrderContext {
  products: Product[]; categories: Category[]; table: TableInfo | null;
  config: Config | null; token: string;
  cart: CartItem[]; addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void; clearCart: () => void;
}

interface CartItem {
  productId: string; variantId?: string; name: string; price: number; quantity: number;
}

const Ctx = createContext<SelfOrderContext | null>(null);
export const useSelfOrder = () => useContext(Ctx)!;

export default function SelfOrderLayout({
  children, params
}: {
  children: React.ReactNode; params: { token: string };
}) {
  const [state, setState] = useState<Omit<SelfOrderContext, 'token' | 'cart' | 'addToCart' | 'removeFromCart' | 'clearCart'>>({
    products: [], categories: [], table: null, config: null,
  });
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    fetch(`/api/self-order/${params.token}`).then(r => r.json()).then(data => {
      if (!data.error) {
        setState({ products: data.products, categories: data.categories, table: data.table, config: data.config });
      }
    });
  }, [params.token]);

  function addToCart(item: CartItem) {
    setCart(prev => {
      const exists = prev.find(i => i.productId === item.productId && i.variantId === item.variantId);
      if (exists) return prev.map(i => i.productId === item.productId && i.variantId === item.variantId ? { ...i, quantity: i.quantity + item.quantity } : i);
      return [...prev, item];
    });
  }

  function removeFromCart(productId: string) {
    setCart(prev => prev.filter(i => i.productId !== productId));
  }

  return (
    <Ctx.Provider value={{ ...state, token: params.token, cart, addToCart, removeFromCart, clearCart: () => setCart([]) }}>
      <div className="min-h-screen bg-slate-950 max-w-md mx-auto relative">
        {children}
      </div>
    </Ctx.Provider>
  );
}
