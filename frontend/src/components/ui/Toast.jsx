import React from "react";
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";
const ICONS = { success:<CheckCircle size={18} className="text-green-500"/>, error:<XCircle size={18} className="text-red-500"/>, warning:<AlertTriangle size={18} className="text-yellow-500"/>, info:<Info size={18} className="text-teal"/> };
const BG = { success:"border-green-200 bg-green-50", error:"border-red-200 bg-red-50", warning:"border-yellow-200 bg-yellow-50", info:"border-teal-light bg-teal-light" };
export default function Toast({ t, type="info", title, message }) {
  return (
    <div className={`flex items-start gap-3 w-full max-w-sm bg-white rounded-xl shadow-card-hover px-4 py-3 border ${BG[type]} transition-all duration-300 ${t?.visible?"opacity-100 translate-y-0":"opacity-0 translate-y-2"}`}>
      <div className="shrink-0 mt-0.5">{ICONS[type]}</div>
      <div className="flex-1 min-w-0">{title&&<p className="font-bold text-[13px] text-ink">{title}</p>}{message&&<p className="text-[12px] text-muted leading-snug mt-0.5">{message}</p>}</div>
    </div>
  );
}
