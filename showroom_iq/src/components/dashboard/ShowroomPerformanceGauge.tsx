import React from 'react';

const ShowroomPerformanceGauge = () => {
  return (
    <div className="bg-white rounded-[32px] p-6 pb-2 shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-stone-100 flex flex-col items-center relative overflow-hidden group">
      
      {/* Top Section with Label and Growth (Only one growth rate pill) */}
      <div className="w-full flex justify-between items-start mb-4 px-2">
        <div className="flex flex-col">
           <h4 className="text-[32px] font-headline font-bold italic text-yellow-700 tracking-[0.05em] leading-none mb-1">Likely</h4>
           <div className="w-12 h-1 bg-yellow-500 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.4)]"></div>
        </div>
        <div className="bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1.5 hover:scale-105 transition-transform">
          <span className="material-symbols-outlined text-[14px] text-emerald-600 font-bold">trending_up</span>
          <span className="text-[10px] font-mono font-bold text-emerald-700">+12.4%</span>
        </div>
      </div>

      {/* Gauge Visual */}
      <div className="relative w-full max-w-[320px] h-[140px] mt-0 flex items-center justify-center translate-y-2">
        <svg viewBox="0 0 200 120" className="w-full h-full">
          <defs>
             <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
               <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
               <feOffset dx="0" dy="2" result="offsetblur" />
               <feComponentTransfer>
                 <feFuncA type="linear" slope="0.2" />
               </feComponentTransfer>
               <feMerge>
                 <feMergeNode />
                 <feMergeNode in="SourceGraphic" />
               </feMerge>
             </filter>
          </defs>
          {/* Base Arc */}
          <path
            d="M 30 100 A 70 70 0 0 1 170 100"
            fill="none"
            stroke="#F5F5F4"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* zones */}
          <path
            d="M 30 100 A 70 70 0 0 1 55 45"
            fill="none"
            stroke="#EF4444"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            d="M 55 45 A 70 70 0 0 1 145 45"
            fill="none"
            stroke="#EAB308"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            d="M 145 45 A 70 70 0 0 1 170 100"
            fill="none"
            stroke="#22C55E"
            strokeWidth="10"
            strokeLinecap="round"
          />
          
          {/* Needle Base Circle */}
          <circle cx="100" cy="100" r="6" fill="#1C1917" filter="url(#shadow)" />
          
          {/* Needle */}
          <line 
            x1="100" y1="100" x2="130" y2="60" 
            stroke="#1C1917" strokeWidth="3" strokeLinecap="round" 
            transform="rotate(-5, 100, 100)"
          />
          
          <circle cx="100" cy="100" r="2" fill="white" />
          
          {/* Boundary Labels */}
          <text x="32" y="112" fontSize="5" className="fill-stone-400 font-mono font-bold" textAnchor="middle">0</text>
          <text x="52" y="40" fontSize="5" className="fill-stone-400 font-mono font-bold" textAnchor="middle">10</text>
          <text x="148" y="40" fontSize="5" className="fill-stone-400 font-mono font-bold" textAnchor="middle">20</text>
          <text x="168" y="112" fontSize="5" className="fill-stone-400 font-mono font-bold" textAnchor="middle">30</text>
        </svg>
      </div>

      {/* Legend Footer */}
      <div className="w-full grid grid-cols-3 gap-2 pt-6 border-t border-stone-50 mt-2">
        <div className="flex flex-col items-center gap-1 opacity-60">
          <div className="w-6 h-0.5 bg-red-400 rounded-full"></div>
          <span className="text-[8px] font-mono font-bold text-stone-500 uppercase tracking-[0.2em]">CONSERVATIVE</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="w-8 h-1 bg-yellow-500 rounded-full shadow-[0_0_10px_rgba(234,179,8,0.3)]"></div>
          <span className="text-[8px] font-mono font-bold text-stone-900 uppercase tracking-[0.2em] scale-110">LIKELY</span>
        </div>
        <div className="flex flex-col items-center gap-1 opacity-60">
          <div className="w-6 h-0.5 bg-green-400 rounded-full"></div>
          <span className="text-[8px] font-mono font-bold text-stone-500 uppercase tracking-[0.2em]">EXCEED</span>
        </div>
      </div>
    </div>
  );
};

export default ShowroomPerformanceGauge;
