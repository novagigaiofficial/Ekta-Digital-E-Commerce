import React, { useEffect, useState } from "react";
import { Check } from "lucide-react";
import api from "../../lib/api";
import Button from "../../components/ui/Button";
import toast from "react-hot-toast";

const FIELDS = [
  {key:"business_name",label:"Business Name",type:"text"},
  {key:"business_address",label:"Business Address",type:"textarea"},
  {key:"business_phone",label:"Phone Number(s)",type:"text"},
  {key:"business_email",label:"Email Address",type:"email"},
  {key:"business_website",label:"Website",type:"text"},
  {key:"bank_details",label:"Bank Details",type:"textarea"},
  {key:"footer_note",label:"Footer Note",type:"textarea"},
  {key:"primary_color",label:"Brand Colour",type:"color"},
];

export default function InvoiceTemplatePage() {
  const [template,setTemplate]=useState({business_name:"Ekta Digital",business_address:"Haidary Plaza, India Street, Dar-es-Salaam, Tanzania",business_phone:"+255 783 394 445 / +255 747 717 000",business_email:"EktaDigital@outlook.com",business_website:"www.ektadigital.co.tz",bank_details:"Bank: CRDB Bank\nAccount Name: Ekta Digital Ltd\nAccount No: [Your Account Number]",footer_note:"Thank you for shopping with Ekta Digital. Digitalise Your Lifestyle.",primary_color:"#008080",business_logo:""});
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [logoUploading,setLogoUploading]=useState(false);

  useEffect(()=>{api.get("/admin/invoice-template").then(r=>setTemplate(r.data)).catch(()=>{}).finally(()=>setLoading(false));},[]);

  const set=(k,v)=>setTemplate(t=>({...t,[k]:v}));

  const handleSave=async()=>{
    setSaving(true);
    try{await api.put("/admin/invoice-template",template);toast.success("Invoice template saved!");}
    catch{toast.error("Failed to save template");}finally{setSaving(false);}
  };

  const handleLogoUpload=async(e)=>{
    const file=e.target.files?.[0];if(!file) return;
    setLogoUploading(true);
    try{
      const fd=new FormData();fd.append("image",file);fd.append("folder","ekta-digital/branding");
      const res=await api.post("/admin/upload/image",fd,{headers:{"Content-Type":"multipart/form-data"}});
      set("business_logo",res.data.url);toast.success("Logo uploaded!");
    }catch{toast.error("Logo upload failed");}finally{setLogoUploading(false);}
  };

  if(loading) return <div className="p-10 text-center text-muted">Loading...</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between"><div><p className="text-[11px] font-bold tracking-[0.15em] uppercase text-muted mb-1">Admin</p><h1 className="text-[28px] font-bold tracking-[-0.8px] text-ink">Invoice Template</h1><p className="text-muted text-[13px] mt-1">Customise your invoice. Changes apply to all future invoice downloads.</p></div><Button loading={saving} onClick={handleSave}><Check size={15}/>Save Template</Button></div>
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-5">
          <div className="bg-white rounded-xl2 shadow-card p-6">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted mb-3">Business Logo</p>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-card rounded-xl border border-rule flex items-center justify-center overflow-hidden">{template.business_logo?<img src={template.business_logo} alt="Logo" className="w-full h-full object-contain p-2"/>:<span className="text-[10px] text-muted text-center px-2">No logo</span>}</div>
              <div>
                <label className="cursor-pointer"><span className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-rule rounded-xl text-[13px] font-semibold text-ink hover:border-teal transition-all">{logoUploading?"Uploading...":"Upload Logo"}</span><input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={logoUploading}/></label>
                <p className="text-[11px] text-muted mt-1">PNG or SVG recommended. Max 2MB.</p>
                {template.business_logo&&<button onClick={()=>set("business_logo","")} className="text-[11px] text-red-500 hover:underline mt-1">Remove logo</button>}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl2 shadow-card p-6 space-y-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted mb-2">Business Details</p>
            {FIELDS.map(f=>(
              <div key={f.key}>
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">{f.label}</label>
                {f.type==="textarea"?<textarea value={template[f.key]??""} onChange={e=>set(f.key,e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl border border-rule bg-card text-[13px] outline-none focus:border-teal focus:border-2 transition-all resize-none"/>
                :f.type==="color"?<div className="flex items-center gap-3"><input type="color" value={template[f.key]??""} onChange={e=>set(f.key,e.target.value)} className="w-12 h-10 rounded-lg border border-rule cursor-pointer"/><input type="text" value={template[f.key]??""} onChange={e=>set(f.key,e.target.value)} className="flex-1 h-10 px-3 rounded-xl border border-rule bg-card text-[13px] outline-none focus:border-teal transition-all font-mono" placeholder="#008080"/></div>
                :<input type={f.type} value={template[f.key]??""} onChange={e=>set(f.key,e.target.value)} className="w-full h-[48px] px-4 rounded-xl border border-rule bg-card text-[13px] outline-none focus:border-teal focus:border-2 transition-all"/>}
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="sticky top-20">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted mb-3">Preview</p>
            <div className="bg-white rounded-xl2 shadow-card overflow-hidden border border-rule">
              <div className="p-5 space-y-4">
                <div className="flex justify-between items-start pb-3 border-b-2" style={{borderColor:template.primary_color}}>
                  <div>{template.business_logo?<img src={template.business_logo} alt="" className="h-8 object-contain"/>:<p className="font-bold text-[16px]" style={{color:template.primary_color}}>{template.business_name}</p>}<p className="text-[9px] text-muted tracking-widest uppercase mt-0.5">Digitalise Your Lifestyle</p></div>
                  <div className="text-right text-[9px] text-muted leading-relaxed"><p className="font-semibold text-ink">{template.business_name}</p><p>{template.business_phone}</p><p>{template.business_email}</p></div>
                </div>
                <div className="flex justify-between items-start"><div><p className="text-[18px] font-bold text-ink">Invoice</p><p className="text-[10px] text-muted">EKT-PREVIEW-001</p></div><div className="text-right text-[9px]"><p className="text-muted">Date: {new Date().toLocaleDateString("en-TZ")}</p><span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold" style={{background:template.primary_color+"20",color:template.primary_color}}>PAID</span></div></div>
                <table className="w-full text-[9px]"><thead><tr style={{background:template.primary_color}}><th className="text-left px-2 py-1.5 text-white font-bold">Product</th><th className="text-right px-2 py-1.5 text-white font-bold">Qty</th><th className="text-right px-2 py-1.5 text-white font-bold">Total</th></tr></thead><tbody>{[["HP LaserJet Pro",1,"650,000"],["Dell Monitor 24\"",2,"760,000"]].map(([name,qty,price])=>(<tr key={name} className="border-b border-rule"><td className="px-2 py-1.5 font-medium">{name}</td><td className="px-2 py-1.5 text-right text-muted">{qty}</td><td className="px-2 py-1.5 text-right font-semibold">TZS {price}</td></tr>))}</tbody></table>
                <div className="flex justify-end"><div className="text-[9px] w-36"><div className="flex justify-between py-1 border-b border-rule"><span className="text-muted">Subtotal</span><span>TZS 1,410,000</span></div><div className="flex justify-between py-1.5 rounded-lg font-bold text-[10px]" style={{background:template.primary_color,color:"white",padding:"4px 6px",marginTop:"2px"}}><span>Total</span><span>TZS 1,410,000</span></div></div></div>
                <div className="border-t-2 pt-2 text-center text-[8px] text-muted" style={{borderColor:template.primary_color}}>{template.footer_note}</div>
              </div>
            </div>
            <p className="text-[11px] text-muted mt-3 text-center">This is a preview. Actual invoices are generated as PDF.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
