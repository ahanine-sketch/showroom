import React from 'react';

export default function Page() {
  return (
    <>
<header className="sticky top-0 h-[60px] bg-white/80 backdrop-blur-xl z-40 px-12 flex items-center justify-between border-b border-stone-100">
<div className="flex items-center gap-3 font-precise text-[11px] uppercase tracking-wider text-outline">
<span>Tableau de bord</span>
<span className="text-[14px]">/</span>
<span>Showrooms</span>
<span className="text-[14px]">/</span>
<span className="text-primary font-bold">Casa Anfa</span>
</div>
<div className="flex items-center gap-6">
<div className="flex gap-4">
<span className="material-symbols-outlined text-outline cursor-pointer hover:text-primary">notifications</span>
<span className="material-symbols-outlined text-outline cursor-pointer hover:text-primary">search</span>
</div>
<div className="h-8 w-8 rounded-full bg-surface-container overflow-hidden">
<img className="w-full h-full object-cover" data-alt="Professional portrait of a male showroom manager in a minimalist studio with soft natural lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuABXnfMCQhR0p-Zqn4x4sz1DuYgNoA1vkNWDhiT8SgaJIQSCKbIyoqlS6tEspsRMWTuTA1gOmSV-gnuH0-bVm4DxGgmAurUGTK0D0oOwrrctHSW4Scm46rpIZV8dM8gjbK6xT4sKnLLkAZvnS5VqQNaSu49y_9auyR7aLolVwvjGn2o6K8FqfdtvXFfknn6DQKDIZGVLyyjqvmQiUbnFL3bbRLH6dwurlSBJ-y-b1WynCYDKwX4Bxhqn7Yh5VLxc3p973qU_GiTH7ty"/>
</div>
</div>
</header>
<div className="px-12 py-10 max-w-7xl mx-auto">

<section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end mb-16">
<div>
<h1 className="text-[48px] font-headline text-on-surface leading-none mb-4 italic">Casa Anfa</h1>
<div className="flex items-center gap-2 text-outline mb-8">
<span className="material-symbols-outlined text-sm">location_on</span>
<span className="text-sm font-medium">Boulevard de la Grande Ceinture, Casablanca, Maroc</span>
</div>
<div className="flex flex-wrap gap-4">
<div className="bg-surface-container-low px-5 py-3 rounded-xl border border-outline-variant/10">
<span className="block text-[10px] font-precise uppercase tracking-tighter text-outline mb-1">Commerciaux</span>
<span className="text-xl font-headline font-semibold">4</span>
</div>
<div className="bg-surface-container-low px-5 py-3 rounded-xl border border-outline-variant/10">
<span className="block text-[10px] font-precise uppercase tracking-tighter text-outline mb-1">Chiffre d'Affaires</span>
<span className="text-xl font-headline font-semibold">1.2M MAD</span>
</div>
<div className="bg-surface-container-low px-5 py-3 rounded-xl border border-outline-variant/10">
<span className="block text-[10px] font-precise uppercase tracking-tighter text-outline mb-1">Performance Score</span>
<span className="text-xl font-headline font-semibold text-primary">78</span>
</div>
</div>
</div>
<div className="bg-surface-container-lowest p-8 rounded-2xl shadow-[0_20px_40px_rgba(27,28,25,0.03)] flex items-center gap-6 border border-outline-variant/20">
<div className="w-20 h-20 rounded-full bg-stone-100 overflow-hidden shrink-0 border-2 border-primary-container/20 p-1">
<img className="w-full h-full object-cover rounded-full" data-alt="Modern business executive woman smiling confidently with professional attire in high-end office interior" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDCE01cGBrF4AZBi3ld--wPxVJ89RJ7-TlfZ1H55u-LOOQy7p1f5FJvio7X-70JBzaVmeVJZvTQbSMdfOgKKJdSFTXxv8W9-zUoQmGr5LbhuwIDaWZMNpUSMVrHOpOSPRr1YyQObggyZCvvecFXARbtW0LFCIICCJ5HXidtukh-fppBO32FfJnsmBVFJtTiGqr7jM7anSq6vYRVRuFWf9n6-kSDqqzeqLS0b87GeUHLJw_cE5oahgFEMiKUHB4dRv6QNSAngKAGnq9l"/>
</div>
<div>
<span className="text-[10px] font-precise uppercase tracking-widest text-primary mb-1 block">Administrateur Showroom</span>
<h3 className="text-xl font-headline font-bold text-on-surface">Sofia El Mansouri</h3>
<div className="mt-3 flex flex-col gap-1">
<div className="flex items-center gap-2 text-outline text-[13px]">
<span className="material-symbols-outlined text-[16px]">mail</span>
<span>s.elmansouri@showroomiq.ma</span>
</div>
<div className="flex items-center gap-2 text-outline text-[13px]">
<span className="material-symbols-outlined text-[16px]">call</span>
<span>+212 5 22 45 67 89</span>
</div>
</div>
</div>
</div>
</section>

<section className="mb-20">
<div className="bg-surface-container-low rounded-3xl p-12 flex flex-col items-center relative overflow-hidden">

<div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
<h2 className="text-sm font-precise uppercase tracking-widest text-outline mb-12">Objectif Mensuel</h2>
<div className="relative w-[320px] h-[160px] flex justify-center">

<svg className="absolute inset-0" height="160" viewBox="0 0 320 160" width="320">

<path d="M 10 150 A 140 140 0 0 1 310 150" fill="none" stroke="#e4e2dd" strokeLinecap="round" strokeWidth="24"></path>

<path d="M 10 150 A 140 140 0 0 1 160 10" fill="none" opacity="0.1" stroke="#ba1a1a" strokeDasharray="0 440" strokeWidth="24"></path>

<path d="M 10 150 A 140 140 0 0 1 270 50" fill="none" stroke="url(#goldGradient)" strokeLinecap="round" strokeWidth="24"></path>
<defs>
<linearGradient id="goldGradient" x1="0%" x2="100%" y1="0%" y2="0%">
<stop offset="0%" style={{stopColor: '#725c00', stopOpacity: '1'}}></stop>
<stop offset="100%" style={{stopColor: '#b8960c', stopOpacity: '1'}}></stop>
</linearGradient>
</defs>
</svg>

<div className="absolute bottom-0 w-1 h-32 bg-on-surface origin-bottom transform rotate-[55deg] transition-transform duration-1000">
<div className="w-4 h-4 bg-on-surface rounded-full absolute -bottom-2 -left-[6px] border-4 border-surface-container-low"></div>
</div>

<div className="absolute bottom-0 text-center flex flex-col items-center">
<span className="text-3xl font-headline font-black tracking-tight text-on-surface">1 200 000 MAD</span>
<div className="mt-4 bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-[12px] font-bold">
                                80% ATTEINT
                            </div>
</div>
</div>
<div className="mt-12 flex justify-between w-full max-w-lg text-[10px] font-precise uppercase text-outline">
<span>0 MAD</span>
<span>Objectif: 1.5M MAD</span>
</div>
</div>
</section>

<section>
<div className="flex items-end justify-between mb-8">
<div>
<h2 className="text-2xl font-headline font-semibold text-on-surface italic">Équipe Commerciale</h2>
<p className="text-sm text-outline">Gestion des accès et performances individuelles</p>
</div>
<button className="flex items-center gap-2 px-6 py-3 luxury-gradient text-white rounded-full text-sm font-medium shadow-xl hover:opacity-90 transition-all active:scale-95">
<span className="material-symbols-outlined text-[20px]">add</span>
<span>Ajouter commercial</span>
</button>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

<div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10 hover:shadow-xl transition-all group">
<div className="flex items-start justify-between mb-6">
<div className="w-14 h-14 rounded-full overflow-hidden">
<img className="w-full h-full object-cover" data-alt="Close-up of a smiling young male professional with a clean-cut look and stylish glasses" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCni09QTtRJFG4icvYfEkBXZA7uPDecvxETUTPzUjKlJ_t5MZbZshKcJ4viZ43mHv6y6qXOg3KBisnuTtUVIQqJ27ZqcPE68mqRJaf3qKrYKDPNJ0JathVTHQavIBTzF_HDYnWwd30Ws3p5tlz3puvLbeTCCO46ztpMjWF_nMjp7cQqJe8qtOkJQ76oUoEQqGdtMipwRdA3qzmo6KRfX3vjaqiPVdztaXWOU7_upbGBGCllDGAR56Qe-n__Yvy3i2t6esbThkzZpGnv"/>
</div>
<span className="bg-surface-container-high text-primary px-3 py-1 rounded-lg text-[11px] font-precise font-bold">SCORE: 92</span>
</div>
<h4 className="text-lg font-headline font-bold text-on-surface">Amine Bennani</h4>
<p className="text-xs text-outline mb-6">Senior Account Executive</p>
<div className="space-y-2">
<div className="flex justify-between text-[10px] font-precise uppercase text-outline">
<span>Performance</span>
<span className="text-on-surface">88%</span>
</div>
<div className="h-1 w-full bg-surface-container-high rounded-full overflow-hidden">
<div className="h-full bg-primary luxury-gradient" style={{width: '88%'}}></div>
</div>
</div>
</div>

<div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10 hover:shadow-xl transition-all group">
<div className="flex items-start justify-between mb-6">
<div className="w-14 h-14 rounded-full overflow-hidden">
<img className="w-full h-full object-cover" data-alt="Portrait of a creative professional woman with a calm expression in a warm naturally lit studio" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQYnOHeE-C9kBAFz9aK8MEUMikHirp0i5smCQgWVtFNKavKFUgbRJ6tjFyo7kNQqjQDm_XPA7foaHYSHJxi2kzzs_428EnERYhg1W3cddSAGPT_7LBnIFYuN0uXKF0J7NEWEveQBFZxSeI2utvO5mBWP4hQZwjnFcJWduNGDxLf17KxDHWgakp3EACoh-L7YN2QH1bcDuKwCofg6IhL9lphBMtD9ATgwbwogt-eFO17zkKSwrzzgBzeiups_yUVosGA81biMY0gbqn"/>
</div>
<span className="bg-surface-container-high text-primary px-3 py-1 rounded-lg text-[11px] font-precise font-bold">SCORE: 85</span>
</div>
<h4 className="text-lg font-headline font-bold text-on-surface">Yasmine Iraqi</h4>
<p className="text-xs text-outline mb-6">Sales Consultant</p>
<div className="space-y-2">
<div className="flex justify-between text-[10px] font-precise uppercase text-outline">
<span>Performance</span>
<span className="text-on-surface">74%</span>
</div>
<div className="h-1 w-full bg-surface-container-high rounded-full overflow-hidden">
<div className="h-full bg-primary luxury-gradient" style={{width: '74%'}}></div>
</div>
</div>
</div>

<div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10 hover:shadow-xl transition-all group">
<div className="flex items-start justify-between mb-6">
<div className="w-14 h-14 rounded-full overflow-hidden">
<img className="w-full h-full object-cover" data-alt="Professional portrait of a middle-aged man with sharp features and a sophisticated gaze" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBLZeZE7pGxdllvoY02pu5BtED_TtLTOdXVIy00kwNyhgT8ABtIKyx9CSiRIrhoZhacKW53sdNzPAf6TurEROivwqMyU9PLau-h5xC3ptonjeoIySue_uPNGJfqnDMmn6fJxT0qm2WXZuUgzj9f0bZaWIyTNUEg3GSNNiYu-gCzmEjUDjpgwn_fJAUBvQ8tzl6zTxEs4ELn7NaGaWJO-uNAWA6_3wBEIDa6TsckXjjFf1OzWDgILWpitUF9ewz-fspDm9yhFLVT4WYY"/>
</div>
<span className="bg-surface-container-high text-error px-3 py-1 rounded-lg text-[11px] font-precise font-bold">SCORE: 64</span>
</div>
<h4 className="text-lg font-headline font-bold text-on-surface">Omar Chraibi</h4>
<p className="text-xs text-outline mb-6">Junior Sales Rep</p>
<div className="space-y-2">
<div className="flex justify-between text-[10px] font-precise uppercase text-outline">
<span>Performance</span>
<span className="text-on-surface">52%</span>
</div>
<div className="h-1 w-full bg-surface-container-high rounded-full overflow-hidden">
<div className="h-full bg-error/40" style={{width: '52%'}}></div>
</div>
</div>
</div>
</div>
</section>
</div>
    </>
  );
}
