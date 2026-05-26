import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Check, Upload, Image, Video } from "lucide-react";
import api from "../../lib/api";
import Button from "../../components/ui/Button";
import { formatPrice } from "../../lib/utils";
import toast from "react-hot-toast";

const EMPTY = {name:"",category_id:"",brand:"",base_price_tzs:"",offer_price_tzs:"",short_description:"",description:"",video_url:"",is_featured:false,is_new_arrival:false,is_top_seller:false,status:"active",images:[]};

function FloatInput({label,type="text",value,onChange}){
  return(<div className="relative"><input type={type} placeholder=" " value={value} onChange={e=>onChange(e.target.value)} className="peer w-full h-[52px] px-4 pt-4 rounded-xl border border-rule bg-card text-[14px] outline-none focus:border-teal focus:border-2 transition-all"/><label className="absolute left-4 top-1.5 text-[11px] font-medium text-muted peer-placeholder-shown:top-4 peer-placeholder-shown:text-[14px] peer-focus:top-1.5 peer-focus:text-[11px] transition-all pointer-events-none">{label}</label></div>);
}

export default function AdminProducts() {
  const [products,setProducts]=useState([]);
  const [loading,setLoading]=useState(true);
  const [search,setSearch]=useState("");
  const [modal,setModal]=useState(false);
  const [editing,setEditing]=useState(null);
  const [categories,setCategories]=useState([]);
  const [saving,setSaving]=useState(false);
  const [imgUploading,setImgUploading]=useState(false);
  const [vidUploading,setVidUploading]=useState(false);
  const [form,setForm]=useState(EMPTY);
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));

  useEffect(()=>{fetchAll();api.get("/categories", { params: { admin: 1 } }).then(r=>setCategories(r.data));},[]);

  const fetchAll=async()=>{
    setLoading(true);
    try{const res=await api.get("/products", { params: { admin: 1, per_page: 50 } });setProducts(res.data.data??[]);}
    catch(e){console.error(e);}finally{setLoading(false);}
  };

  const openAdd=()=>{setEditing(null);setForm(EMPTY);setModal(true);};
  const openEdit=(p)=>{
    setEditing(p.id);
    setForm({name:p.name,category_id:p.category_id,brand:p.brand??"",base_price_tzs:p.base_price_tzs,offer_price_tzs:p.offer_price_tzs??"",short_description:p.short_description??"",description:p.description??"",video_url:p.video_url??"",is_featured:p.is_featured,is_new_arrival:p.is_new_arrival,is_top_seller:p.is_top_seller??false,status:p.status,images:p.images??[]});
    setModal(true);
  };

  const handleImageUpload=async(files)=>{
    if(!files?.length) return;
    setImgUploading(true);
    try{
      const fd=new FormData();
      Array.from(files).forEach(f=>fd.append("images[]",f));
      const res=await api.post("/admin/upload/images",fd,{headers:{"Content-Type":"multipart/form-data"}});
      const newUrls=(res.data.images??[]).filter(r=>!r.error).map(r=>r.url);
      set("images",[...(form.images??[]),...newUrls]);
      toast.success(`${newUrls.length} image(s) uploaded`);
    }catch{toast.error("Image upload failed");}finally{setImgUploading(false);}
  };

  const handleVideoUpload=async(file)=>{
    if(!file) return;
    setVidUploading(true);
    try{
      const fd=new FormData();fd.append("video",file);
      const res=await api.post("/admin/upload/video",fd,{headers:{"Content-Type":"multipart/form-data"}});
      set("video_url",res.data.url);toast.success("Video uploaded!");
    }catch{toast.error("Video upload failed");}finally{setVidUploading(false);}
  };

  const handleSave=async()=>{
    if(!form.name||!form.base_price_tzs){toast.error("Name and price are required");return;}
    setSaving(true);
    try{
      if(editing){await api.put(`/admin/products/${editing}`,form);toast.success("Product updated");}
      else{await api.post("/admin/products",form);toast.success("Product created");}
      setModal(false);fetchAll();
    }catch(e){const errs=e.response?.data?.errors;if(errs){Object.values(errs).flat().forEach(m=>toast.error(m));}else{toast.error("Save failed");}}
    finally{setSaving(false);}
  };

  const [deleteTarget, setDeleteTarget] = useState(null); // {id, name}
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/admin/products/${deleteTarget.id}`);
      toast.success("Product deleted");
      setDeleteTarget(null);
      fetchAll();
    } catch { toast.error("Delete failed"); }
  };

  const filtered=products.filter(p=>p.name.toLowerCase().includes(search.toLowerCase())||(p.brand??"").toLowerCase().includes(search.toLowerCase()));
  const discountPct=form.offer_price_tzs&&form.base_price_tzs?Math.round(((parseFloat(form.base_price_tzs)-parseFloat(form.offer_price_tzs))/parseFloat(form.base_price_tzs))*100):0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><p className="text-[11px] font-bold tracking-[0.15em] uppercase text-muted mb-1">Catalogue</p><h1 className="text-[28px] font-bold tracking-[-0.8px] text-ink">Products</h1></div><Button onClick={openAdd}><Plus size={16}/>Add Product</Button></div>
      <input type="text" placeholder="Search products..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full md:w-72 h-10 px-4 rounded-xl border border-rule bg-white text-[13px] outline-none focus:border-teal focus:border-2 transition-all"/>
      <div className="bg-white rounded-xl2 shadow-card overflow-hidden">
        {loading?<div className="p-10 text-center text-muted">Loading...</div>:(
          <table className="w-full text-[13px]">
            <thead><tr className="border-b border-rule bg-soft">{["Image","Product","Brand","Price","Offer","Status","Stock","Actions"].map(h=>(<th key={h} className="text-left px-4 py-3 text-[11px] font-bold tracking-wider uppercase text-muted">{h}</th>))}</tr></thead>
            <tbody>{filtered.map(p=>{
              const stock=p.variants?.reduce((s,v)=>s+(v.stock_quantity??0),0)??0;
              return(<tr key={p.id} className="border-b border-rule last:border-0 hover:bg-soft transition-colors">
                <td className="px-4 py-3"><div className="w-12 h-12 bg-card rounded-xl overflow-hidden flex items-center justify-center">{p.images?.[0]?<img src={p.images[0]} alt="" className="w-full h-full object-contain p-1"/>:<Image size={16} className="text-rule"/>}</div></td>
                <td className="px-4 py-3 font-semibold text-ink max-w-[160px]"><p className="truncate">{p.name}</p><p className="text-[10px] text-muted">{p.category?.name}</p></td>
                <td className="px-4 py-3 text-muted">{p.brand??"—"}</td>
                <td className="px-4 py-3 font-semibold text-ink">{formatPrice(p.base_price_tzs)}</td>
                <td className="px-4 py-3">{p.offer_price_tzs?<span className="text-red-500 font-semibold">{formatPrice(p.offer_price_tzs)}</span>:<span className="text-muted">—</span>}</td>
                <td className="px-4 py-3"><span className={`text-[11px] font-bold uppercase px-2 py-1 rounded-full ${p.status==="active"?"bg-green-100 text-green-700":"bg-gray-100 text-gray-500"}`}>{p.status}</span></td>
                <td className="px-4 py-3"><span className={`text-[12px] font-semibold ${stock===0?"text-red-500":stock<=5?"text-yellow-600":"text-green-600"}`}>{stock===0?"Out":`${stock} units`}</span></td>
                <td className="px-4 py-3"><div className="flex items-center gap-2"><button onClick={()=>openEdit(p)} className="text-muted hover:text-teal transition-colors"><Pencil size={15}/></button><button onClick={()=>setDeleteTarget({id:p.id,name:p.name})} className="text-muted hover:text-red-500 transition-colors"><Trash2 size={15}/></button></div></td>
              </tr>);
            })}</tbody>
          </table>
        )}
      </div>
      {modal&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={()=>setModal(false)}/>
          <div className="relative bg-white rounded-xl2 shadow-xl w-full max-w-3xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-rule sticky top-0 bg-white z-10"><h2 className="font-bold text-[18px] text-ink">{editing?"Edit Product":"Add New Product"}</h2><button onClick={()=>setModal(false)} className="text-muted hover:text-ink"><X size={20}/></button></div>
            <div className="p-6 grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <FloatInput label="Product Name *" value={form.name} onChange={v=>set("name",v)}/>
                <div><label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">Category *</label><select value={form.category_id} onChange={e=>set("category_id",e.target.value)} className="w-full h-[48px] px-3 rounded-xl border border-rule bg-card text-[14px] outline-none focus:border-teal transition-all"><option value="">Select category</option>{categories.map(c=>(<option key={c.id} value={c.id}>{c.name}</option>))}</select></div>
                <FloatInput label="Brand" value={form.brand} onChange={v=>set("brand",v)}/>
                <FloatInput label="Price (TZS — VAT inclusive) *" type="number" value={form.base_price_tzs} onChange={v=>set("base_price_tzs",v)}/>
                <div>
                  <FloatInput label="Offer / Sale Price (TZS, optional)" type="number" value={form.offer_price_tzs} onChange={v=>set("offer_price_tzs",v)}/>
                  {discountPct>0&&<p className="text-[12px] text-green-600 font-semibold mt-1">✓ {discountPct}% discount will be shown to customers</p>}
                </div>
                <div><label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">Short Description</label><textarea value={form.short_description} onChange={e=>set("short_description",e.target.value)} rows={2} className="w-full px-4 py-3 rounded-xl border border-rule bg-card text-[13px] outline-none focus:border-teal focus:border-2 transition-all resize-none" placeholder="One-line product summary..."/></div>
                <div><label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">Full Description</label><textarea value={form.description} onChange={e=>set("description",e.target.value)} rows={4} className="w-full px-4 py-3 rounded-xl border border-rule bg-card text-[13px] outline-none focus:border-teal focus:border-2 transition-all resize-none" placeholder="Full product description..."/></div>
                <div><label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-1">Status</label><select value={form.status} onChange={e=>set("status",e.target.value)} className="w-full h-[48px] px-3 rounded-xl border border-rule bg-card text-[14px] outline-none focus:border-teal transition-all"><option value="active">Active — visible</option><option value="draft">Draft — hidden</option><option value="archived">Archived</option></select></div>
                <div className="space-y-3">{[{key:"is_featured",label:"Featured Product"},{key:"is_new_arrival",label:"New Arrival"},{key:"is_top_seller",label:"Top Seller 🔥"}].map(f=>(<label key={f.key} className="flex items-center gap-3 cursor-pointer"><div onClick={()=>set(f.key,!form[f.key])} className={`w-10 h-6 rounded-full transition-all duration-200 flex items-center px-0.5 ${form[f.key]?"bg-teal justify-end":"bg-rule justify-start"}`}><div className="w-5 h-5 bg-white rounded-full shadow-sm"/></div><span className="text-[14px] font-medium text-ink">{f.label}</span></label>))}</div>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-2">Product Images</label>
                  <label className={`flex flex-col items-center justify-center h-28 border-2 border-dashed rounded-xl cursor-pointer transition-all ${imgUploading?"border-teal bg-teal-light":"border-rule hover:border-teal"}`}>
                    <Upload size={20} className={imgUploading?"text-teal animate-bounce":"text-muted"}/><p className="text-[12px] font-medium mt-2 text-muted">{imgUploading?"Uploading to Cloudinary...":"Click to upload images"}</p><p className="text-[10px] text-muted mt-0.5">JPG, PNG, WebP — max 5MB each</p>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={e=>handleImageUpload(e.target.files)} disabled={imgUploading}/>
                  </label>
                  {form.images?.length>0&&(
                    <div className="grid grid-cols-4 gap-2 mt-3">
                      {form.images.map((url,i)=>(<div key={i} className="relative aspect-square bg-card rounded-xl overflow-hidden border border-rule group"><img src={url} alt="" className="w-full h-full object-contain p-1"/>{i===0&&<span className="absolute top-1 left-1 text-[8px] font-bold bg-teal text-white px-1 py-0.5 rounded">MAIN</span>}<button onClick={()=>set("images",form.images.filter((_,idx)=>idx!==i))} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px]">✕</button></div>))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-2">Product Video (optional)</label>
                  {form.video_url?(
                    <div className="bg-card rounded-xl p-3 flex items-center justify-between"><div className="flex items-center gap-2"><Video size={16} className="text-teal"/><span className="text-[12px] font-medium text-ink truncate max-w-[160px]">Video uploaded ✓</span></div><div className="flex gap-2"><a href={form.video_url} target="_blank" rel="noreferrer" className="text-[11px] text-teal hover:underline">Preview</a><button onClick={()=>set("video_url","")} className="text-[11px] text-red-500 hover:underline">Remove</button></div></div>
                  ):(
                    <label className={`flex flex-col items-center justify-center h-24 border-2 border-dashed rounded-xl cursor-pointer transition-all ${vidUploading?"border-teal bg-teal-light":"border-rule hover:border-teal"}`}>
                      <Video size={18} className={vidUploading?"text-teal animate-bounce":"text-muted"}/><p className="text-[12px] font-medium mt-1 text-muted">{vidUploading?"Uploading video...":"Upload product video"}</p><p className="text-[10px] text-muted">MP4, MOV — max 100MB</p>
                      <input type="file" accept="video/*" className="hidden" onChange={e=>handleVideoUpload(e.target.files?.[0])} disabled={vidUploading}/>
                    </label>
                  )}
                  <div className="mt-2"><FloatInput label="Or paste video URL (YouTube/Cloudinary)" value={form.video_url} onChange={v=>set("video_url",v)}/></div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-rule flex justify-end gap-3 sticky bottom-0 bg-white"><Button variant="secondary" onClick={()=>setModal(false)}>Cancel</Button><Button loading={saving} onClick={handleSave}><Check size={16}/>{editing?"Save Changes":"Create Product"}</Button></div>
          </div>
        </div>
      )}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={()=>setDeleteTarget(null)}/>
          <div className="relative bg-white rounded-xl2 shadow-xl w-full max-w-sm p-8 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={24} className="text-red-500"/></div>
            <h3 className="font-bold text-[18px] text-ink mb-2">Delete Product?</h3>
            <p className="text-muted text-[14px] mb-6">Are you sure you want to delete <strong>"{deleteTarget.name}"</strong>? This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={()=>setDeleteTarget(null)} className="flex-1 h-11 rounded-pill border border-rule text-[13px] font-semibold text-muted hover:border-teal transition-all">Cancel</button>
              <button onClick={handleDelete} className="flex-1 h-11 rounded-pill bg-red-500 text-white text-[13px] font-semibold hover:bg-red-600 transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
