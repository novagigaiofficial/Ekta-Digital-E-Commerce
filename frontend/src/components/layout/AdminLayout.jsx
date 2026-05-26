import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingBag, MessageSquare, Star,
  Tag, Settings, LogOut, Users, Layout, FileText, FolderOpen,
  ChevronLeft, Bell, ExternalLink
} from "lucide-react";
import useAuthStore from "../../store/authStore";

const NAV = [
  { to: "/admin",                 label: "Dashboard",         icon: LayoutDashboard, end: true  },
  { to: "/admin/orders",          label: "Orders",            icon: ShoppingBag                 },
  { to: "/admin/products",        label: "Products",          icon: Package                     },
  { to: "/admin/categories",      label: "Categories",        icon: FolderOpen                  },
  { to: "/admin/customers",       label: "Customers",         icon: Users                       },
  { to: "/admin/quotes",          label: "Quote Requests",    icon: MessageSquare               },
  { to: "/admin/loyalty",         label: "Loyalty",           icon: Star                        },
  { to: "/admin/promotions",      label: "Promotions",        icon: Tag                         },
  { to: "/admin/homepage",        label: "Homepage Builder",  icon: Layout                      },
  { to: "/admin/invoice-template",label: "Invoice Template",  icon: FileText                    },
  { to: "/admin/settings",        label: "Settings",          icon: Settings                    },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const handleLogout = async () => { await logout(); navigate("/login"); };

  return (
    <div className="flex h-screen bg-[#f5f5f7] overflow-hidden">

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className={`
        flex flex-col shrink-0
        bg-[#1d1d1f]
        transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
        ${collapsed ? "w-[60px]" : "w-[220px]"}
      `}>

        {/* Logo */}
        <div className={`
          h-14 flex items-center border-b border-white/[0.06] shrink-0
          ${collapsed ? "justify-center px-0" : "justify-between px-5"}
        `}>
          {!collapsed && (
            <span className="text-[15px] font-800 tracking-[-0.03em]">
              <span className="text-[#008080]">Ekta</span>
              <span className="text-white"> Admin</span>
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <ChevronLeft size={14} className={`text-[#86868b] transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 overflow-y-auto space-y-0.5">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) => `
                  flex items-center gap-3 h-9 rounded-[10px] px-3
                  text-[13px] font-500 transition-all duration-150
                  ${isActive
                    ? "bg-[#008080]/15 text-[#008080]"
                    : "text-[#86868b] hover:text-white hover:bg-white/5"
                  }
                  ${collapsed ? "justify-center px-0" : ""}
                `}
              >
                <Icon size={16} className="shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="p-2 border-t border-white/[0.06] space-y-0.5">
          {!collapsed && user && (
            <div className="px-3 py-2 mb-1">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#008080] flex items-center justify-center text-white text-[11px] font-700 shrink-0">
                  {user.first_name?.[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-600 text-white truncate">{user.first_name} {user.last_name}</p>
                  <p className="text-[10px] text-[#6e6e73] uppercase tracking-wider">Admin</p>
                </div>
              </div>
            </div>
          )}
          <NavLink
            to="/"
            target="_blank"
            title={collapsed ? "View Store" : undefined}
            className="flex items-center gap-3 h-9 rounded-[10px] px-3 text-[13px] font-500 text-[#86868b] hover:text-white hover:bg-white/5 transition-all"
          >
            <ExternalLink size={16} className="shrink-0" />
            {!collapsed && "View Store"}
          </NavLink>
          <button
            onClick={handleLogout}
            title={collapsed ? "Sign Out" : undefined}
            className={`flex items-center gap-3 h-9 rounded-[10px] px-3 w-full text-[13px] font-500 text-[#86868b] hover:text-[#ff453a] hover:bg-[#ff453a]/10 transition-all ${collapsed ? "justify-center px-0" : ""}`}
          >
            <LogOut size={16} className="shrink-0" />
            {!collapsed && "Sign Out"}
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <header className="h-14 bg-white/80 backdrop-blur border-b border-[#e5e5ea] flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-5 w-px bg-[#e5e5ea]" />
            <p className="text-[13px] font-500 text-[#6e6e73]">
              Welcome back, <span className="font-700 text-[#1d1d1f]">{user?.first_name}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded-full bg-[#f5f5f7] hover:bg-[#ebebeb] flex items-center justify-center transition-colors" aria-label="Notifications">
              <Bell size={15} className="text-[#1d1d1f]" />
            </button>
            <div className="w-8 h-8 rounded-full bg-[#008080] flex items-center justify-center text-white text-[12px] font-700">
              {user?.first_name?.[0]?.toUpperCase() ?? "A"}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
