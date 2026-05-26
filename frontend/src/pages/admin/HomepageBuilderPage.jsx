import React, { useEffect, useState, useRef } from "react";
import { Eye, EyeOff, GripVertical, RefreshCw, Check, Upload, X, Image, Link2, Trash2, Plus } from "lucide-react";
import api from "../../lib/api";
import Button from "../../components/ui/Button";
import toast from "react-hot-toast";

const SECTION_LABELS = {
  hero:        { label: "Hero Slider",        icon: "🖼️" },
  categories:  { label: "Category Grid",      icon: "📂" },
  featured:    { label: "Featured Products",  icon: "⭐" },
  new_arrivals:{ label: "New Arrivals",       icon: "🆕" },
  loyalty:     { label: "Loyalty Banner",     icon: "🏆" },
  b2b:         { label: "B2B Strip",          icon: "🏢" },
  promotions:  { label: "Promotions",         icon: "🏷️" },
  reviews:     { label: "Customer Reviews",   icon: "💬" },
  newsletter:  { label: "Newsletter Signup",  icon: "📧" },
};

const EMPTY_SLIDE = {
  tag: "", headline: "", sub: "",
  cta_text: "Shop Now", cta_href: "/shop",
  image_url: "", is_active: true,
};

// ── Image Upload Widget ─────────────────────────────────────────────────────
function HeroImageUpload({ value, onChange }) {
  const inputRef   = useRef(null);
  const [mode,     setMode]     = useState(value ? "preview" : "choose"); // choose | url | upload | preview | uploading
  const [urlInput, setUrlInput] = useState(value || "");
  const [error,    setError]    = useState("");

  const handleFile = async (file) => {
    if (!file) return;
    // Validate type
    if (!["image/jpeg","image/png","image/webp","image/jpg"].includes(file.type)) {
      setError("Please select a JPG, PNG, or WebP image."); return;
    }
    // Validate size (5 MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5 MB."); return;
    }
    setError("");
    setMode("uploading");
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await api.post("/admin/upload/hero", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onChange(res.data.url);
      setMode("preview");
      toast.success("Image uploaded — converted to WebP ✓", {
        style: { background: "#1d1d1f", color: "#fff", borderRadius: "12px" },
      });
    } catch (e) {
      setError(e.response?.data?.message ?? "Upload failed. Check Cloudinary credentials.");
      setMode("upload");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) return;
    onChange(urlInput.trim());
    setMode("preview");
  };

  const handleClear = () => {
    onChange("");
    setUrlInput("");
    setMode("choose");
    setError("");
  };

  // ── Preview ──────────────────────────────────────────────────────────────
  if (mode === "preview") return (
    <div className="relative rounded-[16px] overflow-hidden bg-[#f5f5f7] border border-[#e5e5ea]">
      <img src={value} alt="Hero preview" className="w-full h-48 object-cover" onError={() => { setError("Image URL is broken."); setMode("choose"); }} />
      <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-all flex items-center justify-center gap-2 opacity-0 hover:opacity-100">
        <button onClick={() => setMode("choose")} className="px-3 py-1.5 bg-white text-[#1d1d1f] rounded-full text-[12px] font-600 hover:bg-[#f5f5f7]">
          Change
        </button>
        <button onClick={handleClear} className="px-3 py-1.5 bg-[#ff3b30] text-white rounded-full text-[12px] font-600">
          Remove
        </button>
      </div>
      <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-600 px-2 py-1 rounded-full">
        WebP optimised ✓
      </div>
    </div>
  );

  // ── Uploading ────────────────────────────────────────────────────────────
  if (mode === "uploading") return (
    <div className="rounded-[16px] bg-[#f5f5f7] border border-[#e5e5ea] h-48 flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 border-2 border-[#008080]/30 border-t-[#008080] rounded-full animate-spin" />
      <p className="text-[13px] font-500 text-[#6e6e73]">Uploading & converting to WebP...</p>
    </div>
  );

  // ── Choose mode ──────────────────────────────────────────────────────────
  if (mode === "choose") return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setMode("upload")}
          className="flex flex-col items-center gap-2 p-5 bg-[#f5f5f7] hover:bg-[#e6f4f4] hover:border-[#008080] border-2 border-dashed border-[#d2d2d7] rounded-[16px] transition-all group"
        >
          <Upload size={24} className="text-[#6e6e73] group-hover:text-[#008080] transition-colors" />
          <span className="text-[13px] font-600 text-[#6e6e73] group-hover:text-[#008080]">Upload Image</span>
          <span className="text-[11px] text-[#86868b]">JPG / PNG / WebP · Max 5 MB</span>
        </button>
        <button
          type="button"
          onClick={() => setMode("url")}
          className="flex flex-col items-center gap-2 p-5 bg-[#f5f5f7] hover:bg-[#f5f5f7] border-2 border-dashed border-[#d2d2d7] hover:border-[#008080] rounded-[16px] transition-all group"
        >
          <Link2 size={24} className="text-[#6e6e73] group-hover:text-[#008080] transition-colors" />
          <span className="text-[13px] font-600 text-[#6e6e73] group-hover:text-[#008080]">Use Image URL</span>
          <span className="text-[11px] text-[#86868b]">Paste an external URL</span>
        </button>
      </div>
      {error && <p className="text-[12px] text-[#ff3b30] flex items-center gap-1"><span>⚠</span>{error}</p>}
    </div>
  );

  // ── URL input ────────────────────────────────────────────────────────────
  if (mode === "url") return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="url"
          placeholder="https://example.com/image.jpg"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
          className="flex-1 h-11 px-4 rounded-[12px] border border-[#d2d2d7] text-[14px] outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/10"
        />
        <button type="button" onClick={handleUrlSubmit} className="px-4 h-11 bg-[#008080] text-white rounded-[12px] text-[13px] font-600 hover:bg-[#006666] transition-colors">
          Use URL
        </button>
      </div>
      <button type="button" onClick={() => setMode("choose")} className="text-[12px] text-[#6e6e73] hover:text-[#1d1d1f] transition-colors">
        ← Back
      </button>
    </div>
  );

  // ── Upload dropzone ──────────────────────────────────────────────────────
  return (
    <div className="space-y-3">
      <div
        className="rounded-[16px] border-2 border-dashed border-[#d2d2d7] hover:border-[#008080] bg-[#f5f5f7] hover:bg-[#e6f4f4] transition-all cursor-pointer p-8 flex flex-col items-center gap-3"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
      >
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
          <Image size={20} className="text-[#008080]" />
        </div>
        <div className="text-center">
          <p className="text-[14px] font-600 text-[#1d1d1f]">Drop your image here</p>
          <p className="text-[12px] text-[#6e6e73] mt-1">or click to browse · JPG, PNG, WebP · Max 5 MB</p>
          <p className="text-[11px] text-[#008080] mt-1 font-500">Images are automatically converted to WebP for faster loading</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/jpg"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
      {error && <p className="text-[12px] text-[#ff3b30]">⚠ {error}</p>}
      <button type="button" onClick={() => setMode("choose")} className="text-[12px] text-[#6e6e73] hover:text-[#1d1d1f] transition-colors">
        ← Back
      </button>
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────
export default function HomepageBuilderPage() {
  const [sections,   setSections]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [dragIndex,  setDragIndex]  = useState(null);
  const [heroSlides, setHeroSlides] = useState([]);
  const [slideModal, setSlideModal] = useState(false);
  const [editSlide,  setEditSlide]  = useState(null); // slide being edited, null = new
  const [slideForm,  setSlideForm]  = useState({ ...EMPTY_SLIDE });
  const [slideSaving,setSlideSaving]= useState(false);
  const [deleteTarget,setDeleteTarget] = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [sec, slides] = await Promise.all([
        api.get("/admin/homepage"),
        api.get("/admin/hero-slides"),
      ]);
      setSections(sec.data);
      setHeroSlides(slides.data);
    } catch (e) { console.error(e); toast.error("Failed to load data"); }
    finally { setLoading(false); }
  };

  // Drag-to-reorder sections
  const handleDragStart = (i) => setDragIndex(i);
  const handleDragOver = (e, i) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === i) return;
    const updated = [...sections];
    const [moved] = updated.splice(dragIndex, 1);
    updated.splice(i, 0, moved);
    setSections(updated);
    setDragIndex(i);
  };
  const handleDragEnd = () => setDragIndex(null);

  const saveOrder = async () => {
    setSaving(true);
    try {
      await api.post("/admin/homepage/reorder", {
        sections: sections.map((s, i) => ({ id: s.id, sort_order: i })),
      });
      toast.success("Homepage order saved!");
    } catch { toast.error("Save failed"); }
    finally { setSaving(false); }
  };

  const toggleVisibility = async (id) => {
    try {
      const res = await api.patch(`/admin/homepage/${id}/toggle`);
      setSections((prev) => prev.map((s) => s.id === id ? res.data : s));
      toast.success("Visibility updated");
    } catch { toast.error("Failed to update visibility"); }
  };

  const seedSections = async () => {
    try { await api.post("/admin/homepage/seed"); fetchAll(); toast.success("Default sections loaded"); }
    catch { toast.error("Seed failed"); }
  };

  // Open slide modal for new slide
  const openAddSlide = () => {
    setEditSlide(null);
    setSlideForm({ ...EMPTY_SLIDE });
    setSlideModal(true);
  };

  // Open slide modal for editing
  const openEditSlide = (slide) => {
    setEditSlide(slide);
    setSlideForm({
      tag: slide.tag ?? "", headline: slide.headline ?? "",
      sub: slide.sub ?? "", cta_text: slide.cta_text ?? "Shop Now",
      cta_href: slide.cta_href ?? "/shop", image_url: slide.image_url ?? "",
      is_active: slide.is_active ?? true,
    });
    setSlideModal(true);
  };

  const saveSlide = async () => {
    if (!slideForm.headline.trim()) { toast.error("Headline is required"); return; }
    setSlideSaving(true);
    try {
      if (editSlide) {
        await api.put(`/admin/hero-slides/${editSlide.id}`, slideForm);
        toast.success("Slide updated!");
      } else {
        await api.post("/admin/hero-slides", slideForm);
        toast.success("Slide added!");
      }
      setSlideModal(false);
      fetchAll();
    } catch { toast.error("Failed to save slide"); }
    finally { setSlideSaving(false); }
  };

  const deleteSlide = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/admin/hero-slides/${deleteTarget.id}`);
      toast.success("Slide deleted");
      setDeleteTarget(null);
      fetchAll();
    } catch { toast.error("Failed to delete slide"); }
  };

  const toggleSlide = async (id, current) => {
    try { await api.put(`/admin/hero-slides/${id}`, { is_active: !current }); fetchAll(); }
    catch { toast.error("Failed to toggle slide"); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-[#008080]/30 border-t-[#008080] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 max-w-[1100px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-700 tracking-[0.12em] uppercase text-[#6e6e73] mb-1">Admin</p>
          <h1 className="text-[28px] font-800 tracking-[-0.03em] text-[#1d1d1f]">Homepage Builder</h1>
          <p className="text-[13px] text-[#6e6e73] mt-1">Drag sections to reorder · Toggle visibility · Changes go live on save</p>
        </div>
        <div className="flex gap-3">
          {sections.length === 0 && (
            <Button variant="secondary" onClick={seedSections}><RefreshCw size={15} />Load Defaults</Button>
          )}
          <Button loading={saving} onClick={saveOrder}><Check size={15} />Save Order</Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Page sections */}
        <div>
          <h2 className="text-[16px] font-700 text-[#1d1d1f] mb-2">Page Sections</h2>
          <p className="text-[13px] text-[#6e6e73] mb-4">Drag the handle to reorder. Click the eye icon to show/hide.</p>
          <div className="space-y-2">
            {sections.map((section, i) => {
              const meta = SECTION_LABELS[section.type] ?? { label: section.type, icon: "📄" };
              return (
                <div
                  key={section.id}
                  draggable
                  onDragStart={() => handleDragStart(i)}
                  onDragOver={(e) => handleDragOver(e, i)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center gap-3 bg-white rounded-[14px] p-4 cursor-grab active:cursor-grabbing select-none transition-all border-2 ${dragIndex === i ? "border-[#008080] shadow-[0_8px_24px_rgba(0,128,128,0.12)] opacity-80" : "border-transparent shadow-[0_1px_6px_rgba(0,0,0,0.06)]"}`}
                >
                  <GripVertical size={16} className="text-[#d2d2d7] shrink-0" />
                  <span className="w-6 h-6 bg-[#f5f5f7] rounded-full flex items-center justify-center text-[10px] font-700 text-[#6e6e73] shrink-0">{i + 1}</span>
                  <span className="text-xl">{meta.icon}</span>
                  <span className="flex-1 text-[14px] font-600 text-[#1d1d1f]">{meta.label}</span>
                  <button
                    onClick={() => toggleVisibility(section.id)}
                    className={`flex items-center gap-1.5 text-[11px] font-700 px-3 py-1.5 rounded-full transition-all ${section.is_visible ? "bg-[#e6f4f4] text-[#008080]" : "bg-[#f5f5f7] text-[#86868b]"}`}
                  >
                    {section.is_visible ? <><Eye size={11} />Visible</> : <><EyeOff size={11} />Hidden</>}
                  </button>
                </div>
              );
            })}
          </div>
          {sections.length === 0 && (
            <div className="bg-white rounded-[20px] p-10 text-center shadow-[0_1px_6px_rgba(0,0,0,0.06)]">
              <p className="text-[#6e6e73] mb-4">No sections yet.</p>
              <Button onClick={seedSections}><RefreshCw size={14} />Load Default Sections</Button>
            </div>
          )}
        </div>

        {/* Hero slides */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[16px] font-700 text-[#1d1d1f]">Hero Slides</h2>
              <p className="text-[12px] text-[#6e6e73] mt-0.5">Images auto-converted to WebP for fast loading</p>
            </div>
            <Button size="sm" onClick={openAddSlide}><Plus size={14} />Add Slide</Button>
          </div>
          <div className="space-y-3">
            {heroSlides.map((slide) => (
              <div key={slide.id} className="bg-white rounded-[16px] shadow-[0_1px_6px_rgba(0,0,0,0.06)] overflow-hidden">
                <div className="flex items-center gap-3 p-3">
                  {/* Thumbnail */}
                  <div className="w-20 h-14 bg-[#f5f5f7] rounded-[10px] overflow-hidden shrink-0 flex items-center justify-center">
                    {slide.image_url
                      ? <img src={slide.image_url} alt="" className="w-full h-full object-cover" />
                      : <span className="text-[24px]">🖼️</span>
                    }
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-700 text-[#1d1d1f] truncate">{slide.headline || "—"}</p>
                    <p className="text-[11px] text-[#008080] font-600">{slide.tag}</p>
                    <p className="text-[10px] text-[#86868b] truncate mt-0.5">{slide.cta_href}</p>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleSlide(slide.id, slide.is_active)}
                      className={`text-[10px] font-700 px-2.5 py-1 rounded-full transition-all ${slide.is_active ? "bg-[#e6f4f4] text-[#008080]" : "bg-[#f5f5f7] text-[#86868b]"}`}
                    >
                      {slide.is_active ? "Active" : "Hidden"}
                    </button>
                    <button
                      onClick={() => openEditSlide(slide)}
                      className="w-7 h-7 rounded-full bg-[#f5f5f7] flex items-center justify-center text-[#6e6e73] hover:bg-[#e6f4f4] hover:text-[#008080] transition-colors"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button
                      onClick={() => setDeleteTarget(slide)}
                      className="w-7 h-7 rounded-full bg-[#f5f5f7] flex items-center justify-center text-[#6e6e73] hover:bg-red-50 hover:text-[#ff3b30] transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {heroSlides.length === 0 && (
              <div className="bg-white rounded-[20px] p-8 text-center shadow-[0_1px_6px_rgba(0,0,0,0.06)]">
                <p className="text-[32px] mb-3">🖼️</p>
                <p className="text-[14px] font-600 text-[#1d1d1f] mb-1">No hero slides yet</p>
                <p className="text-[13px] text-[#6e6e73] mb-4">Add your first slide to power the homepage hero.</p>
                <Button size="sm" onClick={openAddSlide}><Plus size={14} />Add First Slide</Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Slide Modal ─────────────────────────────────────────────────────── */}
      {slideModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 overflow-y-auto">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSlideModal(false)} />
          <div className="relative bg-white rounded-[24px] shadow-2xl w-full max-w-xl p-8 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-[20px] font-800 tracking-[-0.02em] text-[#1d1d1f]">
                {editSlide ? "Edit Slide" : "New Hero Slide"}
              </h3>
              <button onClick={() => setSlideModal(false)} className="w-8 h-8 rounded-full bg-[#f5f5f7] flex items-center justify-center hover:bg-[#ebebeb] transition-colors">
                <X size={15} />
              </button>
            </div>

            {/* Image upload */}
            <div>
              <label className="block text-[12px] font-700 uppercase tracking-[0.08em] text-[#6e6e73] mb-2">
                Slide Image <span className="text-[10px] font-500 normal-case text-[#86868b]">(recommended: 1400×800px)</span>
              </label>
              <HeroImageUpload
                value={slideForm.image_url}
                onChange={(url) => setSlideForm((f) => ({ ...f, image_url: url }))}
              />
            </div>

            {/* Text fields */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: "tag",      label: "Tag",               placeholder: "e.g. Home Appliances",  span: 1 },
                { key: "cta_text", label: "Button Text",        placeholder: "e.g. Shop Now",         span: 1 },
                { key: "headline", label: "Headline",            placeholder: "e.g. Power Your Home.", span: 2 },
                { key: "sub",      label: "Subtitle (optional)", placeholder: "Supporting text...",     span: 2 },
                { key: "cta_href", label: "Button Link",         placeholder: "/shop/home-appliances", span: 2 },
              ].map((f) => (
                <div key={f.key} className={f.span === 2 ? "col-span-2" : ""}>
                  <label className="block text-[12px] font-600 text-[#6e6e73] mb-1">{f.label}</label>
                  <input
                    type="text"
                    placeholder={f.placeholder}
                    value={slideForm[f.key]}
                    onChange={(e) => setSlideForm((s) => ({ ...s, [f.key]: e.target.value }))}
                    className="w-full h-[46px] px-4 rounded-[12px] border border-[#d2d2d7] text-[14px] outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/10 transition-all"
                  />
                </div>
              ))}
            </div>

            {/* Active toggle */}
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setSlideForm((f) => ({ ...f, is_active: !f.is_active }))}
                className={`w-10 h-6 rounded-full transition-colors duration-200 relative ${slideForm.is_active ? "bg-[#008080]" : "bg-[#d2d2d7]"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${slideForm.is_active ? "translate-x-4" : "translate-x-0.5"}`} />
              </div>
              <span className="text-[14px] font-500 text-[#1d1d1f]">
                {slideForm.is_active ? "Active — visible on homepage" : "Hidden — not shown on homepage"}
              </span>
            </label>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setSlideModal(false)} className="flex-1 h-11 bg-[#f5f5f7] text-[#1d1d1f] rounded-full font-600 text-[14px] hover:bg-[#ebebeb] transition-colors">
                Cancel
              </button>
              <button onClick={saveSlide} disabled={slideSaving} className="flex-1 h-11 bg-[#008080] text-white rounded-full font-700 text-[14px] hover:bg-[#006666] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {slideSaving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (editSlide ? "Save Changes" : "Add Slide")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirm ──────────────────────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white rounded-[24px] shadow-2xl p-8 max-w-sm w-full text-center">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} className="text-[#ff3b30]" />
            </div>
            <h3 className="text-[18px] font-700 text-[#1d1d1f] mb-2">Delete Slide?</h3>
            <p className="text-[14px] text-[#6e6e73] mb-6">
              "<strong>{deleteTarget.headline || "This slide"}</strong>" will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 h-11 bg-[#f5f5f7] text-[#1d1d1f] rounded-full font-600 text-[14px] hover:bg-[#ebebeb] transition-colors">
                Cancel
              </button>
              <button onClick={deleteSlide} className="flex-1 h-11 bg-[#ff3b30] text-white rounded-full font-700 text-[14px] hover:bg-red-600 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
