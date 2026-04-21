'use client';

import React, { useState, useEffect } from 'react';
import OwnerHeader from '@/components/OwnerHeader';
import UserSlideOver from '@/components/UserSlideOver';
import ConfirmDialog from '@/components/ConfirmDialog';
import { toast } from 'react-hot-toast';

interface User {
    id: string;
    fullName: string;
    email: string | null;
    phone: string | null;
    role: 'OWNER' | 'ADMIN' | 'COMMERCIAL';
    createdAt: string;
    avatarUrl: string | null;
    showroom: {
        id: string;
        name: string;
    } | null;
}

export default function UsersManagementPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [magasins, setMagasins] = useState<{ id: string; name: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('ALL');
    const [dateFilter, setDateFilter] = useState('');
    
    // Drawer/Dialog states
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('auth_token');
            
            // Fetch Users
            const usersRes = await fetch('http://localhost:3001/api/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const usersResult = await usersRes.json();
            if (usersResult.success) {
                setUsers(usersResult.data);
            }

            // Fetch Magasins for the drawer
            const magasinsRes = await fetch('http://localhost:3001/api/showrooms', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const magasinsResult = await magasinsRes.json();
            if (magasinsResult.success) {
                setMagasins(magasinsResult.data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Erreur lors du chargement des données');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreate = () => {
        setSelectedUser(null);
        setDrawerMode('create');
        setIsDrawerOpen(true);
    };

    const handleEdit = (user: User) => {
        setSelectedUser({
            id: user.id,
            name: user.fullName,
            email: user.email || '',
            phone: user.phone || '',
            role: user.role,
            magasinId: user.showroom?.id,
            targets: (user as any).objectives?.[0] ? {
                conservative: (user as any).objectives[0].conservativeCA,
                likely: (user as any).objectives[0].likelyCA,
                exceed: (user as any).objectives[0].exceedCA
            } : undefined
        });
        setDrawerMode('edit');
        setIsDrawerOpen(true);
    };

    const handleDeleteClick = (userId: string) => {
        setUserToDelete(userId);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!userToDelete) return;
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`http://localhost:3001/api/users/${userToDelete}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await res.json();
            if (result.success) {
                toast.success('Utilisateur supprimé');
                setUsers(users.filter(u => u.id !== userToDelete));
            } else {
                toast.error(result.error || 'Erreur lors de la suppression');
            }
        } catch (error) {
            toast.error('Erreur réseau');
        } finally {
            setIsDeleteDialogOpen(false);
            setUserToDelete(null);
        }
    };

    const handleSaveUser = async (data: any) => {
        try {
            const token = localStorage.getItem('auth_token');
            const url = drawerMode === 'edit' 
                ? `http://localhost:3001/api/users/${selectedUser.id}` 
                : 'http://localhost:3001/api/users';
            const method = drawerMode === 'edit' ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            const result = await res.json();

            if (result.success) {
                setIsDrawerOpen(false);
                toast.success(drawerMode === 'edit' ? 'Utilisateur mis à jour' : 'Utilisateur créé');
                fetchData();
            } else {
                toast.error(result.error || 'Erreur lors de l\'enregistrement');
            }
        } catch (error) {
            toast.error('Erreur réseau');
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
        const matchesDate = !dateFilter || user.createdAt.startsWith(dateFilter);
        return matchesSearch && matchesRole && matchesDate;
    });

    return (
        <div className="min-h-screen bg-[#fcfcf9] dark:bg-stone-950 flex flex-col font-sans">
            <OwnerHeader />
            
            <main className="flex-1 pt-24 px-8 pb-12 max-w-7xl mx-auto w-full">
                {/* Page Title & Add Button */}
                <div className="flex items-end justify-between mb-10 pb-6 border-b border-stone-200/60 transition-all">
                    <div>
                        <nav className="font-mono text-[10px] uppercase tracking-[0.3em] text-yellow-700/70 mb-2 font-bold">
                            Gestion Administrative
                        </nav>
                        <h1 className="text-4xl font-headline text-stone-900 dark:text-stone-100 tracking-tight">Utilisateurs</h1>
                    </div>
                    <button 
                        onClick={handleCreate}
                        className="bg-stone-900 dark:bg-yellow-600 text-white rounded-full px-8 py-3 text-[12px] font-bold uppercase tracking-[0.2em] hover:bg-yellow-700 dark:hover:bg-yellow-500 transition-all shadow-xl hover:shadow-yellow-600/10 flex items-center gap-2 group"
                    >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        Nouvel Utilisateur
                    </button>
                </div>

                {/* Filters Row */}
                <div className="bg-white dark:bg-stone-900/50 rounded-3xl p-4 border border-stone-100 dark:border-stone-800 shadow-sm flex flex-wrap items-center gap-4 mb-8">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[240px]">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-[20px]">search</span>
                        <input 
                            type="text" 
                            placeholder="Rechercher par nom ou email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-stone-50 dark:bg-stone-950/50 border border-transparent focus:border-yellow-500/30 rounded-2xl pl-12 pr-4 py-3 text-[13px] outline-none transition-all"
                        />
                    </div>

                    {/* Role Filter */}
                    <div className="relative min-w-[160px]">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-[18px]">badge</span>
                        <select 
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="appearance-none w-full bg-stone-50 dark:bg-stone-950/50 border border-transparent focus:border-yellow-500/30 rounded-2xl pl-12 pr-10 py-3 text-[13px] outline-none transition-all cursor-pointer"
                        >
                            <option value="ALL">Tous les rôles</option>
                            <option value="OWNER">Propriétaires</option>
                            <option value="ADMIN">Admins</option>
                            <option value="COMMERCIAL">Commerciaux</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none text-[18px]">expand_more</span>
                    </div>

                    {/* Date Filter */}
                    <div className="relative min-w-[160px]">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-[18px]">calendar_today</span>
                        <input 
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="w-full bg-stone-50 dark:bg-stone-950/50 border border-transparent focus:border-yellow-500/30 rounded-2xl pl-12 pr-4 py-3 text-[13px] outline-none transition-all cursor-pointer"
                        />
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-[32px] overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-stone-50 dark:border-stone-800/50">
                                    <th className="px-8 py-5 text-left text-[11px] font-bold text-stone-400 uppercase tracking-widest">Utilisateur</th>
                                    <th className="px-6 py-5 text-left text-[11px] font-bold text-stone-400 uppercase tracking-widest">Rôle</th>
                                    <th className="px-6 py-5 text-left text-[11px] font-bold text-stone-400 uppercase tracking-widest">Magasin</th>
                                    <th className="px-6 py-5 text-left text-[11px] font-bold text-stone-400 uppercase tracking-widest">Coordonnées</th>
                                    <th className="px-6 py-5 text-left text-[11px] font-bold text-stone-400 uppercase tracking-widest">Date d'ajout</th>
                                    <th className="px-8 py-5 text-right text-[11px] font-bold text-stone-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-50 dark:divide-stone-800/50">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="py-20 text-center">
                                            <div className="animate-pulse flex flex-col items-center gap-3">
                                                <div className="w-10 h-10 bg-stone-100 rounded-full"></div>
                                                <div className="h-2 w-32 bg-stone-50 rounded-full"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-20 text-center text-stone-400 font-mono text-[12px] uppercase tracking-widest">
                                            Aucun utilisateur trouvé
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className="group hover:bg-stone-50/50 dark:hover:bg-stone-800/20 transition-colors">
                                            <td className="px-8 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 flex items-center justify-center shadow-sm">
                                                        <span className="material-symbols-outlined text-stone-400 text-[20px]">person</span>
                                                    </div>
                                                    <div>
                                                        <div className="text-[14px] font-bold text-stone-900 dark:text-stone-100">{user.fullName}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                    user.role === 'OWNER' ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30' :
                                                    user.role === 'ADMIN' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30' :
                                                    'bg-stone-100 text-stone-600 dark:bg-stone-800'
                                                }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-[13px] text-stone-600 dark:text-stone-300">
                                                    <span className="material-symbols-outlined text-[18px] text-stone-400">storefront</span>
                                                    {user.showroom?.name || '--'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 text-[12px] text-stone-500 hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer group/mail">
                                                        <span className="material-symbols-outlined text-[16px] text-stone-300 group-hover/mail:text-yellow-600 transition-colors">mail</span>
                                                        {user.email || '--'}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[12px] text-stone-500">
                                                        <span className="material-symbols-outlined text-[16px] text-stone-300">call</span>
                                                        {user.phone || '--'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-[12px] text-stone-400 font-mono">
                                                    {new Date(user.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                </div>
                                            </td>
                                            <td className="px-8 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={() => handleEdit(user)}
                                                        className="w-10 h-10 rounded-xl bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 flex items-center justify-center text-stone-400 hover:text-yellow-600 hover:border-yellow-200 transition-all shadow-sm"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">edit_note</span>
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteClick(user.id)}
                                                        className="w-10 h-10 rounded-xl bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 flex items-center justify-center text-stone-400 hover:text-red-500 hover:border-red-200 transition-all shadow-sm"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">delete_sweep</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            <UserSlideOver 
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                user={selectedUser}
                mode={drawerMode}
                magasins={magasins}
                onSubmit={handleSaveUser}
            />

            <ConfirmDialog 
                isOpen={isDeleteDialogOpen}
                title="Supprimer l'utilisateur"
                message="Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible et supprimera toutes les données associées."
                confirmText="Supprimer"
                cancelText="Annuler"
                isDestructive={true}
                onConfirm={confirmDelete}
                onCancel={() => setIsDeleteDialogOpen(false)}
            />
        </div>
    );
}
