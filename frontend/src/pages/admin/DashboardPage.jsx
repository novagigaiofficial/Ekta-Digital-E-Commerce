import React, { useEffect, useState } from "react";
import { TrendingUp, ShoppingBag, Users, MessageSquare, AlertTriangle } from "lucide-react";
import api from "../../lib/api";
import { formatPrice } from "../../lib/utils";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(()=>{api.get("/admin/dashboard").then(r=>setData(r.data)).catch(e=>{console.error(e);}).finally(()=>setLoading(false));}, []);
  if(loading) return <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_,i)=>(<div key={i} className="bg-white rounded-xl2 h-28 animate-pulse"/>))}</div>;
  const kpis=[{label:"Total Revenue",value:formatPrice(data?.total_revenue_tzs??0),icon:<TrendingUp size={20}/>,color:"bg-teal text-white"},{label:"Orders Today",value:data?.orders_today??0,icon:<ShoppingBag size={20}/>,color:"bg-blue-500 text-white"},{label:"Total Customers",value:data?.active_customers??0,icon:<Users size={20}/>,color:"bg-purple-500 text-white"},{label:"Pending Quotes",value:data?.pending_quotes??0,icon:<MessageSquare size={20}/>,color:"bg-yellow-500 text-white"}];
  return (
    <div className="space-y-6">
      <div><p className="text-[11px] font-bold tracking-[0.15em] uppercase text-muted mb-1">Admin</p><h1 className="text-[28px] font-bold tracking-[-0.8px] text-ink">Dashboard</h1></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k=>(<div key={k.label} className="bg-white rounded-xl2 p-5 shadow-card"><div className="flex items-center justify-between mb-3"><p className="text-[12px] font-semibold text-muted uppercase tracking-wide">{k.label}</p><div className={`w-9 h-9 rounded-xl flex items-center justify-center ${k.color}`}>{k.icon}</div></div><p className="text-[28px] font-bold tracking-[-1px] text-ink">{k.value}</p></div>))}
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl2 shadow-card p-6">
          <h3 className="font-bold text-[16px] text-ink mb-6">Revenue — Last 7 Days</h3>
          {data?.revenue_7_days?.length>0?(
            <div className="flex items-end gap-2 h-32">
              {data.revenue_7_days.map((d,i)=>{const max=Math.max(...data.revenue_7_days.map(x=>x.total));const pct=max>0?(d.total/max)*100:0;return(<div key={i} className="flex-1 flex flex-col items-center gap-1"><div style={{height:`${pct}%`}} className="w-full bg-teal rounded-t-lg min-h-[4px] transition-all duration-500"/><p className="text-[9px] text-muted">{new Date(d.date).toLocaleDateString("en-TZ",{weekday:"short"})}</p></div>);})}
            </div>
          ):<div className="h-32 flex items-center justify-center text-muted text-[14px]">No revenue data yet</div>}
        </div>
        <div className="bg-white rounded-xl2 shadow-card p-6">
          <h3 className="font-bold text-[16px] text-ink mb-4 flex items-center gap-2"><AlertTriangle size={16} className="text-yellow-500"/>Low Stock</h3>
          {data?.low_stock?.length>0?(
            <div className="space-y-3">{data.low_stock.slice(0,6).map(p=>(<div key={p.id} className="flex items-center justify-between text-[13px]"><span className="text-ink font-medium truncate flex-1">{p.name}</span><span className="text-red-500 font-bold ml-2 shrink-0">{Math.min(...(p.variants?.map(v=>v.stock_quantity)??[0]))} left</span></div>))}</div>
          ):<p className="text-muted text-[13px]">All products well stocked ✓</p>}
        </div>
      </div>
      <div className="bg-white rounded-xl2 shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-rule"><h3 className="font-bold text-[16px] text-ink">Recent Orders</h3></div>
        {data?.recent_orders?.length>0?(
          <table className="w-full text-[13px]">
            <thead><tr className="border-b border-rule bg-soft">{["Order #","Customer","Total","Status","Date"].map(h=>(<th key={h} className="text-left px-6 py-3 text-[11px] font-bold tracking-wider uppercase text-muted">{h}</th>))}</tr></thead>
            <tbody>{data.recent_orders.map(o=>(<tr key={o.id} className="border-b border-rule last:border-0 hover:bg-soft transition-colors"><td className="px-6 py-4 font-bold text-ink">{o.order_number}</td><td className="px-6 py-4 text-muted">{o.user?.first_name} {o.user?.last_name}</td><td className="px-6 py-4 font-semibold text-ink">{formatPrice(o.total_tzs)}</td><td className="px-6 py-4"><span className={`text-[11px] font-bold tracking-wide uppercase px-2 py-1 rounded-full ${{pending:"bg-yellow-100 text-yellow-700",confirmed:"bg-blue-100 text-blue-700",processing:"bg-purple-100 text-purple-700",shipped:"bg-indigo-100 text-indigo-700",delivered:"bg-green-100 text-green-700",cancelled:"bg-red-100 text-red-500"}[o.status]??"bg-gray-100 text-gray-600"}`}>{o.status}</span></td><td className="px-6 py-4 text-muted">{new Date(o.created_at).toLocaleDateString("en-TZ")}</td></tr>))}</tbody>
          </table>
        ):<div className="p-10 text-center text-muted">No orders yet</div>}
      </div>
    </div>
  );
}
