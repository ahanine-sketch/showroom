'use client';

import React from 'react';

interface PeriodSelectorProps {
  selectedMonth: number;
  selectedYear: number;
  onChange: (month: number, year: number) => void;
  className?: string;
}

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export default function PeriodSelector({ selectedMonth, selectedYear, onChange, className = '' }: PeriodSelectorProps) {
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];

  return (
    <div className={`flex items-center gap-2 bg-stone-100/50 p-1 rounded-xl border border-stone-200/50 ${className}`}>
      <select 
        value={selectedMonth}
        onChange={(e) => onChange(parseInt(e.target.value), selectedYear)}
        className="bg-transparent text-[11px] font-bold uppercase tracking-widest text-stone-600 px-3 py-1.5 outline-none cursor-pointer hover:text-stone-900 transition-colors"
      >
        {MONTHS.map((name, i) => (
          <option key={name} value={i + 1}>{name}</option>
        ))}
      </select>
      <div className="w-[1px] h-4 bg-stone-200" />
      <select 
        value={selectedYear}
        onChange={(e) => onChange(selectedMonth, parseInt(e.target.value))}
        className="bg-transparent text-[11px] font-bold uppercase tracking-widest text-stone-600 px-3 py-1.5 outline-none cursor-pointer hover:text-stone-900 transition-colors"
      >
        {years.map(y => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
    </div>
  );
}
