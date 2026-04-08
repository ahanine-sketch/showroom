import React from 'react';

interface ScoreBadgeProps {
  score: number;
  max: number;
  status?: string;
}

const ScoreBadge = ({ score, max, status }: ScoreBadgeProps) => {
  const getColors = () => {
    const normalizedStatus = status?.toUpperCase();
    if (normalizedStatus === 'TRES BIEN') {
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-100',
        statusColor: 'text-emerald-500'
      };
    }
    if (normalizedStatus === 'BIEN') {
      return {
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        border: 'border-yellow-100',
        statusColor: 'text-yellow-500'
      };
    }
    if (normalizedStatus === 'MOYEN') {
      return {
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-100',
        statusColor: 'text-orange-500'
      };
    }
    if (normalizedStatus === 'MAUVAIS') {
      return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-100',
        statusColor: 'text-red-500'
      };
    }
    return {
      bg: 'bg-stone-50',
      text: 'text-stone-700',
      border: 'border-stone-100',
      statusColor: 'text-stone-400'
    };
  };

  const colors = getColors();

  return (
    <div className="flex flex-col items-end">
      <div className={`${colors.bg} ${colors.text} ${colors.border} flex items-center gap-2 px-4 py-1.5 rounded-full border font-mono text-[13px] font-bold shadow-sm`}>
        {score} / {max} pts
      </div>
      {status && (
        <span className={`text-[10px] font-bold ${colors.statusColor} mt-1 uppercase tracking-widest italic leading-none`}>
          {status}
        </span>
      )}
    </div>
  );
};

export default ScoreBadge;
