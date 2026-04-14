import React from 'react';

export default function Page() {
  return (
    <>
      

<aside className="fixed left-0 top-0 h-screen w-[240px] z-50 flex flex-col h-full border-r border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-950 shadow-[20px_0_40px_rgba(27,28,25,0.03)]">
<div className="p-8">
<h1 className="text-[28px] font-serif italic text-yellow-600 dark:text-yellow-500 tracking-tight">SIQ</h1>
<p className="font-mono text-[10px] uppercase tracking-widest text-stone-400 mt-1">ShowroomIQ</p>
</div>
<nav className="flex-1 mt-4 px-4 space-y-2">
<a className="flex items-center gap-3 text-stone-500 dark:text-stone-400 pl-4 py-2 hover:text-stone-900 hover:bg-stone-50 transition-colors duration-300" href="#">
<span className="material-symbols-outlined text-[20px]">diamond</span>
<span className="text-sm font-label">Collections</span>
</a>
<a className="flex items-center gap-3 text-stone-500 dark:text-stone-400 pl-4 py-2 hover:text-stone-900 hover:bg-stone-50 transition-colors duration-300" href="#">
<span className="material-symbols-outlined text-[20px]">storefront</span>
<span className="text-sm font-label">Showrooms</span>
</a>
<a className="flex items-center gap-3 text-stone-500 dark:text-stone-400 pl-4 py-2 hover:text-stone-900 hover:bg-stone-50 transition-colors duration-300" href="#">
<span className="material-symbols-outlined text-[20px]">inventory_2</span>
<span className="text-sm font-label">Inventory</span>
</a>
<a className="flex items-center gap-3 text-yellow-700 dark:text-yellow-500 border-l-2 border-yellow-600 pl-4 py-2 font-medium bg-stone-50/50" href="#">
<span className="material-symbols-outlined text-[20px]">groups</span>
<span className="text-sm font-label">Clients</span>
</a>
<a className="flex items-center gap-3 text-stone-500 dark:text-stone-400 pl-4 py-2 hover:text-stone-900 hover:bg-stone-50 transition-colors duration-300" href="#">
<span className="material-symbols-outlined text-[20px]">analytics</span>
<span className="text-sm font-label">Reports</span>
</a>
</nav>
<div className="p-6 border-t border-stone-50">
<div className="flex flex-col gap-2">
<a className="flex items-center gap-3 text-stone-400 text-xs font-label px-4 py-2 hover:text-stone-900 transition-colors" href="#">
<span className="material-symbols-outlined text-[18px]">settings</span>
<span>Settings</span>
</a>
<a className="flex items-center gap-3 text-stone-400 text-xs font-label px-4 py-2 hover:text-stone-900 transition-colors" href="#">
<span className="material-symbols-outlined text-[18px]">help</span>
<span>Support</span>
</a>
</div>
</div>
</aside>

<header className="fixed top-0 right-0 w-[calc(100%-240px)] h-[60px] z-40 bg-white/80 dark:bg-stone-950/80 backdrop-blur-xl flex items-center justify-between px-8">
<div className="flex items-center gap-8">
<div className="flex items-center bg-surface-container-low px-3 py-1.5 rounded-full">
<span className="material-symbols-outlined text-stone-400 text-lg">search</span>
<input className="bg-transparent border-none focus:ring-0 text-xs font-mono w-48 placeholder-stone-400" disabled={true} placeholder="Search archives..." type="text"/>
</div>
<nav className="flex gap-6">
<a className="text-stone-400 dark:text-stone-500 font-mono text-[11px] uppercase tracking-wider hover:text-yellow-600 transition-all" href="#">Dashboard</a>
<a className="text-stone-900 dark:text-stone-50 border-b border-yellow-600 pb-1 font-mono text-[11px] uppercase tracking-wider" href="#">Exhibition</a>
<a className="text-stone-400 dark:text-stone-500 font-mono text-[11px] uppercase tracking-wider hover:text-yellow-600 transition-all" href="#">Archives</a>
</nav>
</div>
<div className="flex items-center gap-4">
<button className="text-stone-400 hover:text-yellow-600 transition-colors">
<span className="material-symbols-outlined">notifications</span>
</button>
<div className="w-8 h-8 rounded-full overflow-hidden border border-stone-100 shadow-sm">
<img className="w-full h-full object-cover" data-alt="professional portrait of a high-end commercial agent in a tailored suit against a neutral background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDuxLTJqiykHf22cAnJSRJt1zZvS2yUaizevJP80kJqp96pMAPn6vQi_MowOI_jPIDAKdgrSEI45F_9EfPe3ezpEh6rXkZs0dHybf5ul6bLfnRonmbk51YB_EIEB-GY0Heeob4nPFyZFN8NHtlb3K1GC3QQCAostRSF75OpEWlFCKPa0f-VXRXkqOIpGGNkwPCsUJ37TSN_Elxm6219itgcYR_hl4Zw5NbSXXCktIjY3ODzexA8wihDDF5YoGq5zvwaG96WuxORwzrj"/>
</div>
</div>
</header>

<main className="pl-[240px] pt-[60px] min-h-screen">

<div className="px-12 pt-8">
<div className="bg-[#E9F5EC] border border-[#D1EBD9] py-3 px-6 rounded-xl flex items-center justify-between">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-[#2D6A4F] text-lg">auto_awesome</span>
<span className="text-[#2D6A4F] font-medium text-[14px]">Excellente semaine ! Score: 88/100</span>
</div>
<span className="text-[#2D6A4F]/60 text-[12px] font-mono">Performance Update: Now</span>
</div>
</div>

<section className="px-12 py-10 flex items-end justify-between">
<div className="flex items-center gap-8">
<div className="relative group">
<div className="w-32 h-32 rounded-2xl overflow-hidden shadow-2xl rotate-[-2deg]">
<img className="w-full h-full object-cover" data-alt="Close-up portrait of an elegant professional man with sharp features and a confident gaze" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhfIkL0T6E_iQkt6AGq42Gk4iA5rYM99kbTkwU-YplbKW9lLLOyQBuf7aKzlA91rLgG0-fs7XaYutqSSyqbkjM2iUHtrEIBH2s_y_AMkL51jxT56An0Zm0Tx92Ckx08bnM62DMIoBNi1mkHXeccNdZLp0roKcq-5rDswjguH8okbZDrNz-xpPbqRzz5P4tAAxFtdj1z1BLsrWmYt6WpdFEv2zDHMYX4rKowAw5_07DDY-Jy5An3feDvPxeJSq2yWXjm7ysQOcovVRX"/>
</div>
<div className="absolute -bottom-2 -right-2 bg-primary text-white w-12 h-12 rounded-xl flex items-center justify-center font-serif italic text-lg shadow-lg rotate-[4deg]">88</div>
</div>
<div>
<span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-400">Commercial Senior</span>
<h2 className="text-4xl font-serif mt-1 text-on-surface">Marc-Antoine Laurent</h2>
<p className="text-stone-500 font-body text-sm mt-2 max-w-md">Dedicated to the curation of luxury experiences and meticulous inventory management within the Parisian showroom sector.</p>
</div>
</div>
<div className="flex gap-4">
<div className="bg-surface-container-low px-6 py-4 rounded-xl border-b-2 border-primary/20">
<span className="block text-stone-400 text-[10px] font-mono uppercase tracking-widest mb-1">Rank</span>
<span className="text-2xl font-serif text-primary">Platinum Elite</span>
</div>
</div>
</section>

<div className="px-12 border-b border-stone-100">
<div className="flex gap-10">
<button className="pb-4 border-b-2 border-primary text-on-surface font-label text-sm flex items-center gap-2">
<span className="material-symbols-outlined text-[18px]">payments</span> Ventes
                </button>
<button className="pb-4 text-stone-400 font-label text-sm flex items-center gap-2 hover:text-stone-600 transition-colors">
<span className="material-symbols-outlined text-[18px]">insights</span> Comportement
                </button>
<button className="pb-4 text-stone-400 font-label text-sm flex items-center gap-2 hover:text-stone-600 transition-colors">
<span className="material-symbols-outlined text-[18px]">calendar_today</span> Calendrier
                </button>
<button className="pb-4 text-stone-400 font-label text-sm flex items-center gap-2 hover:text-stone-600 transition-colors">
<span className="material-symbols-outlined text-[18px]">folder_open</span> Ressources
                </button>
</div>
</div>

<div className="p-12 grid grid-cols-12 gap-8">

<div className="col-span-8 space-y-8">
<div className="grid grid-cols-2 gap-6">
<div className="bg-surface-container-lowest p-8 rounded-2xl shadow-[0_20px_40px_rgba(27,28,25,0.02)] relative overflow-hidden group">
<div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
<span className="font-mono text-[11px] text-stone-400 uppercase tracking-widest">Revenue (Q3)</span>
<div className="text-4xl font-serif text-on-surface mt-4">€482,000.00</div>
<div className="mt-4 flex items-center gap-2 text-green-600 text-xs">
<span className="material-symbols-outlined text-sm">trending_up</span>
<span>+12.4% vs last period</span>
</div>
</div>
<div className="bg-surface-container-lowest p-8 rounded-2xl shadow-[0_20px_40px_rgba(27,28,25,0.02)] relative overflow-hidden group">
<div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
<span className="font-mono text-[11px] text-stone-400 uppercase tracking-widest">Active Leads</span>
<div className="text-4xl font-serif text-on-surface mt-4">42</div>
<div className="mt-4 flex items-center gap-2 text-stone-500 text-xs">
<span className="material-symbols-outlined text-sm">hourglass_empty</span>
<span>8 pending final signature</span>
</div>
</div>
</div>

<div className="bg-surface-container-low p-8 rounded-3xl">
<div className="flex justify-between items-center mb-8">
<h3 className="font-serif text-2xl italic">Dernières Activités</h3>
<span className="text-[10px] font-mono text-stone-400 border border-stone-200 px-2 py-1 rounded">Mise à jour à 14:00</span>
</div>
<div className="space-y-4">
<div className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl border border-stone-100/50">
<div className="flex items-center gap-4">
<div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 font-mono text-xs">HJ</div>
<div>
<p className="text-sm font-medium">Hôtel de Jussieu — Collection Printemps</p>
<p className="text-[11px] text-stone-400 font-mono uppercase">Vente validée • 12 Oct</p>
</div>
</div>
<span className="text-primary font-serif italic text-lg">€12,400</span>
</div>
<div className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl border border-stone-100/50">
<div className="flex items-center gap-4">
<div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 font-mono text-xs">RL</div>
<div>
<p className="text-sm font-medium">Residence Louvre — Mobilier Sur Mesure</p>
<p className="text-[11px] text-stone-400 font-mono uppercase">En attente • 11 Oct</p>
</div>
</div>
<span className="text-stone-400 font-serif italic text-lg">€35,000</span>
</div>
<div className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl border border-stone-100/50 opacity-60">
<div className="flex items-center gap-4">
<div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 font-mono text-xs">CC</div>
<div>
<p className="text-sm font-medium">Château de Courcelles — Archive Search</p>
<p className="text-[11px] text-stone-400 font-mono uppercase">Consultation • 09 Oct</p>
</div>
</div>
<span className="text-stone-400 font-serif italic text-lg">—</span>
</div>
</div>
</div>
</div>

<div className="col-span-4 space-y-8">

<div className="bg-surface-container-lowest p-8 rounded-3xl shadow-[0_20px_40px_rgba(27,28,25,0.02)]">
<h3 className="font-serif text-xl mb-6">Ressources Utiles</h3>
<div className="space-y-3">
<div className="group flex items-center justify-between p-4 rounded-xl hover:bg-stone-50 transition-all cursor-pointer border border-transparent hover:border-stone-100">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-primary">description</span>
<span className="text-sm text-stone-600 font-medium">Catalogue_A24.pdf</span>
</div>
<span className="material-symbols-outlined text-stone-300 group-hover:text-primary transition-colors">download</span>
</div>
<div className="group flex items-center justify-between p-4 rounded-xl hover:bg-stone-50 transition-all cursor-pointer border border-transparent hover:border-stone-100">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-primary">table_chart</span>
<span className="text-sm text-stone-600 font-medium">Tarifs_Premium_2024.xlsx</span>
</div>
<span className="material-symbols-outlined text-stone-300 group-hover:text-primary transition-colors">download</span>
</div>
<div className="group flex items-center justify-between p-4 rounded-xl hover:bg-stone-50 transition-all cursor-pointer border border-transparent hover:border-stone-100">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-primary">picture_as_pdf</span>
<span className="text-sm text-stone-600 font-medium">Guide_Ethique_Vente.pdf</span>
</div>
<span className="material-symbols-outlined text-stone-300 group-hover:text-primary transition-colors">download</span>
</div>
</div>
<button className="w-full mt-6 py-3 text-primary text-[10px] font-mono uppercase tracking-[0.2em] border border-primary/10 rounded-lg hover:bg-primary/5 transition-all">
                        Voir toute la bibliothèque
                    </button>
</div>

<div className="bg-stone-900 text-white p-8 rounded-3xl overflow-hidden relative">
<div className="absolute top-0 right-0 p-4 opacity-10">
<span className="material-symbols-outlined text-9xl">event</span>
</div>
<h3 className="font-serif text-xl mb-6 relative z-10">À venir cette semaine</h3>
<div className="space-y-6 relative z-10">
<div className="flex gap-4">
<div className="text-primary font-mono text-xs pt-1">MON</div>
<div>
<p className="text-sm font-medium">Réunion d'équipe hebdomadaire</p>
<p className="text-[11px] text-stone-400">09:00 — Showroom Marais</p>
</div>
</div>
<div className="flex gap-4">
<div className="text-primary font-mono text-xs pt-1">WED</div>
<div>
<p className="text-sm font-medium">Visite client: Private Collection</p>
<p className="text-[11px] text-stone-400">14:30 — Archives</p>
</div>
</div>
<div className="flex gap-4">
<div className="text-primary font-mono text-xs pt-1">FRI</div>
<div>
<p className="text-sm font-medium">Clôture des inventaires Q3</p>
<p className="text-[11px] text-stone-400">18:00 — Digital Signature</p>
</div>
</div>
</div>
</div>
</div>
</div>

<div className="fixed -bottom-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
</main>

    </>
  );
}
