import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingCart, Star, Truck, RotateCcw, Shield, ChevronLeft, Heart } from "lucide-react";
import api from "../lib/api";
import Button from "../components/ui/Button";
import ProductCard from "../components/ui/ProductCard";
import useCartStore from "../store/cartStore";
import useAuthStore from "../store/authStore";
import { formatPrice, calcPointsEarned } from "../lib/utils";
import toast from "react-hot-toast";

export default function ProductPage() {
  const { slug }   = useParams();
  const navigate   = useNavigate();
  const addItem    = useCartStore((s) => s.addItem);
  const { user }   = useAuthStore();

  const [product,  setProduct]  = useState(null);
  const [related,  setRelated]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [mainImg,  setMainImg]  = useState(0);
  const [variant,  setVariant]  = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [tab,      setTab]      = useState("description");
  const [wishAdded,setWishAdded]= useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const fetch = async () => {
      setLoading(true);

      try {
        const res = await api.get(`/products/${slug}`);

        setProduct(res.data);
        setVariant(res.data.variants?.[0] ?? null);

        const rel = await api.get("/products", {
          params: {
            category: res.data.category?.slug,
            per_page: 4
          }
        });

        setRelated((rel.data.data ?? []).filter((p) => p.slug !== slug));

      } catch {
        navigate("/shop");
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [slug]);

  const handleAddToCart = () => {
    if (!variant) return;
    addItem(variant, product, quantity);
    toast.success(`${product.name} added to cart!`);
  };

  const handleWishlist = async () => {
    if (!user) { toast.error("Please login to save to wishlist"); navigate("/login"); return; }
    try {
      const res = await api.post("/wishlist/toggle", { product_id: product.id });
      setWishAdded(res.data.in_wishlist);
      toast.success(res.data.message);
    } catch { toast.error("Could not update wishlist"); }
  };

  const getBulkDiscount = () => {
    if (!product?.bulk_discount_tiers?.length) return null;
    return product.bulk_discount_tiers
      .filter((t) => quantity >= t.min_quantity)
      .sort((a, b) => b.min_quantity - a.min_quantity)[0] ?? null;
  };

  const bulkDiscount = getBulkDiscount();

  // Use offer_price_tzs when available, otherwise base_price_tzs
  const effectiveBase = product
    ? parseFloat(product.offer_price_tzs ?? product.base_price_tzs) + parseFloat(variant?.price_adjustment_tzs ?? 0)
    : 0;
  const originalPrice = product
    ? parseFloat(product.base_price_tzs) + parseFloat(variant?.price_adjustment_tzs ?? 0)
    : 0;
  const finalPrice    = bulkDiscount ? effectiveBase * (1 - bulkDiscount.discount_pct / 100) : effectiveBase;
  const hasOfferPrice = product?.offer_price_tzs && parseFloat(product.offer_price_tzs) < parseFloat(product.base_price_tzs);
  const saleDiscountPct = hasOfferPrice
    ? Math.round(((originalPrice - effectiveBase) / originalPrice) * 100)
    : 0;
  const pointsEarned = calcPointsEarned(finalPrice * quantity);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-teal border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!product) return null;

  const images = product.images?.length ? product.images : ["https://placehold.co/600x600/e6f4f4/008080?text=Ekta+Digital"];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1200px] mx-auto px-6 py-10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-[13px] text-muted hover:text-teal mb-8 transition-colors">
          <ChevronLeft size={16} />Back to Shop
        </button>
        <div className="grid md:grid-cols-2 gap-16 mb-20">
          {/* Images */}
          <div>
            <div className="bg-card rounded-xl2 aspect-square overflow-hidden mb-4 flex items-center justify-center p-8">
              <img
                src={images[mainImg]}
                alt={product.name}
                className="w-full h-full object-contain"
                onError={(e) => { e.target.src = "https://placehold.co/600x600/e6f4f4/008080?text=Ekta+Digital"; }}
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setMainImg(i)} className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${mainImg === i ? "border-teal" : "border-rule hover:border-teal/50"}`}>
                    <img src={img} alt="" className="w-full h-full object-contain p-1" onError={(e) => { e.target.src = "https://placehold.co/64x64/e6f4f4/008080"; }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[11px] font-bold tracking-widest uppercase text-muted">{product.brand}</span>
              {product.is_new_arrival && <span className="bg-teal text-white text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full">NEW</span>}
              {product.is_top_seller  && <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full">🔥 TOP SELLER</span>}
              {hasOfferPrice && <span className="bg-red-100 text-red-600 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full">SALE −{saleDiscountPct}%</span>}
            </div>

            <h1 className="text-[32px] font-bold tracking-[-0.8px] text-ink leading-tight mb-4">{product.name}</h1>

            <div className="flex items-center gap-2 mb-6">
              <div className="flex gap-0.5">{[...Array(5)].map((_, i) => (<Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />))}</div>
              <span className="text-[13px] text-muted">5.0 (24 reviews)</span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-3">
                <span className="text-[36px] font-bold text-ink tracking-[-1px]">{formatPrice(finalPrice)}</span>
                {(hasOfferPrice || bulkDiscount) && (
                  <span className="text-[18px] text-muted line-through">{formatPrice(bulkDiscount ? effectiveBase : originalPrice)}</span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-[12px] bg-teal-light text-teal font-semibold px-2 py-0.5 rounded-full">VAT Inclusive (18%)</span>
                {hasOfferPrice  && <span className="text-[12px] bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full">Sale Price</span>}
                {bulkDiscount   && <span className="text-[12px] bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">{bulkDiscount.discount_pct}% Bulk Discount</span>}
              </div>
              {product.bulkDiscountTiers?.length > 0 && (
                <div className="mt-3 bg-soft rounded-xl p-3 space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted mb-2">Volume Pricing</p>
                  {product.bulkDiscountTiers.map((t) => (
                    <p key={t.id} className="text-[12px] text-ink">Buy <strong>{t.min_quantity}+</strong> — save <strong className="text-green-600">{t.discount_pct}%</strong></p>
                  ))}
                </div>
              )}
            </div>

            {/* Variant selector */}
            {product.variants?.length > 1 && (
              <div className="mb-6">
                <p className="text-[12px] font-bold uppercase tracking-wider text-muted mb-2">Select Variant</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button key={v.id} onClick={() => setVariant(v)} className={`px-4 py-2 rounded-xl border text-[13px] font-medium transition-all ${variant?.id === v.id ? "border-teal bg-teal-light text-teal" : "border-rule text-ink hover:border-teal"} ${v.stock_quantity === 0 ? "opacity-50" : ""}`}>
                      {v.model || v.size || v.colour}
                      {v.stock_quantity === 0 && <span className="ml-1 text-red-400">(Out)</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock */}
            <div className="mb-6">
              {variant?.stock_quantity > 0
                ? <span className="flex items-center gap-1 text-[13px] text-green-600 font-semibold"><div className="w-2 h-2 rounded-full bg-green-500" />In Stock ({variant.stock_quantity} available)</span>
                : <span className="flex items-center gap-1 text-[13px] text-red-500 font-semibold"><div className="w-2 h-2 rounded-full bg-red-500" />Out of Stock</span>}
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <p className="text-[12px] font-bold uppercase tracking-wider text-muted mb-2">Quantity</p>
              <div className="flex items-center border border-rule rounded-xl overflow-hidden w-fit">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-card transition-colors text-lg font-medium">−</button>
                <span className="w-12 text-center font-semibold text-[15px]">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(variant?.stock_quantity ?? 99, quantity + 1))} className="w-10 h-10 flex items-center justify-center hover:bg-card transition-colors text-lg font-medium">+</button>
              </div>
            </div>

            {/* Points */}
            <div className="bg-teal-light rounded-xl px-4 py-3 mb-6 flex items-center gap-2">
              <Star size={16} className="text-yellow-500 fill-yellow-400" />
              <p className="text-[13px] text-teal font-semibold">Earn <strong>{pointsEarned} loyalty points</strong> on this purchase</p>
            </div>

            {/* CTAs */}
            <div className="flex gap-3 mb-8">
              <Button className="flex-1" onClick={handleAddToCart} disabled={!variant || variant.stock_quantity === 0}>
                <ShoppingCart size={18} />{variant?.stock_quantity === 0 ? "Out of Stock" : "Add to Cart"}
              </Button>
              <button onClick={handleWishlist} className={`w-11 h-11 rounded-xl border-2 flex items-center justify-center transition-all ${wishAdded ? "border-red-400 bg-red-50 text-red-500" : "border-rule text-muted hover:border-red-300 hover:text-red-400"}`}>
                <Heart size={18} className={wishAdded ? "fill-red-400" : ""} />
              </button>
              <Button variant="secondary" onClick={() => navigate("/quote")}>Request Quote</Button>
            </div>

            {/* Trust badges */}
            <div className="space-y-3 border-t border-rule pt-6">
              {[
                { icon: <Truck size={16} />,    text: "Same-day delivery in Dar-es-Salaam" },
                { icon: <RotateCcw size={16} />, text: "Click & collect at Haidary Plaza" },
                { icon: <Shield size={16} />,    text: "Genuine products, warranty included" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-[13px] text-muted">
                  <span className="text-teal">{item.icon}</span>{item.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-20">
          <div className="flex gap-0 border-b border-rule mb-8">
            {["description", "specifications", "delivery"].map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`px-6 py-3 text-[14px] font-semibold capitalize transition-all border-b-2 -mb-px ${tab === t ? "border-teal text-teal" : "border-transparent text-muted hover:text-ink"}`}>{t}</button>
            ))}
          </div>
          {tab === "description" && <p className="text-[15px] text-muted leading-relaxed max-w-2xl">{product.description ?? "No description available."}</p>}
          {tab === "specifications" && (
            <div className="max-w-2xl">
              {product.variants?.length > 0 ? (
                <table className="w-full text-[14px]">
                  <thead><tr className="border-b border-rule"><th className="text-left py-2 font-bold text-muted text-[11px] uppercase tracking-wider w-1/3">SKU</th><th className="text-left py-2 font-bold text-muted text-[11px] uppercase tracking-wider">Specifications</th><th className="text-left py-2 font-bold text-muted text-[11px] uppercase tracking-wider">Stock</th></tr></thead>
                  <tbody>
                    {product.variants.map((v) => (
                      <tr key={v.id} className="border-b border-rule">
                        <td className="py-3 font-semibold text-ink font-mono text-[13px]">{v.sku}</td>
                        <td className="py-3 text-muted">{[v.model, v.size, v.colour].filter(Boolean).join(" · ") || "Standard"}</td>
                        <td className="py-3"><span className={`text-[12px] font-semibold ${v.stock_quantity > 5 ? "text-green-600" : v.stock_quantity > 0 ? "text-yellow-600" : "text-red-500"}`}>{v.stock_quantity > 0 ? `${v.stock_quantity} units` : "Out of Stock"}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <p className="text-muted">No specifications available.</p>}
            </div>
          )}
          {tab === "delivery" && (
            <div className="max-w-2xl space-y-4 text-[14px]">
              {[
                ["Same-Day Delivery",   "Available within Dar-es-Salaam. Order before 2PM for same-day delivery."],
                ["East Africa Delivery","3–7 business days. Charges apply based on weight and destination."],
                ["Click & Collect",     "Free at Haidary Plaza, India Street, Dar-es-Salaam. Ready within 2 hours."],
                ["B2B Orders",          "Contact us for bulk delivery arrangements and special pricing."],
              ].map(([title, desc]) => (
                <div key={title} className="flex gap-4 p-4 bg-soft rounded-xl">
                  <Truck size={18} className="text-teal shrink-0 mt-0.5" />
                  <div><p className="font-semibold text-ink mb-1">{title}</p><p className="text-muted">{desc}</p></div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div>
            <h2 className="text-[28px] font-bold tracking-[-0.8px] text-ink mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
