'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

const OwnerSidebar = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const activeTab = searchParams.get('tab');
    
    const [isScoresOpen, setIsScoresOpen] = useState(true);

    const navItems = [
        { name: 'Tableau de Bord', href: '/owner/dashboard', icon: 'dashboard' },
        { name: 'Magasins', href: '/owner/showrooms', icon: 'storefront' },
        { name: 'Commerciaux', href: '/owner/commercials', icon: 'groups' },
        { name: 'Utilisateurs', href: '/owner/users', icon: 'person' },
        { name: 'Rapports', href: '#', icon: 'analytics' },
    ];

    const handleLogout = (e: React.MouseEvent) => {
        e.preventDefault();
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        window.location.href = '/';
    };

    return (
        <aside className="fixed left-0 top-0 h-screen w-[240px] z-50 flex flex-col bg-white dark:bg-stone-950 border-r border-stone-100 dark:border-stone-800 shadow-[20px_0_40px_rgba(27,28,25,0.03)] overflow-y-auto">
            <div className="p-8">
                <Link href="/">
                    <h1 className="text-[28px] font-serif italic text-yellow-600 dark:text-yellow-500 tracking-tight leading-none cursor-pointer">SIQ</h1>
                </Link>
                <p className="text-[10px] font-sans uppercase tracking-widest text-stone-400 mt-1">ShowroomIQ</p>
            </div>
            
            <nav className="flex-1 mt-4">
                <div className="px-4 mb-2">
                    <p className="text-[10px] font-sans uppercase tracking-widest text-stone-400 px-4 mb-4">Navigation</p>
                    
                    <div className="space-y-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link key={item.name} href={item.href}>
                                    <span className={`flex items-center gap-3 pl-4 py-2.5 transition-all duration-300 cursor-pointer rounded-lg ${
                                        isActive 
                                            ? 'text-yellow-700 dark:text-yellow-500 bg-stone-50 dark:bg-stone-900/50 font-medium' 
                                            : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 hover:bg-stone-50 dark:hover:bg-stone-900'
                                    }`}>
                                        <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                                        <span className="text-[14px]">{item.name}</span>
                                    </span>
                                </Link>
                            );
                        })}

                        {/* Scores Submenu */}
                        <div>
                            <div 
                                onClick={() => setIsScoresOpen(!isScoresOpen)}
                                className={`flex items-center gap-3 pl-4 py-2.5 transition-all duration-300 cursor-pointer rounded-lg ${
                                    pathname === '/owner/settings' 
                                        ? 'text-yellow-700 dark:text-yellow-500 font-medium' 
                                        : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 hover:bg-stone-50 dark:hover:bg-stone-900'
                                }`}
                            >
                                <span className="material-symbols-outlined text-[20px]">schedule</span>
                                <span className="text-[14px] flex-1">Scores</span>
                                <span className={`material-symbols-outlined text-[16px] transition-transform duration-300 mr-2 ${isScoresOpen ? 'rotate-180' : ''}`}>
                                    expand_more
                                </span>
                            </div>
                            
                            {isScoresOpen && (
                                <div className="ml-9 mt-1 space-y-1 border-l border-stone-100 dark:border-stone-800 py-1 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <Link href="/owner/settings?tab=commercial">
                                        <div className={`pl-4 py-2 text-[13px] transition-all cursor-pointer ${
                                            pathname === '/owner/settings' && activeTab === 'commercial'
                                                ? 'text-yellow-600 font-semibold'
                                                : 'text-stone-400 hover:text-stone-800'
                                        }`}>
                                            Barème Commercial
                                        </div>
                                    </Link>
                                    <Link href="/owner/settings?tab=showroom">
                                        <div className={`pl-4 py-2 text-[13px] transition-all cursor-pointer ${
                                            pathname === '/owner/settings' && activeTab === 'showroom'
                                                ? 'text-yellow-600 font-semibold'
                                                : 'text-stone-400 hover:text-stone-800'
                                        }`}>
                                            Barème Magasin
                                        </div>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <div className="p-4 border-t border-stone-50 dark:border-stone-900 mt-auto bg-white/10 backdrop-blur-sm">
                <Link href="/owner/settings">
                    <span className={`flex items-center gap-3 pl-4 py-2.5 transition-colors duration-300 cursor-pointer rounded-lg ${
                        pathname === '/owner/settings' && !activeTab
                            ? 'text-yellow-700 dark:text-yellow-500 bg-stone-50 font-medium' 
                            : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 hover:bg-stone-50'
                    }`}>
                        <span className="material-symbols-outlined text-[20px]">settings</span>
                        <span className="text-[14px]">Paramètres</span>
                    </span>
                </Link>
                <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 text-red-600 dark:text-red-400 pl-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors duration-300 cursor-pointer mt-2 rounded-lg border-none bg-transparent"
                >
                    <span className="material-symbols-outlined text-[20px]">logout</span>
                    <span className="text-[14px] font-medium">Déconnexion</span>
                </button>
            </div>
        </aside>
    );
};

export default OwnerSidebar;
