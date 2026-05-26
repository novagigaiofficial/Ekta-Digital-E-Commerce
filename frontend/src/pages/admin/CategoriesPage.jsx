import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Check, Upload } from "lucide-react";
import api from "../../lib/api";
import Button from "../../components/ui/Button";
import toast from "react-hot-toast";

const EMPTY = {name:"",description:"",sort_order:0,is_active:true,image_url:""};

export default function AdminCategories() {
  const [categories,setCategories]=useState([]);
  const [loading,setLoading]=useState(true);
  const [modal,setModal]=useState(false);
  const [editing,setEditing]=useState(null);
  const [form,setForm]=useState(EMPTY);
  const [saving,setSaving]=useState(false);
  const [imgUp,setImgUp]=useState(false);
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));

  useEffect(()=>{fetchAll();},[]);

  const fetchAll=async()=>{
    setLoading(true);
    try{const res=await api.get("/categories", { params: { admin: 1 } });setCategories(res.data);}
    catch(e){console.error(e);}finally{setLoading(false);}
  };

  const openAdd=()=>{setEditing(null);setForm(EMPTY);setModal(true);};
  const openEdit=(c)=>{setEditing(c.id);setForm({name:c.name,description:c.description??"",sort_order:c.sort_order,is_active:c.is_active,image_url:c.image_url??""});setModal(true);};

  const handleImageUpload=async(file)=>{
    if(!file) return;
    setImgUp(true);
    try{
      const fd=new FormData();fd.append("image",file);fd.append("folder","ekta-digital/categories");
      const res=await api.post("/admin/upload/image",fd,{headers:{"Content-Type":"multipart/form-data"}});
      set("image_url",res.data.url);toast.success("Image uploaded!");
    }catch{toast.error("Upload failed");}finally{setImgUp(false);}
  };

  const handleSave=async()=>{
    if(!form.name){toast.error("Category name is required");return;}
    setSaving(true);
    try{
      if(editing){await api.put(`/admin/categories/${editing}`,form);toast.success("Category updated");}
      else{await api.post("/admin/categories",form);toast.success("Category created");}
      setModal(false);fetchAll();
    }catch{toast.error("Save failed");}finally{setSaving(false);}
  };

  const [deleteTarget, setDeleteTarget] = useState(null);
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/admin/categories/${deleteTarget.id}`);
      toast.success("Category deleted");
      setDeleteTarget(null);
      fetchAll();
    } catch { toast.error("Delete failed — category may have linked products"); }
  };

  const toggleActive=async(cat)=>{
    try{await api.put(`/admin/categories/${cat.id}`,{is_active:!cat.is_active});fetchAll();}
    catch{toast.error("Failed");}
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><p className="text-[11px] font-bold tracking-[0.15em] uppercase text-muted mb-1">Catalogue</p><h1 className="text-[28px] font-bold tracking-[-0.8px] text-ink">Categories</h1></div><Button onClick={openAdd}><Plus size={16}/>Add Category</Button></div>
      {loading?<div className="p-10 text-center text-muted">Loading...</div>:(
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map(cat=>(
            <div key={cat.id} className="bg-white rounded-xl2 shadow-card overflow-hidden">
              <div className="aspect-video bg-card overflow-hidden flex items-center justify-center">
                {cat.image_url?<img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover"/>:<p className="text-[11px] text-muted">No image</p>}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-1"><h3 className="font-bold text-[14px] text-ink">{cat.name}</h3><button onClick={()=>toggleActive(cat)} className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${cat.is_active?"bg-green-100 text-green-700":"bg-gray-100 text-gray-500"}`}>{cat.is_active?"Active":"Hidden"}</button></div>
                <p className="text-[12px] text-muted mb-3">{cat.products_count??0} products</p>
                <div className="flex gap-2">
                  <button onClick={()=>openEdit(cat)} className="flex-1 flex items-center justify-center gap-1 h-8 border border-rule rounded-xl text-[12px] font-medium text-muted hover:border-teal hover:text-teal transition-all"><Pencil size={12}/>Edit</button>
                  <button onClick={()=>setDeleteTarget({id:cat.id,name:cat.name})} className="w-8 h-8 flex items-center justify-center border border-rule rounded-xl text-muted hover:border-red-300 hover:text-red-500 transition-all"><Trash2 size={12}/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {modal&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={()=>setModal(false)}/>
          <div className="relative bg-white rounded-xl2 shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between"><h2 className="font-bold text-[18px] text-ink">{editing?"Edit Category":"Add Category"}</h2><button onClick={()=>setModal(false)}><X size={20} className="text-muted"/></button></div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-2">Category Image</label>
              <label className={`flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all ${imgUp?"border-teal bg-teal-light":"border-rule hover:border-teal"}`}>
                {form.image_url?<img src={form.image_url} alt="" className="h-full w-full object-cover rounded-xl"/>:<><Upload size={20} className={imgUp?"text-teal animate-bounce":"text-muted"}/><p className="text-[12px] text-muted mt-1">{imgUp?"Uploading...":"Upload image"}</p></>}
                <input type="file" accept="image/*" className="hidden" onChange={e=>handleImageUpload(e.target.files?.[0])} disabled={imgUp}/>
              </label>
              {form.image_url&&<button onClick={()=>set("image_url","")} className="text-[11px] text-red-500 hover:underline mt-1">Remove image</button>}
            </div>
            <div className="relative"><input type="text" placeholder=" " value={form.name} onChange={e=>set("name",e.target.value)} className="peer w-full h-[52px] px-4 pt-4 rounded-xl border border-rule bg-card text-[14px] outline-none focus:border-teal focus:border-2 transition-all"/><label className="absolute left-4 top-1.5 text-[11px] font-medium text-muted peer-placeholder-shown:top-4 peer-placeholder-shown:text-[14px] peer-focus:top-1.5 peer-focus:text-[11px] transition-all pointer-events-none">Category Name *</label></div>
            <textarea placeholder="Description (optional)" value={form.description} onChange={e=>set("description",e.target.value)} rows={2} className="w-full px-4 py-3 rounded-xl border border-rule bg-card text-[13px] outline-none focus:border-teal focus:border-2 transition-all resize-none"/>
            <div className="relative"><input type="number" placeholder=" " value={form.sort_order} onChange={e=>set("sort_order",parseInt(e.target.value)||0)} className="peer w-full h-[52px] px-4 pt-4 rounded-xl border border-rule bg-card text-[14px] outline-none focus:border-teal focus:border-2 transition-all"/><label className="absolute left-4 top-1.5 text-[11px] font-medium text-muted peer-placeholder-shown:top-4 peer-placeholder-shown:text-[14px] peer-focus:top-1.5 peer-focus:text-[11px] transition-all pointer-events-none">Sort Order (lower = appears first)</label></div>
            <label className="flex items-center gap-3 cursor-pointer"><div onClick={()=>set("is_active",!form.is_active)} className={`w-10 h-6 rounded-full transition-all duration-200 flex items-center px-0.5 ${form.is_active?"bg-teal justify-end":"bg-rule justify-start"}`}><div className="w-5 h-5 bg-white rounded-full shadow-sm"/></div><span className="text-[14px] font-medium text-ink">{form.is_active?"Active — visible":"Hidden"}</span></label>
            <div className="flex gap-3 pt-2"><Button variant="secondary" className="flex-1" onClick={()=>setModal(false)}>Cancel</Button><Button className="flex-1" loading={saving} onClick={handleSave}><Check size={15}/>{editing?"Save":"Create"}</Button></div>
          </div>
        </div>
      )}
    {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={()=>setDeleteTarget(null)}/>
          <div className="relative bg-white rounded-xl2 shadow-xl w-full max-w-sm p-8 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={24} className="text-red-500"/></div>
            <h3 className="font-bold text-[18px] text-ink mb-2">Delete Category?</h3>
            <p className="text-muted text-[14px] mb-6">Delete <strong>"{deleteTarget.name}"</strong>? Products in this category will be unlinked. This cannot be undone.</p>
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
