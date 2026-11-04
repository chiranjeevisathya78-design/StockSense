import React from 'react';

export default function LoadingSkeleton({ type = 'card', count = 1 }) {
  const items = Array.from({ length: count });

  if (type === 'chart') {
    return (
      <div className="w-full h-80 rounded-[10px] bg-slash-onyx border border-slash-graphite p-6 animate-pulse flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="h-5 w-44 bg-slash-carbon rounded-full"></div>
          <div className="h-5 w-28 bg-slash-carbon rounded-full"></div>
        </div>
        <div className="space-y-4">
          <div className="h-44 w-full bg-slash-carbon/60 rounded-[8px]"></div>
          <div className="flex justify-between">
            <div className="h-3 w-10 bg-slash-carbon rounded-full"></div>
            <div className="h-3 w-10 bg-slash-carbon rounded-full"></div>
            <div className="h-3 w-10 bg-slash-carbon rounded-full"></div>
            <div className="h-3 w-10 bg-slash-carbon rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="w-full rounded-[10px] bg-slash-onyx border border-slash-graphite p-4 animate-pulse space-y-3">
        <div className="h-5 w-1/4 bg-slash-carbon rounded-full mb-4"></div>
        {items.map((_, i) => (
          <div key={i} className="h-10 bg-slash-carbon/40 rounded-[6px] flex items-center px-4 justify-between">
            <div className="h-3 w-20 bg-slash-carbon rounded-full"></div>
            <div className="h-3 w-14 bg-slash-carbon rounded-full"></div>
            <div className="h-3 w-14 bg-slash-carbon rounded-full"></div>
            <div className="h-3 w-16 bg-slash-carbon rounded-full"></div>
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
          className="rounded-[10px] bg-slash-onyx border border-slash-graphite p-5 animate-pulse space-y-3"
        >
          <div className="flex justify-between items-center">
            <div className="h-3 w-16 bg-slash-carbon rounded-full"></div>
            <div className="h-3 w-10 bg-slash-carbon rounded-full"></div>
          </div>
          <div className="h-7 w-24 bg-slash-carbon rounded-full"></div>
          <div className="h-3 w-12 bg-slash-carbon rounded-full"></div>
        </div>
      ))}
    </div>
  );
}
