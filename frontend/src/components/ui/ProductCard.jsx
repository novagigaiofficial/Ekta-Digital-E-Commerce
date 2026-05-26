import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, Zap } from "lucide-react";
import useCartStore     from "../../store/cartStore";
import useWishlistStore from "../../store/wishlistStore";
import useAuthStore     from "../../store/authStore";
import api              from "../../lib/api";
import { formatPrice }  from "../../lib/utils";
import toast            from "react-hot-toast";

export default function ProductCard({ product }) {
  const [hovered,     setHovered]     = useState(false);
  const [wishLoading, setWishLoading] = useState(false);
  const [adding,      setAdding]      = useState(false);
  const addItem    = useCartStore((s) => s.addItem);
  const { toggle, isWishlisted } = useWishlistStore();
  const { user }   = useAuthStore();
  const navigate   = useNavigate();

  const variant    = product.variants?.[0];
  const stock      = variant?.stock_quantity ?? 0;
  const wishlisted = isWishlisted(product.id);

  const salePrice  = product.offer_price_tzs ? parseFloat(product.offer_price_tzs) : null;
  const basePrice  = parseFloat(product.base_price_tzs);
  const finalPrice = salePrice ?? basePrice;
  const discPct    = salePrice ? Math.round(((basePrice - salePrice) / basePrice) * 100) : 0;

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!variant || stock === 0) return;
    setAdding(true);
    addItem(variant, product, 1);
    toast.success(`Added to cart`, {
      icon: "🛍️",
      style: { background: "#1d1d1f", color: "#fff", borderRadius: "12px" },
    });
    setTimeout(() => setAdding(false), 600);
  };

  const handleWishlist = async (e) => {
    e.stopPropagation();
    toggle(product);
    toast.success(wishlisted ? "Removed from wishlist" : "Saved ♥", {
      style: { background: "#1d1d1f", color: "#fff", borderRadius: "12px" },
    });
    if (user) {
      setWishLoading(true);
      try { await api.post("/wishlist/toggle", { product_id: product.id }); }
      catch { toggle(product); }
      finally { setWishLoading(false); }
    }
  };

  return (
    <div
      className="product-card cursor-pointer group relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/product/${product.slug}`)}
    >
      {/* Image container */}
      <div className="relative bg-[#f5f5f7] overflow-hidden" style={{ borderRadius: "20px 20px 0 0", paddingBottom: "100%" }}>
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <img
            src={product.images?.[0] || `https://placehold.co/480x480/f5f5f7/008080?text=${encodeURIComponent(product.brand || "Ekta")}`}
            alt={product.name}
            className={`
              w-full h-full object-contain
              transition-transform duration-700 ease-out
              ${hovered && stock > 0 ? "scale-110" : "scale-100"}
              ${stock === 0 ? "opacity-40 grayscale" : ""}
            `}
            onError={(e) => { e.target.src = `https://placehold.co/480x480/f5f5f7/008080?text=Ekta`; }}
          />
        </div>

        {/* Badges — top left */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {discPct > 0 && (
            <span className="bg-[#ff3b30] text-white text-[10px] font-800 tracking-[0.08em] uppercase px-2.5 py-1 rounded-full leading-none shadow-sm">
              −{discPct}%
            </span>
          )}
          {product.is_new_arrival && !discPct && (
            <span className="bg-[#1d1d1f] text-white text-[10px] font-700 tracking-[0.08em] uppercase px-2.5 py-1 rounded-full leading-none">
              New
            </span>
          )}
          {product.is_top_seller && (
            <span className="bg-[#ff9f0a] text-white text-[10px] font-700 tracking-[0.08em] uppercase px-2.5 py-1 rounded-full leading-none">
              🔥 Top
            </span>
          )}
          {stock > 0 && stock <= 5 && (
            <span className="bg-[#ff9f0a]/90 text-white text-[10px] font-700 px-2.5 py-1 rounded-full leading-none">
              {stock} left
            </span>
          )}
        </div>

        {/* Wishlist — top right */}
        <button
          onClick={handleWishlist}
          disabled={wishLoading}
          className={`
            absolute top-3 right-3 z-10 w-9 h-9
            rounded-full flex items-center justify-center
            transition-all duration-200
            ${wishlisted
              ? "bg-[#ff3b30] shadow-lg"
              : "bg-white/80 backdrop-blur hover:bg-white shadow-sm"
            }
          `}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            size={15}
            className={wishlisted ? "text-white fill-white" : "text-[#1d1d1f]"}
          />
        </button>

        {/* Add to cart — slides up on hover */}
        {stock > 0 && (
          <div className={`
            absolute bottom-0 left-0 right-0 p-3
            transition-all duration-400 ease-out
            ${hovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
          `}>
            <button
              onClick={handleAddToCart}
              className={`
                w-full py-2.5 rounded-full
                font-semibold text-[13px] tracking-[-0.01em]
                flex items-center justify-center gap-2
                transition-all duration-200
                shadow-lg backdrop-blur-sm
                ${adding
                  ? "bg-[#008080] text-white scale-95"
                  : "bg-white/90 text-[#1d1d1f] hover:bg-white"
                }
              `}
            >
              {adding
                ? <><Zap size={14} className="text-white" />Added!</>
                : <><ShoppingCart size={14} />Add to Cart</>
              }
            </button>
          </div>
        )}

        {stock === 0 && (
          <div className="absolute inset-0 flex items-end justify-center pb-4">
            <span className="bg-[#1d1d1f]/70 backdrop-blur text-white text-[12px] font-semibold px-4 py-2 rounded-full">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 pb-5">
        <p className="text-[11px] font-700 tracking-[0.12em] uppercase text-[#6e6e73] mb-1">
          {product.brand}
        </p>
        <h3 className="text-[14px] font-500 text-[#1d1d1f] leading-snug line-clamp-2 mb-2.5">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[16px] font-700 tracking-[-0.02em] text-[#1d1d1f]">
            {formatPrice(finalPrice)}
          </span>
          {salePrice && (
            <span className="text-[13px] text-[#6e6e73] line-through">{formatPrice(basePrice)}</span>
          )}
        </div>
        <p className="text-[11px] text-[#6e6e73] mt-1">VAT Inclusive</p>
      </div>
    </div>
  );
}
