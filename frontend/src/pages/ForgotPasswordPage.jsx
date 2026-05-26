import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle } from "lucide-react";
import api from "../lib/api";

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState("");
  const [sent,    setSent]    = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try { await api.post("/forgot-password", { email }); } catch {}
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#fbfbfd] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-[400px]">
        <Link to="/login" className="inline-flex items-center gap-2 text-[13px] font-500 text-[#6e6e73] hover:text-[#1d1d1f] transition-colors mb-10">
          <ArrowLeft size={15} /> Back to Sign In
        </Link>
        <div className="bg-white rounded-[24px] border border-[#f5f5f7] p-10 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-[#e6f4f4] rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={32} className="text-[#008080]" />
              </div>
              <h2 className="text-[24px] font-800 tracking-[-0.02em] text-[#1d1d1f] mb-3">Check your email</h2>
              <p className="text-[14px] text-[#6e6e73] leading-relaxed mb-8">
                If <strong className="text-[#1d1d1f]">{email}</strong> is registered, we've sent a reset link. Check your inbox and spam folder.
              </p>
              <Link to="/login" className="w-full block text-center py-3.5 bg-[#1d1d1f] text-white rounded-full font-700 text-[15px] hover:bg-[#2d2d2f] transition-colors">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-[32px] font-900 tracking-[-0.03em] text-[#1d1d1f] mb-2">Forgot password?</h1>
              <p className="text-[15px] text-[#6e6e73] mb-8">Enter your email and we'll send a reset link.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[12px] font-600 text-[#6e6e73] mb-1.5">Email Address</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full h-[52px] px-4 rounded-[14px] border border-[#d2d2d7] bg-[#fbfbfd] text-[15px] outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/10 transition-all" />
                </div>
                <button type="submit" disabled={loading} className="w-full h-[52px] bg-[#1d1d1f] text-white rounded-full font-700 text-[16px] hover:bg-[#2d2d2f] transition-all disabled:opacity-50 flex items-center justify-center">
                  {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Send Reset Link"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
