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

// ── COMMERCIAL ──────────────────────────────────────────────────────────────

const CATEGORIES = [
    { id: 'ventes', name: 'Ventes', icon: '📊' },
    { id: 'comportement', name: 'Comportement', icon: '⭐' },
    { id: 'presence', name: 'Présence', icon: '📅' },
];

const METRICS: Record<string, { id: string, name: string, driver: string }[]> = {
    ventes: [
        { id: 'objectif-ca', name: 'Objectif CA', driver: 'Points relative to targets' },
        { id: 'conversion-rate', name: 'Conversion (Devis)', driver: '(Val. + Lost) / Created' },
        { id: 'panier-moyen', name: 'Panier Moyen', driver: 'Value in MAD' },
    ],
    comportement: [
        { id: 'avis-reputation', name: 'Avis & Réputation', driver: 'Nb reviews + / -' },
        { id: 'sav-service', name: 'Qualité Service / SAV', driver: 'Tickets & Complaints' },
        { id: 'discipline-process', name: 'Discipline / Process', driver: 'Nb warnings' },
    ],
    presence: [
        { id: 'assiduite', name: 'Assiduité', driver: 'Retards & Absences' },
    ]
};

const DEFAULT_COMMERCIAL_LEVELS: Record<string, any[]> = {
    'objectif-ca': [
        { id: 'tb', name: 'TRÈS BIEN', criteria: 'Above Likely', points: '35', color: '#2A7D4F' },
        { id: 'b',  name: 'BIEN',      criteria: 'Close to Likely (> 50% gap)', points: '21 - 30', color: '#B8960C' },
        { id: 'm',  name: 'MOYEN',     criteria: 'Low Likely (< 50% gap)', points: '11 - 20', color: '#D4802A' },
        { id: 'mv', name: 'MAUVAIS',   criteria: 'Close Conservative', points: '10', color: '#C0392B' },
        { id: 'tmv',name: 'TRÈS MAUVAIS', criteria: 'Below 50% Conservative', points: '0', color: '#5C5750' },
    ],
    'conversion-rate': [
        { id: 'tb', name: 'TRÈS BIEN', criteria: 'Above 75%', points: '15', color: '#2A7D4F' },
        { id: 'b',  name: 'BIEN',      criteria: 'Between 50% and 75%', points: '10', color: '#B8960C' },
        { id: 'm',  name: 'MOYEN',     criteria: 'Between 35% and 50%', points: '5', color: '#D4802A' },
        { id: 'mv', name: 'MAUVAIS',   criteria: 'Below 35%', points: '0', color: '#C0392B' },
    ],
    'panier-moyen': [
        { id: 'tb', name: 'TRÈS BIEN', criteria: 'Above 20 000 MAD', points: '15', color: '#2A7D4F' },
        { id: 'b',  name: 'BIEN',      criteria: '15 000 - 20 000 MAD', points: '10', color: '#B8960C' },
        { id: 'm',  name: 'MOYEN',     criteria: '10 000 - 15 000 MAD', points: '5', color: '#D4802A' },
        { id: 'mv', name: 'MAUVAIS',   criteria: 'Below 10 000 MAD', points: '0', color: '#C0392B' },
    ],
    'avis-reputation': [
        { id: 'tb', name: 'TRÈS BIEN', criteria: 'More than 3 Positive Reviews', points: '10', color: '#2A7D4F' },
        { id: 'b',  name: 'BIEN',      criteria: 'Up to 3 Positive Reviews', points: '8', color: '#B8960C' },
        { id: 'm',  name: 'MOYEN',     criteria: 'No Reviews at all', points: '4', color: '#D4802A' },
        { id: 'mv', name: 'MAUVAIS',   criteria: 'At least 1 Negative Review', points: '0', color: '#C0392B' },
    ],
    'sav-service': [
        { id: 'tb', name: 'TRÈS BIEN', criteria: 'No Tickets No Complaints', points: '10', color: '#2A7D4F' },
        { id: 'b',  name: 'BIEN',      criteria: 'Up to 4 Tickets / 0 Complaints', points: '8', color: '#B8960C' },
        { id: 'm',  name: 'MOYEN',     criteria: 'More than 4 Tickets / 0 Complaints', points: '4', color: '#D4802A' },
        { id: 'mv', name: 'MAUVAIS',   criteria: 'At least 1 Complaint', points: '0', color: '#C0392B' },
    ],
    'discipline-process': [
        { id: 'tb', name: 'TRÈS BIEN', criteria: 'No Warnings', points: '10', color: '#2A7D4F' },
        { id: 'b',  name: 'BIEN',      criteria: '1st Warning', points: '8', color: '#B8960C' },
        { id: 'm',  name: 'MOYEN',     criteria: '2nd Warning', points: '4', color: '#D4802A' },
        { id: 'mv', name: 'MAUVAIS',   criteria: '3rd Warning', points: '0', color: '#C0392B' },
    ],
    'assiduite': [
        { id: 'tb', name: 'TRÈS BIEN', criteria: "Pas de retards ni d'absences", points: '5', color: '#2A7D4F' },
        { id: 'b',  name: 'BIEN',      criteria: 'Moins de 2 retards ou absences', points: '3', color: '#B8960C' },
        { id: 'm',  name: 'MOYEN',     criteria: 'Entre 2 et 4 absences et retards', points: '1', color: '#D4802A' },
        { id: 'mv', name: 'MAUVAIS',   criteria: 'Plus de 4 absences ou retards', points: '0', color: '#C0392B' },
    ],
};

// ── SHOWROOM (MAGASIN) ───────────────────────────────────────────────────────

const CATEGORIES_SHOWROOM = [
    { id: 'ventes', name: 'Ventes', icon: '📊' },
    { id: 'comportement', name: 'Comportement', icon: '⭐' },
    { id: 'presence', name: 'Présence', icon: '📅' },
];

const METRICS_SHOWROOM: Record<string, { id: string, name: string, driver: string }[]> = {
    ventes: [
        { id: 'showroom:objectif-ca',       name: 'Objectif CA',    driver: '% Reach of Likely Target' },
        { id: 'showroom:devis',             name: 'Devis',          driver: '% Close Rate' },
        { id: 'showroom:kpis-panier-moyen', name: 'KPIs / Panier Moyen', driver: 'Avg Basket in MAD' },
    ],
    comportement: [
        { id: 'showroom:avis',     name: 'Avis',     driver: 'Nb of + & - Reviews' },
        { id: 'showroom:service',  name: 'Service',  driver: 'Nb Tickets & Complaints' },
        { id: 'showroom:showroom', name: 'Showroom', driver: 'Variété, propreté et mise en place' },
    ],
    presence: [
        { id: 'showroom:assiduite', name: 'Assiduité / Présence', driver: 'Retards & Absences' },
    ],
};

const DEFAULT_SHOWROOM_LEVELS: Record<string, any[]> = {
    // VENTES (70 pts total)
    'showroom:objectif-ca': [
        { id: 'tb',  name: 'TRÈS BIEN',   criteria: 'Above Likely Target',        points: '40 - 50', color: '#2A7D4F' },
        { id: 'b',   name: 'BIEN',        criteria: 'Close to Likely',            points: '30 - 40', color: '#B8960C' },
        { id: 'm',   name: 'MOYEN',       criteria: 'Low Likely',                 points: '20 - 30', color: '#D4802A' },
        { id: 'mv',  name: 'MAUVAIS',     criteria: 'Close Conservative',         points: '10',      color: '#C0392B' },
        { id: 'tmv', name: 'TRÈS MAUVAIS',criteria: 'Close to 0',                 points: '0',       color: '#5C5750' },
    ],
    'showroom:devis': [
        { id: 'tb', name: 'TRÈS BIEN', criteria: 'Above 75%',          points: '10', color: '#2A7D4F' },
        { id: 'b',  name: 'BIEN',      criteria: '50% to 75%',         points: '8',  color: '#B8960C' },
        { id: 'm',  name: 'MOYEN',     criteria: '35% to 50%',         points: '4',  color: '#D4802A' },
        { id: 'mv', name: 'MAUVAIS',   criteria: 'Below 35%',          points: '0',  color: '#C0392B' },
    ],
    'showroom:kpis-panier-moyen': [
        { id: 'tb', name: 'TRÈS BIEN', criteria: 'Above 20 000 MAD',     points: '10', color: '#2A7D4F' },
        { id: 'b',  name: 'BIEN',      criteria: '15 000 - 20 000 MAD',  points: '8',  color: '#B8960C' },
        { id: 'm',  name: 'MOYEN',     criteria: '10 000 - 15 000 MAD',  points: '4',  color: '#D4802A' },
        { id: 'mv', name: 'MAUVAIS',   criteria: 'Below 10 000 MAD',     points: '0',  color: '#C0392B' },
    ],
    // COMPORTEMENT (30 pts total)
    'showroom:avis': [
        { id: 'tb', name: 'TRÈS BIEN', criteria: 'More than 3 Positive Reviews', points: '10', color: '#2A7D4F' },
        { id: 'b',  name: 'BIEN',      criteria: 'Up to 3 Positive Reviews',     points: '8',  color: '#B8960C' },
        { id: 'm',  name: 'MOYEN',     criteria: 'No Reviews at all',            points: '4',  color: '#D4802A' },
        { id: 'mv', name: 'MAUVAIS',   criteria: 'At least 1 Negative Review',   points: '0',  color: '#C0392B' },
    ],
    'showroom:service': [
        { id: 'tb', name: 'TRÈS BIEN', criteria: 'No Tickets, No Complaints',             points: '10', color: '#2A7D4F' },
        { id: 'b',  name: 'BIEN',      criteria: 'Up to 4 Tickets but 0 Complaints',      points: '8',  color: '#B8960C' },
        { id: 'm',  name: 'MOYEN',     criteria: 'More than 4 Tickets but 0 Complaints',  points: '4',  color: '#D4802A' },
        { id: 'mv', name: 'MAUVAIS',   criteria: 'At least 1 Complaint',                  points: '0',  color: '#C0392B' },
    ],
    'showroom:showroom': [
        { id: 'tb', name: 'TRÈS BIEN', criteria: 'No Warnings',       points: '10', color: '#2A7D4F' },
        { id: 'b',  name: 'BIEN',      criteria: '1st Warning (-2)',  points: '8',  color: '#B8960C' },
        { id: 'm',  name: 'MOYEN',     criteria: '2nd Warning (-4)',  points: '4',  color: '#D4802A' },
        { id: 'mv', name: 'MAUVAIS',   criteria: '3rd Warning (-4)',  points: '0',  color: '#C0392B' },
    ],
    // PRÉSENCE (5 pts)
    'showroom:assiduite': [
        { id: 'tb', name: 'TRÈS BIEN', criteria: 'Perfect attendance', points: '5', color: '#2A7D4F' },
        { id: 'b',  name: 'BIEN',      criteria: 'Up to 1 late / absence', points: '3', color: '#B8960C' },
        { id: 'm',  name: 'MOYEN',     criteria: 'Between 2-4 lates / absences', points: '1', color: '#D4802A' },
        { id: 'mv', name: 'MAUVAIS',   criteria: 'More than 4 absences or lates', points: '0', color: '#C0392B' },
    ],
};

// ── SHARED COMPONENTS ────────────────────────────────────────────────────────

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

const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => (
    <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-10 fade-in duration-500">
        <div className={`flex items-center gap-4 px-8 py-5 rounded-3xl border shadow-2xl backdrop-blur-xl ${
            type === 'success' 
                ? 'bg-stone-900/90 border-yellow-600/30 text-white shadow-yellow-900/40' 
                : 'bg-red-900/90 border-red-500/30 text-white shadow-red-900/40'
        }`}>
            <span className="material-symbols-outlined text-[24px] text-yellow-500">
                {type === 'success' ? 'verified' : 'error'}
            </span>
            <div>
                <p className="text-[13px] font-black uppercase tracking-widest">{type === 'success' ? 'Succès' : 'Erreur'}</p>
                <p className="text-[12px] font-medium text-stone-300 italic">{message}</p>
            </div>
            <button onClick={onClose} className="ml-4 w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-all">
                <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
        </div>
    </div>
);

export default function SettingsPage() {
    return (
        <Suspense fallback={<div className="p-12 text-stone-400 font-serif italic">Initialisation du configurateur...</div>}>
            <SettingsContent />
        </Suspense>
    );
}

function SettingsContent() {
    const searchParams = useSearchParams();
    const tabParam = searchParams.get('tab');
    
    const [activeTab, setActiveTab] = useState<'commercial' | 'showroom'>('commercial');

    // ── COMMERCIAL STATE ─────────────────────────────────────────────────────
    const [selectedCategory, setSelectedCategory] = useState<string>('ventes');
    const [selectedMetric, setSelectedMetric] = useState<string>('objectif-ca');
    const [metricLevels, setMetricLevels] = useState<Record<string, any[]>>(DEFAULT_COMMERCIAL_LEVELS);
    const [conclusions, setConclusions] = useState([
        { id: 'c1', name: 'Très Bien', range: 'Score > 80', color: '#2A7D4F' },
        { id: 'c2', name: 'Bien',      range: 'Score 60 - 80', color: '#B8960C' },
        { id: 'c3', name: 'Moyen',     range: 'Score 40 - 60', color: '#D4802A' },
        { id: 'c4', name: 'Mauvais',   range: 'Score < 40',    color: '#C0392B' },
    ]);
    const [bonusConfig, setBonusConfig] = useState({ min: 0, max: 5 });

    // ── SHOWROOM STATE ───────────────────────────────────────────────────────
    const [showroomCategory, setShowroomCategory] = useState<string>('ventes');
    const [showroomMetric, setShowroomMetric]     = useState<string>('showroom:objectif-ca');
    const [showroomLevels, setShowroomLevels]     = useState<Record<string, any[]>>(DEFAULT_SHOWROOM_LEVELS);
    const [showroomConclusions, setShowroomConclusions] = useState([
        { id: 'sc1', name: 'Très Bien', range: 'Score ≥ 90',      color: '#2A7D4F' },
        { id: 'sc2', name: 'Bien',      range: 'Score 60 - 89',   color: '#B8960C' },
        { id: 'sc3', name: 'Moyen',     range: 'Score 50 - 59',   color: '#D4802A' },
        { id: 'sc4', name: 'Mauvais',   range: 'Score < 50',      color: '#C0392B' },
    ]);
    const [showroomBonusConfig, setShowroomBonusConfig] = useState({ min: 0, max: 5 });

    // ── SHARED UI STATE ──────────────────────────────────────────────────────
    const [isSaving,  setIsSaving]  = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    // ── FETCH FROM DB ────────────────────────────────────────────────────────
    useEffect(() => {
        const fetchConfigs = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem('auth_token');
                const response = await fetch('http://localhost:3001/api/settings/configs', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                
                if (data.success) {
                    const dbMetrics: any[] = data.data.metrics;
                    const dbGlobal = data.data.global;

                    // Split db metrics into Commercial vs Showroom
                    const newCommercialLevels: Record<string, any[]> = { ...DEFAULT_COMMERCIAL_LEVELS };
                    const newShowroomLevels: Record<string, any[]>   = { ...DEFAULT_SHOWROOM_LEVELS };

                    dbMetrics.forEach((m: any) => {
                        if (m.metricName.startsWith('showroom:')) {
                            newShowroomLevels[m.metricName] = m.levels;
                        } else {
                            newCommercialLevels[m.metricName] = m.levels;
                        }
                    });

                    setMetricLevels(newCommercialLevels);
                    setShowroomLevels(newShowroomLevels);

                    // Global settings
                    if (dbGlobal.siq_conclusions)          setConclusions(dbGlobal.siq_conclusions);
                    if (dbGlobal.siq_bonus_config)         setBonusConfig(dbGlobal.siq_bonus_config);
                    if (dbGlobal.siq_showroom_conclusions) setShowroomConclusions(dbGlobal.siq_showroom_conclusions);
                    if (dbGlobal.siq_showroom_bonus)       setShowroomBonusConfig(dbGlobal.siq_showroom_bonus);
                }
            } catch (err) {
                console.error('Failed to fetch configs', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchConfigs();
    }, []);

    // ── SAVE ─────────────────────────────────────────────────────────────────
    const handleSave = async () => {
        setIsSaving(true);
        const token = localStorage.getItem('auth_token');

        try {
            // Save all metrics (Commercial + Showroom combined)
            const allLevels = { ...metricLevels, ...showroomLevels };
            const metricPromises = Object.entries(allLevels).map(([metricName, levels]) =>
                fetch('http://localhost:3001/api/settings/metric', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ metricName, weight: 1, levels }),
                })
            );

            // Save global settings (both Commercial and Showroom)
            const globalSaves = [
                { key: 'siq_conclusions',          value: conclusions },
                { key: 'siq_bonus_config',         value: bonusConfig },
                { key: 'siq_showroom_conclusions', value: showroomConclusions },
                { key: 'siq_showroom_bonus',       value: showroomBonusConfig },
            ].map(({ key, value }) =>
                fetch('http://localhost:3001/api/settings/global', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ key, value }),
                })
            );

            await Promise.all([...metricPromises, ...globalSaves]);
            setToast({ message: 'Configuration synchronisée avec succès dans la base de données', type: 'success' });
        } catch {
            setToast({ message: 'Erreur lors de la synchronisation', type: 'error' });
        } finally {
            setIsSaving(false);
            setTimeout(() => setToast(null), 3000);
        }
    };

    // Sync tab from URL param
    useEffect(() => {
        if (tabParam === 'showroom') setActiveTab('showroom');
        else setActiveTab('commercial');
    }, [tabParam]);

    // ── COMMERCIAL HELPERS ───────────────────────────────────────────────────
    const currentLevels = metricLevels[selectedMetric] || [];

    const addLevel = () => setMetricLevels(prev => ({
        ...prev,
        [selectedMetric]: [...(prev[selectedMetric] || []), { id: Math.random().toString(36).substr(2, 9), name: 'NOUVEAU', criteria: 'Label', points: '0', color: '#5C5750' }]
    }));
    const deleteLevel = (id: string) => setMetricLevels(prev => ({ ...prev, [selectedMetric]: prev[selectedMetric]?.filter(l => l.id !== id) || [] }));
    const updateLevel = (id: string, field: string, value: string) => setMetricLevels(prev => ({ ...prev, [selectedMetric]: prev[selectedMetric]?.map(l => l.id === id ? { ...l, [field]: value } : l) || [] }));

    // ── HELPERS FOR MAX POINTS ──────────────────────────────────────────────
    const getMaxFromPoints = (pointsStr: string): number => {
        if (!pointsStr) return 0;
        const parts = pointsStr.toString().split('-').map(p => p.trim());
        const lastPart = parts[parts.length - 1];
        const num = parseFloat(lastPart.replace(/[^\d.]/g, ''));
        return isNaN(num) ? 0 : num;
    };

    const getMetricMaxPoints = (levels: any[]): number => {
        if (!levels || levels.length === 0) return 0;
        return Math.max(...levels.map(l => getMaxFromPoints(l.points)));
    };

    const getTotalMaxPoints = (allLevels: Record<string, any[]>, metricGroups: Record<string, any[]>) => {
        let total = 0;
        Object.values(metricGroups).flat().forEach(m => {
            const levels = allLevels[m.id] || [];
            total += getMetricMaxPoints(levels);
        });
        return total;
    };

    const addConclusion    = () => setConclusions(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), name: 'Nouvelle Conclusion', range: 'Score...', color: '#5C5750' }]);
    const deleteConclusion = (id: string) => setConclusions(prev => prev.filter(c => c.id !== id));
    const updateConclusion = (id: string, field: string, value: string) => setConclusions(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));

    // ── SHOWROOM HELPERS ─────────────────────────────────────────────────────
    const currentShowroomLevels = showroomLevels[showroomMetric] || [];

    const addShowroomLevel = () => setShowroomLevels(prev => ({
        ...prev,
        [showroomMetric]: [...(prev[showroomMetric] || []), { id: Math.random().toString(36).substr(2, 9), name: 'NOUVEAU', criteria: 'Label', points: '0', color: '#5C5750' }]
    }));
    const deleteShowroomLevel = (id: string) => setShowroomLevels(prev => ({ ...prev, [showroomMetric]: prev[showroomMetric]?.filter(l => l.id !== id) || [] }));
    const updateShowroomLevel = (id: string, field: string, value: string) => setShowroomLevels(prev => ({ ...prev, [showroomMetric]: prev[showroomMetric]?.map(l => l.id === id ? { ...l, [field]: value } : l) || [] }));

    const addShowroomConclusion    = () => setShowroomConclusions(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), name: 'Nouvelle Conclusion', range: 'Score...', color: '#5C5750' }]);
    const deleteShowroomConclusion = (id: string) => setShowroomConclusions(prev => prev.filter(c => c.id !== id));
    const updateShowroomConclusion = (id: string, field: string, value: string) => setShowroomConclusions(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));

    // ── GENERIC UI BUILDERS ──────────────────────────────────────────────────
    /** Renders the level card grid — shared between Commercial & Showroom */
    const renderLevelEditor = (
        levels: any[],
        onAdd: () => void,
        onDelete: (id: string) => void,
        onUpdate: (id: string, f: string, v: string) => void,
        activeMetricName: string,
        maxPoints: number,
    ) => (
        <div className="p-10">
            <div className="flex items-center justify-between mb-10">
                <div className="space-y-1">
                    <h3 className="font-serif text-3xl font-black text-stone-800 tracking-tighter">Configuration des Notes</h3>
                    <p className="text-stone-400 text-xs font-medium italic">
                        Metric active: <span className="text-stone-600 font-bold">{activeMetricName}</span>
                        <span className="ml-3 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-[10px] font-black uppercase tracking-widest border border-yellow-200">
                            {maxPoints} Max Points
                        </span>
                    </p>
                </div>
                <button
                    onClick={onAdd}
                    className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-[1.05] transition-all active:scale-[0.98] shadow-xl group"
                >
                    <span className="material-symbols-outlined text-[18px] group-hover:rotate-90 transition-transform">add</span>
                    Ajouter une Note
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {levels.map((level) => (
                    <div key={level.id} className="relative p-7 rounded-[32px] bg-stone-50 border border-stone-100/50 space-y-6 transition-all hover:bg-white hover:shadow-2xl hover:border-yellow-200 group animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between gap-3">
                            <input
                                className="bg-transparent border-none p-0 font-black text-[13px] uppercase tracking-[0.2em] outline-none w-full focus:text-yellow-700 transition-colors"
                                value={level.name}
                                onChange={(e) => onUpdate(level.id, 'name', e.target.value)}
                                style={{ color: level.color }}
                            />
                            <button
                                onClick={() => onDelete(level.id)}
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
                                onChange={(e) => onUpdate(level.id, 'criteria', e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Points</label>
                                <input
                                    type="text"
                                    className="w-full h-12 text-center font-mono font-black bg-white border border-stone-200 rounded-xl text-lg text-stone-800 focus:border-yellow-600 outline-none shadow-sm"
                                    value={level.points}
                                    onChange={(e) => onUpdate(level.id, 'points', e.target.value)}
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
                            <ColorPicker selectedColor={level.color} onSelect={(hex) => onUpdate(level.id, 'color', hex)} />
                        </div>
                    </div>
                ))}
                {levels.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-stone-100/30 rounded-[32px] border-2 border-dashed border-stone-200 italic font-serif text-stone-400 text-xl">
                        Aucune note configurée. Cliquez sur "Ajouter une Note" pour commencer.
                    </div>
                )}
            </div>
        </div>
    );

    /** Renders the Conclusion Grid + Bonus sidebar — shared between Commercial & Showroom */
    const renderConclusionSection = (
        conclList: any[],
        bonus: { min: number, max: number },
        onAddConc: () => void,
        onDeleteConc: (id: string) => void,
        onUpdateConc: (id: string, f: string, v: string) => void,
        onBonusChange: (b: { min: number, max: number }) => void,
        showBonus = true,
        totalMaxPoints: number,
    ) => (
        <div className="mt-20">
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-stone-900 border border-stone-800 shadow-2xl shadow-stone-900/20 flex items-center justify-center text-white text-2xl">💰</div>
                    <div className="space-y-0.5">
                        <h2 className="font-serif text-4xl font-black tracking-tighter text-stone-800">Grille de Conclusion</h2>
                        <div className="flex items-center gap-3">
                            <p className="text-stone-400 text-xs font-medium uppercase tracking-widest">Mapping Score Total → Observation</p>
                            <span className="px-3 py-1 bg-stone-900 text-yellow-500 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                                Max points: {totalMaxPoints}
                            </span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={onAddConc}
                    className="flex items-center gap-3 px-8 py-4 bg-yellow-600 text-white rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] shadow-xl shadow-yellow-600/30 hover:bg-yellow-500 hover:scale-[1.05] transition-all active:scale-[0.95]"
                >
                    <span className="material-symbols-outlined text-[20px]">add_circle</span>
                    Nouveau Palier
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                <div className={`${showBonus ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-6`}>
                    {conclList.map((step) => (
                        <div key={step.id} className="flex gap-6 bg-white p-7 rounded-[32px] border border-stone-100 shadow-xl group hover:shadow-2xl transition-all relative overflow-hidden animate-in slide-in-from-left-4 duration-500">
                            <div className="w-2 shrink-0 rounded-full h-full my-auto" style={{ backgroundColor: step.color }} />
                            <div className="flex-1 grid grid-cols-3 gap-8 items-center">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Note / Conclusion</label>
                                    <input
                                        className="w-full bg-transparent font-serif text-2xl font-black text-stone-800 outline-none focus:text-yellow-600 transition-colors"
                                        value={step.name}
                                        onChange={(e) => onUpdateConc(step.id, 'name', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Intervalle Score</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            className="w-full bg-transparent font-mono text-[13px] font-bold text-stone-500 outline-none focus:text-stone-800 transition-colors"
                                            value={step.range}
                                            placeholder="ex: 80 - 100"
                                            onChange={(e) => onUpdateConc(step.id, 'range', e.target.value)}
                                        />
                                        <span className="text-[10px] font-black text-stone-300 italic whitespace-nowrap">
                                            {(() => {
                                                const match = step.range.match(/(\d+)/);
                                                if (match && totalMaxPoints > 0) {
                                                    const val = parseInt(match[1]);
                                                    return `~ ${((val / totalMaxPoints) * 100).toFixed(0)}%`;
                                                }
                                                return '';
                                            })()}
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-2 relative pr-10">
                                    <button
                                        onClick={() => onDeleteConc(step.id)}
                                        className="absolute -right-2 top-1 w-8 h-8 rounded-full flex items-center justify-center text-stone-200 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">delete_sweep</span>
                                    </button>
                                </div>
                            </div>
                            <div className="absolute top-2 right-10">
                                <ColorPicker selectedColor={step.color} onSelect={(hex) => onUpdateConc(step.id, 'color', hex)} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bonus Sidebar — only for Commercial */}
                {showBonus && <div className="lg:col-span-5 sticky top-28">
                    <div className="bg-white rounded-[40px] p-10 border border-stone-200 shadow-2xl relative overflow-hidden transition-all hover:shadow-yellow-600/5 group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-yellow-400/20 transition-all duration-700" />
                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-stone-900 flex items-center justify-center text-white shadow-xl shadow-stone-900/20">
                                    <span className="material-symbols-outlined text-[24px]">workspace_premium</span>
                                </div>
                                <div>
                                    <h3 className="font-serif text-2xl font-black text-stone-900 tracking-tight">Configuration Bonus</h3>
                                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Ajustement Manuel Propriétaire</p>
                                </div>
                            </div>

                            <div className="p-8 bg-stone-50 rounded-[32px] border border-stone-100 space-y-8 shadow-inner">
                                <div className="space-y-4">
                                    <label className="text-[11px] font-black text-stone-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                                        Plage de Points
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <span className="text-[9px] text-stone-400 font-bold uppercase tracking-widest ml-1">Minimum</span>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={bonus.min}
                                                    onChange={(e) => onBonusChange({ ...bonus, min: parseInt(e.target.value) || 0 })}
                                                    className="w-full h-14 bg-white border border-stone-200 rounded-2xl focus:ring-4 focus:ring-yellow-600/10 focus:border-yellow-600 outline-none text-center font-mono font-black text-xl shadow-sm"
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-stone-300 font-bold">PTS</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <span className="text-[9px] text-stone-400 font-bold uppercase tracking-widest ml-1">Maximum</span>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={bonus.max}
                                                    onChange={(e) => onBonusChange({ ...bonus, max: parseInt(e.target.value) || 0 })}
                                                    className="w-full h-14 bg-white border border-stone-200 rounded-2xl focus:ring-4 focus:ring-yellow-600/10 focus:border-yellow-600 outline-none text-center font-mono font-black text-xl shadow-sm"
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-yellow-600 font-bold">PTS</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-6 border-t border-stone-200/60" />
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="w-full py-5 bg-stone-900 text-white rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-stone-900/40 hover:bg-yellow-700 hover:scale-[1.02] transition-all active:scale-[0.98] flex items-center justify-center gap-3 group disabled:opacity-70"
                                >
                                    <span>{isSaving ? 'Enregistrement...' : 'Enregistrer le Barème'}</span>
                                    {!isSaving && <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">send</span>}
                                </button>
                                <p className="text-center text-[10px] text-stone-400 font-medium italic">
                                    * Ces changements impacteront le scorecard dès la prochaine actualisation.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>}
            </div>
        </div>
    );

    // ── RENDER ────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#F7F5F0] pb-24 font-sans text-stone-900">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            {isLoading && (
                <div className="fixed inset-0 z-[100] bg-white/60 backdrop-blur-md flex items-center justify-center flex-col gap-6">
                    <div className="w-12 h-12 border-4 border-stone-200 border-t-yellow-600 rounded-full animate-spin shadow-xl" />
                    <p className="font-serif italic text-stone-500 text-xl animate-pulse">Chargement des configurations...</p>
                </div>
            )}

            {/* Topbar */}
            <header className="h-[60px] bg-white border-b border-stone-200 flex items-center justify-between px-10 sticky top-0 z-40 backdrop-blur-md bg-white/90">
                <h2 className="font-serif text-xl font-medium tracking-tight text-yellow-700">SIQ Configuration</h2>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`px-5 py-2 bg-stone-900 text-white rounded-full text-[11px] font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all active:scale-95 flex items-center gap-2 ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                    {isSaving && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    {isSaving ? 'En cours...' : 'Publier Modifications'}
                </button>
            </header>

            <main className="max-w-7xl mx-auto px-10 pt-10">


                {/* ── COMMERCIAL TAB ── */}
                {activeTab === 'commercial' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {/* Selection bar */}
                        <div className="bg-white rounded-[40px] border border-stone-200 shadow-2xl overflow-hidden mb-12">
                            <div className="bg-stone-50/80 border-b border-stone-100 p-10 flex flex-wrap items-center gap-10">
                                {/* Category buttons */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] ml-1">Catégorie</label>
                                    <div className="flex gap-3">
                                        {CATEGORIES.map(cat => (
                                            <button
                                                key={cat.id}
                                                onClick={() => { setSelectedCategory(cat.id); setSelectedMetric(METRICS[cat.id][0].id); }}
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
                                {/* Metric dropdown */}
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

                            {renderLevelEditor(
                                currentLevels,
                                addLevel,
                                deleteLevel,
                                updateLevel,
                                METRICS[selectedCategory].find(m => m.id === selectedMetric)?.name || '',
                                getMetricMaxPoints(currentLevels)
                            )}
                        </div>

                        {renderConclusionSection(
                            conclusions, 
                            bonusConfig, 
                            addConclusion, 
                            deleteConclusion, 
                            updateConclusion, 
                            setBonusConfig,
                            true,
                            100
                        )}
                    </div>
                )}

                {/* ── SHOWROOM TAB ── */}
                {activeTab === 'showroom' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {/* Selection bar */}
                        <div className="bg-white rounded-[40px] border border-stone-200 shadow-2xl overflow-hidden mb-12">
                            <div className="bg-stone-50/80 border-b border-stone-100 p-10 flex flex-wrap items-center gap-10">
                                {/* Category buttons */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] ml-1">Catégorie</label>
                                    <div className="flex gap-3">
                                        {CATEGORIES_SHOWROOM.map(cat => (
                                            <button
                                                key={cat.id}
                                                onClick={() => {
                                                    setShowroomCategory(cat.id);
                                                    setShowroomMetric(METRICS_SHOWROOM[cat.id][0].id);
                                                }}
                                                className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all duration-300 border-2 ${
                                                    showroomCategory === cat.id
                                                        ? 'bg-white border-yellow-600 shadow-xl scale-[1.05]'
                                                        : 'bg-stone-100/50 border-transparent text-stone-400 hover:bg-stone-200/50'
                                                }`}
                                            >
                                                <span className="text-xl">{cat.icon}</span>
                                                <span className={`text-[12px] font-black uppercase tracking-widest ${showroomCategory === cat.id ? 'text-stone-800' : ''}`}>{cat.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {/* Metric dropdown */}
                                <div className="space-y-4 flex-1 min-w-[320px]">
                                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] ml-1">Paramétrage de la Métrique</label>
                                    <div className="relative">
                                        <select
                                            value={showroomMetric}
                                            onChange={(e) => setShowroomMetric(e.target.value)}
                                            className="w-full h-16 bg-white border-2 border-stone-100 rounded-2xl px-6 text-[16px] font-bold text-stone-800 shadow-sm focus:border-yellow-600 focus:outline-none transition-all appearance-none cursor-pointer"
                                        >
                                            {METRICS_SHOWROOM[showroomCategory].map(met => (
                                                <option key={met.id} value={met.id}>{met.name} ({met.driver})</option>
                                            ))}
                                        </select>
                                        <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 text-stone-300 pointer-events-none">expand_more</span>
                                    </div>
                                </div>
                            </div>

                            {renderLevelEditor(
                                currentShowroomLevels,
                                addShowroomLevel,
                                deleteShowroomLevel,
                                updateShowroomLevel,
                                METRICS_SHOWROOM[showroomCategory].find(m => m.id === showroomMetric)?.name || '',
                                getMetricMaxPoints(currentShowroomLevels)
                            )}
                        </div>

                        {renderConclusionSection(
                            showroomConclusions,
                            showroomBonusConfig,
                            addShowroomConclusion,
                            deleteShowroomConclusion,
                            updateShowroomConclusion,
                            setShowroomBonusConfig,
                            false, // no bonus for Magasin
                            100
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
