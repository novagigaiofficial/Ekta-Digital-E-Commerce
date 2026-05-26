import React, { useState } from "react";
import { Phone, Mail, MapPin, MessageCircle, CheckCircle } from "lucide-react";
import api from "../lib/api";
import Button from "../components/ui/Button";
import toast from "react-hot-toast";

export default function ContactPage() {
  const [form,      setForm]      = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [loading,   setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.message.trim().length < 10) { toast.error("Message must be at least 10 characters"); return; }
    setLoading(true);
    try {
      await api.post("/contact", form);
      setSubmitted(true);
    } catch (e) {
      const errors = e.response?.data?.errors;
      if (errors) Object.values(errors).flat().forEach((m) => toast.error(m));
      else toast.error("Failed to send message. Please try WhatsApp instead.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-soft">
      <div className="bg-white border-b border-rule">
        <div className="max-w-[1200px] mx-auto px-6 py-12">
          <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-teal mb-2">Get in Touch</p>
          <h1 className="text-[48px] font-bold tracking-[-1.5px] text-ink mb-3">Contact Us</h1>
          <p className="text-muted text-[17px] max-w-lg">We're here to help. Reach out via any channel below.</p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-10">
          {/* Contact info */}
          <div className="space-y-4">
            <a href="https://wa.me/255783394445" target="_blank" rel="noreferrer" className="flex items-start gap-4 bg-[#25D366] rounded-xl2 p-5 text-white hover:opacity-90 transition-opacity">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0"><MessageCircle size={20} /></div>
              <div>
                <p className="font-bold text-[15px] mb-0.5">WhatsApp (Fastest)</p>
                <p className="text-white/80 text-[13px]">+255 783 394 445</p>
                <p className="text-white/60 text-[12px] mt-1">Typically replies within 1 hour</p>
              </div>
            </a>
            {[
              { icon: <Phone size={18} className="text-teal" />, title: "Phone",    lines: ["+255 783 394 445", "+255 747 717 000"] },
              { icon: <Mail  size={18} className="text-teal" />, title: "Email",    lines: ["EktaDigital@outlook.com"]              },
              { icon: <MapPin size={18} className="text-teal" />,title: "Visit Us", lines: ["Haidary Plaza, India Street,", "Dar-es-Salaam, Tanzania"] },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-xl2 shadow-card p-5 flex gap-4 items-start">
                <div className="w-10 h-10 bg-teal-light rounded-xl flex items-center justify-center shrink-0">{item.icon}</div>
                <div>
                  <p className="font-bold text-[14px] text-ink mb-1">{item.title}</p>
                  {item.lines.map((l, i) => <p key={i} className="text-[13px] text-muted">{l}</p>)}
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="md:col-span-2">
            {submitted ? (
              <div className="bg-white rounded-xl2 shadow-card p-10 text-center h-full flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={36} className="text-green-500" />
                </div>
                <h2 className="text-[24px] font-bold text-ink mb-2">Message Sent!</h2>
                <p className="text-muted text-[15px] max-w-sm leading-relaxed">We'll get back to you within 24 hours. For urgent queries, please WhatsApp us directly.</p>
                <a href="https://wa.me/255783394445" target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-pill font-semibold text-[14px] hover:opacity-90">
                  💬 Chat on WhatsApp
                </a>
              </div>
            ) : (
              <div className="bg-white rounded-xl2 shadow-card p-8">
                <h2 className="font-bold text-[22px] text-ink mb-6">Send us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {[{ key: "name", label: "Your Name", type: "text" }, { key: "email", label: "Email Address", type: "email" }].map((f) => (
                      <div key={f.key} className="relative">
                        <input type={f.type} placeholder=" " value={form[f.key]} onChange={(e) => set(f.key, e.target.value)} required className="peer w-full h-[52px] px-4 pt-4 rounded-xl border border-rule bg-card text-[14px] outline-none focus:border-teal focus:border-2 transition-all" />
                        <label className="absolute left-4 top-1.5 text-[11px] font-medium text-muted peer-placeholder-shown:top-4 peer-placeholder-shown:text-[14px] peer-focus:top-1.5 peer-focus:text-[11px] transition-all pointer-events-none">{f.label}</label>
                      </div>
                    ))}
                  </div>
                  {[{ key: "phone", label: "Phone Number", type: "tel" }, { key: "subject", label: "Subject", type: "text" }].map((f) => (
                    <div key={f.key} className="relative">
                      <input type={f.type} placeholder=" " value={form[f.key]} onChange={(e) => set(f.key, e.target.value)} className="peer w-full h-[52px] px-4 pt-4 rounded-xl border border-rule bg-card text-[14px] outline-none focus:border-teal focus:border-2 transition-all" />
                      <label className="absolute left-4 top-1.5 text-[11px] font-medium text-muted peer-placeholder-shown:top-4 peer-placeholder-shown:text-[14px] peer-focus:top-1.5 peer-focus:text-[11px] transition-all pointer-events-none">{f.label}</label>
                    </div>
                  ))}
                  <div className="relative">
                    <textarea placeholder=" " value={form.message} onChange={(e) => set("message", e.target.value)} required rows={5} className="peer w-full px-4 pt-6 pb-3 rounded-xl border border-rule bg-card text-[14px] outline-none focus:border-teal focus:border-2 transition-all resize-none" />
                    <label className="absolute left-4 top-2 text-[11px] font-medium text-muted peer-placeholder-shown:top-4 peer-placeholder-shown:text-[14px] peer-focus:top-2 peer-focus:text-[11px] transition-all pointer-events-none">Your Message</label>
                  </div>
                  <Button type="submit" className="w-full" loading={loading}>Send Message</Button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
