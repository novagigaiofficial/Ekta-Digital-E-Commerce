import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const navigate      = useNavigate();
  const [searchParams] = useSearchParams();
  const { register }  = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState(searchParams.get("type") === "b2b" ? "b2b" : "b2c");
  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", phone: "",
    password: "", password_confirmation: "", company_name: "", business_reg_number: "",
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.password_confirmation) { toast.error("Passwords do not match"); return; }
    setLoading(true);
    try {
      await register({ ...form, account_type: type });
      toast.success("Account created!", { icon: "🎉", style: { background: "#1d1d1f", color: "#fff", borderRadius: "12px" } });
      navigate("/account");
    } catch (e) {
      const errors = e.response?.data?.errors;
      if (errors) Object.values(errors).flat().forEach((m) => toast.error(m));
      else toast.error(e.response?.data?.message ?? "Registration failed");
    } finally { setLoading(false); }
  };

  const Field = ({ k, label, type: t = "text", placeholder, half = false }) => (
    <div className={half ? "" : "col-span-2"}>
      <label className="block text-[12px] font-600 text-[#6e6e73] mb-1.5">{label}</label>
      <input
        type={t} placeholder={placeholder ?? label} value={form[k]} onChange={set(k)}
        required={!["phone","company_name","business_reg_number"].includes(k)}
        className="w-full h-[52px] px-4 rounded-[14px] border border-[#d2d2d7] bg-white text-[15px] outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/10 transition-all"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fbfbfd] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-[480px]">
        <div className="text-center mb-10">
          <p className="text-[11px] font-700 tracking-[0.16em] uppercase text-[#008080] mb-3">Get started</p>
          <h1 className="text-[40px] font-900 tracking-[-0.04em] text-[#1d1d1f]">Create account</h1>
        </div>

        {/* Type toggle */}
        <div className="flex bg-[#f5f5f7] rounded-full p-1 mb-8">
          {[{ val: "b2c", label: "Personal" }, { val: "b2b", label: "Business" }].map((t) => (
            <button
              key={t.val}
              type="button"
              onClick={() => setType(t.val)}
              className={`flex-1 py-2.5 rounded-full text-[14px] font-700 transition-all duration-300 ${type === t.val ? "bg-white text-[#1d1d1f] shadow-[0_1px_6px_rgba(0,0,0,0.08)]" : "text-[#6e6e73]"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Field k="first_name" label="First Name" half />
            <Field k="last_name"  label="Last Name"  half />
          </div>
          <div className="space-y-4 mb-4">
            <Field k="email"    label="Email Address"  t="email" />
            <Field k="phone"    label="Phone (optional)" t="tel" />
            {type === "b2b" && <>
              <Field k="company_name"        label="Company Name" />
              <Field k="business_reg_number" label="Business Registration No. (optional)" />
            </>}
            <Field k="password"              label="Password"         t="password" />
            <Field k="password_confirmation" label="Confirm Password" t="password" />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-[52px] bg-[#1d1d1f] text-white rounded-full font-700 text-[16px] hover:bg-[#2d2d2f] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.12)]"
          >
            {loading
              ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : "Create Account →"
            }
          </button>
        </form>

        <p className="text-center text-[14px] text-[#6e6e73] mt-8">
          Already have an account?{" "}
          <Link to="/login" className="font-700 text-[#1d1d1f] hover:text-[#008080] transition-colors">Sign In</Link>
        </p>

        <p className="text-center text-[12px] text-[#86868b] mt-4 leading-relaxed">
          By creating an account, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
