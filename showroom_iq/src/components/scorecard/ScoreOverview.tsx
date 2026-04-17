import React from 'react';

interface ScoreOverviewProps {
  role: 'admin' | 'owner';
  scores?: {
    ventes: number;
    ventesMax: number;
    comportement: number;
    comportementMax: number;
    presence: number;
    presenceMax: number;
    bonus: number;
    bonusMax: number;
  };
}

const ScoreOverview = ({ role, scores: propScores }: ScoreOverviewProps) => {
  // Use props or default to mockup data if not provided
  const scores = propScores || {
    ventes: 54,
    ventesMax: 65,
    comportement: 8,
    comportementMax: 30,
    presence: 1,
    presenceMax: 5,
    bonus: 0,
    bonusMax: 5,
  };


  const totalScore = scores.ventes + scores.comportement + scores.presence + scores.bonus;

  let performanceStatus = "MAUVAIS";
  let badgeClasses = "bg-red-50 text-red-600 border border-red-100";

  if (totalScore >= 80) {
    performanceStatus = "TRES BIEN";
    badgeClasses = "bg-emerald-50 text-emerald-600 border border-emerald-100";
  } else if (totalScore >= 60) {
    performanceStatus = "BIEN";
    badgeClasses = "bg-yellow-50 text-yellow-600 border border-yellow-200 shadow-sm";
  } else if (totalScore >= 40) {
    performanceStatus = "MOYEN";
    badgeClasses = "bg-orange-50 text-orange-600 border border-orange-100 shadow-sm";
  }

  /** Bar color based on exact point thresholds per metric */
  const getSubScoreBarColor = (label: string, score: number): string => {
    if (label === "Ventes") {
      if (score >= 55) return "bg-emerald-400";   // Très Bien
      if (score >= 45) return "bg-yellow-400";    // Bien
      if (score >= 35) return "bg-orange-400";    // Moyen
      return "bg-rose-500";                        // Mauvais
    }
    if (label === "Comportement") {
      if (score >= 25) return "bg-emerald-400";
      if (score >= 16) return "bg-yellow-400";
      if (score >= 10) return "bg-orange-400";
      return "bg-rose-500";
    }
    if (label === "Présence") {
      if (score >= 5) return "bg-emerald-400";
      if (score >= 3) return "bg-yellow-400";
      if (score >= 1) return "bg-orange-400";
      return "bg-rose-500";
    }
    // Bonus — always neutral gray
    return "bg-stone-300";
  };

  const MetricRow = ({ label, score, max }: { label: string, score: number, max: number }) => {
    const percentage = max > 0 ? (score / max) * 100 : 0;
    const barColor = getSubScoreBarColor(label, score);

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
                 className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
                 style={{ width: `${percentage}%` }}
               />
            </div>
         </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-end justify-between py-2">
      {/* Top part: Global score */}
      <div className="flex items-start gap-12 mb-8">

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
