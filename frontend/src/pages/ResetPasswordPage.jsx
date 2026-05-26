import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { KeyRound } from "lucide-react";
import api from "../lib/api";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const token  = searchParams.get("token") ?? "";
  const email  = searchParams.get("email") ?? "";
  const [form,    setForm]    = useState({ password: "", password_confirmation: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    if (form.password !== form.password_confirmation) { toast.error("Passwords do not match"); return; }
    setLoading(true);
    try {
      await api.post("/reset-password", { token, email, ...form });
      toast.success("Password reset! Please sign in.", { icon: "🔑" });
      navigate("/login");
    } catch (e) { toast.error(e.response?.data?.message ?? "Reset failed. Try requesting a new link."); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#fbfbfd] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-[400px]">
        <div className="bg-white rounded-[24px] border border-[#f5f5f7] p-10 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
          <div className="w-12 h-12 bg-[#e6f4f4] rounded-[14px] flex items-center justify-center mb-6"><KeyRound size={22} className="text-[#008080]" /></div>
          <h1 className="text-[32px] font-900 tracking-[-0.03em] text-[#1d1d1f] mb-2">New password</h1>
          <p className="text-[14px] text-[#6e6e73] mb-8">For <strong className="text-[#1d1d1f]">{email}</strong></p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {[["password","New Password"],["password_confirmation","Confirm Password"]].map(([k,l]) => (
              <div key={k}>
                <label className="block text-[12px] font-600 text-[#6e6e73] mb-1.5">{l}</label>
                <input type="password" required value={form[k]} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} className="w-full h-[52px] px-4 rounded-[14px] border border-[#d2d2d7] bg-[#fbfbfd] text-[15px] outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/10 transition-all" />
              </div>
            ))}
            <button type="submit" disabled={loading} className="w-full h-[52px] bg-[#1d1d1f] text-white rounded-full font-700 text-[16px] hover:bg-[#2d2d2f] transition-all disabled:opacity-50 flex items-center justify-center">
              {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Set New Password →"}
            </button>
          </form>
          <p className="text-center mt-6"><Link to="/login" className="text-[13px] font-500 text-[#6e6e73] hover:text-[#1d1d1f] transition-colors">Back to Sign In</Link></p>
        </div>
      </div>
    </div>
  );
}
