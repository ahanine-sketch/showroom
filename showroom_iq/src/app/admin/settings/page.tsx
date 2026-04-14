import React from 'react';

export default function Page() {
  return (
    <>
<header className="fixed top-0 right-0 left-[280px] h-[60px] z-40 bg-white/80 dark:bg-stone-950/80 backdrop-blur-xl flex items-center justify-between px-8 border-b border-stone-100">
<div className="flex items-center gap-6">
<div className="font-mono text-[11px] uppercase tracking-widest text-stone-400 flex gap-2">
<span className="opacity-50">ADMIN</span>
<span className="opacity-30">/</span>
<span className="text-yellow-700">Paramètres</span>
</div>
</div>
<div className="flex items-center gap-6">
<span className="material-symbols-outlined text-stone-400 cursor-pointer hover:text-yellow-700" data-icon="search">search</span>
<div className="relative">
<span className="material-symbols-outlined text-stone-400 cursor-pointer hover:text-yellow-700" data-icon="notifications">notifications</span>
<div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-600 rounded-full"></div>
</div>
<div className="w-8 h-8 rounded-full bg-stone-200 overflow-hidden border border-outline-variant/20">
<img className="w-full h-full object-cover" data-alt="Professional male portrait in a tailored suit against a neutral studio background, high-end editorial style" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBy-K1ils53I0nSmplpRjRO8fy5Mz25Y3I9qgT0pJzDnWEBjTwF8-iA2722k18xHCet7vT3k5Weh60xc_POYz6LI3DPbN60z7ZGIDMmywMOnIDOZAg8zPaNTuG5NbMrzIkZsy6BNHqVBkZJs0lO5Z8pnsJOPl0VVQF-HoLdUOEwdCypxW-VVYj23sa5HQFmjHGuEs5E9mn1iy0oDWNXm3YoedvqufPmdk2kO-WFwHDgLmAhY3QNaLdJ4C35675QmHWxjpfHBWGnfPtq"/>
</div>
</div>
</header>
<div className="pt-[100px] px-12 pb-24 max-w-6xl mx-auto">

<div className="mb-12">
<h2 className="font-headline text-4xl text-on-surface tracking-tight mb-2">Paramètres</h2>
<p className="font-mono text-xs text-stone-500 uppercase tracking-[0.2em]">Showroom Executive Dashboard</p>
</div>
<div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

<section className="lg:col-span-7 space-y-10">
<div className="flex items-baseline justify-between">
<h3 className="font-serif-accent text-3xl text-on-surface">MON PROFIL</h3>
<div className="h-px flex-1 bg-outline-variant/30 mx-6"></div>
</div>
<div className="bg-surface-container-lowest p-10 rounded-xl shadow-[0_20px_40px_rgba(27,28,25,0.02)] border border-outline-variant/10">
<div className="flex flex-col md:flex-row gap-10 items-start">
<div className="flex flex-col items-center gap-4">
<div className="w-[80px] h-[80px] rounded-full overflow-hidden ring-4 ring-surface-container shadow-lg">
<img className="w-full h-full object-cover" data-alt="Close-up of a sophisticated male administrator, neutral lighting, soft textures, luxury aesthetic" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjXhVZ5nESdApgmrIUVsNIw1MYqRyyOI0j5139mjsWQQNML-kJsQ3f6NkUDppGBcwRyfprO8cyo_DEegoNarO0ofNzp8Fn5dkw8QAg2LahK32OZOm7h-zr6Lz4533Nie1eQTy7MceLtlMXajL_xM50PvoOuq_vbVcqoIeBcBxiCAEXt7awef8LzwuoBAB3P-QRbqNQp73M6s8Vrqz1eQWKGX7qOqrXAZhM5_QlyTOZjoDuYpvKxBPitrz5ckuVUXr6JEM_VxFuBzMe"/>
</div>
<button className="text-xs font-mono text-yellow-700 hover:text-yellow-600 underline underline-offset-4 uppercase tracking-wider">Changer la photo</button>
</div>
<div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 w-full">
<div className="flex flex-col gap-2">
<label className="font-mono text-[10px] uppercase tracking-widest text-stone-400">Nom complet</label>
<input className="bg-surface border-none px-4 py-3 rounded-lg font-body text-sm text-on-surface w-full" type="text" value="Jean-Baptiste Lemaire"/>
</div>
<div className="flex flex-col gap-2">
<label className="font-mono text-[10px] uppercase tracking-widest text-stone-400">Email</label>
<input className="bg-surface border-none px-4 py-3 rounded-lg font-body text-sm text-on-surface w-full" type="email" value="jb.lemaire@showroom-iq.com"/>
</div>
<div className="flex flex-col gap-2">
<label className="font-mono text-[10px] uppercase tracking-widest text-stone-400">Téléphone</label>
<input className="bg-surface border-none px-4 py-3 rounded-lg font-body text-sm text-on-surface w-full" type="tel" value="+33 1 45 67 89 00"/>
</div>
<div className="flex flex-col gap-2">
<label className="font-mono text-[10px] uppercase tracking-widest text-stone-400">Titre</label>
<input className="bg-surface border-none px-4 py-3 rounded-lg font-body text-sm text-on-surface w-full" type="text" value="Directeur Régional"/>
</div>
</div>
</div>

<div className="mt-12 pt-8 border-t border-outline-variant/20">
<details className="group">
<summary className="flex items-center justify-between cursor-pointer list-none">
<div className="flex items-center gap-3 text-stone-600 group-hover:text-primary transition-colors">
<span className="material-symbols-outlined" data-icon="lock">lock</span>
<span className="font-medium text-sm">Changer mot de passe</span>
</div>
<span className="material-symbols-outlined text-stone-400 group-open:rotate-180 transition-transform" data-icon="expand_more">expand_more</span>
</summary>
<div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
<div className="flex flex-col gap-2">
<label className="font-mono text-[10px] uppercase tracking-widest text-stone-400">Ancien mot de passe</label>
<input className="bg-surface border-none px-4 py-3 rounded-lg font-body text-sm w-full" type="password"/>
</div>
<div className="flex flex-col gap-2">
<label className="font-mono text-[10px] uppercase tracking-widest text-stone-400">Nouveau mot de passe</label>
<input className="bg-surface border-none px-4 py-3 rounded-lg font-body text-sm w-full" type="password"/>
</div>
</div>
</details>
</div>
<div className="mt-12 flex justify-end">
<button className="luxury-gradient px-10 py-4 rounded-full text-white font-medium text-sm tracking-wide shadow-xl shadow-yellow-900/10 hover:opacity-90 transition-all flex items-center gap-2">
                                Sauvegarder
                                <span className="material-symbols-outlined text-[18px]" data-icon="check">check</span>
</button>
</div>
</div>
</section>

<section className="lg:col-span-5 space-y-10">
<div className="flex items-baseline justify-between">
<h3 className="font-serif-accent text-3xl text-on-surface">SCORING</h3>
<div className="h-px flex-1 bg-outline-variant/30 mx-6"></div>
</div>
<div className="bg-surface-container-low p-8 rounded-xl border border-outline-variant/10">
<div className="flex items-center justify-between mb-8">
<div>
<p className="font-headline text-xl text-on-surface">Showroom Paris</p>
<p className="font-mono text-[10px] text-stone-500 uppercase tracking-widest">Active Weights Configuration</p>
</div>
<span className="material-symbols-outlined text-yellow-700 bg-white p-2 rounded-full" data-icon="tune">tune</span>
</div>
<div className="space-y-4">
<div className="bg-surface-container-lowest p-5 rounded-lg flex items-center justify-between group hover:shadow-md transition-shadow">
<div>
<p className="text-xs font-mono text-stone-400 uppercase tracking-tighter">Metric 01</p>
<p className="text-sm font-semibold text-on-surface">Conversion Rate</p>
</div>
<div className="flex items-center gap-4">
<div className="w-24 h-1.5 bg-surface rounded-full overflow-hidden">
<div className="h-full bg-yellow-600 w-3/4"></div>
</div>
<span className="font-mono text-sm text-yellow-800">75%</span>
</div>
</div>
<div className="bg-surface-container-lowest p-5 rounded-lg flex items-center justify-between group hover:shadow-md transition-shadow">
<div>
<p className="text-xs font-mono text-stone-400 uppercase tracking-tighter">Metric 02</p>
<p className="text-sm font-semibold text-on-surface">Engagement Level</p>
</div>
<div className="flex items-center gap-4">
<div className="w-24 h-1.5 bg-surface rounded-full overflow-hidden">
<div className="h-full bg-yellow-600 w-1/2"></div>
</div>
<span className="font-mono text-sm text-yellow-800">50%</span>
</div>
</div>
<div className="bg-surface-container-lowest p-5 rounded-lg flex items-center justify-between group hover:shadow-md transition-shadow">
<div>
<p className="text-xs font-mono text-stone-400 uppercase tracking-tighter">Metric 03</p>
<p className="text-sm font-semibold text-on-surface">Purchase History</p>
</div>
<div className="flex items-center gap-4">
<div className="w-24 h-1.5 bg-surface rounded-full overflow-hidden">
<div className="h-full bg-yellow-600 w-2/3"></div>
</div>
<span className="font-mono text-sm text-yellow-800">66%</span>
</div>
</div>
</div>
<div className="mt-8 pt-6 border-t border-outline-variant/30 text-center">
<button className="text-xs font-mono uppercase tracking-widest text-stone-500 hover:text-yellow-700 transition-colors">
                                Reset to Default Values
                            </button>
</div>
</div>

<div className="relative overflow-hidden bg-stone-900 rounded-xl p-8 text-white">
<div className="absolute -right-8 -bottom-8 opacity-10">
<span className="material-symbols-outlined text-[160px]" data-icon="auto_awesome">auto_awesome</span>
</div>
<h4 className="font-serif-accent text-2xl mb-4 italic">The Intelligence Engine</h4>
<p className="text-stone-400 text-sm leading-relaxed mb-6">
                            Scoring parameters are calculated in real-time based on your showroom's historical data. Any modification will impact client prioritization immediately.
                        </p>
<a className="inline-flex items-center gap-2 text-yellow-500 font-mono text-[10px] uppercase tracking-widest hover:text-yellow-400" href="#">
                            Learn more about the algorithm
                            <span className="material-symbols-outlined text-sm" data-icon="north_east">north_east</span>
</a>
</div>
</section>
</div>
</div>
    </>
  );
}
