import React from 'react';

interface ScoreBadgeProps {
  score: number;
  max: number;
  status?: string;
  color?: string;
}

/** Converts a hex color to an rgba string with the given opacity */
const hexToRgba = (hex: string, alpha: number): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(0,0,0,${alpha})`;
  return `rgba(${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)},${alpha})`;
};

/** True when the string looks like a CSS hex color (#rgb or #rrggbb) */
const isHex = (v: string) => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v);

const ScoreBadge = ({ score, max, status, color }: ScoreBadgeProps) => {
  // --- Hex color path (database-stored values like #22c55e) ---
  if (color && isHex(color)) {
    const badgeStyle: React.CSSProperties = {
      backgroundColor: hexToRgba(color, 0.1),
      color: color,
      borderColor: hexToRgba(color, 0.25),
    };
    return (
      <div className="flex flex-col items-end">
        <div
          style={badgeStyle}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full border font-mono text-[13px] font-bold shadow-sm"
        >
          {score} / {max} pts
        </div>
        {status && (
          <span
            style={{ color }}
            className="text-[10px] font-bold mt-1 uppercase tracking-widest italic leading-none"
          >
            {status}
          </span>
        )}
      </div>
    );
  }

  // --- Named color / status fallback path ---
  const getColors = () => {
    if (color) {
      const c = color.toLowerCase();
      const baseColors: Record<string, any> = {
        emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', statusColor: 'text-emerald-500' },
        green:   { bg: 'bg-green-50',   text: 'text-green-700',   border: 'border-green-100',   statusColor: 'text-green-500'   },
        yellow:  { bg: 'bg-yellow-50',  text: 'text-yellow-700',  border: 'border-yellow-100',  statusColor: 'text-yellow-500'  },
        orange:  { bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-100',  statusColor: 'text-orange-500'  },
        red:     { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-100',     statusColor: 'text-red-500'     },
        blue:    { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-100',    statusColor: 'text-blue-500'    },
        indigo:  { bg: 'bg-indigo-50',  text: 'text-indigo-700',  border: 'border-indigo-100',  statusColor: 'text-indigo-500'  },
        rose:    { bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-100',    statusColor: 'text-rose-500'    },
        amber:   { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-100',   statusColor: 'text-amber-500'   },
      };
      if (baseColors[c]) return baseColors[c];
    }

    const normalizedStatus = status?.toUpperCase();
    if (normalizedStatus === 'TRES BIEN' || normalizedStatus === 'TRÈS BIEN') {
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', statusColor: 'text-emerald-500' };
    }
    if (normalizedStatus === 'BIEN') {
      return { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-100', statusColor: 'text-yellow-500' };
    }
    if (normalizedStatus === 'MOYEN') {
      return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-100', statusColor: 'text-orange-500' };
    }
    if (normalizedStatus === 'MAUVAIS') {
      return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-100', statusColor: 'text-red-500' };
    }
    return { bg: 'bg-stone-50', text: 'text-stone-700', border: 'border-stone-100', statusColor: 'text-stone-400' };
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
