import { create } from "zustand";
import { persist } from "zustand/middleware";

const useCartStore = create(persist((set, get) => ({
  items: [],
  addItem: (variant, product, quantity = 1) => {
    const items = get().items;
    const existing = items.find((i) => i.variantId === variant.id);
    // Use offer_price_tzs if set, otherwise base_price_tzs
    const basePrice = parseFloat(product.offer_price_tzs ?? product.base_price_tzs);
    const price = basePrice + parseFloat(variant.price_adjustment_tzs ?? 0);
    if (existing) {
      set({ items: items.map((i) => i.variantId === variant.id ? { ...i, quantity: i.quantity + quantity } : i) });
    } else {
      set({ items: [...items, {
        variantId:   variant.id,
        productName: product.name,
        brand:       product.brand,
        image:       product.images?.[0] ?? null,
        size:        variant.size,
        model:       variant.model,
        colour:      variant.colour,
        price,
        quantity,
      }] });
    }
  },
  removeItem: (variantId) => set({ items: get().items.filter((i) => i.variantId !== variantId) }),
  updateQty:  (variantId, quantity) => set({ items: quantity <= 0 ? get().items.filter((i) => i.variantId !== variantId) : get().items.map((i) => i.variantId === variantId ? { ...i, quantity } : i) }),
  clearCart:  () => set({ items: [] }),
  getTotal:   () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  getCount:   () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}), { name: "ekta_cart" }));

export default useCartStore;
