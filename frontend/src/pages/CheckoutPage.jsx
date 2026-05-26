import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, MapPin, CreditCard, Eye, Phone, Tag } from "lucide-react";
import useCartStore from "../store/cartStore";
import useAuthStore from "../store/authStore";
import Button from "../components/ui/Button";
import { formatPrice } from "../lib/utils";
import api from "../lib/api";
import toast from "react-hot-toast";
import { PaymentModal } from "./PaymentPage";

const STEPS = [
  { num: 1, label: "Verify",   icon: <Phone size={16} /> },
  { num: 2, label: "Delivery", icon: <MapPin size={16} /> },
  { num: 3, label: "Payment",  icon: <CreditCard size={16} /> },
  { num: 4, label: "Review",   icon: <Eye size={16} /> },
];
const PAYMENT_METHODS = [
  { id: "mpesa",      label: "M-Pesa",       logo: "📱" },
  { id: "airtel",     label: "Airtel Money",  logo: "📲" },
  { id: "crdb",       label: "CRDB Bank",     logo: "🏦" },
  { id: "selcom",     label: "Selcom Pesa",   logo: "💳" },
  { id: "visa",       label: "Visa",          logo: "💳" },
  { id: "mastercard", label: "Mastercard",    logo: "💳" },
  { id: "paypal",     label: "PayPal",        logo: "🅿️" },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCartStore();
  const { user, setUser, setToken } = useAuthStore();
  const total = getTotal();

  const [step,          setStep]          = useState(user ? 2 : 1);
  const [loading,       setLoading]       = useState(false);
  const [done,          setDone]          = useState(false);
  const [placedOrder,   setPlacedOrder]   = useState(null); // order data for payment modal
  const [orderNum,      setOrderNum]      = useState("");
  const [pointsEarned,  setPointsEarned]  = useState(0);
  const [contact,       setContact]       = useState("");
  const [otp,           setOtp]           = useState("");
  const [otpSent,       setOtpSent]       = useState(false);
  const [otpLoading,    setOtpLoading]    = useState(false);
  const [savedAddresses,setSavedAddresses]= useState([]);
  const [delivery,      setDelivery]      = useState({
    type: "delivery",
    name: user ? `${user.first_name} ${user.last_name}` : "",
    phone: user?.phone ?? "",
    address: "",
    city: "Dar-es-Salaam",
    region: "Tanzania",
  });
  const [payment, setPayment] = useState({ method: "", loyalty_pts: 0 });
  const [promoCode,     setPromoCode]     = useState("");
  const [promoApplied,  setPromoApplied]  = useState(null); // { name, discount }
  const [promoLoading,  setPromoLoading]  = useState(false);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && !done) {
      toast.error("Your cart is empty.");
      navigate("/shop");
    }
  }, []);

  useEffect(() => {
    if (user) {
      api.get("/addresses").then((r) => setSavedAddresses(r.data)).catch(() => {});
    }
  }, [user]);

  const handleSendOtp = async () => {
    if (!contact) { toast.error("Enter your phone or email"); return; }
    setOtpLoading(true);
    try {
      const res = await api.post("/otp/send", { phone_or_email: contact, purpose: "checkout" });
      setOtpSent(true);
      toast.success("OTP sent!");
      if (res.data.otp_dev) toast(`Dev OTP: ${res.data.otp_dev}`, { icon: "🔑" });
    } catch { toast.error("Failed to send OTP"); } finally { setOtpLoading(false); }
  };

  const handleVerifyOtp = async () => {
    setOtpLoading(true);
    try {
      const res = await api.post("/otp/verify", { phone_or_email: contact, otp, purpose: "checkout" });
      setToken(res.data.token);
      setUser(res.data.user);
      toast.success(res.data.is_new_user ? "Account created! Welcome." : "Welcome back!");
      setDelivery((d) => ({
        ...d,
        phone: res.data.user.phone ?? contact,
        name: `${res.data.user.first_name} ${res.data.user.last_name}`,
      }));
      setStep(2);
    } catch { toast.error("Invalid or expired OTP"); } finally { setOtpLoading(false); }
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    try {
      // Validate promo code against active promotions list
      const res = await api.get("/promotions");
      const promos = res.data;
      const match = promos.find(
        (p) => p.discount_code && p.discount_code.toUpperCase() === promoCode.trim().toUpperCase()
      );
      if (!match) { toast.error("Invalid or expired promo code"); setPromoLoading(false); return; }
      const discountAmt = match.type === "percentage"
        ? (total * match.discount_value) / 100
        : parseFloat(match.discount_value);
      setPromoApplied({ name: match.name, code: match.discount_code, discount: Math.min(discountAmt, total) });
      toast.success(`✓ "${match.name}" applied — ${formatPrice(Math.min(discountAmt, total))} off!`);
    } catch { toast.error("Could not validate promo code"); } finally { setPromoLoading(false); }
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const payload = {
        items:                    items.map((i) => ({ variant_id: i.variantId, quantity: i.quantity })),
        delivery_type:            delivery.type,
        delivery_address:         delivery,
        payment_method:           payment.method,
        loyalty_points_to_redeem: payment.loyalty_pts,
      };
      if (promoApplied) payload.discount_code = promoApplied.code;

      const res = await api.post("/orders", payload);
      clearCart();
      setOrderNum(res.data.order.order_number);
      setPointsEarned(res.data.points_earned ?? 0);
      setPlacedOrder(res.data.order); // open payment modal
      setDone(true);
    } catch (e) {
      toast.error(e.response?.data?.message ?? "Order failed");
    } finally { setLoading(false); }
  };

  const loyaltyDiscount = payment.loyalty_pts * 5;
  const promoDiscount   = promoApplied?.discount ?? 0;
  const finalTotal      = Math.max(0, total - loyaltyDiscount - promoDiscount);

  // Show payment modal on top of success screen
  if (done && placedOrder && !["invoice"].includes(placedOrder.payment_method)) {
    // Show payment modal; dismiss closes it and shows the success screen
  }

  if (done) return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-6">
      <div className="bg-white rounded-2xl p-10 max-w-md w-full text-center shadow-2xl">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={36} className="text-green-500" />
        </div>
        <h2 className="text-[28px] font-bold text-ink mb-2">Order Confirmed! 🎉</h2>
        <p className="text-muted mb-4">Thank you, {user?.first_name}. Your order is on its way.</p>
        <div className="bg-teal-light rounded-xl px-4 py-3 mb-4">
          <p className="text-[12px] text-muted mb-1">Order ID</p>
          <p className="text-[20px] font-bold text-teal tracking-wider">{orderNum}</p>
        </div>
        {pointsEarned > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 mb-4">
            <p className="text-[13px] font-semibold text-yellow-700">⭐ You earned {pointsEarned} loyalty points!</p>
          </div>
        )}
        <p className="text-[13px] text-muted mb-8">
          Same-day delivery for Dar-es-Salaam orders. Confirm receipt in your account to unlock your invoice.
        </p>
        <Button className="w-full mb-3" onClick={() => navigate("/account")}>Track My Order</Button>
        <Button variant="secondary" className="w-full" onClick={() => navigate("/shop")}>Continue Shopping</Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-soft py-10">
      <div className="max-w-[960px] mx-auto px-6">
        <h1 className="text-[36px] font-bold tracking-[-1px] text-ink mb-8">Checkout</h1>

        {/* Step indicator */}
        <div className="flex items-center mb-10">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.num}>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold transition-all ${step >= s.num ? "bg-teal text-white" : "bg-rule text-muted"}`}>
                  {step > s.num ? <CheckCircle size={16} /> : s.num}
                </div>
                <span className={`text-[13px] font-semibold hidden sm:block ${step === s.num ? "text-ink" : "text-muted"}`}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-3 transition-all ${step > s.num ? "bg-teal" : "bg-rule"}`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          <div className="md:col-span-2">

            {/* STEP 1 — OTP */}
            {step === 1 && (
              <div className="bg-white rounded-xl2 p-8 shadow-card">
                <h2 className="font-bold text-[20px] mb-2 text-ink">Verify Your Identity</h2>
                <p className="text-muted text-[14px] mb-6">Enter your phone or email. We'll send a one-time code.</p>
                <div className="space-y-4">
                  <input type="text" placeholder="Phone number or email address" value={contact} onChange={(e) => setContact(e.target.value)} disabled={otpSent} className="w-full h-[52px] px-4 rounded-xl border border-rule bg-card text-[14px] outline-none focus:border-teal focus:border-2 transition-all disabled:opacity-60" />
                  {!otpSent ? (
                    <Button className="w-full" loading={otpLoading} onClick={handleSendOtp}>Send OTP</Button>
                  ) : (
                    <>
                      <p className="text-[13px] text-teal font-medium">✓ OTP sent to {contact}</p>
                      <input type="text" placeholder="Enter 6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} className="w-full h-[52px] px-4 rounded-xl border border-rule bg-card text-[20px] font-bold tracking-[0.5em] text-center outline-none focus:border-teal focus:border-2 transition-all" />
                      <Button className="w-full" loading={otpLoading} disabled={otp.length < 6} onClick={handleVerifyOtp}>Verify & Continue</Button>
                      <button onClick={() => { setOtpSent(false); setOtp(""); }} className="text-[13px] text-muted hover:text-teal w-full text-center">Change contact details</button>
                    </>
                  )}
                </div>
                <div className="mt-6 text-center">
                  <p className="text-[13px] text-muted">Already have an account?{" "}
                    <button onClick={() => navigate("/login")} className="text-teal font-semibold hover:underline">Sign in instead</button>
                  </p>
                </div>
              </div>
            )}

            {/* STEP 2 — Delivery */}
            {step === 2 && (
              <div className="bg-white rounded-xl2 p-8 shadow-card">
                <h2 className="font-bold text-[20px] mb-6 text-ink">Delivery Options</h2>
                {savedAddresses.length > 0 && (
                  <div className="mb-6">
                    <p className="text-[12px] font-bold uppercase tracking-wider text-muted mb-3">Saved Addresses</p>
                    <div className="space-y-2 mb-4">
                      {savedAddresses.map((addr) => (
                        <button key={addr.id} onClick={() => setDelivery({ type: "delivery", name: addr.full_name, phone: addr.phone, address: addr.address_line, city: addr.city, region: addr.region })} className={`w-full text-left p-3 rounded-xl border-2 transition-all ${delivery.address === addr.address_line ? "border-teal bg-teal-light" : "border-rule hover:border-teal/50"}`}>
                          <p className="font-semibold text-[13px] text-ink">{addr.label} — {addr.full_name}</p>
                          <p className="text-[12px] text-muted">{addr.address_line}, {addr.city}</p>
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 my-4">
                      <div className="flex-1 h-px bg-rule" /><span className="text-[12px] text-muted">or enter new address</span><div className="flex-1 h-px bg-rule" />
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[{ val: "delivery", label: "Home Delivery", sub: "Delivered to your address" }, { val: "click_and_collect", label: "Click & Collect", sub: "Haidary Plaza, India Street" }].map((o) => (
                    <button key={o.val} onClick={() => setDelivery((d) => ({ ...d, type: o.val }))} className={`p-4 rounded-xl border-2 text-left transition-all ${delivery.type === o.val ? "border-teal bg-teal-light" : "border-rule hover:border-teal/50"}`}>
                      <p className="font-semibold text-ink text-[14px]">{o.label}</p>
                      <p className="text-[12px] text-muted mt-0.5">{o.sub}</p>
                    </button>
                  ))}
                </div>
                {delivery.type === "delivery" && (
                  <div className="space-y-4">
                    {[{ key: "name", label: "Full Name", type: "text" }, { key: "phone", label: "Phone", type: "tel" }, { key: "address", label: "Address", type: "text" }, { key: "city", label: "City", type: "text" }].map((f) => (
                      <div key={f.key} className="relative">
                        <input type={f.type} placeholder=" " value={delivery[f.key]} onChange={(e) => setDelivery((d) => ({ ...d, [f.key]: e.target.value }))} className="peer w-full h-[52px] px-4 pt-4 rounded-xl border border-rule bg-card text-[14px] outline-none focus:border-teal focus:border-2 transition-all" />
                        <label className="absolute left-4 top-1.5 text-[11px] font-medium text-muted peer-placeholder-shown:top-4 peer-placeholder-shown:text-[14px] peer-focus:top-1.5 peer-focus:text-[11px] transition-all pointer-events-none">{f.label}</label>
                      </div>
                    ))}
                    {delivery.city === "Dar-es-Salaam" && (
                      <div className="bg-green-50 text-green-700 rounded-xl px-4 py-3 text-[13px] font-medium">✓ Same-day delivery available!</div>
                    )}
                  </div>
                )}
                <Button className="w-full mt-6" onClick={() => setStep(3)}>Continue to Payment</Button>
              </div>
            )}

            {/* STEP 3 — Payment */}
            {step === 3 && (
              <div className="bg-white rounded-xl2 p-8 shadow-card">
                <h2 className="font-bold text-[20px] mb-6 text-ink">Payment Method</h2>
                <div className="space-y-3 mb-6">
                  {PAYMENT_METHODS.map((m) => (
                    <button key={m.id} onClick={() => setPayment((p) => ({ ...p, method: m.id }))} className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${payment.method === m.id ? "border-teal bg-teal-light" : "border-rule hover:border-teal/50"}`}>
                      <span className="text-2xl">{m.logo}</span>
                      <span className="font-semibold text-ink text-[15px]">{m.label}</span>
                      {payment.method === m.id && <CheckCircle size={18} className="ml-auto text-teal" />}
                    </button>
                  ))}
                  {user?.account_type === "b2b" && (
                    <button onClick={() => setPayment((p) => ({ ...p, method: "invoice" }))} className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${payment.method === "invoice" ? "border-teal bg-teal-light" : "border-rule hover:border-teal/50"}`}>
                      <span className="text-2xl">🧾</span>
                      <div><p className="font-semibold text-ink text-[15px]">Invoice / Bank Transfer</p><p className="text-[12px] text-muted">B2B accounts only</p></div>
                    </button>
                  )}
                </div>

                {/* Loyalty points */}
                {user?.loyalty_points_balance > 0 && (
                  <div className="bg-teal-light rounded-xl p-4 mb-4">
                    <p className="text-[14px] font-semibold text-teal mb-2">★ {user.loyalty_points_balance} pts ({formatPrice(user.loyalty_points_balance * 5)})</p>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="accent-teal w-4 h-4" checked={payment.loyalty_pts > 0} onChange={(e) => setPayment((p) => ({ ...p, loyalty_pts: e.target.checked ? user.loyalty_points_balance : 0 }))} />
                      <span className="text-[13px] font-medium text-ink">Redeem for {formatPrice(user.loyalty_points_balance * 5)} off</span>
                    </label>
                  </div>
                )}

                {/* Promo code */}
                <div className="mb-6">
                  <p className="text-[12px] font-bold uppercase tracking-wider text-muted mb-2">Promo Code</p>
                  {promoApplied ? (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Tag size={14} className="text-green-600" />
                        <span className="text-[13px] font-semibold text-green-700">{promoApplied.code} — {promoApplied.name}</span>
                        <span className="text-[13px] font-bold text-green-700">−{formatPrice(promoApplied.discount)}</span>
                      </div>
                      <button onClick={() => { setPromoApplied(null); setPromoCode(""); }} className="text-[11px] text-red-500 hover:underline">Remove</button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input type="text" placeholder="Enter promo code" value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())} className="flex-1 h-[48px] px-4 rounded-xl border border-rule bg-card text-[14px] font-mono uppercase outline-none focus:border-teal focus:border-2 transition-all" />
                      <Button variant="secondary" loading={promoLoading} onClick={handleApplyPromo} className="shrink-0">Apply</Button>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button variant="secondary" onClick={() => setStep(2)}>Back</Button>
                  <Button className="flex-1" onClick={() => setStep(4)} disabled={!payment.method}>Review Order</Button>
                </div>
              </div>
            )}

            {/* STEP 4 — Review */}
            {step === 4 && (
              <div className="bg-white rounded-xl2 p-8 shadow-card">
                <h2 className="font-bold text-[20px] mb-6 text-ink">Review Your Order</h2>
                <div className="space-y-3 mb-6">
                  {items.map((item) => (
                    <div key={item.variantId} className="flex items-center gap-4 pb-3 border-b border-rule last:border-0">
                      <div className="w-12 h-12 bg-card rounded-xl flex items-center justify-center shrink-0">
                        <img src={item.image || "https://placehold.co/48x48/e6f4f4/008080"} alt="" className="w-full h-full object-contain p-1" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-[13px] text-ink">{item.productName}</p>
                        <p className="text-[12px] text-muted">Qty: {item.quantity} {item.size ? `· ${item.size}` : ""}{item.colour ? ` · ${item.colour}` : ""}</p>
                      </div>
                      <p className="font-bold text-[14px] text-ink">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 text-[14px] mb-6 border-t border-rule pt-4">
                  <div className="flex justify-between text-muted"><span>Delivery</span><span className="capitalize">{delivery.type === "click_and_collect" ? "Click & Collect" : delivery.city}</span></div>
                  <div className="flex justify-between text-muted"><span>Payment</span><span className="capitalize font-medium text-ink">{payment.method}</span></div>
                  {payment.loyalty_pts > 0 && <div className="flex justify-between text-green-600"><span>Loyalty Discount</span><span>−{formatPrice(loyaltyDiscount)}</span></div>}
                  {promoApplied && <div className="flex justify-between text-green-600"><span>Promo ({promoApplied.code})</span><span>−{formatPrice(promoDiscount)}</span></div>}
                  <div className="flex justify-between font-bold text-[16px] text-ink border-t border-rule pt-2"><span>Total</span><span>{formatPrice(finalTotal)}</span></div>
                </div>
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={() => setStep(3)}>Back</Button>
                  <Button className="flex-1" loading={loading} onClick={handlePlaceOrder}>Place Order</Button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="bg-white rounded-xl2 p-6 shadow-card h-fit sticky top-20">
            <h3 className="font-bold text-[16px] text-ink mb-4">Order Total</h3>
            <div className="space-y-2 text-[13px] text-muted mb-4">
              <div className="flex justify-between"><span>{items.length} item(s)</span><span>{formatPrice(total)}</span></div>
              {payment.loyalty_pts > 0 && <div className="flex justify-between text-green-600"><span>Points redeemed</span><span>−{formatPrice(loyaltyDiscount)}</span></div>}
              {promoApplied && <div className="flex justify-between text-green-600"><span>Promo code</span><span>−{formatPrice(promoDiscount)}</span></div>}
            </div>
            <div className="border-t border-rule pt-3 flex justify-between font-bold text-[16px] text-ink">
              <span>Total</span><span>{formatPrice(finalTotal)}</span>
            </div>
          </div>
        </div>
      </div>
      {/* Payment modal */}
      {placedOrder && (
        <PaymentModal
          order={placedOrder}
          onClose={() => setPlacedOrder(null)}
        />
      )}
    </div>
  );
}