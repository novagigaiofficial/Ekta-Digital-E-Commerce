import React from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, ShoppingBag } from "lucide-react";
import useCartStore from "../store/cartStore";
import Button from "../components/ui/Button";
import { formatPrice } from "../lib/utils";

export default function CartPage() {
  const { items, removeItem, updateQty, getTotal } = useCartStore();
  const navigate   = useNavigate();
  const total      = getTotal();
  const pointsEarn = Math.floor(total / 1000);

  if (items.length === 0) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-soft">
      <ShoppingBag size={64} className="text-rule" />
      <h2 className="text-[28px] font-bold text-ink">Your cart is empty</h2>
      <Button onClick={() => navigate("/shop")}>Browse Products</Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-soft py-10">
      <div className="max-w-[1200px] mx-auto px-6">
        <h1 className="text-[40px] font-bold tracking-[-1px] text-ink mb-10">Your Cart</h1>
        <div className="grid md:grid-cols-3 gap-10">
          {/* Items */}
          <div className="md:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.variantId} className="bg-white rounded-xl2 p-5 flex gap-5 shadow-card">
                <div className="w-20 h-20 bg-card rounded-xl flex items-center justify-center shrink-0">
                  <img
                    src={item.image || "https://placehold.co/80x80/e6f4f4/008080"}
                    alt={item.productName}
                    className="w-full h-full object-contain p-2"
                    onError={(e) => { e.target.src = "https://placehold.co/80x80/e6f4f4/008080"; }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted mb-0.5">{item.brand}</p>
                  <p className="font-semibold text-ink text-[15px] mb-1 truncate">{item.productName}</p>
                  {(item.model || item.size || item.colour) && (
                    <p className="text-[12px] text-muted mb-2">{[item.model, item.size, item.colour].filter(Boolean).join(" · ")}</p>
                  )}
                  <p className="font-bold text-teal text-[15px]">{formatPrice(item.price * item.quantity)}</p>
                  <p className="text-[12px] text-muted">{formatPrice(item.price)} each</p>
                </div>
                <div className="flex flex-col items-end justify-between shrink-0">
                  <button onClick={() => removeItem(item.variantId)} className="text-muted hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                  <div className="flex items-center border border-rule rounded-xl overflow-hidden">
                    <button onClick={() => updateQty(item.variantId, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-card font-medium transition-colors">−</button>
                    <span className="w-8 text-center font-semibold text-[13px]">{item.quantity}</span>
                    <button onClick={() => updateQty(item.variantId, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-card font-medium transition-colors">+</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-white rounded-xl2 p-6 shadow-card h-fit sticky top-20">
            <h2 className="font-bold text-[18px] text-ink mb-6">Order Summary</h2>
            <div className="space-y-3 text-[14px] mb-6">
              <div className="flex justify-between text-muted"><span>Subtotal ({items.length} items)</span><span>{formatPrice(total)}</span></div>
              <div className="flex justify-between text-muted"><span>VAT (18% incl.)</span><span>{formatPrice(total * 0.18 / 1.18)}</span></div>
              <div className="border-t border-rule pt-3 flex justify-between font-bold text-[16px] text-ink">
                <span>Total</span><span>{formatPrice(total)}</span>
              </div>
            </div>
            {pointsEarn > 0 && (
              <div className="bg-teal-light rounded-xl px-4 py-3 mb-6 text-[13px] text-teal font-medium">
                ★ You'll earn <strong>{pointsEarn} points</strong> on this order
              </div>
            )}
            {/* No login gate — checkout page handles auth via OTP */}
            <Button className="w-full mb-3" onClick={() => navigate("/checkout")}>
              Proceed to Checkout
            </Button>
            <Button variant="secondary" className="w-full" onClick={() => navigate("/shop")}>
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
