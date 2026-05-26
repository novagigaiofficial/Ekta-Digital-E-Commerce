import React, { useEffect, useState, useCallback } from "react";
import { Search } from "lucide-react";
import api from "../../lib/api";

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [typeFilter,setTypeFilter]= useState("all");
  const [page,      setPage]      = useState(1);
  const [lastPage,  setLastPage]  = useState(1);
  const [total,     setTotal]     = useState(0);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page };
      if (search)                          params.search       = search;
      if (typeFilter && typeFilter !== "all") params.account_type = typeFilter;
      const res = await api.get("/admin/customers", { params });
      setCustomers(res.data.data ?? []);
      setLastPage(res.data.last_page ?? 1);
      setTotal(res.data.total ?? 0);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [search, typeFilter, page]);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchCustomers();
    }, 400);

    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    fetchCustomers();
  }, [typeFilter, page]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-muted mb-1">Management</p>
        <h1 className="text-[28px] font-bold tracking-[-0.8px] text-ink">Customers</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Customers",   value: total           },
          { label: "B2C Customers",     value: customers.filter((c) => c.account_type === "b2c").length },
          { label: "B2B Customers",     value: customers.filter((c) => c.account_type === "b2b").length },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl2 shadow-card p-4 text-center">
            <p className="text-[24px] font-bold text-ink">{s.value}</p>
            <p className="text-[12px] text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-rule bg-white text-[13px] outline-none focus:border-teal transition-all"
          />
        </div>
        <div className="flex gap-2">
          {["all", "b2c", "b2b"].map((t) => (
            <button
              key={t}
              onClick={() => { setTypeFilter(t); setPage(1); }}
              className={`px-4 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-wide transition-all ${
                typeFilter === t ? "bg-teal text-white" : "bg-white text-muted border border-rule hover:border-teal"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl2 shadow-card overflow-hidden">
        {loading ? (
          <div className="p-10 text-center">
            <div className="w-8 h-8 border-2 border-teal border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : customers.length === 0 ? (
          <div className="p-10 text-center text-muted">No customers found</div>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-rule bg-soft">
                {["Name","Email","Phone","Type","Points","Orders","Joined"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-bold tracking-wider uppercase text-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-rule last:border-0 hover:bg-soft transition-colors">
                  <td className="px-4 py-3 font-semibold text-ink">{c.first_name} {c.last_name}</td>
                  <td className="px-4 py-3 text-muted max-w-[180px] truncate">{c.email}</td>
                  <td className="px-4 py-3 text-muted">{c.phone ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-bold uppercase px-2 py-1 rounded-full ${
                      c.account_type === "b2b" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                    }`}>{c.account_type}</span>
                  </td>
                  <td className="px-4 py-3 text-teal font-semibold">{c.loyalty_points_balance}</td>
                  <td className="px-4 py-3 text-muted">{c.orders_count}</td>
                  <td className="px-4 py-3 text-muted">{new Date(c.created_at).toLocaleDateString("en-TZ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {lastPage > 1 && (
          <div className="flex justify-center gap-2 py-4 border-t border-rule">
            {[...Array(lastPage)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-8 h-8 rounded-full text-[12px] font-semibold transition-all ${
                  page === i + 1 ? "bg-teal text-white" : "bg-soft text-muted hover:bg-teal-light"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
