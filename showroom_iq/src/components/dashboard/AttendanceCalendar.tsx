import React from 'react';

const AttendanceCalendar = () => {
  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const monthData = [...Array(30)].map((_, i) => ({
    day: i + 1,
    status: (i + 1) === 1 || (i + 1) === 8 || (i + 1) === 15 ? 'retard' : 
            (i + 1) === 12 ? 'absence' : 
            (i + 1) === 20 ? 'conge' : 'present'
  }));

  return (
    <div className="bg-white rounded-[32px] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-stone-100 flex flex-col group relative overflow-hidden">
        <div className="flex justify-between items-center mb-6 w-full relative z-10 px-4 pt-2">
          <div>
            <h4 className="font-headline text-3xl italic tracking-tight text-stone-900 mb-1">Log d'assiduité</h4>
            <span className="text-[10px] uppercase font-mono font-bold tracking-[0.5em] text-stone-300">Mensuel Showroom</span>
          </div>
          <div className="flex gap-4">
             <div className="flex bg-stone-50 border border-stone-100 shadow-sm p-1.5 rounded-2xl group/btn hover:scale-105 transition-transform cursor-pointer">
                <button className="px-5 py-2 text-[13px] font-bold text-stone-900 font-headline italic">Avril 2025</button>
             </div>
             <div className="flex gap-2">
                <button className="w-10 h-10 rounded-full border border-stone-100 bg-white hover:bg-stone-50 transition-all shadow-sm flex items-center justify-center">
                   <span className="material-symbols-outlined text-[18px] text-stone-400">chevron_left</span>
                </button>
                <button className="w-10 h-10 rounded-full border border-stone-100 bg-white hover:bg-stone-50 transition-all shadow-sm flex items-center justify-center">
                   <span className="material-symbols-outlined text-[18px] text-stone-400">chevron_right</span>
                </button>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-3 mb-6 relative z-10">
          {days.map(day => (
            <div key={day} className="text-center text-[9px] font-bold text-stone-300 uppercase tracking-[0.2em] py-3 bg-stone-50/50 rounded-lg border border-stone-50/50">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-3 relative z-10">
           <div className="aspect-[2/1] opacity-20 bg-stone-50 rounded-xl border border-stone-50 group-hover:scale-95 transition-transform duration-500"></div>
            {monthData.map((item, i) => (
              <div key={i} className={`aspect-[2/1] p-2 rounded-xl border transition-all cursor-pointer relative group/day flex flex-col justify-between overflow-hidden ${
                item.day === 8 ? 'border-yellow-700 bg-yellow-50/30' : 'border-stone-50 hover:border-stone-200 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.01)] hover:shadow-xl hover:-translate-y-1'
              }`}>
                 <span className={`font-mono text-[13px] font-bold ${item.day === 8 ? 'text-yellow-700' : 'text-stone-300 group-hover/day:text-stone-900 transition-colors'}`}>
                   {item.day < 10 ? `0${item.day}` : item.day}
                </span>
                
                <div className="flex gap-1.5 justify-end items-center h-4">
                   {item.status === 'retard' && (
                     <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.6)] animate-pulse"></div>
                   )}
                   {item.status === 'absence' && (
                     <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)] animate-pulse"></div>
                   )}
                   {item.status === 'conge' && (
                     <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)] opacity-60"></div>
                   )}
                </div>

                {/* Hover Indicator */}
                <div className="absolute inset-0 bg-stone-900/0 group-hover/day:bg-stone-900/5 transition-colors pointer-events-none"></div>
             </div>
           ))}
        </div>

        <div className="mt-8 flex gap-8 pt-6 border-t border-stone-50 relative z-10">
           <div className="flex items-center gap-3 group/legend cursor-help">
              <div className="w-4 h-4 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)] group-hover:scale-125 transition-transform"></div>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-stone-400 font-bold group-hover:text-stone-900 transition-colors">RETARD</span>
           </div>
           <div className="flex items-center gap-3 group/legend cursor-help">
              <div className="w-4 h-4 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)] group-hover:scale-125 transition-transform"></div>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-stone-400 font-bold group-hover:text-stone-900 transition-colors">ABSENCE</span>
           </div>
           <div className="flex items-center gap-3 group/legend cursor-help">
              <div className="w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)] group-hover:scale-125 transition-transform"></div>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-stone-400 font-bold group-hover:text-stone-900 transition-colors">CONGÉ</span>
           </div>
        </div>

        <div className="absolute -right-20 -top-20 w-96 h-96 bg-stone-50 rounded-full blur-3xl opacity-50 group-hover:scale-110 transition-transform duration-1000 ease-out pointer-events-none"></div>
    </div>
  );
};

export default AttendanceCalendar;
