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
    isMagasin?: boolean;
    globalStatus?: string;
    globalStatusColor?: string;
    ventesStatusColor?: string;
    behaviorStatusColor?: string;
    presenceStatusColor?: string;
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

  let performanceStatus = scores.globalStatus || "MAUVAIS";
  let statusColor = scores.globalStatusColor || '#C0392B';

  const isMagasin = scores.isMagasin;

  const getBadgeStyles = (color: string) => {
    if (color.startsWith('#')) {
      return {
        backgroundColor: `${color}15`, // 15% opacity for bg
        color: color,
        border: `1px solid ${color}30`
      };
    }
    const mapping: Record<string, any> = {
      emerald: { backgroundColor: '#ECFDF5', color: '#059669', border: '1px solid #D1FAE5' },
      green: { backgroundColor: '#F0FDF4', color: '#16A34A', border: '1px solid #DCFCE7' },
      yellow: { backgroundColor: '#FEFCE8', color: '#CA8A04', border: '1px solid #FEF08A' },
      orange: { backgroundColor: '#FFF7ED', color: '#EA580C', border: '1px solid #FFEDD5' },
      red: { backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FEE2E2' },
      blue: { backgroundColor: '#EFF6FF', color: '#2563EB', border: '1px solid #DBEAFE' },
    };
    return mapping[color.toLowerCase()] || mapping.red;
  };

  /** Bar color based on percentage thresholds per metric */
  const getSubScoreBarColor = (label: string, score: number, max: number): any => {
    if (label === "Bonus") return { backgroundColor: '#D6D3D1' };
    
    let color = '';
    if (label === "Ventes") color = scores.ventesStatusColor || '';
    if (label === "Comportement") color = scores.behaviorStatusColor || '';
    if (label === "Présence") color = scores.presenceStatusColor || '';

    if (color.startsWith('#')) return { backgroundColor: color };
    
    const map: Record<string, string> = { 
      emerald: '#34D399', 
      green: '#4ADE80', 
      yellow: '#FACC15', 
      orange: '#FB923C', 
      red: '#F43F5E', 
      blue: '#60A5FA' 
    };
    
    if (map[color.toLowerCase()]) return { backgroundColor: map[color.toLowerCase()] };

    if (max <= 0) return { backgroundColor: '#F43F5E' };
    
    const percentage = (score / max) * 100;
    if (percentage >= 80) return { backgroundColor: '#34D399' };
    if (percentage >= 60) return { backgroundColor: '#FACC15' };
    if (percentage >= 40) return { backgroundColor: '#FB923C' };
    return { backgroundColor: '#F43F5E' };
  };

  const MetricRow = ({ label, score, max }: { label: string, score: number, max: number }) => {
    const percentage = max > 0 ? Math.min(100, (score / max) * 100) : 0;
    const barStyle = getSubScoreBarColor(label, score, max);

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
                 className="h-full rounded-full transition-all duration-700 ease-out"
                 style={{ width: `${percentage}%`, ...barStyle }}
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
          <span 
            className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg"
            style={getBadgeStyles(statusColor)}
          >
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
        {!isMagasin && (
          <div className="flex flex-col gap-3">
             <MetricRow label="Présence" score={scores.presence} max={scores.presenceMax} />
             <MetricRow label="Bonus" score={scores.bonus} max={scores.bonusMax} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ScoreOverview;
