'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const CommercialSidebar = () => {
    const pathname = usePathname();

    const navItems = [
        { name: 'Collections', href: '#', icon: 'diamond' },
        { name: 'Showrooms', href: '#', icon: 'storefront' },
        { name: 'Inventory', href: '#', icon: 'inventory_2' },
        { name: 'Clients', href: '/commercial/dashboard', icon: 'groups' },
        { name: 'Reports', href: '#', icon: 'analytics' },
    ];

    const handleLogout = (e: React.MouseEvent) => {
        e.preventDefault();
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        window.location.href = '/';
    };

    return (
        <aside className="fixed left-0 top-0 h-screen w-[240px] z-50 flex flex-col border-r border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-950 shadow-[20px_0_40px_rgba(27,28,25,0.03)]">
            <div className="p-8">
                <Link href="/">
                    <h1 className="text-[28px] font-serif italic text-yellow-600 dark:text-yellow-500 tracking-tight cursor-pointer">SIQ</h1>
                </Link>
                <p className="font-mono text-[10px] uppercase tracking-widest text-stone-400 mt-1">ShowroomIQ</p>
            </div>
            
            <nav className="flex-1 mt-4 px-4 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.name} href={item.href}>
                            <span className={`flex items-center gap-3 pl-4 py-2 text-sm transition-colors duration-300 cursor-pointer rounded-lg ${
                                isActive 
                                    ? 'text-yellow-700 dark:text-yellow-500 border-l-2 border-yellow-600 bg-stone-50/50 font-medium' 
                                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 hover:bg-stone-50'
                            }`}>
                                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                                <span>{item.name}</span>
                            </span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-6 border-t border-stone-50 mt-auto">
                <div className="flex flex-col gap-2">
                    <Link href="#">
                        <span className="flex items-center gap-3 text-stone-400 text-xs px-4 py-2 hover:text-stone-900 transition-colors cursor-pointer">
                            <span className="material-symbols-outlined text-[18px]">settings</span>
                            <span>Settings</span>
                        </span>
                    </Link>
                    <Link href="#">
                        <span className="flex items-center gap-3 text-stone-400 text-xs px-4 py-2 hover:text-stone-900 transition-colors cursor-pointer">
                            <span className="material-symbols-outlined text-[18px]">help</span>
                            <span>Support</span>
                        </span>
                    </Link>
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-3 text-red-600 dark:text-red-400 text-xs px-4 py-2 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors duration-300 cursor-pointer rounded-lg border-none bg-transparent"
                    >
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                        <span>Déconnexion</span>
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default CommercialSidebar;
