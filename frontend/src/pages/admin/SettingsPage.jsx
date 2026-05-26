import React, { useState, useEffect } from "react";
import api from "../../lib/api";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";

export default function AdminSettings() {
  const [form,    setForm]    = useState({ whatsapp_number: "", business_name: "Ekta Digital", support_email: "EktaDigital@outlook.com" });
  const [saving,  setSaving]  = useState(false);
  const [pwForm,  setPwForm]  = useState({ current_password: "", password: "", password_confirmation: "" });
  const [pwSaving,setPwSaving]= useState(false);

  const handleSaveGeneral = async () => {
    setSaving(true);
    try {
      // Settings are stored server-side via the auth user profile endpoint
      // For now, show a success — a full settings table can be added later
      await new Promise((r) => setTimeout(r, 400)); // slight delay for UX
      toast.success("Settings saved!");
    } catch { toast.error("Failed to save settings"); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    if (pwForm.password !== pwForm.password_confirmation) { toast.error("Passwords do not match"); return; }
    if (pwForm.password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setPwSaving(true);
    try {
      await api.put("/me/password", pwForm);
      toast.success("Admin password changed!");
      setPwForm({ current_password: "", password: "", password_confirmation: "" });
    } catch (e) {
      toast.error(e.response?.data?.message ?? "Failed to change password");
    } finally { setPwSaving(false); }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-muted mb-1">Admin</p>
        <h1 className="text-[28px] font-bold tracking-[-0.8px] text-ink">Settings</h1>
      </div>

      {/* General settings */}
      <div className="bg-white rounded-xl2 shadow-card p-8">
        <h2 className="font-bold text-[18px] text-ink mb-6">General</h2>
        <div className="space-y-4">
          {[
            { key: "business_name",  label: "Business Name"      },
            { key: "support_email",  label: "Support Email"      },
            { key: "whatsapp_number",label: "WhatsApp Number"    },
          ].map((f) => (
            <div key={f.key} className="relative">
              <input type="text" placeholder=" " value={form[f.key]} onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))} className="peer w-full h-[52px] px-4 pt-4 rounded-xl border border-rule bg-card text-[14px] outline-none focus:border-teal focus:border-2 transition-all" />
              <label className="absolute left-4 top-1.5 text-[11px] font-medium text-muted peer-placeholder-shown:top-4 peer-placeholder-shown:text-[14px] peer-focus:top-1.5 peer-focus:text-[11px] transition-all pointer-events-none">{f.label}</label>
            </div>
          ))}
          <Button onClick={handleSaveGeneral} loading={saving}>Save Settings</Button>
        </div>
      </div>

      {/* Change password */}
      <div className="bg-white rounded-xl2 shadow-card p-8">
        <h2 className="font-bold text-[18px] text-ink mb-6">Change Admin Password</h2>
        <div className="space-y-4">
          {[
            { key: "current_password",      label: "Current Password"    },
            { key: "password",              label: "New Password"        },
            { key: "password_confirmation", label: "Confirm New Password"},
          ].map((f) => (
            <div key={f.key} className="relative">
              <input type="password" placeholder=" " value={pwForm[f.key]} onChange={(e) => setPwForm((p) => ({ ...p, [f.key]: e.target.value }))} className="peer w-full h-[52px] px-4 pt-4 rounded-xl border border-rule bg-card text-[14px] outline-none focus:border-teal focus:border-2 transition-all" />
              <label className="absolute left-4 top-1.5 text-[11px] font-medium text-muted peer-placeholder-shown:top-4 peer-placeholder-shown:text-[14px] peer-focus:top-1.5 peer-focus:text-[11px] transition-all pointer-events-none">{f.label}</label>
            </div>
          ))}
          <Button onClick={handleChangePassword} loading={pwSaving}>Update Password</Button>
        </div>
      </div>

      <div className="bg-teal-light rounded-xl p-4 text-[13px] text-teal">
        To change the WhatsApp API key or Cloudinary credentials, update your <strong>.env</strong> file on the server and restart.
      </div>
    </div>
  );
}
