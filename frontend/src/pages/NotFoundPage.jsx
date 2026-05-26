import React from "react";
import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#fbfbfd] flex flex-col items-center justify-center px-6 text-center">
      <p className="text-[120px] font-900 tracking-[-0.06em] text-[#f5f5f7] leading-none select-none mb-0">404</p>
      <div className="-mt-8 relative z-10">
        <h1 className="text-[32px] font-800 tracking-[-0.03em] text-[#1d1d1f] mb-3">Page not found</h1>
        <p className="text-[16px] text-[#6e6e73] mb-10 max-w-sm">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-[#f5f5f7] text-[#1d1d1f] rounded-full font-600 text-[15px] hover:bg-[#ebebeb] transition-colors"
          >
            ← Go Back
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-[#1d1d1f] text-white rounded-full font-600 text-[15px] hover:bg-[#2d2d2f] transition-colors"
          >
            Home
          </button>
        </div>
      </div>
    </div>
  );
}
