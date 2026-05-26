import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../lib/api";
import ProductCard from "../components/ui/ProductCard";
import Button from "../components/ui/Button";
import { observeFadeUp } from "../lib/utils";

const SORT_OPTIONS = [
  { label: "Newest",         value: "newest"     },
  { label: "Price: Low–High",value: "price_asc"  },
  { label: "Price: High–Low",value: "price_desc" },
];
const BRANDS = ["HP","Canon","Epson","Samsung","LG","Dell","Lenovo","Brother","Xerox","Panasonic","Midea","Logitech"];

export default function ShopPage() {
  const { category }   = useParams();
  const [searchParams] = useSearchParams();
  const [products,  setProducts]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [totalPages,setTotalPages]= useState(1);
  const [total,     setTotal]     = useState(0);
  const [page,      setPage]      = useState(1);
  const [filterOpen,setFilterOpen]= useState(false);
  const [filters,   setFilters]   = useState({
    brand:      searchParams.get("brand")     ?? "",
    min_price:  searchParams.get("min_price") ?? "",
    max_price:  searchParams.get("max_price") ?? "",
    sort:       searchParams.get("sort")      ?? "newest",
    search:     searchParams.get("search")    ?? "",
  });

  // Debounce ref for search
  const debounceRef = useRef(null);

  const activeFilters = Object.entries(filters).filter(([k, v]) => v && k !== "sort");

  const updateFilter = (key, value) => {
    if (key === "search") {
      // Update display immediately but debounce API call
      setFilters((f) => ({ ...f, [key]: value }));
      return;
    }
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  const removeFilter = (key) => updateFilter(key, "");

  const categoryTitle = category
    ? category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "All Products";

  const fetchProducts = useCallback(async (searchOverride) => {
    setLoading(true);
    try {
      const params = { ...filters, page };
      if (searchOverride !== undefined) params.search = searchOverride;
      if (category) params.category = category;
      const res = await api.get("/products", { params });
      setProducts(res.data.data ?? []);
      setTotalPages(res.data.last_page ?? 1);
      setTotal(res.data.total ?? 0);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filters, category, page]);

  // Debounce search changes
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchProducts(filters.search);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [filters.search]);

  // Non-search filter changes fire immediately
  useEffect(() => {
    if (!loading || page > 1) fetchProducts();
  }, [filters.brand, filters.min_price, filters.max_price, filters.sort, page, category]);

  useEffect(() => { observeFadeUp(); }, [products]);

  // Smart pagination — show max 7 page buttons
  const getPageNumbers = () => {
    if (totalPages <= 7) return [...Array(totalPages)].map((_, i) => i + 1);
    const pages = [];
    pages.push(1);
    const start = Math.max(2, page - 2);
    const end   = Math.min(totalPages - 1, page + 2);
    if (start > 2) pages.push("...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="min-h-screen bg-soft">
      <div className="bg-white border-b border-rule">
        <div className="max-w-[1200px] mx-auto px-6 py-10">
          <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-teal mb-1">Shop</p>
          <h1 className="text-[40px] font-bold tracking-[-1px] text-ink">{categoryTitle}</h1>
          {!loading && <p className="text-muted text-[14px] mt-1">{total.toLocaleString()} products</p>}
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-10">
        <div className="flex gap-10">
          {/* Sidebar filters */}
          <aside className="hidden md:block w-56 shrink-0">
            <FilterPanel filters={filters} updateFilter={updateFilter} />
          </aside>

          <div className="flex-1">
            {/* Active filters + sort bar */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div className="flex flex-wrap gap-2">
                {activeFilters.map(([key, val]) => (
                  <span key={key} className="flex items-center gap-1 bg-teal-light text-teal text-[12px] font-semibold px-3 py-1 rounded-full">
                    {val}
                    <button onClick={() => removeFilter(key)} className="ml-1 hover:opacity-70">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <button
                  className="md:hidden flex items-center gap-2 text-[13px] font-semibold border border-rule px-3 py-2 rounded-xl"
                  onClick={() => setFilterOpen(true)}
                >
                  <SlidersHorizontal size={15} />Filters
                </button>
                <div className="relative">
                  <select
                    value={filters.sort}
                    onChange={(e) => updateFilter("sort", e.target.value)}
                    className="appearance-none bg-white border border-rule rounded-xl px-4 py-2 pr-8 text-[13px] font-medium text-ink outline-none cursor-pointer"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Products grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl2 aspect-[3/4] animate-pulse" />
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {products.map((p, i) => (
                    <div key={p.id} className="fade-up" style={{ transitionDelay: `${i * 60}ms` }}>
                      <ProductCard product={p} />
                    </div>
                  ))}
                </div>

                {/* Smart pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-10">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="w-9 h-9 rounded-full flex items-center justify-center bg-white border border-rule hover:border-teal disabled:opacity-40 transition-all"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    {getPageNumbers().map((p, i) =>
                      p === "..." ? (
                        <span key={`dots-${i}`} className="w-9 h-9 flex items-center justify-center text-muted text-[14px]">…</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`w-9 h-9 rounded-full text-[13px] font-semibold transition-all ${
                            page === p ? "bg-teal text-white" : "bg-white text-ink border border-rule hover:border-teal"
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )}
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="w-9 h-9 rounded-full flex items-center justify-center bg-white border border-rule hover:border-teal disabled:opacity-40 transition-all"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-24">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-[22px] font-bold text-ink mb-2">No products found</h3>
                <p className="text-muted mb-6">Try adjusting your filters or search term.</p>
                <Button
                  onClick={() => setFilters({ brand: "", min_price: "", max_price: "", sort: "newest", search: "" })}
                  variant="secondary"
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setFilterOpen(false)} />
          <div className="relative ml-auto w-72 bg-white h-full overflow-y-auto p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-[17px]">Filters</h3>
              <button onClick={() => setFilterOpen(false)}><X size={20} /></button>
            </div>
            <FilterPanel filters={filters} updateFilter={updateFilter} />
            <Button className="w-full mt-6" onClick={() => setFilterOpen(false)}>Apply Filters</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterPanel({ filters, updateFilter }) {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-bold tracking-widest uppercase text-muted mb-3">Search</p>
        <input
          type="text"
          placeholder="Search products..."
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="w-full h-10 px-3 rounded-xl border border-rule bg-card text-[13px] outline-none focus:border-teal focus:border-2 transition-all"
        />
      </div>
      <div>
        <p className="text-[11px] font-bold tracking-widest uppercase text-muted mb-3">Brand</p>
        <div className="space-y-2">
          {BRANDS.map((b) => (
            <label key={b} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="brand"
                value={b}
                checked={filters.brand === b}
                onChange={() => updateFilter("brand", filters.brand === b ? "" : b)}
                className="accent-teal"
              />
              <span className="text-[13px] text-ink">{b}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <p className="text-[11px] font-bold tracking-widest uppercase text-muted mb-3">Price Range (TZS)</p>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.min_price}
            onChange={(e) => updateFilter("min_price", e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-rule bg-card text-[13px] outline-none focus:border-teal transition-all"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.max_price}
            onChange={(e) => updateFilter("max_price", e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-rule bg-card text-[13px] outline-none focus:border-teal transition-all"
          />
        </div>
      </div>
    </div>
  );
}
