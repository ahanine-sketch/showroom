'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const OwnerSidebar = () => {
    const pathname = usePathname();

    const navItems = [
        { name: 'Collections', href: '/owner/dashboard', icon: 'diamond' },
        { name: 'Showrooms', href: '/owner/showrooms', icon: 'storefront' },
        { name: 'Commercials', href: '/owner/commercials', icon: 'groups' },
        { name: 'Reports', href: '#', icon: 'analytics' },
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-[240px] z-50 flex flex-col bg-white dark:bg-stone-950 border-r border-stone-100 dark:border-stone-800 shadow-[20px_0_40px_rgba(27,28,25,0.03)]">
            <div className="p-8">
                <Link href="/">
                    <h1 className="text-[28px] font-editorial italic text-yellow-600 dark:text-yellow-500 tracking-tight leading-none cursor-pointer">SIQ</h1>
                </Link>
                <p className="text-[10px] font-label uppercase tracking-widest text-stone-400 mt-1">ShowroomIQ</p>
            </div>
            <nav className="flex-1 mt-4">
                <div className="px-4 mb-2">
                    <p className="text-[10px] font-label uppercase tracking-widest text-stone-400 px-4 mb-4">Principal</p>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.name} href={item.href}>
                                <span className={`flex items-center gap-3 pl-4 py-2.5 transition-colors duration-300 cursor-pointer ${
                                    isActive 
                                        ? 'text-yellow-700 dark:text-yellow-500 border-l-2 border-yellow-600 bg-stone-50/50 font-medium' 
                                        : 'text-stone-500 dark:text-stone-400 border-l-2 border-transparent hover:text-stone-900 hover:bg-stone-50 dark:hover:bg-stone-900'
                                }`}>
                                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                                    <span className="text-[14px]">{item.name}</span>
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
            <div className="p-4 border-t border-stone-50 mt-auto">
                <Link href="/owner/settings">
                    <span className={`flex items-center gap-3 pl-4 py-2.5 transition-colors duration-300 cursor-pointer ${
                        pathname === '/owner/settings' 
                            ? 'text-yellow-700 dark:text-yellow-500 border-l-2 border-yellow-600 bg-stone-50/50 font-medium' 
                            : 'text-stone-500 dark:text-stone-400 border-l-2 border-transparent hover:text-stone-900 hover:bg-stone-50 dark:hover:bg-stone-900'
                    }`}>
                        <span className="material-symbols-outlined text-[20px]">settings</span>
                        <span className="text-[14px]">Settings</span>
                    </span>
                </Link>
                <Link href="#">
                    <span className="flex items-center gap-3 text-stone-500 dark:text-stone-400 pl-4 py-2.5 hover:text-stone-900 hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors duration-300 cursor-pointer">
                        <span className="material-symbols-outlined text-[20px]">help</span>
                        <span className="text-[14px]">Support</span>
                    </span>
                </Link>
                <Link href="/">
                    <span className="flex items-center gap-3 text-red-600 dark:text-red-400 pl-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors duration-300 cursor-pointer mt-2 rounded-lg">
                        <span className="material-symbols-outlined text-[20px]">logout</span>
                        <span className="text-[14px] font-medium">Déconnexion</span>
                    </span>
                </Link>
            </div>
        </aside>
    );
};

export default OwnerSidebar;
