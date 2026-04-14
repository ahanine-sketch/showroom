import React from 'react';
import Link from 'next/link';

export default function Page() {
  return (
    <>
<div className="pt-[60px] px-12 pb-20 max-w-[1400px] mx-auto">

<div className="mb-12 flex justify-between items-end">
<div>
<h2 className="text-4xl font-editorial text-on-surface tracking-tight">Tableau de Bord</h2>
<p className="text-stone-500 mt-2 font-body italic">Aperçu global de la performance de vos magasins.</p>
</div>
</div>

<div className="grid grid-cols-4 gap-6 mb-12">

<div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_4px_20px_rgba(27,28,25,0.02)] border border-stone-50 group hover:border-primary-container/20 transition-all">
<p className="text-[11px] font-label text-stone-400 uppercase tracking-widest mb-4">CA Total — Semaine</p>
<div className="flex items-baseline gap-2">
<span className="text-2xl font-label text-on-surface font-semibold tracking-tighter">2 450 000</span>
<span className="text-sm font-label text-stone-500 uppercase">MAD</span>
</div>
<div className="mt-4 flex items-center gap-2">
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-50 text-green-700 text-[10px] font-bold">
<span className="material-symbols-outlined text-[12px]">trending_up</span>
                            +12%
                        </span>
<span className="text-[10px] text-stone-400">vs sem. précédente</span>
</div>
</div>

<div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_4px_20px_rgba(27,28,25,0.02)] border border-stone-50 group hover:border-primary-container/20 transition-all">
<p className="text-[11px] font-label text-stone-400 uppercase tracking-widest mb-4">Commerciaux actifs</p>
<div className="flex items-baseline gap-2">
<span className="text-4xl font-headline italic text-on-surface">24</span>
<span className="text-sm font-body text-stone-400 italic">sur 6 magasins</span>
</div>
<div className="mt-4 flex -space-x-2">
<div className="w-6 h-6 rounded-full bg-stone-100 border-2 border-white flex items-center justify-center text-[10px]">ML</div>
<div className="w-6 h-6 rounded-full bg-stone-200 border-2 border-white flex items-center justify-center text-[10px]">SJ</div>
<div className="w-6 h-6 rounded-full bg-stone-100 border-2 border-white flex items-center justify-center text-[10px]">AK</div>
<div className="w-6 h-6 rounded-full bg-primary-fixed border-2 border-white flex items-center justify-center text-[10px] text-on-primary-fixed">+21</div>
</div>
</div>

<div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_4px_20px_rgba(27,28,25,0.02)] border border-stone-50 group hover:border-primary-container/20 transition-all flex items-center gap-6">
<div className="relative w-16 h-16 flex items-center justify-center">
<svg className="w-full h-full transform -rotate-90">
<circle className="text-stone-100" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeWidth="3"></circle>
<circle className="text-primary-container" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeDasharray="175.9" strokeDashoffset="45.7" strokeWidth="3"></circle>
</svg>
<span className="absolute text-sm font-label font-bold text-on-surface">74</span>
</div>
<div>
<p className="text-[11px] font-label text-stone-400 uppercase tracking-widest mb-1">Score moyen</p>
<span className="inline-flex items-center px-2 py-0.5 rounded bg-yellow-50 text-yellow-800 text-[10px] font-bold">Bon</span>
<p className="text-[10px] text-stone-400 mt-2 italic">Basé sur 180 audits</p>
</div>
</div>

<div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_4px_20px_rgba(27,28,25,0.02)] border border-stone-50 group hover:border-primary-container/20 transition-all">
<p className="text-[11px] font-label text-stone-400 uppercase tracking-widest mb-4">Meilleur magasin</p>
<h3 className="text-2xl font-headline text-on-surface mb-2 italic">Casa Anfa</h3>
<div className="flex items-center gap-2">
<span className="text-primary text-xl font-label font-bold">88</span>
<span className="text-[10px] font-label text-stone-400 uppercase">/ 100 score</span>
</div>
</div>
</div>



</div>
    </>
  );
}
