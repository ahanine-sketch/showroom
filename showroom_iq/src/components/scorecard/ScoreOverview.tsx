import React from 'react';

const ScoreOverview = ({ role }: { role: 'admin' | 'owner' }) => {
  // Hardcoded mockup data
  const scores = {
    ventes: 54,
    ventesMax: 65,
    comportement: 8,
    comportementMax: 30,
    presence: 1,
    presenceMax: 5,
    bonus: 3,
    bonusMax: 5,
  };

  const totalScore = 66; // Sum: 54 + 8 + 1 + 3

  let performanceStatus = "MAUVAIS";
  let badgeClasses = "bg-red-50 text-red-600 border border-red-100";
  
  if (totalScore >= 90) {
    performanceStatus = "TRES BIEN";
    badgeClasses = "bg-emerald-50 text-emerald-600 border border-emerald-100";
  } else if (totalScore >= 60) {
    performanceStatus = "BIEN";
    badgeClasses = "bg-yellow-50 text-yellow-600 border border-yellow-200 shadow-sm";
  } else if (totalScore >= 45) {
    performanceStatus = "MOYEN";
    badgeClasses = "bg-orange-50 text-orange-600 border border-orange-100 shadow-sm";
  } else {
    performanceStatus = "MAUVAIS";
    badgeClasses = "bg-red-50 text-red-600 border border-red-100";
  }

  const getSubScoreBarColor = (label: string) => {
    if (label === "Ventes") return "bg-yellow-400";
    if (label === "Comportement") return "bg-rose-400";
    if (label === "Présence") return "bg-orange-400";
    if (label === "Bonus") return "bg-stone-300";
    return "bg-stone-100";
  };

  const MetricRow = ({ label, score, max }: { label: string, score: number, max: number }) => {
    const percentage = max > 0 ? (score / max) * 100 : 0;
    
    return (
      <div className="flex items-center gap-4 group/metric">
         <span className="text-[9px] text-stone-400 uppercase font-bold tracking-[0.15em] w-20 text-right group-hover/metric:text-stone-600 transition-colors">
            {label}
         </span>
         <div className="flex items-center gap-2.5">
            <span className="font-mono text-[14px] font-bold text-stone-900 w-4 text-right tracking-tighter">
              {score}
            </span>
            <div className="w-14 h-1 bg-stone-100 rounded-full overflow-hidden shadow-inner flex-shrink-0">
               <div 
                 className={`h-full rounded-full transition-all duration-700 ease-out ${getSubScoreBarColor(label)}`} 
                 style={{ width: `${percentage}%` }}
               ></div>
            </div>
         </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-end justify-between py-2">
      {/* Top part: Global score */}
      <div className="flex items-start gap-12 mb-8">
        {role === 'admin' && (
          <button className="w-9 h-9 mt-2 rounded-full border border-stone-200 text-stone-400 hover:text-stone-900 hover:border-stone-300 transition-colors flex items-center justify-center bg-stone-50 shadow-sm" title="Modifier les données">
            <span className="material-symbols-outlined text-[16px]">edit</span>
          </button>
        )}
        <div className="flex flex-col items-end justify-center pt-4">
          <span className="text-[9px] text-stone-400 uppercase font-black tracking-[0.3em] mb-2.5 opacity-60">Score Global</span>
          <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${badgeClasses}`}>
            {performanceStatus}
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[84px] leading-[0.7] font-bold text-stone-900 tracking-tighter">{totalScore}</span>
          <span className="font-mono text-[18px] font-bold text-stone-300">/ 100</span>
        </div>
      </div>

      {/* Bottom part: Breakdown with subtle progress bars matches Image 1 */}
      <div className="flex gap-12 border-l border-stone-100 pl-12">
        <div className="flex flex-col gap-3">
           <MetricRow label="Ventes" score={scores.ventes} max={scores.ventesMax} />
           <MetricRow label="Comportement" score={scores.comportement} max={scores.comportementMax} />
        </div>
        <div className="flex flex-col gap-3">
           <MetricRow label="Présence" score={scores.presence} max={scores.presenceMax} />
           <MetricRow label="Bonus" score={scores.bonus} max={scores.bonusMax} />
        </div>
      </div>
    </div>
  );
};

export default ScoreOverview;
