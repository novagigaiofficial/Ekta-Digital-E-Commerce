import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Truck, CreditCard, ShieldCheck, Globe, Star, ArrowRight, ChevronLeft, ChevronRight, Play } from "lucide-react";
import api from "../lib/api";
import ProductCard from "../components/ui/ProductCard";
import { formatPrice, observeFadeUp } from "../lib/utils";

const FALLBACK_SLIDES = [
  {
    tag: "New Arrivals",
    headline: "Power Your\nHome.",
    sub: "Premium appliances, same-day delivered across Dar-es-Salaam.",
    cta: "Shop Appliances",
    href: "/shop/home-appliances",
    emoji: "🏠",
    accent: "#008080",
  },
  {
    tag: "IT & Office",
    headline: "Work Without\nLimits.",
    sub: "Laptops, monitors, networking gear. Everything you need to perform.",
    cta: "Shop IT",
    href: "/shop/it-office",
    emoji: "💻",
    accent: "#005f5f",
  },
  {
    tag: "Printers & Toners",
    headline: "Print.\nFile.\nLead.",
    sub: "Top brands, all models, genuine toners. Ready for pickup today.",
    cta: "Shop Printers",
    href: "/shop/printers-toners",
    emoji: "🖨️",
    accent: "#1d1d1f",
  },
];

const TRUST = [
  { icon: <Truck size={20} />,       title: "Same-Day Delivery",   sub: "Within Dar-es-Salaam"    },
  { icon: <CreditCard size={20} />,  title: "7 Payment Methods",   sub: "M-Pesa, Cards & more"    },
  { icon: <ShieldCheck size={20} />, title: "VAT Inclusive",       sub: "All prices incl. 18% VAT" },
  { icon: <Globe size={20} />,       title: "East Africa Coverage", sub: "Delivery region-wide"    },
];

const CATEGORIES = [
  { name: "Home Appliances",    slug: "home-appliances",  emoji: "🏠" },
  { name: "IT & Office",        slug: "it-office",        emoji: "💻" },
  { name: "Printers & Toners",  slug: "printers-toners",  emoji: "🖨️" },
  { name: "Office Supplies",    slug: "office-supplies",  emoji: "📎" },
];

export default function HomePage() {
  const [slideIdx,  setSlideIdx]  = useState(0);
  const [slides,    setSlides]    = useState(FALLBACK_SLIDES);
  const [featured,  setFeatured]  = useState([]);
  const [arrivals,  setArrivals]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [newsletter,setNewsletter]= useState({ email: "", done: false });
  const navigate    = useNavigate();
  const intervalRef = useRef(null);

  const startAutoSlide = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => setSlideIdx((s) => (s + 1) % slides.length), 6000);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    startAutoSlide();

    return () => clearInterval(intervalRef.current);
  }, [slides.length]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const load = async () => {
      try {
        const [heroRes, featRes, arrRes] = await Promise.all([
          api.get("/hero-slides").catch(() => ({ data: [] })),
          api.get("/products", { params: { featured: true, per_page: 4 } }),
          api.get("/products", { params: { new_arrivals: true, per_page: 8 } }),
        ]);

        const apiSlides = heroRes.data ?? [];

        if (apiSlides.length) setSlides(apiSlides);

        setFeatured(featRes.data.data ?? []);
        setArrivals(arrRes.data.data ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    if (!loading) observeFadeUp();
  }, [loading]);

  const gotoSlide = (i) => { setSlideIdx(i); startAutoSlide(); };
  const prev = () => gotoSlide((slideIdx - 1 + slides.length) % slides.length);
  const next = () => gotoSlide((slideIdx + 1) % slides.length);

  const s = slides[slideIdx] ?? FALLBACK_SLIDES[0];
  const headline = (s.headline ?? "").split("\n");

  return (
    <div className="w-full overflow-x-hidden">

      {/* ── HERO — Premium Full-Bleed Cinematic ─────────────────────────── */}
      <section className="relative w-full overflow-hidden bg-[#0a0a0a]" style={{ minHeight: "100svh" }}>

        {/* ── Background layer — image or gradient ─────────────────────── */}
        <div className="absolute inset-0 z-0">
          {s.image_url ? (
            <>
              <img
                key={`bg-${slideIdx}`}
                src={s.image_url}
                alt=""
                className="w-full h-full object-cover"
                style={{ animation: "hero-zoom 8s ease-out both" }}
              />
              {/* Dark gradient overlay — stronger at bottom for text legibility */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/10" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
            </>
          ) : (
            <>
              {/* Premium dark gradient when no image */}
              <div className="absolute inset-0 bg-[#0d1117]" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_60%_40%,rgba(0,128,128,0.22)_0%,transparent_65%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_70%,rgba(0,128,128,0.10)_0%,transparent_60%)]" />
              {/* Floating emoji visual */}
              <div className="absolute right-[8%] top-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-[40px] bg-white/[0.04] border border-white/[0.07] flex items-center justify-center backdrop-blur-sm hidden md:flex">
                <span className="text-[160px] select-none" style={{ filter: "drop-shadow(0 20px 60px rgba(0,128,128,0.3))" }}>{s.emoji ?? "🛍️"}</span>
              </div>
              {/* Grid lines decoration */}
              <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "80px 80px" }} />
            </>
          )}
        </div>

        {/* ── Slide progress bar ───────────────────────────────────────── */}
        <div className="absolute top-0 left-0 right-0 z-30 h-[2px] bg-white/10">
          <div
            key={`progress-${slideIdx}`}
            className="h-full bg-[#008080]"
            style={{ animation: "slide-progress 6s linear forwards" }}
          />
        </div>

        {/* ── Content ──────────────────────────────────────────────────── */}
        <div className="relative z-20 max-w-[1200px] mx-auto px-6 flex flex-col justify-center" style={{ minHeight: "100svh", paddingTop: "80px", paddingBottom: "120px" }}>
          <div key={slideIdx} className="max-w-[620px]" style={{ animation: "hero-text-in 0.9s cubic-bezier(0.16,1,0.3,1) both" }}>

            {/* Eyebrow tag */}
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-flex items-center gap-2 text-[11px] font-700 tracking-[0.18em] uppercase text-[#008080] bg-[#008080]/15 border border-[#008080]/30 px-3 py-1.5 rounded-full backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#008080] animate-pulse" />
                {s.tag ?? "Ekta Digital"}
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-900 text-white leading-[0.92] tracking-[-0.04em] mb-6" style={{ fontSize: "clamp(48px, 7.5vw, 96px)" }}>
              {headline.map((line, i) => (
                <span key={i} className="block" style={{ animationDelay: `${i * 80}ms` }}>{line}</span>
              ))}
            </h1>

            {/* Subtitle */}
            {s.sub && (
              <p className="text-white/65 font-400 leading-relaxed mb-10" style={{ fontSize: "clamp(15px, 2vw, 19px)", maxWidth: "480px" }}>
                {s.sub}
              </p>
            )}

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 mb-12">
              <button
                onClick={() => navigate(s.cta_href ?? s.href ?? "/shop")}
                className="group flex items-center gap-2 px-8 py-4 bg-[#008080] text-white rounded-full font-700 transition-all duration-300 hover:bg-[#00a0a0] hover:shadow-[0_8px_32px_rgba(0,128,128,0.5)] active:scale-[0.97]"
                style={{ fontSize: "clamp(14px, 1.5vw, 16px)" }}
              >
                {s.cta_text ?? s.cta ?? "Shop Now"}
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
              </button>
              <button
                onClick={() => navigate("/shop")}
                className="px-8 py-4 bg-white/10 text-white border border-white/25 rounded-full font-600 backdrop-blur-sm hover:bg-white/20 hover:border-white/40 transition-all duration-300 active:scale-[0.97]"
                style={{ fontSize: "clamp(14px, 1.5vw, 16px)" }}
              >
                Browse All →
              </button>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap gap-4">
              {[
                { icon: "⚡", text: "Same-day Delivery" },
                { icon: "🔒", text: "100% Genuine" },
                { icon: "⭐", text: "Earn Loyalty Points" },
              ].map((t) => (
                <div key={t.text} className="flex items-center gap-1.5">
                  <span className="text-[14px]">{t.icon}</span>
                  <span className="text-[12px] font-500 text-white/55">{t.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Slide navigation ─────────────────────────────────────────── */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4">
          <button
            onClick={prev}
            className="w-9 h-9 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/25 transition-all duration-200"
            aria-label="Previous slide"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Dot indicators */}
          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => gotoSlide(i)}
                className={`rounded-full transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  i === slideIdx
                    ? "bg-[#008080] w-8 h-2 shadow-[0_0_8px_rgba(0,128,128,0.8)]"
                    : "bg-white/30 w-2 h-2 hover:bg-white/60"
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="w-9 h-9 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/25 transition-all duration-200"
            aria-label="Next slide"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* ── Slide counter ─────────────────────────────────────────────── */}
        <div className="absolute bottom-12 right-8 z-30 hidden md:flex items-center gap-2 text-white/40">
          <span className="text-[13px] font-700 text-white/80">{String(slideIdx + 1).padStart(2, "0")}</span>
          <div className="w-16 h-px bg-white/20"><div className="h-px bg-white/60" style={{ width: `${((slideIdx + 1) / slides.length) * 100}%` }} /></div>
          <span className="text-[13px]">{String(slides.length).padStart(2, "0")}</span>
        </div>

        {/* ── Scroll indicator ──────────────────────────────────────────── */}
        <div className="absolute bottom-10 left-8 z-30 hidden md:flex flex-col items-center gap-2" style={{ animation: "fade-in 2s ease 2s both" }}>
          <div className="w-5 h-8 border border-white/25 rounded-full flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 bg-white/60 rounded-full" style={{ animation: "scroll-dot 2s ease-in-out infinite" }} />
          </div>
          <span className="text-[9px] font-600 uppercase tracking-[0.2em] text-white/35 rotate-90 origin-center translate-y-3">Scroll</span>
        </div>
      </section>

      {/* ── TRUST BAR ─────────────────────────────────────────────────────── */}
      <section className="bg-[#1d1d1f]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/[0.06]">
            {TRUST.map((t, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-5">
                <div className="text-[#008080] shrink-0">{t.icon}</div>
                <div>
                  <p className="text-[13px] font-600 text-white">{t.title}</p>
                  <p className="text-[12px] text-[#86868b]">{t.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ────────────────────────────────────────────────────── */}
      <section className="py-28 bg-[#fbfbfd]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="mb-14 fade-up">
            <p className="section-eyebrow mb-3">Browse by Category</p>
            <h2 className="section-title">What are you looking for?</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIES.map((cat, i) => (
              <Link
                key={i}
                to={`/shop/${cat.slug}`}
                className="fade-up group relative bg-white rounded-[24px] p-8 border border-[#f5f5f7] hover:border-[#008080]/20 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-1 cursor-pointer overflow-hidden"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#e6f4f4]/0 to-[#e6f4f4]/0 group-hover:from-[#e6f4f4]/30 group-hover:to-transparent transition-all duration-500" />
                <span className="text-[48px] mb-4 block">{cat.emoji}</span>
                <p className="text-[16px] font-700 tracking-[-0.02em] text-[#1d1d1f] mb-1">{cat.name}</p>
                <p className="text-[13px] text-[#008080] font-600 flex items-center gap-1 group-hover:gap-2 transition-all duration-200">
                  Browse <ArrowRight size={13} />
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED ──────────────────────────────────────────────────────── */}
      <section className="py-28 bg-white">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex items-end justify-between mb-14 fade-up">
            <div>
              <p className="section-eyebrow mb-3">Hand-picked</p>
              <h2 className="section-title">Staff Picks</h2>
            </div>
            <Link to="/shop?featured=true" className="flex items-center gap-1.5 text-[#008080] font-600 text-[14px] hover:gap-3 transition-all duration-200">
              View All <ArrowRight size={15} />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => <div key={i} className="bg-[#f5f5f7] rounded-[20px] aspect-[3/4] shimmer" />)}
            </div>
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {featured.map((p, i) => (
                <div key={p.id} className="fade-up" style={{ transitionDelay: `${i * 80}ms` }}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-[#6e6e73]">Products coming soon.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── LOYALTY BANNER ────────────────────────────────────────────────── */}
      <section className="py-28 bg-[#1d1d1f] relative overflow-hidden">
        {/* decorative */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_80%_60%_at_70%_50%,rgba(0,128,128,0.18)_0%,transparent_70%)] pointer-events-none" />
        <div className="max-w-[1200px] mx-auto px-6 grid md:grid-cols-2 gap-16 items-center relative">
          <div className="fade-up">
            <p className="text-[11px] font-700 tracking-[0.16em] uppercase text-[#008080] mb-4">Ekta Rewards</p>
            <h2 className="text-[clamp(48px,6vw,80px)] font-900 leading-[0.95] tracking-[-0.04em] text-white mb-6">
              Shop.<br />Earn.<br /><span className="text-[#008080]">Save.</span>
            </h2>
            <p className="text-[17px] font-400 text-[#86868b] leading-relaxed mb-10 max-w-md">
              Earn loyalty points on every purchase. Redeem them for real money off your next order.
            </p>
            <button
              onClick={() => navigate("/register")}
              className="px-8 py-4 bg-[#008080] text-white rounded-full text-[16px] font-600 hover:bg-[#00a0a0] transition-colors shadow-[0_4px_20px_rgba(0,128,128,0.4)]"
            >
              Join Free — Start Earning
            </button>
          </div>
          <div className="fade-up flex justify-center" style={{ transitionDelay: "120ms" }}>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-[28px] p-10 text-center max-w-xs w-full">
              <Star size={36} className="text-[#ffd60a] mx-auto mb-5 fill-[#ffd60a]" />
              <p className="text-[72px] font-900 tracking-[-0.04em] text-white leading-none mb-2">1K</p>
              <p className="text-[15px] text-[#86868b] mb-8">points = TZS 5,000 off</p>
              <div className="space-y-3 text-left">
                {[
                  "1 point per TZS 1,000 spent",
                  "Redeem at checkout instantly",
                  "Points never expire",
                ].map((t) => (
                  <div key={t} className="flex items-center gap-3 text-[13px] text-[#86868b]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#008080] shrink-0" />
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── NEW ARRIVALS ──────────────────────────────────────────────────── */}
      <section className="py-28 bg-[#fbfbfd]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex items-end justify-between mb-14 fade-up">
            <div>
              <p className="section-eyebrow mb-3">Just Landed</p>
              <h2 className="section-title">New Arrivals</h2>
            </div>
            <Link to="/shop?new_arrivals=true" className="flex items-center gap-1.5 text-[#008080] font-600 text-[14px] hover:gap-3 transition-all duration-200">
              View All <ArrowRight size={15} />
            </Link>
          </div>
          <div className="flex md:grid md:grid-cols-4 gap-6 overflow-x-auto md:overflow-visible pb-2 md:pb-0 -mx-6 px-6 md:mx-0 md:px-0 scrollbar-hide">
            {arrivals.map((p, i) => (
              <div key={p.id} className="min-w-[260px] md:min-w-0 fade-up" style={{ transitionDelay: `${i * 60}ms` }}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── B2B ───────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white border-t border-b border-[#f5f5f7]">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8 fade-up">
          <div>
            <p className="section-eyebrow mb-2">For Businesses</p>
            <h2 className="text-[36px] font-800 tracking-[-0.03em] text-[#1d1d1f] mb-2">Running a business?</h2>
            <p className="text-[16px] text-[#6e6e73] max-w-lg">Exclusive B2B pricing, bulk discounts, flexible payment terms, dedicated support.</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <button onClick={() => navigate("/quote")} className="px-6 py-3.5 bg-[#008080] text-white rounded-full font-600 text-[15px] hover:bg-[#006666] transition-colors">
              Request Quote
            </button>
            <button onClick={() => navigate("/register?type=b2b")} className="px-6 py-3.5 bg-[#f5f5f7] text-[#1d1d1f] rounded-full font-600 text-[15px] hover:bg-[#ebebeb] transition-colors">
              Open B2B Account
            </button>
          </div>
        </div>
      </section>

      {/* ── PAYMENT METHODS ───────────────────────────────────────────────── */}
      <section className="py-16 bg-[#fbfbfd]">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <p className="text-[11px] font-700 tracking-[0.14em] uppercase text-[#86868b] mb-6">We Accept</p>
          <div className="flex flex-wrap justify-center gap-3 items-center">
            {["M-Pesa", "Airtel Money", "CRDB Bank", "Selcom Pesa", "Visa", "Mastercard", "PayPal"].map((m) => (
              <span key={m} className="bg-white border border-[#e5e5ea] text-[#1d1d1f] text-[13px] font-500 px-5 py-2.5 rounded-full shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                {m}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ────────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-[540px] mx-auto px-6 text-center fade-up">
          <p className="section-eyebrow mb-3">Stay in the Loop</p>
          <h2 className="text-[40px] font-800 tracking-[-0.03em] text-[#1d1d1f] mb-3">
            Deals before everyone else.
          </h2>
          <p className="text-[16px] text-[#6e6e73] mb-10">Monthly offers, new arrivals, exclusive discounts. Unsubscribe anytime.</p>
          {newsletter.done ? (
            <div className="bg-[#e6f4f4] rounded-[16px] px-6 py-4 text-[#008080] font-600 text-[15px]">
              ✓ You're in! Watch your inbox.
            </div>
          ) : (
            <form
              onSubmit={(e) => { e.preventDefault(); setNewsletter({ ...newsletter, done: true }); }}
              className="flex gap-2 max-w-md mx-auto"
            >
              <input
                type="email"
                placeholder="your@email.com"
                required
                value={newsletter.email}
                onChange={(e) => setNewsletter({ ...newsletter, email: e.target.value })}
                className="flex-1 h-[52px] px-5 rounded-full border border-[#d2d2d7] bg-[#f5f5f7] text-[15px] outline-none focus:border-[#008080] focus:bg-white transition-all"
              />
              <button type="submit" className="px-6 h-[52px] bg-[#008080] text-white rounded-full font-600 text-[15px] hover:bg-[#006666] transition-colors whitespace-nowrap">
                Subscribe
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
