import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingBag, Search, Heart, X, ChevronDown, LayoutDashboard } from "lucide-react";
import useCartStore       from "../../store/cartStore";
import useAuthStore       from "../../store/authStore";
import useCartDrawerStore from "../../store/cartDrawerStore";
import api                from "../../lib/api";

const NAV = [
  { label: "Home Appliances", href: "/shop/home-appliances"  },
  { label: "IT & Office",     href: "/shop/it-office"        },
  { label: "Printers",        href: "/shop/printers-toners"  },
  { label: "Deals",           href: "/shop?featured=true"    },
  { label: "Quote",           href: "/quote"                 },
];

export default function Navbar() {
  const [scrolled,    setScrolled]    = useState(false);
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchRes,   setSearchRes]   = useState([]);
  const [searching,   setSearching]   = useState(false);
  const count        = useCartStore((s) => s.getCount());
  const { user, logout } = useAuthStore();
  const { open: openCart } = useCartDrawerStore();
  const navigate  = useNavigate();
  const location  = useLocation();
  const isAdmin   = user?.account_type === "admin";

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); setSearchOpen(false); }, [location]);

  // Search with debounce
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchRes([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.get("/products", { params: { search: searchQuery, per_page: 5 } });
        setSearchRes(res.data.data ?? []);
      } catch {} finally { setSearching(false); }
    }, 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const handleLogout = async () => { await logout(); navigate("/"); };

  return (
    <>
      <header className={`
        fixed top-0 left-0 right-0 z-50 glass-nav
        transition-all duration-300
        ${scrolled ? "shadow-[0_1px_0_rgba(0,0,0,0.08)]" : ""}
      `}>
        <div className="max-w-[1200px] mx-auto px-6 h-[52px] flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="font-900 text-[19px] tracking-[-0.04em] shrink-0 z-10">
            <span className="text-[#008080]">Ekta</span>
            <span className="text-[#1d1d1f]"> Digital</span>
          </Link>

          {/* Center nav — desktop */}
          <nav className="hidden md:flex items-center gap-7 absolute left-1/2 -translate-x-1/2">
            {NAV.map((l) => (
              <Link
                key={l.label}
                to={l.href}
                className={`
                  text-[13px] font-500 transition-colors duration-200
                  ${location.pathname === l.href
                    ? "text-[#008080]"
                    : "text-[#1d1d1f] hover:text-[#008080]"
                  }
                `}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1 z-10">

            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#f5f5f7] transition-colors"
              aria-label="Search"
            >
              <Search size={17} className="text-[#1d1d1f]" />
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#f5f5f7] transition-colors"
              aria-label="Wishlist"
            >
              <Heart size={17} className="text-[#1d1d1f]" />
            </Link>

            {/* Cart */}
            <button
              onClick={openCart}
              className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#f5f5f7] transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag size={17} className="text-[#1d1d1f]" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#008080] text-white text-[9px] font-800 w-4 h-4 rounded-full flex items-center justify-center leading-none">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </button>

            {/* User */}
            {user ? (
              <div className="relative group ml-1">
                <button className="flex items-center gap-1.5 pl-2 pr-3 h-8 rounded-full bg-[#f5f5f7] hover:bg-[#ebebeb] transition-colors">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-800 text-white ${isAdmin ? "bg-purple-600" : "bg-[#008080]"}`}>
                    {user.first_name?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-[12px] font-600 text-[#1d1d1f] hidden sm:block">{user.first_name}</span>
                  <ChevronDown size={11} className="text-[#6e6e73] hidden sm:block" />
                </button>
                {/* Dropdown */}
                <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="bg-white rounded-[16px] shadow-[0_8px_40px_rgba(0,0,0,0.14)] p-2 min-w-[200px] border border-[rgba(0,0,0,0.06)]">
                    <div className="px-3 py-2.5 mb-1">
                      <p className="text-[13px] font-700 text-[#1d1d1f]">{user.first_name} {user.last_name}</p>
                      <p className="text-[11px] text-[#6e6e73] capitalize">{user.account_type} account</p>
                    </div>
                    {isAdmin && (
                      <Link to="/admin" className="flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-[13px] font-600 text-purple-600 hover:bg-purple-50 transition-colors">
                        <LayoutDashboard size={14} />Admin Panel
                      </Link>
                    )}
                    {[
                      { label: "My Account", to: "/account"                              },
                      { label: "My Orders",  to: "/account", state: { tab: "orders"   } },
                      { label: "Wishlist",   to: "/wishlist"                             },
                    ].map((item) => (
                      <Link key={item.label} to={item.to} state={item.state}
                        className="flex items-center px-3 py-2 rounded-[10px] text-[13px] font-500 text-[#1d1d1f] hover:bg-[#f5f5f7] transition-colors">
                        {item.label}
                      </Link>
                    ))}
                    <div className="border-t border-[#f5f5f7] mt-1 pt-1">
                      <button onClick={handleLogout} className="w-full text-left flex items-center px-3 py-2 rounded-[10px] text-[13px] font-500 text-[#ff3b30] hover:bg-red-50 transition-colors">
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="ml-1 px-4 h-8 inline-flex items-center rounded-full bg-[#008080] text-white text-[12px] font-600 hover:bg-[#006666] transition-colors"
              >
                Sign In
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#f5f5f7] transition-colors ml-1"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <div className="w-4 h-3 flex flex-col justify-between">
                <span className={`block h-0.5 bg-[#1d1d1f] rounded-full transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-1.5" : ""}`} />
                <span className={`block h-0.5 bg-[#1d1d1f] rounded-full transition-all duration-300 ${menuOpen ? "opacity-0 scale-x-0" : ""}`} />
                <span className={`block h-0.5 bg-[#1d1d1f] rounded-full transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* ── Full-screen search overlay ─────────────────────────────────────── */}
      {searchOpen && (
        <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-xl flex flex-col">
          <div className="max-w-[640px] mx-auto w-full px-6 pt-20">
            <div className="flex items-center gap-4 border-b-2 border-[#008080] pb-3 mb-6">
              <Search size={20} className="text-[#008080] shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Search products, brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
                    setSearchOpen(false);
                  }
                }}
                className="flex-1 text-[24px] font-300 text-[#1d1d1f] bg-transparent outline-none placeholder:text-[#d2d2d7]"
              />
              <button onClick={() => { setSearchOpen(false); setSearchQuery(""); }} className="text-[#6e6e73] hover:text-[#1d1d1f] transition-colors">
                <X size={22} />
              </button>
            </div>
            {searching && <div className="flex gap-2 items-center text-[#6e6e73]"><span className="w-4 h-4 border-2 border-[#008080]/30 border-t-[#008080] rounded-full animate-spin" /><span className="text-[14px]">Searching...</span></div>}
            {searchRes.length > 0 && (
              <div className="space-y-1">
                {searchRes.map((p) => (
                  <button key={p.id} onClick={() => { navigate(`/product/${p.slug}`); setSearchOpen(false); setSearchQuery(""); }}
                    className="w-full flex items-center gap-4 p-3 rounded-[14px] hover:bg-[#f5f5f7] transition-colors text-left">
                    <div className="w-12 h-12 bg-[#f5f5f7] rounded-[10px] flex items-center justify-center shrink-0 overflow-hidden">
                      <img src={p.images?.[0]} alt="" className="w-full h-full object-contain p-1" onError={(e) => { e.target.style.display="none"; }} />
                    </div>
                    <div>
                      <p className="text-[14px] font-600 text-[#1d1d1f]">{p.name}</p>
                      <p className="text-[12px] text-[#6e6e73]">{p.brand} · {p.offer_price_tzs ? `TZS ${Number(p.offer_price_tzs).toLocaleString()}` : `TZS ${Number(p.base_price_tzs).toLocaleString()}`}</p>
                    </div>
                  </button>
                ))}
                <button onClick={() => { navigate(`/shop?search=${encodeURIComponent(searchQuery)}`); setSearchOpen(false); }}
                  className="w-full text-center text-[13px] font-600 text-[#008080] py-3 hover:underline">
                  See all results for "{searchQuery}" →
                </button>
              </div>
            )}
            {!searching && searchQuery && searchRes.length === 0 && (
              <p className="text-[15px] text-[#6e6e73]">No results for "<strong className="text-[#1d1d1f]">{searchQuery}</strong>"</p>
            )}
            {!searchQuery && (
              <div>
                <p className="text-[11px] font-700 uppercase tracking-[0.12em] text-[#6e6e73] mb-3">Quick Links</p>
                <div className="flex flex-wrap gap-2">
                  {["Home Appliances","IT & Office","Printers","Deals","New Arrivals"].map((t) => (
                    <button key={t} onClick={() => { navigate(`/shop?search=${encodeURIComponent(t)}`); setSearchOpen(false); }}
                      className="px-4 py-2 bg-[#f5f5f7] text-[#1d1d1f] text-[13px] font-500 rounded-full hover:bg-[#ebebeb] transition-colors">
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Mobile menu ────────────────────────────────────────────────────── */}
      {menuOpen && (
        <div className="fixed inset-0 z-[90] bg-white/98 backdrop-blur-xl pt-[52px] md:hidden">
          <nav className="px-6 py-8 space-y-1">
            {NAV.map((l) => (
              <Link key={l.label} to={l.href} onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between py-4 border-b border-[#f5f5f7] text-[18px] font-500 text-[#1d1d1f]">
                {l.label}<span className="text-[#6e6e73] text-[20px]">›</span>
              </Link>
            ))}
            {user ? (
              <>
                <Link to="/account" onClick={() => setMenuOpen(false)} className="flex items-center justify-between py-4 border-b border-[#f5f5f7] text-[18px] font-500 text-[#1d1d1f]">
                  My Account<span className="text-[#6e6e73] text-[20px]">›</span>
                </Link>
                <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="w-full text-left py-4 text-[18px] font-500 text-[#ff3b30]">
                  Sign Out
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)} className="block py-4 text-[18px] font-600 text-[#008080]">
                Sign In
              </Link>
            )}
          </nav>
        </div>
      )}
    </>
  );
}
