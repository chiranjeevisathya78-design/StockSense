import React from 'react';

export default function LoadingSkeleton({ type = 'card', count = 1 }) {
  const items = Array.from({ length: count });

  if (type === 'chart') {
    return (
      <div className="w-full h-80 rounded-2xl bg-white border border-[#e8e8e6] p-6 animate-pulse flex flex-col justify-between shadow-xs">
        <div className="flex items-center justify-between">
          <div className="h-5 w-44 bg-[#f0f0ee] rounded-full"></div>
          <div className="h-5 w-28 bg-[#f0f0ee] rounded-full"></div>
        </div>
        <div className="space-y-4">
          <div className="h-44 w-full bg-[#f7f7f5] rounded-xl"></div>
          <div className="flex justify-between">
            <div className="h-3 w-10 bg-[#f0f0ee] rounded-full"></div>
            <div className="h-3 w-10 bg-[#f0f0ee] rounded-full"></div>
            <div className="h-3 w-10 bg-[#f0f0ee] rounded-full"></div>
            <div className="h-3 w-10 bg-[#f0f0ee] rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="w-full rounded-2xl bg-white border border-[#e8e8e6] p-4 animate-pulse space-y-3 shadow-xs">
        <div className="h-5 w-1/4 bg-[#f0f0ee] rounded-full mb-4"></div>
        {items.map((_, i) => (
          <div key={i} className="h-10 bg-[#fafaf8] rounded-xl flex items-center px-4 justify-between">
            <div className="h-3 w-20 bg-[#f0f0ee] rounded-full"></div>
            <div className="h-3 w-14 bg-[#f0f0ee] rounded-full"></div>
            <div className="h-3 w-14 bg-[#f0f0ee] rounded-full"></div>
            <div className="h-3 w-16 bg-[#f0f0ee] rounded-full"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((_, i) => (
        <div
          key={i}
          className="rounded-2xl bg-white border border-[#e8e8e6] p-5 animate-pulse space-y-3 shadow-xs"
        >
          <div className="flex justify-between items-center">
            <div className="h-3 w-16 bg-[#f0f0ee] rounded-full"></div>
            <div className="h-3 w-8 bg-[#f0f0ee] rounded-full"></div>
          </div>
          <div className="h-6 w-28 bg-[#f0f0ee] rounded-full"></div>
          <div className="h-3 w-36 bg-[#f0f0ee] rounded-full"></div>
        </div>
      ))}
    </div>
  );
}
