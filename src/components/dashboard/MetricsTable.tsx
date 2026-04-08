import React from 'react';

const MetricsTable = () => {
  const metrics = [
    { label: 'Nb Clients', icon: 'group', sublabel: 'Servis', value: '52', color: 'emerald' },
    { label: 'Nb Ventes', icon: 'shopping_bag', sublabel: 'Conclues', value: '47', color: 'emerald' },
    { label: 'Panier Moyen', icon: 'payments', sublabel: 'MAD', value: '26 450', color: 'yellow' },
    { label: 'KPI Emplacement', icon: 'circle', sublabel: 'Placeholder', value: '--', color: 'empty' },
    { label: 'KPI Emplacement', icon: 'circle', sublabel: 'Placeholder', value: '--', color: 'empty' },
    { label: 'KPI Emplacement', icon: 'circle', sublabel: 'Placeholder', value: '--', color: 'empty' },
  ];

  return (
    <div className="bg-white rounded-[32px] p-0 shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-stone-100 overflow-hidden flex flex-col group">
      <div className="p-8 pb-4 border-b border-stone-50 flex items-center justify-between">
        <h4 className="font-headline text-3xl italic tracking-tight text-stone-900 group-hover:pl-4 transition-all">KPIs de Performance</h4>
        <div className="h-6 w-1 rounded-full bg-stone-100"></div>
      </div>

      {/* Metric Headers Grid */}
      <div className="grid grid-cols-6 border-b border-stone-50">
        {metrics.map((metric, idx) => (
          <div key={idx} className="p-5 flex flex-col items-center justify-center border-r last:border-r-0 border-stone-50 bg-stone-50/20 hover:bg-stone-50 transition-colors">
            <span className="material-symbols-outlined text-stone-300 text-[18px] mb-2">{metric.icon}</span>
            <span className="text-[9px] font-mono font-bold text-stone-400 uppercase tracking-widest text-center whitespace-nowrap">{metric.label}</span>
          </div>
        ))}
      </div>

      {/* Metric Values Grid */}
      <div className="grid grid-cols-6 mb-2">
        {metrics.map((metric, idx) => (
          <div key={idx} className="p-6 flex flex-col items-center justify-center border-r last:border-r-0 border-stone-50 bg-white group/cell hover:shadow-inner transition-shadow">
            {metric.color === 'empty' ? (
              <div className="h-[40px] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-stone-100 group-hover/cell:scale-150 transition-transform"></div>
              </div>
            ) : (
              <span className={`text-[32px] font-bold tracking-tight mb-1 font-mono group-hover/cell:scale-105 transition-transform ${metric.color === 'emerald' ? 'text-emerald-600' : 'text-yellow-700'}`}>{metric.value}</span>
            )}
            <span className="text-[10px] text-stone-300 font-medium uppercase tracking-[0.2em] font-mono">{metric.sublabel}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MetricsTable;
