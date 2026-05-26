import React, { useEffect, useState } from "react";
import api from "../../lib/api";
import toast from "react-hot-toast";

const STATUS_COLORS = {new:"bg-yellow-100 text-yellow-700",in_progress:"bg-blue-100 text-blue-700",quoted:"bg-purple-100 text-purple-700",won:"bg-green-100 text-green-700",lost:"bg-red-100 text-red-500"};

export default function AdminQuotes() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(()=>{fetchQuotes();},[]);

  const fetchQuotes = async () => {
    setLoading(true);
    try{const res=await api.get("/admin/quotes");setQuotes(res.data.data??[]);}
    catch(e){console.error(e);toast.error("Failed to load quotes");}finally{setLoading(false);}
  };

  const updateStatus = async (id,status) => {
    try{await api.put(`/admin/quotes/${id}`,{status});toast.success("Status updated");fetchQuotes();setSelected(q=>q?{...q,status}:q);}
    catch{toast.error("Update failed");}
  };

  const openWhatsApp = (quote) => {
    const products=(quote.products_requested??[]).map(p=>`• ${p.name} x${p.qty}`).join("%0A");
    const msg=`*Quote Request — Ekta Digital*%0A%0A*Company:* ${quote.company_name}%0A*Contact:* ${quote.contact_name}%0A*Phone:* ${quote.phone}%0A%0A*Products:*%0A${products}`;
    window.open(`https://wa.me/${quote.phone.replace(/\D/g,"")}?text=${msg}`,"_blank");
  };

  return (
    <div className="space-y-6">
      <div><p className="text-[11px] font-bold tracking-[0.15em] uppercase text-muted mb-1">B2B</p><h1 className="text-[28px] font-bold tracking-[-0.8px] text-ink">Quote Requests</h1></div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl2 shadow-card overflow-hidden">
          {loading?<div className="p-10 text-center text-muted">Loading...</div>:quotes.length===0?<div className="p-10 text-center text-muted">No quote requests yet</div>:(
            <table className="w-full text-[13px]">
              <thead><tr className="border-b border-rule bg-soft">{["Company","Contact","Products","Status","Date"].map(h=>(<th key={h} className="text-left px-4 py-3 text-[11px] font-bold tracking-wider uppercase text-muted">{h}</th>))}</tr></thead>
              <tbody>{quotes.map(q=>(<tr key={q.id} onClick={()=>setSelected(q)} className={`border-b border-rule last:border-0 cursor-pointer transition-colors ${selected?.id===q.id?"bg-teal-light":"hover:bg-soft"}`}><td className="px-4 py-3 font-bold text-ink">{q.company_name}</td><td className="px-4 py-3 text-muted">{q.contact_name}</td><td className="px-4 py-3 text-muted">{q.products_requested?.length??0} item(s)</td><td className="px-4 py-3"><span className={`text-[11px] font-bold tracking-wide uppercase px-2 py-1 rounded-full ${STATUS_COLORS[q.status]??"bg-gray-100 text-gray-600"}`}>{q.status?.replace("_"," ")}</span></td><td className="px-4 py-3 text-muted">{new Date(q.created_at).toLocaleDateString("en-TZ")}</td></tr>))}</tbody>
            </table>
          )}
        </div>
        {selected?(
          <div className="bg-white rounded-xl2 shadow-card p-5 space-y-4 h-fit">
            <h3 className="font-bold text-[16px] text-ink">{selected.company_name}</h3>
            <div className="space-y-1 text-[13px]">{[{label:"Contact",value:selected.contact_name},{label:"Phone",value:selected.phone},{label:"Email",value:selected.email},{label:"Payment",value:selected.preferred_payment_method??"—"}].map(f=>(<div key={f.label} className="flex justify-between py-1.5 border-b border-rule last:border-0"><span className="text-muted">{f.label}</span><span className="font-medium text-ink">{f.value}</span></div>))}</div>
            <div><p className="text-[11px] font-bold uppercase tracking-wider text-muted mb-2">Products Requested</p><div className="space-y-2">{(selected.products_requested??[]).map((p,i)=>(<div key={i} className="flex justify-between text-[13px] bg-soft rounded-lg px-3 py-2"><span className="text-ink font-medium">{p.name}</span><span className="text-teal font-bold">x{p.qty}</span></div>))}</div></div>
            {selected.notes&&<div><p className="text-[11px] font-bold uppercase tracking-wider text-muted mb-1">Notes</p><p className="text-[13px] text-muted bg-soft rounded-lg p-3">{selected.notes}</p></div>}
            <div><p className="text-[11px] font-bold uppercase tracking-wider text-muted mb-2">Update Status</p><select value={selected.status} onChange={e=>updateStatus(selected.id,e.target.value)} className="w-full h-[44px] px-3 rounded-xl border border-rule bg-card text-[13px] outline-none focus:border-teal transition-all">{["new","in_progress","quoted","won","lost"].map(s=>(<option key={s} value={s} className="capitalize">{s.replace("_"," ")}</option>))}</select></div>
            <button onClick={()=>openWhatsApp(selected)} className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white rounded-pill py-3 font-semibold text-[14px] hover:opacity-90 transition-opacity">💬 Reply on WhatsApp</button>
          </div>
        ):<div className="bg-white rounded-xl2 shadow-card p-8 text-center text-muted h-fit"><p className="text-[13px]">Click a quote to view details</p></div>}
      </div>
    </div>
  );
}
