import React, { useState, useEffect } from "react";
import { Plus, Minus } from "lucide-react";
import { observeFadeUp } from "../lib/utils";

const FAQS = [
  { q: "Do you offer same-day delivery?", a: "Yes! Orders placed before 2 PM are delivered the same day within Dar-es-Salaam. For other regions, delivery takes 2–5 business days depending on your location." },
  { q: "How do I pay for my order?",      a: "We accept M-Pesa, Airtel Money, CRDB, Selcom Pesa, Visa, Mastercard, PayPal, and bank transfers. B2B customers can also pay via invoice." },
  { q: "Are all products genuine?",       a: "Absolutely. Every product we sell is 100% genuine, sourced directly from authorised distributors and comes with the manufacturer's warranty." },
  { q: "Can I request a quote for bulk orders?", a: "Yes! Use our Quote Request page to submit your requirements. Our B2B team will respond within 2 hours with a personalised quote and bulk pricing." },
  { q: "What is your return policy?",    a: "We accept returns within 7 days for faulty products. Items must be unused and in original packaging. Contact our support team to initiate a return." },
  { q: "How do loyalty points work?",    a: "You earn 1 loyalty point for every TZS 1,000 you spend. Points are worth TZS 5 each and can be redeemed at checkout. Points never expire." },
  { q: "Can I collect my order in-store?", a: "Yes! Click & Collect is available at our showroom in Haidary Plaza, India Street, Dar-es-Salaam. Your order is ready within 2 hours of placement." },
  { q: "Do you deliver outside Tanzania?", a: "We deliver across East Africa. Shipping charges and timelines vary by destination. Contact us for a quote on international orders." },
  { q: "How do I track my order?",       a: "You can track your order in real-time from your Account page. We also send SMS and email updates at every stage of delivery." },
  { q: "Do you offer warranty on products?", a: "All products come with the manufacturer's standard warranty. Extended warranties are available on select appliances — ask our team for details." },
];

function Item({ faq, open, toggle }) {
  return (
    <div className={`border-b border-[#f5f5f7] last:border-0 transition-colors duration-200 ${open ? "bg-[#fbfbfd]" : ""}`}>
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between py-5 px-6 text-left group"
      >
        <span className={`text-[16px] font-600 tracking-[-0.01em] transition-colors ${open ? "text-[#008080]" : "text-[#1d1d1f] group-hover:text-[#008080]"}`}>
          {faq.q}
        </span>
        <span className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ml-4 transition-all duration-300 ${open ? "bg-[#008080] text-white rotate-180" : "bg-[#f5f5f7] text-[#6e6e73] group-hover:bg-[#e6f4f4]"}`}>
          {open ? <Minus size={14} /> : <Plus size={14} />}
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${open ? "max-h-64 opacity-100" : "max-h-0 opacity-0"}`}>
        <p className="px-6 pb-5 text-[15px] text-[#6e6e73] leading-relaxed">{faq.a}</p>
      </div>
    </div>
  );
}

export default function FaqPage() {
  const [open, setOpen] = useState(null);
  useEffect(() => { setTimeout(observeFadeUp, 100); }, []);

  return (
    <div className="min-h-screen bg-[#fbfbfd]">
      {/* Header */}
      <div className="bg-white border-b border-[#f5f5f7] py-20">
        <div className="max-w-[700px] mx-auto px-6 text-center">
          <p className="text-[11px] font-700 tracking-[0.16em] uppercase text-[#008080] mb-3">Help Centre</p>
          <h1 className="text-[52px] font-900 tracking-[-0.04em] text-[#1d1d1f] mb-4">FAQ</h1>
          <p className="text-[17px] text-[#6e6e73]">Everything you need to know about shopping with Ekta Digital.</p>
        </div>
      </div>

      {/* FAQ list */}
      <div className="max-w-[700px] mx-auto px-6 py-16">
        <div className="bg-white rounded-[24px] border border-[#f5f5f7] shadow-[0_2px_20px_rgba(0,0,0,0.04)] overflow-hidden fade-up">
          {FAQS.map((faq, i) => (
            <Item key={i} faq={faq} open={open === i} toggle={() => setOpen(open === i ? null : i)} />
          ))}
        </div>

        {/* Still need help */}
        <div className="mt-12 bg-[#1d1d1f] rounded-[24px] p-8 text-center fade-up">
          <p className="text-white text-[20px] font-700 mb-2">Still have questions?</p>
          <p className="text-[#86868b] text-[14px] mb-6">Our team typically responds within 1 hour on WhatsApp.</p>
          <a
            href="https://wa.me/255783394445"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-full font-700 text-[15px] hover:opacity-90 transition-opacity"
          >
            💬 Chat on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
