import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Loader, Copy } from "lucide-react";
import api from "../lib/api";
import Button from "../components/ui/Button";
import { formatPrice } from "../lib/utils";
import toast from "react-hot-toast";

// ─── Payment Success Page ────────────────────────────────────────────────────
export function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  // const orderId = searchParams.get("order");
  const ppOrderId = searchParams.get("token");
  const [status, setStatus] = useState("loading");
  const [order,  setOrder]  = useState(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!orderId) {
      navigate("/account");
      return;
    }

    const handleSuccess = async () => {
      try {
        // If PayPal redirect, capture the payment
        if (ppOrderId) {
          await api.post("/payment/paypal/capture", {
            pp_order_id: ppOrderId,
            order_id: orderId,
          });
        }

        // Poll payment status
        const res = await api.get(`/orders/${orderId}/payment-status`);

        setOrder(res.data);

        setStatus(
          res.data.payment_status === "paid"
            ? "success"
            : "pending"
        );
      } catch {
        setStatus("pending");
      }
    };

    handleSuccess();
  }, [orderId, ppOrderId]);

  if (status === "loading") return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader size={32} className="animate-spin text-teal" />
    </div>
  );

  return (
    <div className="min-h-screen bg-soft flex items-center justify-center px-6 py-16">
      <div className="bg-white rounded-2xl shadow-card p-10 max-w-md w-full text-center">
        {status === "success" ? (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-green-500" />
            </div>
            <h1 className="text-[28px] font-bold text-ink mb-2">Payment Successful! 🎉</h1>
            <p className="text-muted mb-4">Your order <strong className="text-ink">{order?.order_number}</strong> is confirmed and being processed.</p>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader size={40} className="text-yellow-500 animate-spin" />
            </div>
            <h1 className="text-[28px] font-bold text-ink mb-2">Payment Pending</h1>
            <p className="text-muted mb-4">We're waiting for payment confirmation. Your order will be processed once payment is received.</p>
          </>
        )}
        <div className="flex gap-3 mt-6">
          <Button className="flex-1" onClick={() => navigate("/account", { state: { tab: "orders" } })}>
            Track My Order
          </Button>
          <Button variant="secondary" className="flex-1" onClick={() => navigate("/shop")}>
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Payment Cancel Page ─────────────────────────────────────────────────────
export function PaymentCancelPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  // const orderId = searchParams.get("order");

  return (
    <div className="min-h-screen bg-soft flex items-center justify-center px-6 py-16">
      <div className="bg-white rounded-2xl shadow-card p-10 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle size={40} className="text-red-500" />
        </div>
        <h1 className="text-[28px] font-bold text-ink mb-2">Payment Cancelled</h1>
        <p className="text-muted mb-6">Your payment was cancelled. Your order is saved and you can try again from your account.</p>
        <div className="flex gap-3">
          <Button className="flex-1" onClick={() => navigate("/account", { state: { tab: "orders" } })}>
            View My Orders
          </Button>
          <Button variant="secondary" className="flex-1" onClick={() => navigate("/")}>
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── PaymentModal — shown after order is placed ───────────────────────────────
export function PaymentModal({ order, onClose }) {
  const navigate  = useNavigate();
  const [loading, setLoading]   = useState(false);
  const [bankDetails, setBankDetails] = useState(null);
  const [demoMode,   setDemoMode]     = useState(false);

  const GATEWAY_MAP = {
    mpesa:       "selcom",
    airtel:      "selcom",
    crdb:        "selcom",
    selcom:      "selcom",
    visa:        "selcom",
    mastercard:  "selcom",
    paypal:      "paypal",
    invoice:     "bank_transfer",
  };

  const handlePay = async () => {
    setLoading(true);
    try {
      const gateway = GATEWAY_MAP[order.payment_method] ?? "selcom";
      const res = await api.post(`/orders/${order.id}/pay`, {
        gateway,
        phone: order.delivery_address?.phone,
      });

      if (res.data.demo_mode) {
        setDemoMode(true);
        toast("Demo mode — payment gateway not configured. Order saved as pending.", { icon: "ℹ️" });
        return;
      }

      if (gateway === "bank_transfer") {
        setBankDetails(res.data);
        return;
      }

      if (res.data.payment_url) {
        window.location.href = res.data.payment_url;
        return;
      }

      toast.success("Payment initiated!");
      navigate("/account", { state: { tab: "orders" } });
    } catch (e) {
      toast.error(e.response?.data?.message ?? "Payment initiation failed");
    } finally {
      setLoading(false);
    }
  };

  if (demoMode) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🔧</span>
        </div>
        <h2 className="font-bold text-[20px] text-ink mb-2">Demo Mode</h2>
        <p className="text-muted text-[14px] mb-6">Payment gateway not configured. Your order <strong>{order.order_number}</strong> has been saved. Admin will process it manually.</p>
        <Button className="w-full" onClick={() => { onClose(); navigate("/account", { state: { tab: "orders" } }); }}>
          View My Orders
        </Button>
      </div>
    </div>
  );

  if (bankDetails) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <h2 className="font-bold text-[22px] text-ink mb-2">Bank Transfer Details</h2>
        <p className="text-muted text-[14px] mb-6">Transfer the exact amount and use your order number as reference.</p>
        <div className="bg-soft rounded-xl p-5 space-y-3 mb-4">
          {[
            { label: "Amount",       value: formatPrice(bankDetails.amount), highlight: true },
            { label: "Order Ref",    value: bankDetails.order_number,        highlight: true },
            { label: "Bank",         value: bankDetails.bank_details?.bank        ?? "CRDB Bank" },
            { label: "Account Name", value: bankDetails.bank_details?.account_name ?? "Ekta Digital Ltd" },
            { label: "Account No",   value: bankDetails.bank_details?.account_no   ?? "Contact us" },
            { label: "Branch",       value: bankDetails.bank_details?.branch        ?? "India Street, DSM" },
            { label: "SWIFT",        value: bankDetails.bank_details?.swift         ?? "CORUTZTZ" },
          ].map((item) => (
            <div key={item.label} className="flex justify-between items-center">
              <span className="text-[12px] text-muted font-medium">{item.label}</span>
              <div className="flex items-center gap-2">
                <span className={`text-[14px] font-bold ${item.highlight ? "text-teal text-[16px]" : "text-ink"}`}>{item.value}</span>
                {item.highlight && (
                  <button onClick={() => { navigator.clipboard.writeText(item.value); toast.success(`${item.label} copied!`); }} className="text-muted hover:text-teal transition-colors">
                    <Copy size={13} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="text-[13px] text-muted mb-6 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
          ⏱ Allow 1 business day for confirmation. Your order status will update to "Confirmed" after we verify the transfer.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => { onClose(); navigate("/account", { state: { tab: "orders" } }); }}>
            View Orders
          </Button>
          <a href="https://wa.me/255783394445" target="_blank" rel="noreferrer" className="flex-1">
            <Button className="w-full">💬 WhatsApp Us</Button>
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
        <div className="w-16 h-16 bg-teal-light rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">💳</span>
        </div>
        <h2 className="font-bold text-[22px] text-ink mb-1">Complete Payment</h2>
        <p className="text-muted text-[14px] mb-2">Order <strong>{order.order_number}</strong></p>
        <p className="text-[28px] font-bold text-teal mb-6">{formatPrice(order.total_tzs)}</p>
        <p className="text-[13px] text-muted mb-6">
          You selected <strong className="text-ink capitalize">{order.payment_method?.replace("_", " ")}</strong>.
          {" "}You'll be redirected to complete payment securely.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
          <Button loading={loading} onClick={handlePay} className="flex-1">Pay Now</Button>
        </div>
        <p className="text-[11px] text-muted mt-4">🔒 Secured by Selcom / PayPal</p>
      </div>
    </div>
  );
}
