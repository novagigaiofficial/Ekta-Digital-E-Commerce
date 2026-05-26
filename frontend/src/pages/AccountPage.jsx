import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Package, Star, MapPin, Settings, LogOut, ChevronRight, Download, RotateCcw, Plus, Lock, CheckCircle } from "lucide-react";
import useAuthStore from "../store/authStore";
import useCartStore from "../store/cartStore";
import api from "../lib/api";
import getToken from "../lib/getToken";
import Button from "../components/ui/Button";
import { formatPrice } from "../lib/utils";
import toast from "react-hot-toast";

const TABS = [
  { key: "overview",   label: "Overview",        icon: <Package size={16} /> },
  { key: "orders",     label: "My Orders",        icon: <Package size={16} /> },
  { key: "loyalty",    label: "Loyalty Points",   icon: <Star size={16} /> },
  { key: "addresses",  label: "My Addresses",     icon: <MapPin size={16} /> },
  { key: "settings",   label: "Settings",         icon: <Settings size={16} /> },
];

const STATUS_COLORS = {
  pending:    "bg-yellow-100 text-yellow-700",
  confirmed:  "bg-blue-100 text-blue-700",
  processing: "bg-purple-100 text-purple-700",
  shipped:    "bg-indigo-100 text-indigo-700",
  delivered:  "bg-green-100 text-green-700",
  cancelled:  "bg-red-100 text-red-500",
};

const STEP_INDEX = { pending: 0, confirmed: 1, processing: 2, shipped: 3, delivered: 4, cancelled: -1 };

export default function AccountPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout, setUser } = useAuthStore();
  const addItem   = useCartStore((s) => s.addItem);

  // Support deep-linking via navigate("/account", { state: { tab: "orders" } })
  const [tab,        setTab]        = useState(location.state?.tab ?? "overview");
  const [orders,     setOrders]     = useState([]);
  const [loyalty,    setLoyalty]    = useState(null);
  const [addresses,  setAddresses]  = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [addrModal,  setAddrModal]  = useState(false);
  const [addrForm,   setAddrForm]   = useState({ label: "Home", full_name: "", phone: "", address_line: "", city: "", is_default: false });
  const [addrSaving, setAddrSaving] = useState(false);
  const [profileForm,setProfileForm]= useState({ first_name: user?.first_name ?? "", last_name: user?.last_name ?? "", phone: user?.phone ?? "" });
  const [profileSaving,setProfileSaving] = useState(false);
  const [pwForm,     setPwForm]     = useState({ current_password: "", password: "", password_confirmation: "" });
  const [pwSaving,   setPwSaving]   = useState(false);

  const loadData = async () => {
    setLoading(true);

    try {
      // your existing loadData code here
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    loadData();
  }, [user, tab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === "orders"   || tab === "overview") { const r = await api.get("/orders");   setOrders(r.data.data ?? []); }
      if (tab === "loyalty"  || tab === "overview") { const r = await api.get("/loyalty");  setLoyalty(r.data); }
      if (tab === "addresses")                       { const r = await api.get("/addresses"); setAddresses(r.data); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleLogout = async () => { await logout(); navigate("/"); };

  const handleReorder = async (orderId) => {
    try {
      const res   = await api.get(`/orders/${orderId}`);
      const items = res.data.items ?? [];
      if (!items.length) { toast.error("No items found in this order"); return; }
      items.forEach((item) => {
        if (item.variant && item.variant.product) addItem(item.variant, item.variant.product, item.quantity);
      });
      toast.success(`${items.length} item(s) added to cart!`);
      navigate("/cart");
    } catch { toast.error("Could not reorder. Please try again."); }
  };

  const handleSaveAddress = async () => {
    setAddrSaving(true);
    try {
      await api.post("/addresses", addrForm);
      toast.success("Address saved!");
      setAddrModal(false);
      setAddrForm({ label: "Home", full_name: "", phone: "", address_line: "", city: "", is_default: false });
      const r = await api.get("/addresses");
      setAddresses(r.data);
    } catch (e) {
      const errors = e.response?.data?.errors;
      if (errors) Object.values(errors).flat().forEach((m) => toast.error(m));
      else toast.error("Failed to save address");
    } finally { setAddrSaving(false); }
  };

  const handleDeleteAddress = async (id) => {
    // Address delete: small undo-able action, proceeds immediately
    try {
      await api.delete(`/addresses/${id}`);
      toast.success("Deleted");
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch { toast.error("Failed to delete"); }
  };

  // Profile update
  const handleSaveProfile = async () => {
    setProfileSaving(true);
    try {
      const res = await api.put("/me", profileForm);
      setUser(res.data);
      toast.success("Profile updated!");
    } catch (e) {
      const errors = e.response?.data?.errors;
      if (errors) Object.values(errors).flat().forEach((m) => toast.error(m));
      else toast.error("Failed to update profile");
    } finally { setProfileSaving(false); }
  };

  // Password change
  const handleChangePassword = async () => {
    if (pwForm.password !== pwForm.password_confirmation) { toast.error("Passwords do not match"); return; }
    if (pwForm.password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setPwSaving(true);
    try {
      await api.put("/me/password", pwForm);
      toast.success("Password changed successfully!");
      setPwForm({ current_password: "", password: "", password_confirmation: "" });
    } catch (e) {
      toast.error(e.response?.data?.message ?? "Failed to change password");
    } finally { setPwSaving(false); }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-soft">
      <div className="max-w-[1200px] mx-auto px-6 py-10">
        <div className="mb-8">
          <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-teal mb-1">My Account</p>
          <h1 className="text-[36px] font-bold tracking-[-1px] text-ink">Hello, {user.first_name} 👋</h1>
        </div>
        <div className="grid md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="md:col-span-1">
            <div className="bg-white rounded-xl2 shadow-card overflow-hidden">
              {TABS.map((t) => (
                <button key={t.key} onClick={() => setTab(t.key)} className={`w-full flex items-center gap-3 px-5 py-4 text-[14px] font-medium transition-all border-b border-rule last:border-0 ${tab === t.key ? "bg-teal-light text-teal border-l-2 border-l-teal" : "text-ink hover:bg-soft"}`}>
                  <span className={tab === t.key ? "text-teal" : "text-muted"}>{t.icon}</span>
                  {t.label}
                  <ChevronRight size={14} className="ml-auto text-muted" />
                </button>
              ))}
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-4 text-[14px] font-medium text-red-500 hover:bg-red-50 transition-all">
                <LogOut size={16} />Logout
              </button>
            </div>
          </aside>

          {/* Content */}
          <div className="md:col-span-3">

            {/* Overview */}
            {tab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Total Orders",   value: orders.length,                              color: "text-ink"        },
                    { label: "Loyalty Points", value: user.loyalty_points_balance,                color: "text-teal"       },
                    { label: "Points Value",   value: formatPrice(user.loyalty_points_balance*5), color: "text-green-600"  },
                  ].map((s) => (
                    <div key={s.label} className="bg-white rounded-xl2 p-5 shadow-card text-center">
                      <p className={`text-[28px] font-bold tracking-[-1px] ${s.color}`}>{s.value}</p>
                      <p className="text-[12px] text-muted mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-teal rounded-xl2 p-6 text-white">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-white/70 mb-1">Ekta Rewards</p>
                      <p className="text-[40px] font-bold tracking-[-1px] leading-none">{user.loyalty_points_balance}<span className="text-[16px] font-medium text-white/70 ml-2">points</span></p>
                    </div>
                    <Star size={32} className="text-yellow-300 fill-yellow-300" />
                  </div>
                  <p className="text-white/70 text-[14px]">Redeemable value: <strong className="text-white">{formatPrice(user.loyalty_points_balance * 5)}</strong></p>
                </div>
                {orders.length > 0 && (
                  <div className="bg-white rounded-xl2 shadow-card overflow-hidden">
                    <div className="px-6 py-4 border-b border-rule flex justify-between items-center">
                      <h3 className="font-bold text-[16px] text-ink">Recent Orders</h3>
                      <button onClick={() => setTab("orders")} className="text-teal text-[13px] font-semibold hover:underline">View All</button>
                    </div>
                    {orders.slice(0, 3).map((o) => <OrderRow key={o.id} order={o} onReorder={handleReorder} onRefresh={loadData} />)}
                  </div>
                )}
              </div>
            )}

            {/* Orders */}
            {tab === "orders" && (
              <div className="bg-white rounded-xl2 shadow-card overflow-hidden">
                <div className="px-6 py-5 border-b border-rule"><h2 className="font-bold text-[20px] text-ink">My Orders</h2></div>
                {loading
                  ? <div className="p-10 text-center"><div className="w-8 h-8 border-2 border-teal border-t-transparent rounded-full animate-spin mx-auto" /></div>
                  : orders.length === 0
                    ? <div className="p-10 text-center"><Package size={40} className="text-rule mx-auto mb-3" /><p className="text-muted mb-4">No orders yet.</p><Button onClick={() => navigate("/shop")}>Start Shopping</Button></div>
                    : orders.map((o) => <OrderRow key={o.id} order={o} showDetail onReorder={handleReorder} onRefresh={loadData} />)
                }
              </div>
            )}

            {/* Loyalty */}
            {tab === "loyalty" && (
              <div className="space-y-6">
                <div className="bg-teal rounded-xl2 p-8 text-white">
                  <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-white/70 mb-2">Your Balance</p>
                  <p className="text-[56px] font-bold tracking-[-2px] leading-none mb-2">{user.loyalty_points_balance}</p>
                  <p className="text-white/70 text-[15px]">points · worth <strong className="text-white">{formatPrice(user.loyalty_points_balance * 5)}</strong></p>
                </div>
                <div className="bg-white rounded-xl2 shadow-card p-6">
                  <h3 className="font-bold text-[16px] text-ink mb-4">How it works</h3>
                  <div className="space-y-3">
                    {[
                      { icon: "🛍️", text: "Earn 1 point per TZS 1,000 spent"      },
                      { icon: "💰", text: "1 point = TZS 5 off your next order"    },
                      { icon: "♾️", text: "Points never expire"                    },
                      { icon: "✅", text: "Redeem at checkout — enter your points" },
                    ].map((item) => (
                      <div key={item.text} className="flex items-center gap-3 text-[14px] text-muted">
                        <span className="text-xl">{item.icon}</span>{item.text}
                      </div>
                    ))}
                  </div>
                </div>
                {loyalty?.history?.data?.length > 0 && (
                  <div className="bg-white rounded-xl2 shadow-card overflow-hidden">
                    <div className="px-6 py-4 border-b border-rule"><h3 className="font-bold text-[16px] text-ink">Points History</h3></div>
                    {loyalty.history.data.map((l) => (
                      <div key={l.id} className="flex items-center justify-between px-6 py-4 border-b border-rule last:border-0">
                        <div>
                          <p className="text-[14px] font-medium text-ink">{l.note}</p>
                          <p className="text-[12px] text-muted">{new Date(l.created_at).toLocaleDateString("en-TZ")}</p>
                        </div>
                        <span className={`font-bold text-[15px] ${l.points_delta > 0 ? "text-green-600" : "text-red-500"}`}>
                          {l.points_delta > 0 ? "+" : ""}{l.points_delta}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Addresses */}
            {tab === "addresses" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="font-bold text-[20px] text-ink">My Addresses</h2>
                  <Button onClick={() => setAddrModal(true)}><Plus size={15} />Add Address</Button>
                </div>
                {loading
                  ? <div className="p-10 text-center"><div className="w-8 h-8 border-2 border-teal border-t-transparent rounded-full animate-spin mx-auto" /></div>
                  : addresses.length === 0
                    ? <div className="bg-white rounded-xl2 shadow-card p-10 text-center"><MapPin size={40} className="text-rule mx-auto mb-3" /><p className="text-muted mb-4">No saved addresses yet.</p><Button onClick={() => setAddrModal(true)}>Add Your First Address</Button></div>
                    : <div className="grid md:grid-cols-2 gap-4">
                        {addresses.map((addr) => (
                          <div key={addr.id} className="bg-white rounded-xl2 shadow-card p-5">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-2">
                                <span className="text-[12px] font-bold uppercase tracking-wider bg-teal-light text-teal px-2 py-0.5 rounded-full">{addr.label}</span>
                                {addr.is_default && <span className="text-[11px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Default</span>}
                              </div>
                              <button onClick={() => handleDeleteAddress(addr.id)} className="text-muted hover:text-red-500 transition-colors text-[12px]">✕</button>
                            </div>
                            <p className="font-semibold text-[14px] text-ink mb-1">{addr.full_name}</p>
                            <p className="text-[13px] text-muted">{addr.phone}</p>
                            <p className="text-[13px] text-muted">{addr.address_line}, {addr.city}</p>
                          </div>
                        ))}
                      </div>
                }
                {addrModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setAddrModal(false)} />
                    <div className="relative bg-white rounded-xl2 shadow-xl w-full max-w-md p-8 space-y-4">
                      <h3 className="font-bold text-[18px] text-ink">Add New Address</h3>
                      <div className="flex gap-2">
                        {["Home", "Work", "Other"].map((l) => (
                          <button key={l} onClick={() => setAddrForm((f) => ({ ...f, label: l }))} className={`px-4 py-1.5 rounded-full text-[13px] font-semibold border transition-all ${addrForm.label === l ? "bg-teal text-white border-teal" : "border-rule text-ink hover:border-teal"}`}>{l}</button>
                        ))}
                      </div>
                      {[{ key: "full_name", label: "Full Name", type: "text" }, { key: "phone", label: "Phone", type: "tel" }, { key: "address_line", label: "Address", type: "text" }, { key: "city", label: "City", type: "text" }].map((f) => (
                        <div key={f.key} className="relative">
                          <input type={f.type} placeholder=" " value={addrForm[f.key]} onChange={(e) => setAddrForm((p) => ({ ...p, [f.key]: e.target.value }))} required className="peer w-full h-[52px] px-4 pt-4 rounded-xl border border-rule bg-card text-[14px] outline-none focus:border-teal focus:border-2 transition-all" />
                          <label className="absolute left-4 top-1.5 text-[11px] font-medium text-muted peer-placeholder-shown:top-4 peer-placeholder-shown:text-[14px] peer-focus:top-1.5 peer-focus:text-[11px] transition-all pointer-events-none">{f.label}</label>
                        </div>
                      ))}
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="accent-teal w-4 h-4" checked={addrForm.is_default} onChange={(e) => setAddrForm((f) => ({ ...f, is_default: e.target.checked }))} />
                        <span className="text-[14px] font-medium text-ink">Set as default address</span>
                      </label>
                      <div className="flex gap-3 pt-2">
                        <Button variant="secondary" className="flex-1" onClick={() => setAddrModal(false)}>Cancel</Button>
                        <Button className="flex-1" loading={addrSaving} onClick={handleSaveAddress}>Save Address</Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Settings */}
            {tab === "settings" && (
              <div className="space-y-6">
                {/* Profile update */}
                <div className="bg-white rounded-xl2 shadow-card p-8">
                  <h2 className="font-bold text-[20px] text-ink mb-6">Profile Information</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {[{ key: "first_name", label: "First Name" }, { key: "last_name", label: "Last Name" }].map((f) => (
                        <div key={f.key} className="relative">
                          <input type="text" placeholder=" " value={profileForm[f.key]} onChange={(e) => setProfileForm((p) => ({ ...p, [f.key]: e.target.value }))} className="peer w-full h-[52px] px-4 pt-4 rounded-xl border border-rule bg-card text-[14px] outline-none focus:border-teal focus:border-2 transition-all" />
                          <label className="absolute left-4 top-1.5 text-[11px] font-medium text-muted peer-placeholder-shown:top-4 peer-placeholder-shown:text-[14px] peer-focus:top-1.5 peer-focus:text-[11px] transition-all pointer-events-none">{f.label}</label>
                        </div>
                      ))}
                    </div>
                    <div className="relative">
                      <input type="tel" placeholder=" " value={profileForm.phone} onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))} className="peer w-full h-[52px] px-4 pt-4 rounded-xl border border-rule bg-card text-[14px] outline-none focus:border-teal focus:border-2 transition-all" />
                      <label className="absolute left-4 top-1.5 text-[11px] font-medium text-muted peer-placeholder-shown:top-4 peer-placeholder-shown:text-[14px] peer-focus:top-1.5 peer-focus:text-[11px] transition-all pointer-events-none">Phone Number</label>
                    </div>
                    <div className="p-3 bg-card rounded-xl border border-rule text-[13px] text-muted flex justify-between">
                      <span>Email Address</span><span className="font-medium text-ink">{user.email}</span>
                    </div>
                    <Button onClick={handleSaveProfile} loading={profileSaving}>Save Changes</Button>
                  </div>
                </div>

                {/* Change password */}
                <div className="bg-white rounded-xl2 shadow-card p-8">
                  <h2 className="font-bold text-[20px] text-ink mb-6">Change Password</h2>
                  <div className="space-y-4">
                    {[
                      { key: "current_password",      label: "Current Password"   },
                      { key: "password",               label: "New Password"       },
                      { key: "password_confirmation",  label: "Confirm New Password" },
                    ].map((f) => (
                      <div key={f.key} className="relative">
                        <input type="password" placeholder=" " value={pwForm[f.key]} onChange={(e) => setPwForm((p) => ({ ...p, [f.key]: e.target.value }))} className="peer w-full h-[52px] px-4 pt-4 rounded-xl border border-rule bg-card text-[14px] outline-none focus:border-teal focus:border-2 transition-all" />
                        <label className="absolute left-4 top-1.5 text-[11px] font-medium text-muted peer-placeholder-shown:top-4 peer-placeholder-shown:text-[14px] peer-focus:top-1.5 peer-focus:text-[11px] transition-all pointer-events-none">{f.label}</label>
                      </div>
                    ))}
                    <Button onClick={handleChangePassword} loading={pwSaving}>Update Password</Button>
                  </div>
                </div>

                <div className="bg-teal-light rounded-xl p-4 text-[13px] text-teal">
                  Account type: <strong className="uppercase">{user.account_type}</strong> · To change your email, contact us at <a href="mailto:EktaDigital@outlook.com" className="font-bold hover:underline">EktaDigital@outlook.com</a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── OrderRow ────────────────────────────────────────────────────────────────
function OrderRow({ order, showDetail = false, onReorder, onRefresh }) {
  const [downloading,  setDownloading]  = useState(false);
  const [confirming,   setConfirming]   = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const isDelivered = order.status === "delivered";
  const canConfirm  = ["shipped", "processing", "confirmed"].includes(order.status);

  const handleDownloadInvoice = async () => {
    setDownloading(true);
    try {
      const token = getToken();  // ← unified token read
      const res   = await fetch(
        `${process.env.REACT_APP_API_URL || "http://localhost:8000/api/v1"}/orders/${order.id}/invoice`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url  = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href     = url;
      link.download = `Invoice-${order.order_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Invoice downloaded!");
    } catch { toast.error("Failed to download invoice. Please try again."); }
    finally { setDownloading(false); }
  };

  const handleConfirmDelivery = async () => {
    setConfirming(true);
    try {
      await api.post(`/orders/${order.id}/confirm-delivery`);
      toast.success("Delivery confirmed! Your invoice is now ready.");
      setConfirmModal(false);
      onRefresh?.();
    } catch (e) { toast.error(e.response?.data?.message ?? "Confirmation failed"); }
    finally { setConfirming(false); }
  };

  return (
    <>
      <div className="px-6 py-5 border-b border-rule last:border-0">
        <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
          <div>
            <p className="font-bold text-[14px] text-ink">{order.order_number}</p>
            <p className="text-[12px] text-muted mt-0.5">
              {new Date(order.created_at).toLocaleDateString("en-TZ", { day: "numeric", month: "long", year: "numeric" })}
              {" · "}{order.items?.length ?? 0} item(s)
              {" · "}<strong className="text-ink">{formatPrice(order.total_tzs)}</strong>
            </p>
            {isDelivered && order.delivered_at && (
              <p className="text-[11px] text-green-600 font-medium mt-0.5">
                ✓ Delivered on {new Date(order.delivered_at).toLocaleDateString("en-TZ", { day: "numeric", month: "long", year: "numeric" })}
                {" "}{order.delivery_confirmed_by === "customer" ? "(confirmed by you)" : "(confirmed by Ekta Digital)"}
              </p>
            )}
          </div>
          <span className={`text-[11px] font-bold tracking-wide uppercase px-3 py-1.5 rounded-full shrink-0 ${STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-600"}`}>
            {order.status}
          </span>
        </div>

        {showDetail && <div className="mb-4"><StatusTimeline status={order.status} deliveredAt={order.delivered_at} /></div>}

        {showDetail && (
          <div className="flex flex-wrap gap-2 items-center">
            <button onClick={() => onReorder(order.id)} className="flex items-center gap-1.5 text-[12px] font-semibold text-teal border border-teal px-3 py-1.5 rounded-full hover:bg-teal-light transition-colors">
              <RotateCcw size={12} />Reorder
            </button>
            {canConfirm && (
              <button onClick={() => setConfirmModal(true)} className="flex items-center gap-1.5 text-[12px] font-semibold text-white bg-green-500 px-4 py-1.5 rounded-full hover:bg-green-600 transition-colors animate-pulse">
                <CheckCircle size={12} />Confirm Receipt
              </button>
            )}
            {isDelivered ? (
              <button onClick={handleDownloadInvoice} disabled={downloading} className="flex items-center gap-1.5 text-[12px] font-semibold text-white bg-ink px-4 py-1.5 rounded-full hover:opacity-80 transition-all disabled:opacity-50">
                {downloading ? <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" /> : <Download size={12} />}
                Download Invoice
              </button>
            ) : (
              <div className="flex items-center gap-1.5 text-[12px] text-muted border border-rule px-3 py-1.5 rounded-full opacity-50 select-none" title="Invoice available after delivery is confirmed">
                <Lock size={11} />Invoice (after delivery)
              </div>
            )}
          </div>
        )}
      </div>

      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setConfirmModal(false)} />
          <div className="relative bg-white rounded-xl2 shadow-2xl w-full max-w-sm p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package size={32} className="text-green-500" />
            </div>
            <h3 className="font-bold text-[20px] text-ink mb-2">Confirm You Received This Order</h3>
            <p className="text-muted text-[14px] leading-relaxed mb-2">
              By confirming, you're letting us know that order{" "}
              <br /><strong className="text-ink">{order.order_number}</strong><br />
              has been delivered to you successfully.
            </p>
            <div className="bg-soft rounded-xl p-4 mb-6 text-left space-y-2">
              <p className="text-[12px] font-bold uppercase tracking-wider text-muted mb-2">What happens next</p>
              {["Order marked as Delivered", "Your VAT invoice becomes available", "You can download it anytime from here"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-[13px] text-body">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal shrink-0" />{item}
                </div>
              ))}
            </div>
            <p className="text-[12px] text-muted mb-6">Only confirm if you have physically received all items.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmModal(false)} disabled={confirming} className="flex-1 h-11 rounded-pill border border-rule text-[13px] font-semibold text-muted hover:border-teal transition-all disabled:opacity-50">Not Yet</button>
              <button onClick={handleConfirmDelivery} disabled={confirming} className="flex-1 h-11 rounded-pill bg-green-500 text-white text-[13px] font-semibold hover:bg-green-600 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                {confirming ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><CheckCircle size={15} />Yes, I Received It</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── StatusTimeline ───────────────────────────────────────────────────────────
const TIMELINE_STEPS = [
  { key: "pending",    label: "Placed",    icon: "📋" },
  { key: "confirmed",  label: "Confirmed", icon: "✅" },
  { key: "processing", label: "Preparing", icon: "📦" },
  { key: "shipped",    label: "On the way",icon: "🚚" },
  { key: "delivered",  label: "Delivered", icon: "🏠" },
];

function StatusTimeline({ status, deliveredAt }) {
  if (status === "cancelled") return (
    <div className="flex items-center gap-2 py-2">
      <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center"><span className="text-[12px]">✕</span></div>
      <span className="text-[13px] text-red-500 font-semibold">Order Cancelled</span>
    </div>
  );
  const currentIndex = STEP_INDEX[status] ?? 0;
  return (
    <div className="flex items-start gap-0 w-full">
      {TIMELINE_STEPS.map((step, i) => {
        const isDone    = i < currentIndex;
        const isCurrent = i === currentIndex;
        const isLast    = i === TIMELINE_STEPS.length - 1;
        return (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center gap-1.5 min-w-[52px]">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[14px] border-2 transition-all ${isDone ? "bg-teal border-teal" : isCurrent ? "bg-white border-teal ring-4 ring-teal/10" : "bg-white border-rule"}`}>
                {isDone ? <span className="text-white text-[12px] font-bold">✓</span> : <span className={isCurrent ? "text-[14px]" : "text-[14px] grayscale opacity-40"}>{step.icon}</span>}
              </div>
              <span className={`text-[9px] font-bold text-center leading-tight transition-colors ${isDone || isCurrent ? "text-teal" : "text-muted"}`}>
                {step.label}
                {step.key === "delivered" && deliveredAt && (
                  <span className="block text-[8px] text-green-600 font-normal">{new Date(deliveredAt).toLocaleDateString("en-TZ", { day: "numeric", month: "short" })}</span>
                )}
              </span>
            </div>
            {!isLast && <div className={`flex-1 h-0.5 mt-4 transition-all ${isDone ? "bg-teal" : "bg-rule"}`} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}
