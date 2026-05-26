import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import useWishlistStore from "../store/wishlistStore";
import useCartStore     from "../store/cartStore";
import { formatPrice }  from "../lib/utils";
import Button           from "../components/ui/Button";
import api              from "../lib/api";
import toast            from "react-hot-toast";

export default function WishlistPage() {
  const navigate = useNavigate();
  const { items, toggle } = useWishlistStore();
  const addItem           = useCartStore((s) => s.addItem);
  const [moving, setMoving] = useState(null); // track which product is loading

  // Fetch fresh product data from API to get up-to-date variant/stock info
  const handleMoveToCart = async (product) => {
    setMoving(product.id);
    try {
      const res     = await api.get(`/products/${product.slug}`);
      const fresh   = res.data;
      const variant = fresh.variants?.find((v) => v.stock_quantity > 0) ?? fresh.variants?.[0];

      if (!variant) { toast.error("No variants available for this product"); return; }
      if (variant.stock_quantity === 0) { toast.error("This product is currently out of stock"); return; }

      addItem(variant, fresh, 1);
      toggle(product); // remove from wishlist
      toast.success(`${product.name} moved to cart!`);
    } catch {
      toast.error("Could not load product. Please try again.");
    } finally { setMoving(null); }
  };

  if (items.length === 0) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-soft px-6">
      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
        <Heart size={36} className="text-red-300" />
      </div>
      <h2 className="text-[28px] font-bold text-ink">Your wishlist is empty</h2>
      <p className="text-muted text-center max-w-sm">Save products you love and come back to them anytime.</p>
      <Button onClick={() => navigate("/shop")}>Browse Products</Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-soft py-10">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="mb-8">
          <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-teal mb-1">Saved Items</p>
          <h1 className="text-[40px] font-bold tracking-[-1px] text-ink">
            My Wishlist <span className="text-[20px] text-muted font-normal ml-3">({items.length})</span>
          </h1>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {items.map((product) => {
            const finalPrice = product.offer_price_tzs
              ? parseFloat(product.offer_price_tzs)
              : parseFloat(product.base_price_tzs);
            const isMoving = moving === product.id;
            return (
              <div key={product.id} className="bg-white rounded-xl2 shadow-card overflow-hidden group">
                <div
                  className="relative bg-card aspect-square overflow-hidden p-6 cursor-pointer"
                  onClick={() => navigate(`/product/${product.slug}`)}
                >
                  <img
                    src={product.images?.[0] || "https://placehold.co/400x400/e6f4f4/008080?text=Ekta"}
                    alt={product.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-350"
                    onError={(e) => { e.target.src = "https://placehold.co/400x400/e6f4f4/008080?text=Ekta"; }}
                  />
                </div>
                <div className="p-4">
                  <p className="text-[11px] font-bold tracking-widest uppercase text-muted mb-1">{product.brand}</p>
                  <h3
                    className="text-[14px] font-medium text-ink line-clamp-2 mb-2 cursor-pointer hover:text-teal transition-colors"
                    onClick={() => navigate(`/product/${product.slug}`)}
                  >
                    {product.name}
                  </h3>
                  <p className="font-bold text-[16px] text-ink mb-3">{formatPrice(finalPrice)}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMoveToCart(product)}
                      disabled={isMoving}
                      className="flex-1 flex items-center justify-center gap-1 bg-teal text-white rounded-pill py-2 text-[12px] font-semibold hover:bg-teal-dark transition-colors disabled:opacity-60"
                    >
                      {isMoving
                        ? <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                        : <><ShoppingCart size={13} />Add to Cart</>
                      }
                    </button>
                    <button
                      onClick={() => { toggle(product); toast.success("Removed from wishlist"); }}
                      className="w-9 h-9 flex items-center justify-center border border-rule rounded-pill hover:border-red-300 hover:text-red-500 text-muted transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
