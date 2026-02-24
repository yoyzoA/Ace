import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CART_KEY = 'ace-cart';

const normalizeItems = (items) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => ({
      productId: String(item?.productId || item?.id || '').trim(),
      quantity: Math.floor(Number(item?.quantity))
    }))
    .filter((item) => item.productId && Number.isFinite(item.quantity) && item.quantity > 0);
};

const readCart = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(CART_KEY);
    if (!stored) {
      return [];
    }
    return normalizeItems(JSON.parse(stored));
  } catch (error) {
    return [];
  }
};

const writeCart = (items) => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(CART_KEY, JSON.stringify(items));
};

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => readCart());

  useEffect(() => {
    writeCart(items);
  }, [items]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === CART_KEY) {
        setItems(readCart());
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const addItem = (productId, quantity = 1) => {
    const normalizedId = String(productId || '').trim();
    const normalizedQty = Math.floor(Number(quantity));
    if (!normalizedId || !Number.isFinite(normalizedQty) || normalizedQty <= 0) {
      return;
    }

    setItems((prev) => {
      const next = normalizeItems(prev);
      const existing = next.find((item) => item.productId === normalizedId);
      if (existing) {
        existing.quantity += normalizedQty;
      } else {
        next.push({ productId: normalizedId, quantity: normalizedQty });
      }
      return normalizeItems(next);
    });
  };

  const updateQuantity = (productId, quantity) => {
    const normalizedId = String(productId || '').trim();
    const normalizedQty = Math.floor(Number(quantity));
    if (!normalizedId) {
      return;
    }

    setItems((prev) =>
      normalizeItems(
        prev.map((item) =>
          item.productId === normalizedId
            ? { ...item, quantity: normalizedQty }
            : item
        )
      )
    );
  };

  const removeItem = (productId) => {
    const normalizedId = String(productId || '').trim();
    setItems((prev) => prev.filter((item) => item.productId !== normalizedId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      totalItems
    }),
    [items, totalItems]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
