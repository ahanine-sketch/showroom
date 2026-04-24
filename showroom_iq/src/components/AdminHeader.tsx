'use client';

import { API_BASE_URL } from '@/config';
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface UserProfile {
  fullName: string;
  role: string;
}

const AdminHeader = () => {
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) return;
        
        const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setUser(data.data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, []);

  return (
    <header className="fixed top-0 right-0 left-[240px] h-[60px] z-40 bg-white/80 backdrop-blur-xl flex items-center justify-between px-8 border-b border-stone-50">
      <div className="flex items-center gap-4">
        {/* Placeholder for breadcrumbs or other info */}
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 border-r border-stone-100 pr-6">
          <button className="relative text-stone-400 hover:text-yellow-600 transition-all">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[12px] font-medium leading-none text-stone-900">{user?.fullName || 'Chargement...'}</p>
            <p className="text-[10px] font-label text-stone-400 uppercase mt-1">Directeur Showroom</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-stone-50 border-2 border-stone-50 flex items-center justify-center text-stone-300 shadow-sm">
            <span className="material-symbols-outlined text-[20px]">person</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
