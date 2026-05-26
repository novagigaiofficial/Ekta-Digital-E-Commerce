import React from "react";
import { useNavigate } from "react-router-dom";
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import useCartStore from "../../store/cartStore";
import { formatPrice } from "../../lib/utils";

export default function CartDrawer({ open, onClose }) {
  const { items, removeItem, updateQty, getTotal } = useCartStore();
  const navigate  = useNavigate();
  const total     = getTotal();
  const points    = Math.floor(total / 1000);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[80] bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />
      {/* Drawer */}
      <aside className={`
        fixed top-0 right-0 z-[90] h-full w-full max-w-[420px]
        bg-white flex flex-col
        transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
        ${open ? "translate-x-0" : "translate-x-full"}
      `} style={{ boxShadow: "-20px 0 60px rgba(0,0,0,0.12)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#f5f5f7]">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-[#008080]" />
            <h2 className="text-[18px] font-700 tracking-[-0.03em] text-[#1d1d1f]">
              Cart
              {items.length > 0 && <span className="ml-2 text-[14px] font-500 text-[#6e6e73]">({items.length})</span>}
            </h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#f5f5f7] hover:bg-[#ebebeb] transition-colors">
            <X size={15} className="text-[#1d1d1f]" />
          </button>
        </div>

        {/* Items */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
            <div className="w-20 h-20 bg-[#f5f5f7] rounded-full flex items-center justify-center">
              <ShoppingBag size={32} className="text-[#d2d2d7]" />
            </div>
            <p className="text-[17px] font-600 text-[#1d1d1f]">Your cart is empty</p>
            <p className="text-[14px] text-[#6e6e73] text-center">Add products to get started</p>
            <button
              onClick={() => { navigate("/shop"); onClose(); }}
              className="mt-2 px-6 py-2.5 bg-[#008080] text-white rounded-full text-[14px] font-600 hover:bg-[#006666] transition-colors"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.map((item) => (
                <div key={item.variantId} className="flex gap-4">
                  {/* Image */}
                  <div className="w-[72px] h-[72px] bg-[#f5f5f7] rounded-[14px] flex items-center justify-center shrink-0 overflow-hidden">
                    <img
                      src={item.image || `https://placehold.co/72x72/f5f5f7/008080`}
                      alt={item.productName}
                      className="w-full h-full object-contain p-2"
                      onError={(e) => { e.target.src = `https://placehold.co/72x72/f5f5f7/008080`; }}
                    />
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-700 uppercase tracking-[0.08em] text-[#6e6e73] mb-0.5">{item.brand}</p>
                    <p className="text-[13px] font-500 text-[#1d1d1f] leading-snug line-clamp-2 mb-2">{item.productName}</p>
                    {(item.model || item.colour || item.size) && (
                      <p className="text-[11px] text-[#6e6e73]">{[item.model, item.colour, item.size].filter(Boolean).join(" · ")}</p>
                    )}
                    <div className="flex items-center justify-between mt-2.5">
                      {/* Qty stepper */}
                      <div className="flex items-center gap-1 bg-[#f5f5f7] rounded-full px-1">
                        <button
                          onClick={() => updateQty(item.variantId, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#ebebeb] transition-colors"
                        >
                          {item.quantity === 1 ? <Trash2 size={12} className="text-[#ff3b30]" /> : <Minus size={12} className="text-[#1d1d1f]" />}
                        </button>
                        <span className="w-6 text-center text-[13px] font-600">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(item.variantId, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#ebebeb] transition-colors"
                        >
                          <Plus size={12} className="text-[#1d1d1f]" />
                        </button>
                      </div>
                      <p className="text-[14px] font-700 text-[#1d1d1f]">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-6 pb-8 pt-4 border-t border-[#f5f5f7] space-y-4">
              {/* Loyalty earn note */}
              {points > 0 && (
                <div className="flex items-center gap-2 bg-[#e6f4f4] rounded-[12px] px-4 py-3">
                  <span className="text-[#008080] text-[16px]">⭐</span>
                  <p className="text-[12px] font-600 text-[#008080]">You'll earn <strong>{points} loyalty points</strong> on this order</p>
                </div>
              )}
              {/* Total */}
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-500 text-[#6e6e73]">Subtotal</span>
                <span className="text-[20px] font-700 tracking-[-0.03em] text-[#1d1d1f]">{formatPrice(total)}</span>
              </div>
              <p className="text-[11px] text-[#6e6e73] text-center -mt-2">VAT inclusive · Delivery calculated at checkout</p>
              {/* CTA */}
              <button
                onClick={() => { navigate("/checkout"); onClose(); }}
                className="w-full bg-[#008080] text-white rounded-full py-4 font-700 text-[16px] hover:bg-[#006666] active:bg-[#005555] transition-colors flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(0,128,128,0.3)]"
              >
                Checkout <ArrowRight size={18} />
              </button>
              <button
                onClick={() => { navigate("/cart"); onClose(); }}
                className="w-full text-center text-[13px] font-500 text-[#6e6e73] hover:text-[#1d1d1f] transition-colors py-1"
              >
                View full cart
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
