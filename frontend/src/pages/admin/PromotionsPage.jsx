import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import api from "../../lib/api";
import Button from "../../components/ui/Button";
import { formatPrice } from "../../lib/utils";
import toast from "react-hot-toast";

const EMPTY = {name:"",type:"percentage",discount_code:"",discount_value:"",applies_to:"all",start_date:"",end_date:"",is_active:true};

export default function AdminPromotions() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  useEffect(()=>{fetchPromos();},[]);

  const fetchPromos = async () => {
    setLoading(true);
    try{const res=await api.get("/admin/promotions");setPromos(res.data.data??[]);}
    catch(e){console.error(e);}finally{setLoading(false);}
  };

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (p) => {
    setEditing(p.id);
    setForm({name:p.name,type:p.type,discount_code:p.discount_code??"",discount_value:p.discount_value,applies_to:p.applies_to,start_date:p.start_date?.slice(0,16)??"",end_date:p.end_date?.slice(0,16)??"",is_active:p.is_active});
    setModal(true);
  };
  const handleSave = async () => {
    if(!form.name||!form.discount_value){toast.error("Name and discount value are required");return;}
    setSaving(true);
    try{
      if(editing){await api.put(`/admin/promotions/${editing}`,form);toast.success("Promotion updated");}
      else{await api.post("/admin/promotions",form);toast.success("Promotion created");}
      setModal(false); fetchPromos();
    }catch(e){const errs=e.response?.data?.errors;if(errs){Object.values(errs).flat().forEach(m=>toast.error(m));}else{toast.error("Save failed");}}
    finally{setSaving(false);}
  };
  const handleDelete = async (id,name) => {
    // Deletion proceeds immediately; can be restored by creating a new promo
    try{await api.delete(`/admin/promotions/${id}`);toast.success("Deleted");fetchPromos();}catch{toast.error("Delete failed");}
  };
  const handleToggle = async (promo) => {
    try{await api.put(`/admin/promotions/${promo.id}`, { is_active: !promo.is_active });fetchPromos();}catch{toast.error("Failed");}
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><p className="text-[11px] font-bold tracking-[0.15em] uppercase text-muted mb-1">Marketing</p><h1 className="text-[28px] font-bold tracking-[-0.8px] text-ink">Promotions</h1></div><Button onClick={openAdd}><Plus size={16}/>New Campaign</Button></div>
      <div className="bg-white rounded-xl2 shadow-card overflow-hidden">
        {loading?<div className="p-10 text-center text-muted">Loading...</div>:promos.length===0?<div className="p-10 text-center"><p className="text-muted mb-4">No promotions yet.</p><Button onClick={openAdd}>Create Your First Campaign</Button></div>:(
          <table className="w-full text-[13px]">
            <thead><tr className="border-b border-rule bg-soft">{["Campaign","Type","Discount","Code","Applies To","Status","Actions"].map(h=>(<th key={h} className="text-left px-4 py-3 text-[11px] font-bold tracking-wider uppercase text-muted">{h}</th>))}</tr></thead>
            <tbody>{promos.map(p=>(<tr key={p.id} className="border-b border-rule last:border-0 hover:bg-soft transition-colors"><td className="px-4 py-3 font-semibold text-ink">{p.name}</td><td className="px-4 py-3"><span className="text-[11px] font-bold uppercase tracking-wide bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{p.type}</span></td><td className="px-4 py-3 font-semibold text-ink">{p.type==="percentage"?`${p.discount_value}%`:formatPrice(p.discount_value)}</td><td className="px-4 py-3 text-muted font-mono">{p.discount_code??"—"}</td><td className="px-4 py-3 text-muted capitalize">{p.applies_to}</td><td className="px-4 py-3"><button onClick={()=>handleToggle(p)} className={`text-[11px] font-bold uppercase tracking-wide px-2 py-1 rounded-full transition-all ${p.is_active?"bg-green-100 text-green-700":"bg-gray-100 text-gray-500"}`}>{p.is_active?"Active":"Inactive"}</button></td><td className="px-4 py-3"><div className="flex gap-2"><button onClick={()=>openEdit(p)} className="text-muted hover:text-teal transition-colors"><Pencil size={14}/></button><button onClick={()=>handleDelete(p.id,p.name)} className="text-muted hover:text-red-500 transition-colors"><Trash2 size={14}/></button></div></td></tr>))}</tbody>
          </table>
        )}
      </div>
      {modal&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={()=>setModal(false)}/>
          <div className="relative bg-white rounded-xl2 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-rule sticky top-0 bg-white"><h2 className="font-bold text-[18px] text-ink">{editing?"Edit Campaign":"New Campaign"}</h2><button onClick={()=>setModal(false)} className="text-muted hover:text-ink"><X size={20}/></button></div>
            <div className="p-6 space-y-4">
              <div className="relative"><input type="text" placeholder=" " value={form.name} onChange={e=>set("name",e.target.value)} className="peer w-full h-[52px] px-4 pt-4 rounded-xl border border-rule bg-card text-[14px] outline-none focus:border-teal focus:border-2 transition-all"/><label className="absolute left-4 top-1.5 text-[11px] font-medium text-muted peer-placeholder-shown:top-4 peer-placeholder-shown:text-[14px] peer-focus:top-1.5 peer-focus:text-[11px] transition-all pointer-events-none">Campaign Name *</label></div>
              <div><label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-2">Discount Type</label><div className="flex gap-2">{[{val:"percentage",label:"Percentage %"},{val:"fixed",label:"Fixed TZS"},{val:"code",label:"Promo Code"}].map(t=>(<button key={t.val} onClick={()=>set("type",t.val)} className={`flex-1 py-2 rounded-xl text-[13px] font-semibold border transition-all ${form.type===t.val?"bg-teal text-white border-teal":"border-rule text-ink hover:border-teal"}`}>{t.label}</button>))}</div></div>
              <div className="relative"><input type="number" placeholder=" " value={form.discount_value} onChange={e=>set("discount_value",e.target.value)} className="peer w-full h-[52px] px-4 pt-4 rounded-xl border border-rule bg-card text-[14px] outline-none focus:border-teal focus:border-2 transition-all"/><label className="absolute left-4 top-1.5 text-[11px] font-medium text-muted peer-placeholder-shown:top-4 peer-placeholder-shown:text-[14px] peer-focus:top-1.5 peer-focus:text-[11px] transition-all pointer-events-none">Discount Value * {form.type==="percentage"?"(%)":"(TZS)"}</label></div>
              {form.type==="code"&&<div className="relative"><input type="text" placeholder=" " value={form.discount_code} onChange={e=>set("discount_code",e.target.value.toUpperCase())} className="peer w-full h-[52px] px-4 pt-4 rounded-xl border border-rule bg-card text-[14px] outline-none focus:border-teal focus:border-2 transition-all font-mono tracking-widest uppercase"/><label className="absolute left-4 top-1.5 text-[11px] font-medium text-muted peer-placeholder-shown:top-4 peer-placeholder-shown:text-[14px] peer-focus:top-1.5 peer-focus:text-[11px] transition-all pointer-events-none">Promo Code (e.g. SAVE20)</label></div>}
              <div><label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-2">Applies To</label><select value={form.applies_to} onChange={e=>set("applies_to",e.target.value)} className="w-full h-[48px] px-3 rounded-xl border border-rule bg-card text-[14px] outline-none focus:border-teal transition-all"><option value="all">All Products</option><option value="category">Specific Category</option><option value="product">Specific Product</option></select></div>
              <div className="grid grid-cols-2 gap-4">{[{key:"start_date",label:"Start Date"},{key:"end_date",label:"End Date"}].map(f=>(<div key={f.key}><label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">{f.label}</label><input type="datetime-local" value={form[f.key]} onChange={e=>set(f.key,e.target.value)} className="w-full h-[48px] px-3 rounded-xl border border-rule bg-card text-[13px] outline-none focus:border-teal transition-all"/></div>))}</div>
              <label className="flex items-center gap-3 cursor-pointer"><div onClick={()=>set("is_active",!form.is_active)} className={`w-10 h-6 rounded-full transition-all duration-200 flex items-center px-0.5 ${form.is_active?"bg-teal justify-end":"bg-rule justify-start"}`}><div className="w-5 h-5 bg-white rounded-full shadow-sm"/></div><span className="text-[14px] font-medium text-ink">{form.is_active?"Active — live on store":"Inactive — hidden"}</span></label>
            </div>
            <div className="px-6 py-4 border-t border-rule flex justify-end gap-3 sticky bottom-0 bg-white"><Button variant="secondary" onClick={()=>setModal(false)}>Cancel</Button><Button loading={saving} onClick={handleSave}><Check size={16}/>{editing?"Save Changes":"Create Campaign"}</Button></div>
          </div>
        </div>
      )}
    </div>
  );
}
