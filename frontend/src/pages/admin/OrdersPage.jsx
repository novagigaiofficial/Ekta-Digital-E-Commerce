import getToken from "../../lib/getToken";
import React, { useEffect, useState, useCallback } from "react";
import { Download, CheckCircle, Truck } from "lucide-react";
import api from "../../lib/api";
import { formatPrice } from "../../lib/utils";
import toast from "react-hot-toast";

const STATUS_OPTIONS = ["pending","confirmed","processing","shipped","delivered","cancelled"];
const STATUS_COLORS = {pending:"bg-yellow-100 text-yellow-700",confirmed:"bg-blue-100 text-blue-700",processing:"bg-purple-100 text-purple-700",shipped:"bg-indigo-100 text-indigo-700",delivered:"bg-green-100 text-green-700",cancelled:"bg-red-100 text-red-500"};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try{const res=await api.get("/admin/orders",{params:{status:filter,search}});setOrders(res.data.data??[]);}
    catch(e){console.error(e);}finally{setLoading(false);}
  }, [filter, search]);

  useEffect(() => {
    const delay = search ? 400 : 0;
    const t = setTimeout(() => fetchOrders(), delay);
    return () => clearTimeout(t);
  }, [fetchOrders, search]);

  const updateStatus = async (id,status) => {
    if(status==="delivered"){setConfirming(true);return;}
    await applyStatusUpdate(id,status);
  };

  const applyStatusUpdate = async (id,status) => {
    setUpdating(true);
    try{
      await api.put(`/admin/orders/${id}`,{status});
      toast.success(status==="delivered"?"✓ Order marked as Delivered. Customer notified & invoice unlocked!":"Order status updated");
      fetchOrders();
      if(selected?.id===id) setSelected(o=>({...o,status}));
      setConfirming(false);
    }catch{toast.error("Update failed");}finally{setUpdating(false);}
  };

  const handleMarkPaid = async (order, ref) => {
    setMarkingPaid(true);
    try {
      await api.post(`/admin/orders/${order.id}/mark-paid`, { payment_reference: ref });
      toast.success("Order marked as paid!");
      fetchOrders();
      if (selected?.id === order.id) setSelected(o => ({ ...o, payment_status: "paid" }));
    } catch (e) {
      toast.error(e.response?.data?.message ?? "Failed to mark as paid");
    } finally { setMarkingPaid(false); }
  };

  const handleDownloadInvoice = async (order) => {
    try{
      const token=getToken();
      const res=await fetch(`${process.env.REACT_APP_API_URL||"http://localhost:8000/api/v1"}/admin/orders/${order.id}/invoice`,{headers:{Authorization:`Bearer ${token}`}});
      if(!res.ok) throw new Error("Failed");
      const blob=await res.blob(); const url=window.URL.createObjectURL(blob);
      const link=document.createElement("a"); link.href=url; link.download=`Invoice-${order.order_number}.pdf`;
      document.body.appendChild(link); link.click(); link.remove(); window.URL.revokeObjectURL(url);
    }catch{toast.error("Invoice download failed");}
  };

  // Orders are filtered server-side; use orders directly
  const filtered = orders;

  return (
    <div className="space-y-6">
      <div><p className="text-[11px] font-bold tracking-[0.15em] uppercase text-muted mb-1">Management</p><h1 className="text-[28px] font-bold tracking-[-0.8px] text-ink">Orders</h1></div>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">{["all",...STATUS_OPTIONS].map(s=>(<button key={s} onClick={()=>setFilter(s)} className={`px-4 py-1.5 rounded-full text-[12px] font-semibold capitalize transition-all ${filter===s?"bg-teal text-white":"bg-white text-muted border border-rule hover:border-teal"}`}>{s}</button>))}</div>
        <input type="text" placeholder="Search order # or customer..." value={search} onChange={e=>setSearch(e.target.value)} className="h-9 px-4 rounded-xl border border-rule bg-white text-[13px] outline-none focus:border-teal transition-all w-56"/>
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl2 shadow-card overflow-hidden">
          {loading?<div className="p-10 text-center"><div className="w-8 h-8 border-2 border-teal border-t-transparent rounded-full animate-spin mx-auto"/></div>
          :filtered.length===0?<div className="p-10 text-center text-muted">No orders found</div>:(
            <table className="w-full text-[13px]">
              <thead><tr className="border-b border-rule bg-soft">{["Order","Customer","Total","Status","Date"].map(h=>(<th key={h} className="text-left px-4 py-3 text-[11px] font-bold tracking-wider uppercase text-muted">{h}</th>))}</tr></thead>
              <tbody>{filtered.map(o=>(<tr key={o.id} onClick={()=>setSelected(o)} className={`border-b border-rule last:border-0 cursor-pointer transition-colors ${selected?.id===o.id?"bg-teal-light":"hover:bg-soft"}`}><td className="px-4 py-3 font-bold text-ink">{o.order_number}</td><td className="px-4 py-3 text-muted">{o.user?.first_name} {o.user?.last_name}</td><td className="px-4 py-3 font-semibold text-ink">{formatPrice(o.total_tzs)}</td><td className="px-4 py-3"><span className={`text-[11px] font-bold uppercase tracking-wide px-2 py-1 rounded-full ${STATUS_COLORS[o.status]??"bg-gray-100 text-gray-600"}`}>{o.status}</span></td><td className="px-4 py-3 text-muted">{new Date(o.created_at).toLocaleDateString("en-TZ")}</td></tr>))}</tbody>
            </table>
          )}
        </div>
        {selected?(
          <div className="bg-white rounded-xl2 shadow-card p-5 space-y-4 h-fit">
            <h3 className="font-bold text-[16px] text-ink">{selected.order_number}</h3>
            <div><p className="text-[11px] font-bold uppercase tracking-wider text-muted mb-1">Customer</p><p className="text-[14px] font-medium text-ink">{selected.user?.first_name} {selected.user?.last_name}</p><p className="text-[12px] text-muted">{selected.user?.email}</p></div>
            <div><p className="text-[11px] font-bold uppercase tracking-wider text-muted mb-1">Delivery</p><p className="text-[13px] text-ink capitalize">{selected.delivery_type?.replace("_"," ")}</p>{selected.delivery_address?.address&&<p className="text-[12px] text-muted">{selected.delivery_address.name}<br/>{selected.delivery_address.phone}<br/>{selected.delivery_address.address}, {selected.delivery_address.city}</p>}</div>
            <div><p className="text-[11px] font-bold uppercase tracking-wider text-muted mb-1">Payment</p><p className="text-[13px] text-ink capitalize">{selected.payment_method}</p><span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-full ${selected.payment_status==="paid"?"bg-green-100 text-green-700":"bg-yellow-100 text-yellow-700"}`}>{selected.payment_status}</span></div>
            <div className="border-t border-rule pt-3 space-y-1.5 text-[13px]">
              <div className="flex justify-between text-muted"><span>Subtotal</span><span>{formatPrice(selected.subtotal_tzs)}</span></div>
              {selected.discount_tzs>0&&<div className="flex justify-between text-green-600"><span>Discount</span><span>−{formatPrice(selected.discount_tzs)}</span></div>}
              <div className="flex justify-between font-bold text-[15px] text-ink border-t border-rule pt-2"><span>Total</span><span>{formatPrice(selected.total_tzs)}</span></div>
            </div>
            {/* Delivery confirmation info */}
            {selected.delivered_at&&<div className="bg-green-50 border border-green-200 rounded-xl p-3"><p className="text-[12px] font-semibold text-green-700">✓ Delivered {new Date(selected.delivered_at).toLocaleDateString("en-TZ")}</p><p className="text-[11px] text-green-600">Confirmed by: {selected.delivery_confirmed_by}</p></div>}
            <div className="border border-rule rounded-xl overflow-hidden">
              <div className="px-4 py-3 bg-soft border-b border-rule"><p className="text-[11px] font-bold uppercase tracking-wider text-muted">Update Status</p></div>
              <div className="p-4 space-y-3">
                <select value={selected.status} onChange={e=>updateStatus(selected.id,e.target.value)} disabled={updating} className="w-full h-[44px] px-3 rounded-xl border border-rule bg-card text-[13px] outline-none focus:border-teal transition-all disabled:opacity-60">
                  {STATUS_OPTIONS.map(s=>(<option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase()+s.slice(1)}</option>))}
                </select>
                {selected.payment_status !== "paid" && (
                  <button
                    onClick={() => {
                      const ref = window.prompt("Enter payment reference (optional):") ?? "";
                      handleMarkPaid(selected, ref);
                    }}
                    disabled={markingPaid}
                    className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white rounded-pill py-2.5 font-semibold text-[13px] hover:bg-blue-600 transition-colors disabled:opacity-60"
                  >
                    💰 Mark as Paid
                  </button>
                )}
                {selected.status!=="delivered"&&selected.status!=="cancelled"&&(
                  <button onClick={()=>setConfirming(true)} className="w-full flex items-center justify-center gap-2 bg-green-500 text-white rounded-pill py-3 font-bold text-[14px] hover:bg-green-600 transition-colors"><Truck size={16}/>Mark as Delivered</button>
                )}
                {selected.status==="delivered"&&<div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center"><CheckCircle size={20} className="text-green-500 mx-auto mb-1"/><p className="text-[13px] font-semibold text-green-700">Order Delivered</p><p className="text-[11px] text-green-600">Customer invoice is unlocked</p></div>}
              </div>
            </div>
            <button onClick={()=>handleDownloadInvoice(selected)} className="w-full flex items-center justify-center gap-2 bg-ink text-white rounded-pill py-2.5 font-semibold text-[13px] hover:opacity-80 transition-opacity"><Download size={15}/>Download Invoice PDF</button>
            <p className="text-[11px] text-muted text-center">{selected.status==="delivered"?"✓ Customer can download their invoice":"⚠ Invoice locked for customer until delivery"}</p>
          </div>
        ):<div className="bg-white rounded-xl2 shadow-card p-8 text-center text-muted h-fit"><p className="text-[13px]">Click an order to view details</p></div>}
      </div>
      {confirming&&selected&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={()=>setConfirming(false)}/>
          <div className="relative bg-white rounded-xl2 shadow-xl w-full max-w-sm p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle size={32} className="text-green-500"/></div>
            <h3 className="font-bold text-[20px] text-ink mb-2">Confirm Delivery</h3>
            <p className="text-muted text-[14px] mb-2">Mark order <strong>{selected.order_number}</strong> as delivered?</p>
            <div className="bg-soft rounded-xl p-3 mb-6 text-[13px] text-muted space-y-1 text-left">
              <p>✓ Order status → <strong>Delivered</strong></p>
              <p>✓ Customer email notification sent</p>
              <p>✓ Invoice unlocked for customer download</p>
            </div>
            <div className="flex gap-3">
              <button onClick={()=>setConfirming(false)} className="flex-1 h-11 rounded-pill border border-rule text-[13px] font-semibold text-muted hover:border-teal transition-all">Cancel</button>
              <button onClick={()=>applyStatusUpdate(selected.id,"delivered")} disabled={updating} className="flex-1 h-11 rounded-pill bg-green-500 text-white text-[13px] font-semibold hover:bg-green-600 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                {updating?<span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>:<><CheckCircle size={15}/>Confirm Delivery</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
