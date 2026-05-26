import React from "react";

const variants = {
  primary:   "bg-[#008080] text-white hover:bg-[#006666] active:bg-[#005555] shadow-[0_1px_3px_rgba(0,128,128,0.3)]",
  secondary: "bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#ebebeb] active:bg-[#e0e0e0]",
  outline:   "border border-[#008080] text-[#008080] hover:bg-[#e6f4f4]",
  ghost:     "text-[#008080] hover:bg-[#e6f4f4]",
  dark:      "bg-[#1d1d1f] text-white hover:bg-[#2d2d2f] active:bg-[#3d3d3f]",
  danger:    "bg-red-500 text-white hover:bg-red-600 active:bg-red-700",
  white:     "bg-white text-[#1d1d1f] hover:bg-[#f5f5f7] shadow-sm",
};

export default function Button({ children, variant = "primary", className = "", loading = false, size = "md", ...props }) {
  const sizes = {
    sm: "px-4 py-2 text-[13px] min-h-[36px]",
    md: "px-6 py-3 text-[15px] min-h-[46px]",
    lg: "px-8 py-4 text-[16px] min-h-[52px]",
  };
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2
        rounded-[980px] font-semibold
        transition-all duration-200
        hover:scale-[1.02] active:scale-[0.98]
        disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none
        select-none
        ${sizes[size] ?? sizes.md}
        ${variants[variant] ?? variants.primary}
        ${className}
      `.replace(/\s+/g, " ").trim()}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading
        ? <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
        : children
      }
    </button>
  );
}
