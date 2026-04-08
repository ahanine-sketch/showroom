import React from 'react';

export default function Page() {
  return (
    <>
<header className="fixed top-0 right-0 left-0 h-[60px] z-40 flex items-center justify-between px-8 bg-white/80 dark:bg-stone-950/80 backdrop-blur-xl">
<div className="flex items-center gap-4">
<span className="mono-text text-[11px] uppercase tracking-[0.2em] text-stone-400">Settings / Configuration</span>
</div>
<div className="flex items-center gap-6">
<div className="flex items-center gap-6 mr-6 border-r border-stone-100 pr-6">
<a className="text-stone-400 hover:text-yellow-600 transition-all mono-text text-[11px] uppercase tracking-widest" href="#">Dashboard</a>
<a className="text-stone-400 hover:text-yellow-600 transition-all mono-text text-[11px] uppercase tracking-widest" href="#">Exhibition</a>
<a className="text-stone-400 hover:text-yellow-600 transition-all mono-text text-[11px] uppercase tracking-widest" href="#">Archives</a>
</div>
<div className="flex items-center gap-4">
<span className="material-symbols-outlined text-stone-400 cursor-pointer hover:text-primary">notifications</span>
<span className="material-symbols-outlined text-stone-400 cursor-pointer hover:text-primary">search</span>
<div className="w-8 h-8 rounded-full bg-stone-200 overflow-hidden border border-stone-100">
<img alt="User Profile" className="w-full h-full object-cover" data-alt="professional portrait of a luxury showroom manager in a modern office setting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2lMDXgJ0K1T8amilYKiKreBaTZ6HyEFRsWiht4K1mB9UplHwon64Kz-CjZHkq5v1sh5IJn3OYUQRJEk4bpSWJiWwVUDaKiPniSHlxkM2fcMTP5imCkD6-h_vjRtAz_sNSZO-pH5YyOUfcyuFy9GyHPm4gJe3W5AOwm2FtD-1oK1Cvz9YTPF-xF4d2tl9pFeOVwLJth96a3BzFz8J1PUjJqjQDteI6DQ0phmNWx17S5xZ1wYP-GTO5KUqSp7ZVmOovUlu4969mQquU"/>
</div>
</div>
</div>
</header>
<div className="pt-24 px-12 pb-20 max-w-7xl mx-auto">

<div className="flex items-end justify-between mb-12">
<div className="max-w-2xl">
<h1 className="serif-text text-5xl font-light text-on-surface mb-4 tracking-tight">Configuration du scoring</h1>
<p className="text-stone-500 font-light leading-relaxed">
                        Ajustez les pondérations et les seuils critiques pour vos indicateurs de performance. Ces métriques définissent le score de santé global de vos showrooms et collections.
                    </p>
</div>
<div className="flex flex-col items-end gap-2">
<span className="mono-text text-[10px] uppercase tracking-widest text-stone-400">Total Validé</span>
<div className="bg-error-container/30 border border-error/10 px-4 py-2 rounded-full flex items-center gap-3">
<span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
<span className="mono-text font-bold text-error">85 / 100</span>
</div>
</div>
</div>

<div className="bg-surface-container-lowest rounded-xl shadow-[0_20px_40px_rgba(27,28,25,0.03)] overflow-hidden border border-stone-100/50">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container-low/50">
<th className="px-8 py-5 mono-text text-[12px] font-medium text-stone-400 uppercase tracking-widest">Métrique</th>
<th className="px-6 py-5 mono-text text-[12px] font-medium text-stone-400 uppercase tracking-widest text-center">Max Pts</th>
<th className="px-6 py-5 mono-text text-[12px] font-medium text-stone-400 uppercase tracking-widest text-center">Seuils Critiques (%)</th>
<th className="px-8 py-5 mono-text text-[12px] font-medium text-stone-400 uppercase tracking-widest text-right">Visualisation</th>
</tr>
</thead>
<tbody className="divide-y divide-stone-50">

<tr className="hover:bg-surface-container-low/30 transition-colors group">
<td className="px-8 py-6">
<span className="font-medium text-on-surface block">% Atteinte Objectif</span>
<span className="text-[11px] text-stone-400 uppercase tracking-tighter">Ventes vs Prévisions</span>
</td>
<td className="px-6 py-6 text-center">
<input className="w-20 bg-surface-container-low border-none rounded px-3 py-2 mono-text text-sm focus:ring-1 focus:ring-primary text-center" type="number" value="40"/>
</td>
<td className="px-6 py-6">
<div className="flex items-center justify-center gap-2">
<input className="w-16 bg-surface-container-low border-none rounded px-2 py-2 mono-text text-xs focus:ring-1 focus:ring-primary text-center" placeholder="Min" type="number" value="60"/>
<span className="text-stone-300">—</span>
<input className="w-16 bg-surface-container-low border-none rounded px-2 py-2 mono-text text-xs focus:ring-1 focus:ring-primary text-center" placeholder="Mid" type="number" value="85"/>
</div>
</td>
<td className="px-8 py-6">
<div className="flex items-center justify-end gap-3">
<div className="w-6 h-6 rounded-full bg-error/20 border-2 border-error"></div>
<div className="w-6 h-6 rounded-full bg-yellow-400/20 border-2 border-yellow-500"></div>
<div className="w-6 h-6 rounded-full bg-emerald-500/20 border-2 border-emerald-600"></div>
</div>
</td>
</tr>

<tr className="bg-surface-container-low/20 hover:bg-surface-container-low/30 transition-colors group">
<td className="px-8 py-6">
<span className="font-medium text-on-surface block">Close Rate</span>
<span className="text-[11px] text-stone-400 uppercase tracking-tighter">Conversion prospects</span>
</td>
<td className="px-6 py-6 text-center">
<input className="w-20 bg-surface-container-low border-none rounded px-3 py-2 mono-text text-sm focus:ring-1 focus:ring-primary text-center" type="number" value="25"/>
</td>
<td className="px-6 py-6">
<div className="flex items-center justify-center gap-2">
<input className="w-16 bg-surface-container-low border-none rounded px-2 py-2 mono-text text-xs focus:ring-1 focus:ring-primary text-center" type="number" value="15"/>
<span className="text-stone-300">—</span>
<input className="w-16 bg-surface-container-low border-none rounded px-2 py-2 mono-text text-xs focus:ring-1 focus:ring-primary text-center" type="number" value="30"/>
</div>
</td>
<td className="px-8 py-6">
<div className="flex items-center justify-end gap-3">
<div className="w-6 h-6 rounded-full bg-orange-600/20 border-2 border-orange-700"></div>
<div className="w-6 h-6 rounded-full bg-yellow-400/20 border-2 border-yellow-500"></div>
<div className="w-6 h-6 rounded-full bg-blue-500/20 border-2 border-blue-600"></div>
</div>
</td>
</tr>

<tr className="hover:bg-surface-container-low/30 transition-colors group">
<td className="px-8 py-6">
<span className="font-medium text-on-surface block">Panier Moyen</span>
<span className="text-[11px] text-stone-400 uppercase tracking-tighter">Valeur par transaction</span>
</td>
<td className="px-6 py-6 text-center">
<input className="w-20 bg-surface-container-low border-none rounded px-3 py-2 mono-text text-sm focus:ring-1 focus:ring-primary text-center" type="number" value="20"/>
</td>
<td className="px-6 py-6">
<div className="flex items-center justify-center gap-2">
<input className="w-16 bg-surface-container-low border-none rounded px-2 py-2 mono-text text-xs focus:ring-1 focus:ring-primary text-center" type="number" value="50"/>
<span className="text-stone-300">—</span>
<input className="w-16 bg-surface-container-low border-none rounded px-2 py-2 mono-text text-xs focus:ring-1 focus:ring-primary text-center" type="number" value="75"/>
</div>
</td>
<td className="px-8 py-6">
<div className="flex items-center justify-end gap-3">
<div className="w-6 h-6 rounded-full bg-error/20 border-2 border-error"></div>
<div className="w-6 h-6 rounded-full bg-stone-300/20 border-2 border-stone-400"></div>
<div className="w-6 h-6 rounded-full bg-primary/20 border-2 border-primary"></div>
</div>
</td>
</tr>

<tr className="bg-surface-container-low/20 hover:bg-surface-container-low/30 transition-colors group">
<td className="px-8 py-6">
<span className="font-medium text-on-surface block">Taux de Retour</span>
<span className="text-[11px] text-stone-400 uppercase tracking-tighter">Satisfaction client</span>
</td>
<td className="px-6 py-6 text-center">
<input className="w-20 bg-surface-container-low border-none rounded px-3 py-2 mono-text text-sm focus:ring-1 focus:ring-primary text-center" type="number" value="15"/>
</td>
<td className="px-6 py-6">
<div className="flex items-center justify-center gap-2">
<input className="w-16 bg-surface-container-low border-none rounded px-2 py-2 mono-text text-xs focus:ring-1 focus:ring-primary text-center" type="number" value="5"/>
<span className="text-stone-300">—</span>
<input className="w-16 bg-surface-container-low border-none rounded px-2 py-2 mono-text text-xs focus:ring-1 focus:ring-primary text-center" type="number" value="12"/>
</div>
</td>
<td className="px-8 py-6">
<div className="flex items-center justify-end gap-3">
<div className="w-6 h-6 rounded-full bg-emerald-500/20 border-2 border-emerald-600"></div>
<div className="w-6 h-6 rounded-full bg-yellow-400/20 border-2 border-yellow-500"></div>
<div className="w-6 h-6 rounded-full bg-error/20 border-2 border-error"></div>
</div>
</td>
</tr>
</tbody>
</table>
</div>

<div className="mt-12 flex items-center justify-between">
<div className="flex items-center gap-2 text-stone-400 mono-text text-[11px]">
<span className="material-symbols-outlined text-[16px]">info</span>
<span>Modifié par Admin le 12/10/2023</span>
</div>
<div className="flex items-center gap-4">
<button className="px-8 py-3 mono-text text-xs uppercase tracking-widest text-stone-500 hover:text-on-surface transition-colors">
                        Réinitialiser
                    </button>
<button className="px-10 py-3 bg-primary text-white rounded-lg text-sm font-medium shadow-xl shadow-primary/20 hover:translate-y-[-1px] active:translate-y-[1px] transition-all">
                        Sauvegarder les modifications
                    </button>
</div>
</div>

<div className="mt-24 grid grid-cols-12 gap-6">
<div className="col-span-8 p-12 bg-surface-container-low rounded-xl relative overflow-hidden">
<div className="relative z-10">
<h3 className="serif-text text-2xl mb-4">Pourquoi le scoring ?</h3>
<p className="text-stone-600 leading-relaxed max-w-md">
                            Le système de scoring intelligent ShowroomIQ permet de standardiser l'excellence opérationnelle à travers votre réseau. En définissant des seuils précis, vous recevez des alertes proactives avant que les performances ne chutent.
                        </p>
</div>
<div className="absolute right-[-40px] bottom-[-20px] w-64 h-64 opacity-10">
<span className="material-symbols-outlined text-[200px]">auto_graph</span>
</div>
</div>
<div className="col-span-4 p-8 bg-stone-900 text-white rounded-xl flex flex-col justify-between">
<div className="w-12 h-12 rounded-lg bg-yellow-600/30 flex items-center justify-center">
<span className="material-symbols-outlined text-yellow-500">verified</span>
</div>
<div>
<p className="mono-text text-[10px] uppercase tracking-widest text-stone-500 mb-2">Statut du Système</p>
<h4 className="text-xl font-medium mb-1">Optimisation Active</h4>
<p className="text-stone-400 text-sm">Vos algorithmes de prédiction utilisent actuellement 88% des données historiques.</p>
</div>
</div>
</div>
</div>
    </>
  );
}
