'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// Luxury Color Presets
const LUXURY_COLORS = [
    { name: 'Emerald', hex: '#2A7D4F' },
    { name: 'Gold', hex: '#B8960C' },
    { name: 'Amber', hex: '#D4802A' },
    { name: 'Red', hex: '#C0392B' },
    { name: 'Stone', hex: '#5C5750' },
];

const CATEGORIES = [
    { id: 'ventes', name: 'Ventes', icon: '📊' },
    { id: 'comportement', name: 'Comportement', icon: '⭐' },
    { id: 'presence', name: 'Présence', icon: '📅' },
];

const METRICS: Record<string, { id: string, name: string, driver: string }[]> = {
    ventes: [
        { id: 'objectif-ca', name: 'Objectif CA', driver: '% Atteinte Likely' },
        { id: 'devis', name: 'Devis', driver: '% Close Rate' },
        { id: 'kpis-vente', name: 'KPIs Vente', driver: 'Panier moyen MAD' },
    ],
    comportement: [
        { id: 'avis-clients', name: 'Avis Clients', driver: 'Nb avis + et -' },
        { id: 'sav-service', name: 'SAV / Service', driver: 'Tickets & Plaintes' },
        { id: 'process', name: 'Process', driver: 'Nb avertissements' },
    ],
    presence: [
        { id: 'presence-log', name: 'Présence', driver: 'Retards & Absences' },
    ]
};

const ColorPicker = ({ selectedColor, onSelect }: { selectedColor: string, onSelect: (hex: string) => void }) => (
    <div className="flex gap-1.5 p-1 bg-stone-100 rounded-lg w-fit">
        {LUXURY_COLORS.map((color) => (
            <button
                key={color.hex}
                onClick={() => onSelect(color.hex)}
                className={`w-6 h-6 rounded-full border-2 transition-all ${
                    selectedColor === color.hex ? 'border-stone-800 scale-110 shadow-sm' : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
            />
        ))}
    </div>
);

export default function SettingsPage() {
    return (
        <Suspense fallback={<div className="p-12 text-stone-400 font-serif italic">Initialisation du configurateur dynamically...</div>}>
            <SettingsContent />
        </Suspense>
    );
}

function SettingsContent() {
    const searchParams = useSearchParams();
    const tabParam = searchParams.get('tab');
    
    const [activeTab, setActiveTab ] = useState<'commercial' | 'showroom'>('commercial');
    const [selectedCategory, setSelectedCategory] = useState<string>('ventes');
    const [selectedMetric, setSelectedMetric] = useState<string>('objectif-ca');

    // Dynamic Metric Specific Levels State
    const [metricLevels, setMetricLevels] = useState<Record<string, any[]>>({
        'objectif-ca': [
            { id: 'tb', name: 'TRÈS BIEN', criteria: 'Above Likely', points: '35', color: '#2A7D4F' },
            { id: 'b', name: 'BIEN', criteria: 'Close to Likely', points: '25', color: '#B8960C' },
            { id: 'm', name: 'MOYEN', criteria: 'Low Likely', points: '15', color: '#D4802A' },
            { id: 'mv', name: 'MAUVAIS', criteria: 'Below conservative', points: '5', color: '#C0392B' },
        ]
    });

    // Dynamic Conclusions State
    const [conclusions, setConclusions] = useState([
        { id: 'c1', name: 'Très Bien', range: 'Score > 80', commission: '5 000 MAD', color: '#2A7D4F' },
        { id: 'c2', name: 'Bien', range: 'Score 60 - 80', commission: '1 500 MAD', color: '#B8960C' },
        { id: 'c3', name: 'Moyen', range: 'Score 40 - 60', commission: '500 MAD', color: '#D4802A' },
        { id: 'c4', name: 'Mauvais', range: 'Score < 40', commission: '0 MAD', color: '#C0392B' },
    ]);

    useEffect(() => {
        if (tabParam === 'showroom') setActiveTab('showroom');
        else setActiveTab('commercial');
    }, [tabParam]);

    // Current levels helper
    const currentLevels = metricLevels[selectedMetric] || [];

    const addLevel = () => {
        const newLevel = { 
            id: Math.random().toString(36).substr(2, 9), 
            name: 'NOUVEAU', 
            criteria: 'Label', 
            points: '0', 
            color: '#5C5750' 
        };
        setMetricLevels(prev => ({
            ...prev,
            [selectedMetric]: [...(prev[selectedMetric] || []), newLevel]
        }));
    };

    const deleteLevel = (id: string) => {
        setMetricLevels(prev => ({
            ...prev,
            [selectedMetric]: prev[selectedMetric]?.filter(l => l.id !== id) || []
        }));
    };

    const updateLevel = (id: string, field: string, value: string) => {
        setMetricLevels(prev => ({
            ...prev,
            [selectedMetric]: prev[selectedMetric]?.map(l => l.id === id ? { ...l, [field]: value } : l) || []
        }));
    };

    const addConclusion = () => {
        const newConc = { 
            id: Math.random().toString(36).substr(2, 9), 
            name: 'Nouvelle Conclusion', 
            range: 'Score...', 
            commission: '0 MAD', 
            color: '#5C5750' 
        };
        setConclusions(prev => [...prev, newConc]);
    };

    const deleteConclusion = (id: string) => {
        setConclusions(prev => prev.filter(c => c.id !== id));
    };

    const updateConclusion = (id: string, field: string, value: string) => {
        setConclusions(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
    };

    return (
        <div className="min-h-screen bg-[#F7F5F0] pb-24 font-sans text-stone-900">
            {/* Topbar */}
            <header className="h-[60px] bg-white border-b border-stone-200 flex items-center justify-between px-10 sticky top-0 z-40 backdrop-blur-md bg-white/90">
                <div className="flex items-center gap-4">
                    <h2 className="font-serif text-xl font-medium tracking-tight italic text-yellow-700">SIQ Configuration</h2>
                    <span className="w-1 h-1 rounded-full bg-stone-300"></span>
                    <span className="text-[11px] font-mono text-stone-400 uppercase tracking-widest">Dynamic Engine v2.0</span>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-5 py-2 bg-stone-900 text-white rounded-full text-[11px] font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all active:scale-95">
                        Publier Modifications
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-10 pt-10">
                {/* Mode Selector */}
                <div className="flex gap-1 bg-stone-200/40 p-1.5 rounded-2xl w-fit mb-12 shadow-inner border border-stone-200/50">
                    <button 
                        onClick={() => setActiveTab('commercial')}
                        className={`px-8 py-3 rounded-xl text-[11px] tracking-[0.2em] uppercase transition-all duration-300 font-black ${
                            activeTab === 'commercial' 
                                ? 'bg-white text-yellow-700 shadow-xl scale-[1.02]' 
                                : 'text-stone-400 hover:text-stone-600'
                        }`}
                    >
                        Commercial
                    </button>
                    <button 
                        onClick={() => setActiveTab('showroom')}
                        className={`px-8 py-3 rounded-xl text-[11px] tracking-[0.2em] uppercase transition-all duration-300 font-black ${
                            activeTab === 'showroom' 
                                ? 'bg-white text-yellow-700 shadow-xl scale-[1.02]' 
                                : 'text-stone-400 hover:text-stone-600'
                        }`}
                    >
                        Showroom
                    </button>
                </div>

                {activeTab === 'commercial' ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {/* SELECTION BAR */}
                        <div className="bg-white rounded-[40px] border border-stone-200 shadow-2xl overflow-hidden mb-12">
                            <div className="bg-stone-50/80 border-b border-stone-100 p-10 flex flex-wrap items-center gap-10">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] ml-1">Catégorie</label>
                                    <div className="flex gap-3">
                                        {CATEGORIES.map(cat => (
                                            <button 
                                                key={cat.id}
                                                onClick={() => {
                                                    setSelectedCategory(cat.id);
                                                    setSelectedMetric(METRICS[cat.id][0].id);
                                                }}
                                                className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all duration-300 border-2 ${
                                                    selectedCategory === cat.id 
                                                        ? 'bg-white border-yellow-600 shadow-xl scale-[1.05]' 
                                                        : 'bg-stone-100/50 border-transparent text-stone-400 hover:bg-stone-200/50'
                                                }`}
                                            >
                                                <span className="text-xl">{cat.icon}</span>
                                                <span className={`text-[12px] font-black uppercase tracking-widest ${selectedCategory === cat.id ? 'text-stone-800' : ''}`}>{cat.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4 flex-1 min-w-[320px]">
                                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] ml-1">Paramétrage de la Métrique</label>
                                    <div className="relative">
                                        <select 
                                            value={selectedMetric}
                                            onChange={(e) => setSelectedMetric(e.target.value)}
                                            className="w-full h-16 bg-white border-2 border-stone-100 rounded-2xl px-6 text-[16px] font-bold text-stone-800 shadow-sm focus:border-yellow-600 focus:outline-none transition-all appearance-none cursor-pointer"
                                        >
                                            {METRICS[selectedCategory].map(met => (
                                                <option key={met.id} value={met.id}>{met.name} ({met.driver})</option>
                                            ))}
                                        </select>
                                        <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 text-stone-300 pointer-events-none">expand_more</span>
                                    </div>
                                </div>
                            </div>

                            {/* DYNAMIC LEVEL EDITOR */}
                            <div className="p-10">
                                <div className="flex items-center justify-between mb-10">
                                    <div className="space-y-1">
                                        <h3 className="font-serif text-3xl font-black italic text-stone-800 tracking-tighter">
                                            Configuration des Notes
                                        </h3>
                                        <p className="text-stone-400 text-xs font-medium">Metric active: <span className="text-stone-600 font-bold">{METRICS[selectedCategory].find(m => m.id === selectedMetric)?.name}</span></p>
                                    </div>
                                    <button 
                                        onClick={addLevel}
                                        className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-[1.05] transition-all active:scale-[0.98] shadow-xl group"
                                    >
                                        <span className="material-symbols-outlined text-[18px] group-hover:rotate-90 transition-transform">add</span>
                                        Ajouter une Note
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                    {currentLevels.map((level) => (
                                        <div key={level.id} className="relative p-7 rounded-[32px] bg-stone-50 border border-stone-100/50 space-y-6 transition-all hover:bg-white hover:shadow-2xl hover:border-yellow-200 group animate-in zoom-in-95 duration-300">
                                            {/* Header with Note Name & Delete */}
                                            <div className="flex items-center justify-between gap-3">
                                                <input 
                                                    className="bg-transparent border-none p-0 font-black text-[13px] uppercase tracking-[0.2em] outline-none w-full focus:text-yellow-700 transition-colors"
                                                    value={level.name}
                                                    onChange={(e) => updateLevel(level.id, 'name', e.target.value)}
                                                    style={{ color: level.color }}
                                                />
                                                <button 
                                                    onClick={() => deleteLevel(level.id)}
                                                    className="w-8 h-8 rounded-full flex items-center justify-center text-stone-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                                </button>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Libellé</label>
                                                <textarea 
                                                    className="w-full h-20 bg-white border border-stone-200 rounded-2xl p-4 text-[13px] font-medium text-stone-700 resize-none focus:ring-2 focus:ring-yellow-600/20 focus:border-yellow-600 outline-none shadow-sm transition-all"
                                                    value={level.criteria}
                                                    onChange={(e) => updateLevel(level.id, 'criteria', e.target.value)}
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Points</label>
                                                    <input 
                                                        type="text"
                                                        className="w-full h-12 text-center font-mono font-black bg-white border border-stone-200 rounded-xl text-lg text-stone-800 focus:border-yellow-600 outline-none shadow-sm"
                                                        value={level.points}
                                                        onChange={(e) => updateLevel(level.id, 'points', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1 text-center block">Couleur</label>
                                                    <div className="flex justify-center items-center h-12">
                                                        <div className="w-9 h-9 rounded-full shadow-inner border-4 border-white ring-1 ring-stone-100" style={{ backgroundColor: level.color }} />
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="pt-2 flex justify-center">
                                                <ColorPicker 
                                                    selectedColor={level.color} 
                                                    onSelect={(hex) => updateLevel(level.id, 'color', hex)}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    {currentLevels.length === 0 && (
                                        <div className="col-span-full py-20 text-center bg-stone-100/30 rounded-[32px] border-2 border-dashed border-stone-200 italic font-serif text-stone-400 text-xl">
                                            Aucune note configurée. Cliquez sur "Ajouter une Note" pour commencer.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* DYNAMIC CONCLUSION GRID */}
                        <div className="mt-20">
                            <div className="flex items-center justify-between mb-10">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-stone-900 border border-stone-800 shadow-2xl shadow-stone-900/20 flex items-center justify-center text-white text-2xl">💰</div>
                                    <div className="space-y-0.5">
                                        <h2 className="font-serif text-4xl font-black italic tracking-tighter text-stone-800">Grille de Conclusion</h2>
                                        <p className="text-stone-400 text-xs font-medium uppercase tracking-widest">Mapping Score Total → MAD Commission</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={addConclusion}
                                    className="flex items-center gap-3 px-8 py-4 bg-yellow-600 text-white rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] shadow-xl shadow-yellow-600/30 hover:bg-yellow-500 hover:scale-[1.05] transition-all active:scale-[0.95]"
                                >
                                    <span className="material-symbols-outlined text-[20px]">add_circle</span>
                                    Nouveau Palier
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                                <div className="lg:col-span-7 space-y-6">
                                    {conclusions.map((step) => (
                                        <div key={step.id} className="flex gap-6 bg-white p-7 rounded-[32px] border border-stone-100 shadow-xl group hover:shadow-2xl transition-all relative overflow-hidden animate-in slide-in-from-left-4 duration-500">
                                            <div className="w-2 shrink-0 rounded-full h-full my-auto" style={{ backgroundColor: step.color }} />
                                            <div className="flex-1 grid grid-cols-3 gap-8 items-center">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Note / Conclusion</label>
                                                    <input 
                                                        className="w-full bg-transparent font-serif text-2xl font-black text-stone-800 outline-none focus:text-yellow-600 transition-colors" 
                                                        value={step.name} 
                                                        onChange={(e) => updateConclusion(step.id, 'name', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Intervalle Score</label>
                                                    <input 
                                                        className="w-full bg-transparent font-mono text-[13px] font-bold text-stone-500 outline-none focus:text-stone-800 transition-colors" 
                                                        value={step.range} 
                                                        placeholder="ex: 80 - 100"
                                                        onChange={(e) => updateConclusion(step.id, 'range', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2 relative pr-10">
                                                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Commission MAD</label>
                                                    <input 
                                                        className="w-full bg-transparent font-black text-yellow-600 text-xl outline-none" 
                                                        value={step.commission} 
                                                        onChange={(e) => updateConclusion(step.id, 'commission', e.target.value)}
                                                    />
                                                    
                                                    {/* Delete Conclusion */}
                                                    <button 
                                                        onClick={() => deleteConclusion(step.id)}
                                                        className="absolute -right-2 top-1 w-8 h-8 rounded-full flex items-center justify-center text-stone-200 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">delete_sweep</span>
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            {/* Color selector for conclusion */}
                                            <div className="absolute top-2 right-10">
                                                <ColorPicker selectedColor={step.color} onSelect={(hex) => updateConclusion(step.id, 'color', hex)} />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* PREVIEW SIDEBAR */}
                                <div className="lg:col-span-5 sticky top-28">
                                    <div className="bg-stone-900 rounded-[48px] p-12 flex flex-col justify-between min-h-[500px] relative overflow-hidden shadow-[0_48px_100px_-24px_rgba(0,0,0,0.5)]">
                                        <div className="absolute top-0 right-0 w-80 h-80 bg-yellow-600/20 rounded-full blur-[120px]" />
                                        <div className="relative z-10">
                                            <h3 className="text-white font-serif text-4xl font-light mb-10">Aperçu du <span className="text-yellow-500 font-black italic tracking-tighter">Performance Score</span></h3>
                                            
                                            <div className="space-y-10">
                                                <div className="space-y-4">
                                                    <p className="text-stone-500 text-[11px] font-black uppercase tracking-[0.3em] ml-1">Simulateur Scorecard</p>
                                                    <div className="p-8 bg-white/5 rounded-[32px] border border-white/10 backdrop-blur-sm flex items-center justify-between group cursor-pointer hover:bg-white/10 transition-all">
                                                        <div>
                                                            <p className="text-white text-2xl font-black tracking-tight mb-1 italic">{conclusions[0]?.name || 'Note'}</p>
                                                            <p className="text-stone-500 text-[11px] font-bold uppercase tracking-widest">Basé sur la configuration actuelle</p>
                                                        </div>
                                                        <div 
                                                            className="w-16 h-16 rounded-3xl flex items-center justify-center text-white text-2xl animate-pulse shadow-2xl"
                                                            style={{ backgroundColor: conclusions[0]?.color || '#B8960C', boxShadow: `0 0 30px ${conclusions[0]?.color}40` }}
                                                        >
                                                            ✨
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="p-8 bg-white/5 rounded-[40px] border border-white/5 flex flex-col items-center">
                                                        <p className="text-stone-500 text-[10px] font-black uppercase tracking-widest mb-4">Total Points</p>
                                                        <p className="text-5xl font-mono font-black text-white tracking-widest leading-none">92</p>
                                                        <p className="text-[10px] text-stone-600 font-bold mt-2 italic">Excellent</p>
                                                    </div>
                                                    <div className="p-8 bg-yellow-600/15 rounded-[40px] border border-yellow-600/20 flex flex-col items-center">
                                                        <p className="text-yellow-600/60 text-[10px] font-black uppercase tracking-widest mb-4">Prime Estimée</p>
                                                        <p className="text-4xl font-black text-yellow-500 tracking-tighter leading-none">{conclusions[0]?.commission || '0 MAD'}</p>
                                                        <p className="text-[10px] text-yellow-600/40 font-bold mt-2 italic">Payé Mensuel</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-12 pt-8 border-t border-white/5 relative z-10 flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center text-stone-500 italic font-serif">i</div>
                                            <p className="text-stone-500 text-[12px] leading-relaxed font-light">
                                                Ce système dynamique permet aux propriétaires d'adapter instantanément les paliers de performance aux objectifs changeants de la marque.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <h1 className="font-serif text-5xl font-black text-stone-900 mb-4 tracking-tighter italic">Showroom Targets</h1>
                        <div className="h-80 bg-white rounded-[40px] border-2 border-dashed border-stone-200 flex flex-col items-center justify-center text-stone-400 font-serif italic text-2xl shadow-inner group">
                            <span className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-500">🏢</span>
                            Espace Showroom • Dynamic Builder Engine
                            <p className="text-xs font-sans not-italic uppercase tracking-widest mt-4 font-black">Coming Soon in v2.1</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
