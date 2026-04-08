'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const AdminSidebar = () => {
    const pathname = usePathname();

    const navItems = [
        { name: 'Mon Showroom', href: '/admin/dashboard', icon: 'diamond' },
        { name: 'Mon Equipe', href: '/admin/equipe', icon: 'groups' },
        { name: 'Ressources', href: '#', icon: 'inventory_2' },
        { name: 'Paramètres', href: '/admin/settings', icon: 'settings' },
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-[240px] z-50 flex flex-col border-r border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-950 shadow-[20px_0_40px_rgba(27,28,25,0.03)]">
            <div className="p-8 pb-10">
                <Link href="/">
                    <h1 className="text-[28px] font-serif italic text-yellow-600 dark:text-yellow-500 tracking-tight cursor-pointer">SIQ</h1>
                </Link>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-stone-400 mt-1">ShowroomIQ</p>
            </div>
            <nav className="flex-1 px-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.name} href={item.href}>
                            <span className={`flex items-center gap-3 pl-4 py-2 text-[14px] transition-colors duration-300 cursor-pointer ${
                                isActive 
                                    ? 'text-yellow-700 dark:text-yellow-500 border-l-2 border-yellow-600 bg-stone-50/50 font-medium' 
                                    : 'text-stone-500 dark:text-stone-400 border-l-2 border-transparent hover:text-stone-900 hover:bg-stone-50 dark:hover:bg-stone-900'
                            }`}>
                                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                                <span>{item.name}</span>
                            </span>
                        </Link>
                    );
                })}
            </nav>
            <div className="p-6 mt-auto">
                <div className="mt-8 space-y-4">
                    <Link href="#">
                        <span className="flex items-center gap-3 text-stone-500 text-[14px] px-4 py-2 hover:text-on-surface transition-colors cursor-pointer">
                            <span className="material-symbols-outlined text-[20px]">help</span>
                            Support
                        </span>
                    </Link>
                </div>
            </div>
        </aside>
    );
};

export default AdminSidebar;
