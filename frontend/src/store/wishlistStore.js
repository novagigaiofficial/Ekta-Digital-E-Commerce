import { create } from "zustand";
import { persist } from "zustand/middleware";

const useWishlistStore = create(persist((set, get) => ({
  items: [],
  toggle: (product) => {
    const items = get().items;
    const exists = items.find((i) => i.id === product.id);
    if (exists) { set({ items: items.filter((i) => i.id !== product.id) }); }
    else { set({ items: [...items, product] }); }
  },
  isWishlisted: (productId) => get().items.some((i) => i.id === productId),
  getCount: () => get().items.length,
  clear: () => set({ items: [] }),
}), { name: "ekta_wishlist" }));

export default useWishlistStore;
