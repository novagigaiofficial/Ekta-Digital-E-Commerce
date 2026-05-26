import React from "react";
export default function Skeleton({ className="", variant=null }) {
  const base="animate-pulse bg-card rounded-xl";
  if(variant==="product") return (<div className="bg-white rounded-xl2 overflow-hidden shadow-card"><div className="bg-card aspect-square"/><div className="p-4 space-y-3"><div className="h-3 bg-card rounded-full w-16"/><div className="h-4 bg-card rounded-full w-3/4"/><div className="h-5 bg-card rounded-full w-2/3"/></div></div>);
  if(variant==="card") return (<div className="bg-white rounded-xl2 p-5 shadow-card space-y-3"><div className="h-4 bg-card rounded-full w-1/2"/><div className="h-3 bg-card rounded-full w-full"/><div className="h-3 bg-card rounded-full w-3/4"/></div>);
  return <div className={`${base} ${className}`}/>;
}
export function ProductGridSkeleton({ count=8 }) {
  return <div className="grid grid-cols-2 md:grid-cols-4 gap-6">{[...Array(count)].map((_,i)=><Skeleton key={i} variant="product"/>)}</div>;
}
