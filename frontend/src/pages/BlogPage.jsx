import React, { useState, useEffect } from "react";
import { ArrowRight, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { observeFadeUp } from "../lib/utils";
import toast from "react-hot-toast";

const POSTS = [
  { id: 1, tag: "Buying Guide",    title: "How to Choose the Right Air Conditioner for Your Home",          excerpt: "From BTU ratings to inverter technology — everything you need to know before buying an AC in Tanzania.",                                                read: "5 min",  date: "May 2025", emoji: "❄️" },
  { id: 2, tag: "Tech Tips",       title: "Laser vs Inkjet: Which Printer is Right for Your Office?",       excerpt: "We break down the real cost per page, speed, and quality differences so you can make the right choice.",                                            read: "4 min",  date: "Apr 2025", emoji: "🖨️" },
  { id: 3, tag: "Business",        title: "5 Ways Ekta Digital Saves Tanzanian Businesses Money",           excerpt: "Bulk pricing, loyalty rewards, B2B invoicing — discover how over 200 businesses trust Ekta for their procurement.",                                 read: "6 min",  date: "Mar 2025", emoji: "💼" },
  { id: 4, tag: "Product Spotlight",title: "Samsung vs LG Refrigerators: A 2025 Comparison",               excerpt: "Energy ratings, capacity, smart features — we put Tanzania's two best-selling fridge brands side by side.",                                          read: "7 min",  date: "Mar 2025", emoji: "🧊" },
  { id: 5, tag: "Tech Tips",       title: "Setting Up Your Home Office: The Complete Equipment Guide",      excerpt: "Desk, monitor, printer, and connectivity — build a productive home office on any budget with our curated picks.",                                    read: "8 min",  date: "Feb 2025", emoji: "💻" },
  { id: 6, tag: "Sustainability",  title: "Energy Star Products: Save Money While Saving the Planet",       excerpt: "Every appliance with the Energy Star label can cut your electricity bill by up to 30%. Here's what to look for.",                                    read: "4 min",  date: "Jan 2025", emoji: "🌱" },
];

export default function BlogPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [done,  setDone]  = useState(false);
  useEffect(() => { setTimeout(observeFadeUp, 100); }, []);

  const [featured, ...rest] = POSTS;

  return (
    <div className="min-h-screen bg-[#fbfbfd]">
      {/* Header */}
      <div className="bg-white border-b border-[#f5f5f7] py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <p className="text-[11px] font-700 tracking-[0.16em] uppercase text-[#008080] mb-3">Insights</p>
          <h1 className="text-[clamp(40px,6vw,72px)] font-900 tracking-[-0.04em] text-[#1d1d1f] leading-[0.95]">
            Ekta Digital<br />Journal
          </h1>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-16">
        {/* Featured */}
        <div className="fade-up bg-[#1d1d1f] rounded-[28px] p-10 mb-12 relative overflow-hidden cursor-pointer hover:shadow-[0_24px_60px_rgba(0,0,0,0.18)] transition-all duration-400 group" onClick={() => toast("Full blog coming soon! Stay tuned.", { icon: "📖" })}>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_80%_50%,rgba(0,128,128,0.15)_0%,transparent_70%)]" />
          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="inline-block text-[11px] font-700 tracking-[0.12em] uppercase text-[#008080] bg-[#008080]/15 px-3 py-1 rounded-full mb-4">{featured.tag}</span>
              <h2 className="text-[32px] font-900 tracking-[-0.03em] text-white leading-snug mb-4">{featured.title}</h2>
              <p className="text-[15px] text-[#86868b] leading-relaxed mb-6">{featured.excerpt}</p>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-[12px] text-[#86868b]"><Clock size={12} />{featured.read} read</span>
                <span className="text-[12px] text-[#86868b]">{featured.date}</span>
              </div>
            </div>
            <div className="flex justify-center md:justify-end">
              <div className="w-40 h-40 bg-white/5 border border-white/10 rounded-[24px] flex items-center justify-center text-[80px] group-hover:scale-110 transition-transform duration-500">
                {featured.emoji}
              </div>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {rest.map((post, i) => (
            <div
              key={post.id}
              className="fade-up bg-white rounded-[24px] border border-[#f5f5f7] p-6 hover:border-[#008080]/20 hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] transition-all duration-400 cursor-pointer group hover:-translate-y-1"
              style={{ transitionDelay: `${i*60}ms` }}
              onClick={() => toast("Full blog coming soon! Stay tuned.", { icon: "📖" })}
            >
              <div className="w-14 h-14 bg-[#f5f5f7] rounded-[16px] flex items-center justify-center text-[32px] mb-5 group-hover:scale-110 transition-transform duration-300">
                {post.emoji}
              </div>
              <span className="text-[11px] font-700 tracking-[0.12em] uppercase text-[#008080] mb-2 block">{post.tag}</span>
              <h3 className="text-[17px] font-700 tracking-[-0.02em] text-[#1d1d1f] leading-snug mb-3 line-clamp-2">{post.title}</h3>
              <p className="text-[13px] text-[#6e6e73] leading-relaxed line-clamp-2 mb-4">{post.excerpt}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-[12px] text-[#86868b]">
                  <span className="flex items-center gap-1"><Clock size={11} />{post.read}</span>
                  <span>{post.date}</span>
                </div>
                <ArrowRight size={15} className="text-[#008080] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="bg-[#e6f4f4] rounded-[28px] p-10 text-center fade-up">
          <p className="text-[11px] font-700 tracking-[0.16em] uppercase text-[#008080] mb-3">Newsletter</p>
          <h2 className="text-[32px] font-900 tracking-[-0.03em] text-[#1d1d1f] mb-3">Never miss an insight</h2>
          <p className="text-[15px] text-[#6e6e73] mb-8">New guides and product reviews every month. No spam.</p>
          {done ? (
            <div className="text-[#008080] font-700 text-[16px]">✓ You're subscribed!</div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setDone(true); toast.success("Subscribed! We'll be in touch.", { icon: "📧" }); }} className="flex gap-2 max-w-md mx-auto">
              <input type="email" required placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1 h-[50px] px-4 rounded-full border border-[#d2d2d7] bg-white text-[15px] outline-none focus:border-[#008080] transition-all" />
              <button type="submit" className="px-6 h-[50px] bg-[#008080] text-white rounded-full font-700 text-[15px] hover:bg-[#006666] transition-colors whitespace-nowrap">Subscribe</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
