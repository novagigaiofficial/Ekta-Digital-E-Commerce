import React, { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";

export default function WhatsAppButton() {
  const [visible, setVisible] = useState(false);
  const [tooltip, setTooltip] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 1500);
    const t2 = setTimeout(() => setTooltip(false), 6000);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, []);

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
      {tooltip && (
        <div className="bg-[#1d1d1f] text-white text-[13px] font-500 px-4 py-2.5 rounded-[12px] shadow-lg whitespace-nowrap animate-pulse">
          Chat with us 👋
          <button onClick={() => setTooltip(false)} className="ml-2 opacity-60 hover:opacity-100">
            <X size={12} />
          </button>
        </div>
      )}
      <a
        href="https://wa.me/255783394445?text=Hello%20Ekta%20Digital%2C%20I%20need%20help%20with%20my%20order."
        target="_blank"
        rel="noreferrer"
        className="relative w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(37,211,102,0.5)] hover:scale-110 hover:shadow-[0_8px_30px_rgba(37,211,102,0.6)] active:scale-95 transition-all duration-300 whatsapp-pulse"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle size={26} className="text-white fill-white relative z-10" />
      </a>
    </div>
  );
}
