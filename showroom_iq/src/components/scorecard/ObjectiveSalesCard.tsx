import React from 'react';
import ScoreBadge from './ScoreBadge';

interface ObjectiveSalesCardProps {
  score: number;
  maxScore: number;
  status: string;
  caGenerated: string;
  baseValue: number;
  likelyValue: number;
  totalValue: number;
  currentValue: number;
  className?: string;
  title?: string;
  icon?: string;
  iconColor?: string;
  iconBgColor?: string;
}

const ObjectiveSalesCard = ({
  score,
  maxScore,
  status,
  caGenerated,
  baseValue,
  likelyValue,
  totalValue,
  currentValue,
  className = "",
  title = "Objectifs",
  icon = "target",
  iconColor = "text-yellow-600",
  iconBgColor = "bg-yellow-50"
}: ObjectiveSalesCardProps) => {
  // Constants for SVG
  const totalArcLength = 125.66; // PI * r where r = 40
  
  // Calculate Ratios
  const redRatio = baseValue / totalValue;
  const yellowRatio = (likelyValue - baseValue) / totalValue;
  const greenRatio = (totalValue - likelyValue) / totalValue;
  
  // Calculate Stroke Lengths
  const redStroke = (redRatio * totalArcLength).toFixed(1);
  const yellowStroke = (yellowRatio * totalArcLength).toFixed(1);
  const greenStroke = (greenRatio * totalArcLength).toFixed(1);
  
  // Offsets
  const yellowOffset = (-(baseValue / totalValue) * totalArcLength).toFixed(1);
  const greenOffset = (-(likelyValue / totalValue) * totalArcLength).toFixed(1);
  
  // Needle Rotation
  const needleRotation = ((currentValue / totalValue) * 180).toFixed(2);

  // Percentage Reached
  const percentage = ((currentValue / likelyValue) * 100).toFixed(0);


  return (
    <div className={`bg-white p-10 rounded-2xl border border-stone-200/60 shadow-sm flex flex-col items-center relative min-h-[430px] justify-between ${className}`}>
      {/* Internal Title Header */}
      <div className="absolute top-8 left-10 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl ${iconBgColor} ${iconColor} flex items-center justify-center shadow-sm`}>
          <span className="material-symbols-outlined text-[24px]">{icon}</span>
        </div>
        <h4 className="font-headline text-[32px] font-bold tracking-tight text-stone-900">{title}</h4>
      </div>

      <div className="w-full h-16"></div> {/* Reduced spacer */}

      <div className="w-full flex justify-between items-start mb-0 px-2">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-start translate-x-2">
            <span className="text-[11px] text-stone-400 uppercase tracking-widest font-black mb-4 opacity-60">% atteint ( Likely)</span>
            <span className="font-mono font-bold text-[18px] px-5 py-2.5 bg-stone-50 rounded-xl text-stone-900 border border-stone-100 shadow-sm leading-none">
              {percentage}%
            </span>
          </div>
          <div className="flex flex-col items-start translate-x-2">
            <span className="text-[11px] text-stone-400 uppercase tracking-widest font-black mb-4 opacity-60">CA Généré</span>
            <span className="font-mono font-bold text-[18px] px-5 py-2.5 bg-yellow-50/50 rounded-xl text-yellow-600 border border-yellow-100 shadow-sm leading-none">
              {caGenerated} <span className="text-[10px] opacity-60 ml-0.5">MAD</span>
            </span>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <ScoreBadge score={score} max={maxScore} status={status} />
        </div>
      </div>

      <div className="w-full max-w-[280px] -mt-10 flex flex-col items-center">
        <svg className="w-full overflow-visible" viewBox="0 0 100 65">
          <defs>
            <filter id="needleShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1.5" stdDeviation="1.2" floodOpacity="0.12" />
            </filter>
          </defs>
          <g transform="translate(0, 5)">
            <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#ef4444" strokeWidth="8" strokeDasharray={`${redStroke} ${totalArcLength}`} strokeDashoffset="0" strokeLinecap="round"></path>
            <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#eab308" strokeWidth="8" strokeDasharray={`${yellowStroke} ${totalArcLength}`} strokeDashoffset={yellowOffset} strokeLinecap="round"></path>
            <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#22c55e" strokeWidth="8" strokeDasharray={`${greenStroke} ${totalArcLength}`} strokeDashoffset={greenOffset} strokeLinecap="round"></path>
            
            <text x="8" y="58" fontSize="4" fill="#1c1917" textAnchor="end" className="font-mono font-black">0</text>
            
            <text x="76" y="8" fontSize="3.5" fill="#1c1917" textAnchor="middle" className="font-mono font-bold">{baseValue.toLocaleString('en-US')}</text>
            <text x="96" y="28" fontSize="3.5" fill="#1c1917" textAnchor="start" className="font-mono font-bold">{likelyValue.toLocaleString('en-US')}</text>

            <text x="94" y="58" fontSize="4" fill="#1c1917" textAnchor="start" className="font-mono font-black">{totalValue.toLocaleString('en-US')}</text>
            
            <g style={{ transform: `rotate(${needleRotation}deg)`, transformOrigin: "50px 50px" }} className="transition-transform duration-1000 ease-out delay-150" filter="url(#needleShadow)">
              <path d="M 50 49 L 14 50 L 50 51 Z" fill="#1c1917" />
              <circle cx="50" cy="50" fill="#1c1917" r="4"></circle>
              <circle cx="50" cy="50" fill="#ffffff" r="1.5"></circle>
            </g>
          </g>
        </svg>
      </div>

      <div className="w-full max-w-[600px] flex items-center justify-between mt-6 pt-6 border-t border-stone-100/80">
        <div className="flex flex-col items-center group flex-1">
          <span className="w-full h-[6px] rounded-full bg-red-400 mb-3 opacity-30 group-hover:opacity-100 transition-all"></span>
          <div className="text-center">
            <p className="text-[11px] text-stone-400 font-bold uppercase tracking-widest">Conservative</p>
          </div>
        </div>
        <div className="w-12 shrink-0"></div>
        <div className="flex flex-col items-center group flex-1 scale-110">
          <span className="w-full h-[8px] rounded-full bg-yellow-500 mb-3 shadow-sm transition-all"></span>
          <div className="text-center">
            <p className="text-[12px] text-yellow-600 font-black uppercase tracking-widest">Likely</p>
          </div>
        </div>
        <div className="w-12 shrink-0"></div>
        <div className="flex flex-col items-center group flex-1">
          <span className="w-full h-[6px] rounded-full bg-green-500 mb-3 opacity-30 group-hover:opacity-100 transition-all"></span>
          <div className="text-center">
            <p className="text-[11px] text-stone-400 font-bold uppercase tracking-widest">Exceed</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ObjectiveSalesCard;
