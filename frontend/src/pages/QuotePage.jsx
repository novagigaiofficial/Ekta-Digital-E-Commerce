import React, { useState } from "react";
import { Plus, Trash2, CheckCircle } from "lucide-react";
import api from "../lib/api";
import Button from "../components/ui/Button";
import toast from "react-hot-toast";

export default function QuotePage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ company_name:"",contact_name:"",phone:"",email:"",preferred_payment_method:"",notes:"" });
  const [products, setProducts] = useState([{name:"",qty:1}]);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try { await api.post("/quotes",{...form,products_requested:products}); setSubmitted(true); }
    catch (err) { const errors=err.response?.data?.errors; if(errors){Object.values(errors).flat().forEach(e=>toast.error(e));}else{toast.error("Submission failed. Please try again.");} }
    finally { setLoading(false); }
  };

  if(submitted) return (
    <div className="min-h-screen flex items-center justify-center bg-soft px-6">
      <div className="bg-white rounded-xl2 shadow-card p-10 max-w-md w-full text-center">
        <CheckCircle size={56} className="text-green-500 mx-auto mb-4"/>
        <h2 className="text-[28px] font-bold text-ink mb-2">Quote Submitted!</h2>
        <p className="text-muted text-[15px] mb-6">We'll contact you on WhatsApp within 24 hours with a custom quote.</p>
        <a href="https://wa.me/255783394445" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-pill font-semibold text-[15px] hover:opacity-90 transition-opacity">💬 Chat on WhatsApp</a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-soft py-16">
      <div className="max-w-[1100px] mx-auto px-6">
        <div className="text-center mb-12"><p className="text-[11px] font-bold tracking-[0.15em] uppercase text-teal mb-2">For Businesses</p><h1 className="text-[48px] font-bold tracking-[-1.5px] text-ink mb-4">Request a Quote</h1><p className="text-muted text-[17px] max-w-xl mx-auto">Get exclusive B2B pricing. Fill in the form and we'll respond on WhatsApp within 24 hours.</p></div>
        <div className="grid md:grid-cols-3 gap-10">
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl2 shadow-card p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {[{key:"company_name",label:"Company Name"},{key:"contact_name",label:"Contact Person"},{key:"phone",label:"Phone Number"},{key:"email",label:"Email Address"}].map(f=>(
                  <div key={f.key} className="relative">
                    <input type={f.key==="email"?"email":"text"} placeholder=" " value={form[f.key]} onChange={e=>set(f.key,e.target.value)} required className="peer w-full h-[52px] px-4 pt-4 rounded-xl border border-rule bg-card text-[14px] outline-none focus:border-teal focus:border-2 transition-all"/>
                    <label className="absolute left-4 top-1.5 text-[11px] font-medium text-muted peer-placeholder-shown:top-4 peer-placeholder-shown:text-[14px] peer-focus:top-1.5 peer-focus:text-[11px] transition-all pointer-events-none">{f.label}</label>
                  </div>
                ))}
              </div>
              <div>
                <h3 className="font-bold text-[16px] text-ink mb-3">Products Required</h3>
                {products.map((p,i)=>(
                  <div key={i} className="flex gap-3 items-center mb-3">
                    <input type="text" placeholder="Product name" value={p.name} onChange={e=>setProducts(prev=>prev.map((item,idx)=>idx===i?{...item,name:e.target.value}:item))} required className="flex-1 h-[48px] px-4 rounded-xl border border-rule bg-card text-[14px] outline-none focus:border-teal focus:border-2 transition-all"/>
                    <input type="number" placeholder="Qty" min="1" value={p.qty} onChange={e=>setProducts(prev=>prev.map((item,idx)=>idx===i?{...item,qty:parseInt(e.target.value)||1}:item))} className="w-20 h-[48px] px-3 rounded-xl border border-rule bg-card text-[14px] text-center outline-none focus:border-teal focus:border-2 transition-all"/>
                    {products.length>1&&<button type="button" onClick={()=>setProducts(prev=>prev.filter((_,idx)=>idx!==i))} className="text-muted hover:text-red-500 transition-colors"><Trash2 size={16}/></button>}
                  </div>
                ))}
                <button type="button" onClick={()=>setProducts(p=>[...p,{name:"",qty:1}])} className="flex items-center gap-2 text-teal text-[13px] font-semibold hover:gap-3 transition-all"><Plus size={16}/>Add another product</button>
              </div>
              <textarea placeholder="Additional notes..." value={form.notes} onChange={e=>set("notes",e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl border border-rule bg-card text-[14px] outline-none focus:border-teal focus:border-2 transition-all resize-none"/>
              <Button type="submit" className="w-full" loading={loading}>Submit Quote Request</Button>
            </form>
          </div>
          <div className="space-y-4">
            <div className="bg-ink rounded-xl2 p-6 text-white">
              <h3 className="font-bold text-[16px] mb-4">Why Ekta Digital for Business?</h3>
              <div className="space-y-4">
                {[{icon:"💰",title:"Exclusive Pricing",desc:"Verified B2B accounts get special wholesale rates."},{icon:"🧾",title:"Flexible Payment Terms",desc:"Pay on invoice or via bank transfer."},{icon:"👤",title:"Dedicated Support",desc:"Your own sales contact on WhatsApp."}].map(item=>(
                  <div key={item.title} className="flex gap-3"><span className="text-xl shrink-0">{item.icon}</span><div><p className="font-semibold text-[14px] text-white mb-0.5">{item.title}</p><p className="text-[12px] text-gray-400 leading-relaxed">{item.desc}</p></div></div>
                ))}
              </div>
            </div>
            <div className="bg-teal rounded-xl2 p-5 text-white text-center">
              <p className="text-[13px] text-white/70 mb-2">Prefer to call or WhatsApp directly?</p>
              <a href="https://wa.me/255783394445" target="_blank" rel="noreferrer" className="font-bold text-[16px] hover:underline">+255 783 394 445</a>
              <p className="text-[12px] text-white/60 mt-1">Mon–Sat · 8AM–6PM EAT</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
