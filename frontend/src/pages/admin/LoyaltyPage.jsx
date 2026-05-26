import React, { useEffect, useState } from "react";
import { Star, Search } from "lucide-react";
import api from "../../lib/api";
import { formatPrice } from "../../lib/utils";
import toast from "react-hot-toast";

export default function AdminLoyalty() {
  const [customers, setCustomers] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [selected,  setSelected]  = useState(null);
  const [adjust,    setAdjust]    = useState({ pts: 0, note: "" });
  const [saving,    setSaving]    = useState(false);

  const fetchCustomers = () => {
    setLoading(true);
    api.get("/admin/customers")
      .then((r) => setCustomers(r.data.data ?? []))
      .catch(e=>{console.error(e);toast.error('Failed to load customers');})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCustomers(); }, []);

  const filtered = customers.filter((c) =>
    `${c.first_name} ${c.last_name} ${c.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdjust = async () => {
    if (!selected || !adjust.pts || adjust.pts === 0) return;
    if (!adjust.note.trim()) { toast.error("Please enter a reason for the adjustment"); return; }
    setSaving(true);
    try {
      const res = await api.post("/admin/loyalty/adjust", {
        user_id: selected.id,
        points:  parseInt(adjust.pts),
        note:    adjust.note,
      });
      toast.success(`${adjust.pts > 0 ? "+" : ""}${adjust.pts} points applied to ${selected.first_name}`);
      // Update local state
      setCustomers((prev) =>
        prev.map((c) => c.id === selected.id ? { ...c, loyalty_points_balance: res.data.new_balance } : c)
      );
      setSelected(null);
      setAdjust({ pts: 0, note: "" });
    } catch (e) {
      toast.error(e.response?.data?.message ?? "Adjustment failed");
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-muted mb-1">Rewards</p>
        <h1 className="text-[28px] font-bold tracking-[-0.8px] text-ink">Loyalty Points</h1>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Points Balance", value: customers.reduce((s,c)=>s+c.loyalty_points_balance,0).toLocaleString(), color: "text-teal" },
          { label: "Total Redeemable Value", value: formatPrice(customers.reduce((s,c)=>s+c.loyalty_points_balance*5,0)), color: "text-green-600" },
          { label: "Customers with Points", value: customers.filter((c)=>c.loyalty_points_balance>0).length, color: "text-ink" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl2 p-5 shadow-card">
            <p className={`text-[26px] font-bold tracking-[-0.8px] ${s.color}`}>{s.value}</p>
            <p className="text-[12px] text-muted mt-1">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input type="text" placeholder="Search customers..." value={search} onChange={(e)=>setSearch(e.target.value)} className="w-full h-10 pl-9 pr-4 rounded-xl border border-rule bg-white text-[13px] outline-none focus:border-teal transition-all"/>
          </div>
          <div className="bg-white rounded-xl2 shadow-card overflow-hidden">
            {loading ? <div className="p-10 text-center text-muted">Loading...</div> : (
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-rule bg-soft">
                    {["Customer","Email","Points","Value","Action"].map((h)=>(
                      <th key={h} className="text-left px-4 py-3 text-[11px] font-bold tracking-wider uppercase text-muted">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id} className="border-b border-rule last:border-0 hover:bg-soft transition-colors">
                      <td className="px-4 py-3 font-semibold text-ink">{c.first_name} {c.last_name}</td>
                      <td className="px-4 py-3 text-muted">{c.email}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 font-bold text-teal">
                          <Star size={12} className="fill-yellow-400 text-yellow-400"/>{c.loyalty_points_balance}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-green-600 font-semibold">{formatPrice(c.loyalty_points_balance*5)}</td>
                      <td className="px-4 py-3">
                        <button onClick={()=>{setSelected(c);setAdjust({pts:0,note:""});}} className="text-teal text-[12px] font-semibold hover:underline">Adjust</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        <div className="bg-white rounded-xl2 shadow-card p-6 h-fit">
          <h3 className="font-bold text-[16px] text-ink mb-4">Manual Adjustment</h3>
          {selected ? (
            <div className="space-y-4">
              <div className="bg-teal-light rounded-xl p-4">
                <p className="font-bold text-ink text-[14px]">{selected.first_name} {selected.last_name}</p>
                <p className="text-muted text-[12px]">{selected.email}</p>
                <p className="text-teal font-bold text-[18px] mt-2">{selected.loyalty_points_balance} pts</p>
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">Points to Add / Remove</label>
                <input type="number" placeholder="e.g. 100 or -50" value={adjust.pts} onChange={(e)=>setAdjust((a)=>({...a,pts:e.target.value}))} className="w-full h-[48px] px-4 rounded-xl border border-rule bg-card text-[14px] outline-none focus:border-teal transition-all"/>
                <p className="text-[11px] text-muted mt-1">Use negative number to deduct</p>
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">Reason / Note *</label>
                <input type="text" placeholder="e.g. Goodwill adjustment" value={adjust.note} onChange={(e)=>setAdjust((a)=>({...a,note:e.target.value}))} className="w-full h-[48px] px-4 rounded-xl border border-rule bg-card text-[14px] outline-none focus:border-teal transition-all"/>
              </div>
              <div className="flex gap-3">
                <button onClick={()=>setSelected(null)} className="flex-1 h-10 rounded-pill border border-rule text-[13px] font-semibold text-muted hover:border-teal transition-all">Cancel</button>
                <button onClick={handleAdjust} disabled={saving || !adjust.pts || !adjust.note} className="flex-1 h-10 rounded-pill bg-teal text-white text-[13px] font-semibold hover:bg-teal-dark transition-all disabled:opacity-50">
                  {saving ? "Saving..." : "Apply"}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted">
              <Star size={32} className="mx-auto mb-3 text-rule"/>
              <p className="text-[13px]">Select a customer to adjust their points</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
