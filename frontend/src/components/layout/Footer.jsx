import React from "react";
import { Link } from "react-router-dom";
import { Instagram, MessageCircle, Mail, Phone, MapPin, ArrowUpRight } from "lucide-react";

const LINKS = {
  Shop: [
    { label: "Home Appliances",   href: "/shop/home-appliances"  },
    { label: "IT & Office",       href: "/shop/it-office"        },
    { label: "Printers & Toners", href: "/shop/printers-toners"  },
    { label: "Deals & Offers",    href: "/shop?featured=true"    },
    { label: "New Arrivals",      href: "/shop?new_arrivals=true" },
  ],
  Company: [
    { label: "About",          href: "/about"   },
    { label: "Blog",           href: "/blog"    },
    { label: "FAQ",            href: "/faq"     },
    { label: "B2B Portal",     href: "/quote"   },
    { label: "Contact",        href: "/contact" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#1d1d1f] text-white mt-32">
      {/* Top gradient bar */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#008080] to-transparent opacity-40" />

      <div className="max-w-[1200px] mx-auto px-6">
        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 pt-16 pb-12">

          {/* Brand col */}
          <div className="md:col-span-2">
            <p className="text-[22px] font-800 tracking-[-0.04em] mb-1">
              <span className="text-[#008080]">Ekta</span> Digital
            </p>
            <p className="text-[13px] text-[#86868b] mb-6">Digitalise Your Lifestyle</p>
            <p className="text-[14px] text-[#86868b] leading-relaxed mb-8 max-w-xs">
              Tanzania's premium destination for home appliances, IT equipment, and office supplies. Same-day delivery in Dar-es-Salaam.
            </p>
            <div className="flex gap-3">
              {[
                { href: "https://wa.me/255783394445", icon: <MessageCircle size={16} />, label: "WhatsApp", color: "#25D366" },
                { href: "https://instagram.com",      icon: <Instagram     size={16} />, label: "Instagram" },
                { href: "mailto:EktaDigital@outlook.com", icon: <Mail      size={16} />, label: "Email"     },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-[#86868b] hover:text-white hover:border-white/40 transition-all duration-200"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([title, links]) => (
            <div key={title}>
              <p className="text-[11px] font-700 tracking-[0.12em] uppercase text-[#86868b] mb-5">{title}</p>
              <ul className="space-y-3">
                {links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.href}
                      className="text-[14px] text-[#d1d1d6] hover:text-white transition-colors duration-200 flex items-center gap-1 group"
                    >
                      {l.label}
                      <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact col */}
          <div>
            <p className="text-[11px] font-700 tracking-[0.12em] uppercase text-[#86868b] mb-5">Contact</p>
            <div className="space-y-4">
              {[
                { icon: <Phone size={14} />,  lines: ["+255 783 394 445", "+255 747 717 000"]  },
                { icon: <Mail size={14} />,   lines: ["EktaDigital@outlook.com"]               },
                { icon: <MapPin size={14} />, lines: ["Haidary Plaza,", "India Street, Dar-es-Salaam"] },
              ].map((item, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="mt-0.5 text-[#008080] shrink-0">{item.icon}</span>
                  <div>{item.lines.map((l, j) => <p key={j} className="text-[13px] text-[#86868b]">{l}</p>)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 py-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-[#6e6e73]">
            © {new Date().getFullYear()} Ekta Digital. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {["Privacy Policy", "Terms of Use"].map((l) => (
              <Link key={l} to="/faq" className="text-[12px] text-[#6e6e73] hover:text-[#86868b] transition-colors">
                {l}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
