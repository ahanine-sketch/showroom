import React from 'react';
import Link from 'next/link';

export default function Page() {
  return (
    <>
<header className="fixed top-0 right-0 left-0 h-[60px] z-40 bg-white/80 backdrop-blur-xl flex items-center justify-between px-8">
<div className="flex items-center gap-4">
<nav className="flex items-center gap-2">
<span className="text-[10px] font-label text-stone-400 uppercase tracking-tighter">Tableau de bord</span>
<span className="material-symbols-outlined text-[14px] text-stone-300">chevron_right</span>
<span className="text-[10px] font-label text-stone-900 uppercase tracking-tighter border-b border-yellow-600">Overview</span>
</nav>
</div>
<div className="flex items-center gap-6">
<div className="flex items-center gap-4 border-r border-stone-100 pr-6">
<button className="text-stone-400 hover:text-yellow-600 transition-all">
<span className="material-symbols-outlined text-[20px]">search</span>
</button>
<button className="relative text-stone-400 hover:text-yellow-600 transition-all">
<span className="material-symbols-outlined text-[20px]">notifications</span>
<span className="absolute top-0 right-0 w-1.5 h-1.5 bg-primary rounded-full"></span>
</button>
</div>
<div className="flex items-center gap-3">
<div className="text-right">
<p className="text-[12px] font-medium leading-none text-on-surface">Meryem Alami</p>
<p className="text-[10px] font-label text-stone-400 uppercase mt-1">Owner</p>
</div>
<img alt="User Profile" className="w-8 h-8 rounded-full object-cover ring-2 ring-stone-50" data-alt="professional corporate headshot of a middle-aged woman with a confident expression in a brightly lit modern office background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZ7eKYbMcB3xqW0Gcq1VkvM-G6jPrF8hcqTuWa7hFpL9gy4lw_1kK5-gzN8I-aMqhbBlqzAQihLj7lRgIOo6aaPkig8hIOfB_34jWbLr3fMdPVkrenITHHhzktM-CW29zKiCiWrBu4HVNYu1uIid8bUszqNSv44PqnnJKNIHU9leFA3UjdIrYNPiiWGvzbzzTViL7yz_o7mj8n12gnBpLj-6ZQrVinK7VxYvS6zH9qAfRmgVxzM15v1U-cqpH_VbkXbyLh3FfyORSX"/>
</div>
</div>
</header>
<div className="pt-[92px] px-12 pb-20 max-w-[1400px] mx-auto">

<div className="mb-12 flex justify-between items-end">
<div>
<h2 className="text-4xl font-editorial text-on-surface tracking-tight">Tableau de bord</h2>
<p className="text-stone-500 mt-2 font-body italic">Aperçu global de la performance de vos showrooms.</p>
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
<span className="text-sm font-body text-stone-400 italic">sur 6 showrooms</span>
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
<p className="text-[11px] font-label text-stone-400 uppercase tracking-widest mb-4">Meilleur showroom</p>
<h3 className="text-2xl font-headline text-on-surface mb-2 italic">Casa Anfa</h3>
<div className="flex items-center gap-2">
<span className="text-primary text-xl font-label font-bold">88</span>
<span className="text-[10px] font-label text-stone-400 uppercase">/ 100 score</span>
</div>
</div>
</div>

<div className="grid grid-cols-2 gap-8">

<Link className="bg-surface-container-lowest p-8 rounded-xl shadow-sm hover:shadow-xl hover:border-primary-container border border-transparent transition-all duration-500 flex flex-col justify-between h-[320px] group" href="/owner/showrooms/casablanca">
<div className="flex justify-between items-start mb-6">
<div>
<h4 className="text-2xl font-headline text-on-surface">Showroom Casa Anfa</h4>
<p className="text-stone-400 text-sm mt-1">Boulevard de l'Océan, Casablanca</p>
</div>
<span className="px-3 py-1 bg-stone-100 rounded-full text-[10px] font-label uppercase text-stone-600 tracking-widest">Casablanca</span>
</div>
<div className="flex items-center gap-3 mb-8">
<img alt="Admin Avatar" className="w-10 h-10 rounded-full object-cover" data-alt="portrait of a professional male manager in a luxury retail environment with soft background lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVGafg6EWcsuyuhokwe079hgx6YzunEuPhT_j9FhsUL88rx5lWlxODpqY9tWvanlrniw7M_ghmR4m2VQ666VvPTefqssbscJkDShiJZqOA0DPV6vJsdFM0ygJGluSoPTq-ELPPXgBPet_W2nEz-KBl3yHRWD4b8xh4Fb1PX7_wo-EonFej_wmcH1okOvm-uPD8E55T8kyfCyMzgNvGhXdVHLq9fA9owZm_rDgpiTrHZH6u59wguljeLY0NN3GoQAQpkC95u1YYy4Ff"/>
<div>
<p className="text-xs text-stone-400 uppercase font-label tracking-tighter">Responsable</p>
<p className="text-sm font-medium text-on-surface">Omar Bensouda</p>
</div>
</div>
<div className="space-y-2 mb-8">
<div className="flex justify-between text-[11px] font-label text-stone-400 uppercase tracking-wider">
<span>Performance CA</span>
<span className="text-on-surface">92%</span>
</div>
<div className="h-1 w-full bg-stone-100 rounded-full overflow-hidden">
<div className="h-full bg-primary-container" style={{width: '92%'}}></div>
</div>
</div>
<div className="flex items-end justify-between">
<div>
<span className="text-5xl font-label font-bold text-on-surface tracking-tighter">88</span>
<span className="text-stone-400 text-sm font-label uppercase ml-1">/ 100</span>
</div>
<div className="text-primary hover:text-on-primary-container font-medium text-sm flex items-center gap-1 group-hover:translate-x-1 transition-all">
                            Voir détails
                            <span className="material-symbols-outlined text-[18px]">arrow_right_alt</span>
</div>
</div>
</Link>

<Link className="bg-surface-container-lowest p-8 rounded-xl shadow-sm hover:shadow-xl hover:border-primary-container border border-transparent transition-all duration-500 flex flex-col justify-between h-[320px] group" href="/owner/showrooms/rabat">
<div className="flex justify-between items-start mb-6">
<div>
<h4 className="text-2xl font-headline text-on-surface">Showroom Rabat Agdal</h4>
<p className="text-stone-400 text-sm mt-1">Avenue de France, Rabat</p>
</div>
<span className="px-3 py-1 bg-stone-100 rounded-full text-[10px] font-label uppercase text-stone-600 tracking-widest">Rabat</span>
</div>
<div className="flex items-center gap-3 mb-8">
<img alt="Admin Avatar" className="w-10 h-10 rounded-full object-cover" data-alt="professional woman manager in an elegant showroom setting with high-end furniture in the background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvrcd7E8Zj5jYyJaN8WVprgDfIgN3amL6Cb_jiKMRZSbKdBw0L58iPfKJPwfOx6t50VIs7TvattglVPtKS-L_IzD2Hn9m-VcYazXyWpmpbrWMbTOcVyQmLWHmuyjcqkwajiKousFW7qKv7iMVpCM2KiNKZAbzeW1kaIeOdaLRRindOKtaPtMVw9GHyioMA-_KuHYSFPCM7Rjun6hIXGYthsBoNfPFqQEX6fJTEvUh0-5fggeYsLG5fJKKyRSLJIfMQTr2tn1IepNzG"/>
<div>
<p className="text-xs text-stone-400 uppercase font-label tracking-tighter">Responsable</p>
<p className="text-sm font-medium text-on-surface">Sofia Laroui</p>
</div>
</div>
<div className="space-y-2 mb-8">
<div className="flex justify-between text-[11px] font-label text-stone-400 uppercase tracking-wider">
<span>Performance CA</span>
<span className="text-on-surface">74%</span>
</div>
<div className="h-1 w-full bg-stone-100 rounded-full overflow-hidden">
<div className="h-full bg-primary-container" style={{width: '74%'}}></div>
</div>
</div>
<div className="flex items-end justify-between">
<div>
<span className="text-5xl font-label font-bold text-on-surface tracking-tighter">82</span>
<span className="text-stone-400 text-sm font-label uppercase ml-1">/ 100</span>
</div>
<div className="text-primary hover:text-on-primary-container font-medium text-sm flex items-center gap-1 group-hover:translate-x-1 transition-all">
                            Voir détails
                            <span className="material-symbols-outlined text-[18px]">arrow_right_alt</span>
</div>
</div>
</Link>

<Link className="bg-surface-container-lowest p-8 rounded-xl shadow-sm hover:shadow-xl hover:border-primary-container border border-transparent transition-all duration-500 flex flex-col justify-between h-[320px] group" href="/owner/showrooms/marrakech">
<div className="flex justify-between items-start mb-6">
<div>
<h4 className="text-2xl font-headline text-on-surface">Showroom Marrakech</h4>
<p className="text-stone-400 text-sm mt-1">Hivernage, Marrakech</p>
</div>
<span className="px-3 py-1 bg-stone-100 rounded-full text-[10px] font-label uppercase text-stone-600 tracking-widest">Marrakech</span>
</div>
<div className="flex items-center gap-3 mb-8">
<div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 font-label text-xs">YA</div>
<div>
<p className="text-xs text-stone-400 uppercase font-label tracking-tighter">Responsable</p>
<p className="text-sm font-medium text-on-surface">Youssef Amrani</p>
</div>
</div>
<div className="space-y-2 mb-8">
<div className="flex justify-between text-[11px] font-label text-stone-400 uppercase tracking-wider">
<span>Performance CA</span>
<span className="text-on-surface">61%</span>
</div>
<div className="h-1 w-full bg-stone-100 rounded-full overflow-hidden">
<div className="h-full bg-primary-container" style={{width: '61%'}}></div>
</div>
</div>
<div className="flex items-end justify-between">
<div>
<span className="text-5xl font-label font-bold text-on-surface tracking-tighter">71</span>
<span className="text-stone-400 text-sm font-label uppercase ml-1">/ 100</span>
</div>
<div className="text-primary hover:text-on-primary-container font-medium text-sm flex items-center gap-1 group-hover:translate-x-1 transition-all">
                            Voir détails
                            <span className="material-symbols-outlined text-[18px]">arrow_right_alt</span>
</div>
</div>
</Link>

<Link className="bg-surface-container-lowest p-8 rounded-xl shadow-sm hover:shadow-xl hover:border-primary-container border border-transparent transition-all duration-500 flex flex-col justify-between h-[320px] group" href="/owner/showrooms/tanger">
<div className="flex justify-between items-start mb-6">
<div>
<h4 className="text-2xl font-headline text-on-surface">Showroom Tanger</h4>
<p className="text-stone-400 text-sm mt-1">Marina Bay, Tanger</p>
</div>
<span className="px-3 py-1 bg-stone-100 rounded-full text-[10px] font-label uppercase text-stone-600 tracking-widest">Tanger</span>
</div>
<div className="flex items-center gap-3 mb-8">
<img alt="Admin Avatar" className="w-10 h-10 rounded-full object-cover" data-alt="professional male showroom manager standing in a sleek minimalist boutique background with warm accent lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjZ9qRPxFG3QoHUBe2mFqJWCY4wQVS0NbgXT898MuedohWaqGlxxjKiq68vOg9FdZK1GGPQ46XWnxx6H_e3W86IkUzBmRsMaPTB5UAlNxYeSGAlawNc8Y1ZpYm_CRUIFAP1ul5_9rwXYX998w_5dtIQ4bjoh89t0u2u3LyJxR68iuzV7VLusXtykum-BnbgTJFjA8X_L74NxSIrhJ4D5svA6keR8sI1zMHHvn0Aq5uximgrLv9E9_gwW-bcM_Hwy_eNla-z-U4uYyy"/>
<div>
<p className="text-xs text-stone-400 uppercase font-label tracking-tighter">Responsable</p>
<p className="text-sm font-medium text-on-surface">Hassan Tazi</p>
</div>
</div>
<div className="space-y-2 mb-8">
<div className="flex justify-between text-[11px] font-label text-stone-400 uppercase tracking-wider">
<span>Performance CA</span>
<span className="text-on-surface">85%</span>
</div>
<div className="h-1 w-full bg-stone-100 rounded-full overflow-hidden">
<div className="h-full bg-primary-container" style={{width: '85%'}}></div>
</div>
</div>
<div className="flex items-end justify-between">
<div>
<span className="text-5xl font-label font-bold text-on-surface tracking-tighter">79</span>
<span className="text-stone-400 text-sm font-label uppercase ml-1">/ 100</span>
</div>
<div className="text-primary hover:text-on-primary-container font-medium text-sm flex items-center gap-1 group-hover:translate-x-1 transition-all">
                            Voir détails
                            <span className="material-symbols-outlined text-[18px]">arrow_right_alt</span>
</div>
</div>
</Link>

<Link className="bg-surface-container-lowest p-8 rounded-xl shadow-sm hover:shadow-xl hover:border-primary-container border border-transparent transition-all duration-500 flex flex-col justify-between h-[320px] group" href="/owner/showrooms/agadir">
<div className="flex justify-between items-start mb-6">
<div>
<h4 className="text-2xl font-headline text-on-surface">Showroom Agadir</h4>
<p className="text-stone-400 text-sm mt-1">Cité Founty, Agadir</p>
</div>
<span className="px-3 py-1 bg-stone-100 rounded-full text-[10px] font-label uppercase text-stone-600 tracking-widest">Agadir</span>
</div>
<div className="flex items-center gap-3 mb-8">
<div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 font-label text-xs">IK</div>
<div>
<p className="text-xs text-stone-400 uppercase font-label tracking-tighter">Responsable</p>
<p className="text-sm font-medium text-on-surface">Imane Kabbaj</p>
</div>
</div>
<div className="space-y-2 mb-8">
<div className="flex justify-between text-[11px] font-label text-stone-400 uppercase tracking-wider">
<span>Performance CA</span>
<span className="text-on-surface">45%</span>
</div>
<div className="h-1 w-full bg-stone-100 rounded-full overflow-hidden">
<div className="h-full bg-error" style={{width: '45%'}}></div>
</div>
</div>
<div className="flex items-end justify-between">
<div>
<span className="text-5xl font-label font-bold text-on-surface tracking-tighter text-error">58</span>
<span className="text-stone-400 text-sm font-label uppercase ml-1">/ 100</span>
</div>
<div className="text-primary hover:text-on-primary-container font-medium text-sm flex items-center gap-1 group-hover:translate-x-1 transition-all">
                            Voir détails
                            <span className="material-symbols-outlined text-[18px]">arrow_right_alt</span>
</div>
</div>
</Link>

<Link className="bg-surface-container-lowest p-8 rounded-xl shadow-sm hover:shadow-xl hover:border-primary-container border border-transparent transition-all duration-500 flex flex-col justify-between h-[320px] group" href="/owner/showrooms/fes">
<div className="flex justify-between items-start mb-6">
<div>
<h4 className="text-2xl font-headline text-on-surface">Showroom Fès</h4>
<p className="text-stone-400 text-sm mt-1">Route d'Imouzzer, Fès</p>
</div>
<span className="px-3 py-1 bg-stone-100 rounded-full text-[10px] font-label uppercase text-stone-600 tracking-widest">Fès</span>
</div>
<div className="flex items-center gap-3 mb-8">
<img alt="Admin Avatar" className="w-10 h-10 rounded-full object-cover" data-alt="sharp professional businessman in a navy suit against a clean architectural interior background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC04rnJmfZvWP1ZvpFlJf_72_j59aiTC0ncmXE3LaZie7pLVfnb7gXMwrBcoaHDf2GzNoRhRWAh1P5Z8PbczvgsGT1pT_cgayyzQJTaa5KVQhBgZ6fqN0T3D6YBkCcKfVAWwRhAQh1BUd0cGXiqM8II-um6W3gLFDg61rkCiS1kb6cpzDbmbccvCCFSIXOZLm2VeYnDzRd6gnDG4EbNts6NBINFwHOclyhCJlRJaJP5amQmybcQ7rhZfFjqzSYQqCL77g3NkiWnMWSM"/>
<div>
<p className="text-xs text-stone-400 uppercase font-label tracking-tighter">Responsable</p>
<p className="text-sm font-medium text-on-surface">Adil Filali</p>
</div>
</div>
<div className="space-y-2 mb-8">
<div className="flex justify-between text-[11px] font-label text-stone-400 uppercase tracking-wider">
<span>Performance CA</span>
<span className="text-on-surface">68%</span>
</div>
<div className="h-1 w-full bg-stone-100 rounded-full overflow-hidden">
<div className="h-full bg-primary-container" style={{width: '68%'}}></div>
</div>
</div>
<div className="flex items-end justify-between">
<div>
<span className="text-5xl font-label font-bold text-on-surface tracking-tighter">65</span>
<span className="text-stone-400 text-sm font-label uppercase ml-1">/ 100</span>
</div>
<div className="text-primary hover:text-on-primary-container font-medium text-sm flex items-center gap-1 group-hover:translate-x-1 transition-all">
                            Voir détails
                            <span className="material-symbols-outlined text-[18px]">arrow_right_alt</span>
</div>
</div>
</Link>
</div>

<div className="mt-16 pt-8 border-t border-stone-200/50 flex justify-between items-center text-stone-400 font-label text-[10px] uppercase tracking-[0.2em]">
<div>© 2024 ShowroomIQ — Intelligence Opérationnelle</div>
<div className="flex gap-8">
<span>Dernière mise à jour: Aujourd'hui, 09:42</span>
<span>Status Système: <span className="text-green-600">Optimal</span></span>
</div>
</div>
</div>
    </>
  );
}
