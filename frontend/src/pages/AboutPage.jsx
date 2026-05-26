import React, { useEffect } from "react";
import { Shield, Truck, Star, Users, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { observeFadeUp } from "../lib/utils";

const VALUES = [
  { icon: <Shield size={24} />,  title: "Genuine Products",      desc: "Every item we sell is 100% authentic, sourced directly from authorised distributors and brand partners."                },
  { icon: <Truck size={24} />,   title: "Same-Day Delivery",      desc: "Order before 2PM and receive your products the same day within Dar-es-Salaam. No more waiting."                     },
  { icon: <Star size={24} />,    title: "Premium Quality",        desc: "We curate only the best — from Samsung refrigerators to HP enterprise printers and Logitech accessories."          },
  { icon: <Users size={24} />,   title: "B2B Partnership",        desc: "We're the trusted supplier for over 200+ businesses across Tanzania with dedicated account management."             },
];

const STATS = [
  { value: "5,000+",   label: "Happy Customers"    },
  { value: "2,000+",   label: "Products in Stock"  },
  { value: "200+",     label: "Business Partners"  },
  { value: "7",        label: "Years in Tanzania"  },
];

export default function AboutPage() {
  const navigate = useNavigate();
  useEffect(() => { setTimeout(observeFadeUp, 100); }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-[#1d1d1f] relative overflow-hidden py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_80%,rgba(0,128,128,0.2)_0%,transparent_70%)]" />
        <div className="max-w-[1200px] mx-auto px-6 relative z-10">
          <p className="text-[11px] font-700 tracking-[0.16em] uppercase text-[#008080] mb-4">Our Story</p>
          <h1 className="text-[clamp(48px,7vw,88px)] font-900 tracking-[-0.04em] text-white leading-[0.92] mb-8 max-w-3xl">
            Digitalise<br />Your<br /><span className="text-[#008080]">Lifestyle.</span>
          </h1>
          <p className="text-[18px] text-[#86868b] max-w-xl leading-relaxed">
            Founded in Dar-es-Salaam, Ekta Digital has been Tanzania's trusted destination for premium home appliances, IT equipment, and office supplies since 2017.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#008080] py-16">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-white/20">
            {STATS.map((s, i) => (
              <div key={i} className="text-center px-6 py-4">
                <p className="text-[40px] font-900 tracking-[-0.04em] text-white">{s.value}</p>
                <p className="text-[13px] font-500 text-white/70 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-28 bg-[#fbfbfd]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="mb-16 fade-up">
            <p className="text-[11px] font-700 tracking-[0.16em] uppercase text-[#008080] mb-3">What We Stand For</p>
            <h2 className="text-[clamp(32px,5vw,52px)] font-900 tracking-[-0.04em] text-[#1d1d1f]">Built on trust.</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {VALUES.map((v, i) => (
              <div key={i} className="fade-up bg-white rounded-[24px] p-8 border border-[#f5f5f7] hover:border-[#008080]/20 hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] transition-all duration-400" style={{ transitionDelay: `${i*80}ms` }}>
                <div className="w-12 h-12 bg-[#e6f4f4] rounded-[14px] flex items-center justify-center text-[#008080] mb-5">{v.icon}</div>
                <h3 className="text-[20px] font-700 tracking-[-0.02em] text-[#1d1d1f] mb-2">{v.title}</h3>
                <p className="text-[15px] text-[#6e6e73] leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="py-28 bg-white">
        <div className="max-w-[1200px] mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div className="fade-up">
            <p className="text-[11px] font-700 tracking-[0.16em] uppercase text-[#008080] mb-3">Find Us</p>
            <h2 className="text-[40px] font-900 tracking-[-0.04em] text-[#1d1d1f] mb-6">Visit our showroom</h2>
            <div className="space-y-3 text-[15px] text-[#6e6e73] mb-8">
              <p>📍 Haidary Plaza, India Street, Dar-es-Salaam, Tanzania</p>
              <p>📞 +255 783 394 445 · +255 747 717 000</p>
              <p>📧 EktaDigital@outlook.com</p>
              <p>🕐 Mon – Sat: 8:30 AM – 6:30 PM</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => navigate("/contact")} className="px-6 py-3 bg-[#008080] text-white rounded-full font-600 text-[15px] hover:bg-[#006666] transition-colors">
                Contact Us
              </button>
              <button onClick={() => navigate("/quote")} className="px-6 py-3 bg-[#f5f5f7] text-[#1d1d1f] rounded-full font-600 text-[15px] hover:bg-[#ebebeb] transition-colors">
                Request Quote
              </button>
            </div>
          </div>
          <div className="fade-up bg-[#f5f5f7] rounded-[24px] aspect-video flex items-center justify-center" style={{ transitionDelay: "120ms" }}>
            <div className="text-center">
              <p className="text-[48px] mb-2">📍</p>
              <p className="text-[15px] font-600 text-[#1d1d1f]">Haidary Plaza</p>
              <p className="text-[13px] text-[#6e6e73]">India Street, Dar-es-Salaam</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#f5f5f7]">
        <div className="max-w-[700px] mx-auto px-6 text-center fade-up">
          <h2 className="text-[36px] font-800 tracking-[-0.03em] text-[#1d1d1f] mb-4">Ready to shop?</h2>
          <p className="text-[16px] text-[#6e6e73] mb-8">Explore thousands of genuine products with same-day delivery.</p>
          <button onClick={() => navigate("/shop")} className="px-8 py-4 bg-[#1d1d1f] text-white rounded-full font-700 text-[16px] hover:bg-[#2d2d2f] transition-colors inline-flex items-center gap-2">
            Browse Products <ArrowRight size={18} />
          </button>
        </div>
      </section>
    </div>
  );
}
