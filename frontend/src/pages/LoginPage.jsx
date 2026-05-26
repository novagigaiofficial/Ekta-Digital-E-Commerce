import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(form.email, form.password);
      toast.success("Welcome back!", { icon: "👋", style: { background: "#1d1d1f", color: "#fff", borderRadius: "12px" } });
      navigate(res.user?.account_type === "admin" ? "/admin" : "/account");
    } catch (e) {
      toast.error(e.response?.data?.message ?? "Incorrect email or password");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#fbfbfd] flex">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex flex-1 bg-[#1d1d1f] items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_30%_50%,rgba(0,128,128,0.25)_0%,transparent_70%)]" />
        <div className="relative z-10 text-center px-12">
          <p className="text-[20px] font-800 tracking-[-0.03em] mb-1">
            <span className="text-[#008080]">Ekta</span><span className="text-white"> Digital</span>
          </p>
          <p className="text-[14px] text-[#86868b] mb-12">Digitalise Your Lifestyle</p>
          <h2 className="text-[52px] font-900 tracking-[-0.04em] text-white leading-[0.95] mb-6">
            Your shop,<br /><span className="text-[#008080]">your way.</span>
          </h2>
          <p className="text-[16px] text-[#86868b] leading-relaxed max-w-sm">
            Home appliances, IT gear, printers — all in one place. Same-day delivery in Dar-es-Salaam.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-[400px]">
          <div className="mb-10">
            <p className="text-[11px] font-700 tracking-[0.16em] uppercase text-[#008080] mb-3">Welcome back</p>
            <h1 className="text-[40px] font-900 tracking-[-0.04em] text-[#1d1d1f] leading-[0.95]">Sign in</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: "email",    label: "Email",    type: "email",    placeholder: "you@example.com"  },
              { key: "password", label: "Password", type: "password", placeholder: "Your password"    },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-[12px] font-600 text-[#6e6e73] mb-1.5">{f.label}</label>
                <input
                  type={f.type}
                  placeholder={f.placeholder}
                  value={form[f.key]}
                  onChange={set(f.key)}
                  required
                  className="w-full h-[52px] px-4 rounded-[14px] border border-[#d2d2d7] bg-white text-[15px] text-[#1d1d1f] outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/10 transition-all"
                />
              </div>
            ))}

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-[13px] font-500 text-[#008080] hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[52px] bg-[#1d1d1f] text-white rounded-full font-700 text-[16px] hover:bg-[#2d2d2f] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(0,0,0,0.12)]"
            >
              {loading
                ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : "Sign In →"
              }
            </button>
          </form>

          <p className="text-center text-[14px] text-[#6e6e73] mt-8">
            New to Ekta Digital?{" "}
            <Link to="/register" className="font-700 text-[#1d1d1f] hover:text-[#008080] transition-colors">
              Create account
            </Link>
          </p>

          {/* B2B */}
          <div className="mt-6 p-5 bg-[#f5f5f7] rounded-[18px] text-center">
            <p className="text-[13px] text-[#6e6e73] mb-2">Running a business?</p>
            <Link to="/register?type=b2b" className="text-[14px] font-700 text-[#008080] hover:underline">
              Open a B2B Account →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
