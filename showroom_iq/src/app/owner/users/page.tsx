'use client';

import { API_BASE_URL } from '@/config';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import OwnerHeader from '@/components/OwnerHeader';
import UserSlideOver from '@/components/UserSlideOver';
import ConfirmDialog from '@/components/ConfirmDialog';
import { toast } from 'react-hot-toast';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { 
  Pencil, 
  Trash2, 
  Ban, 
  CheckCircle2, 
  Calendar as CalendarIcon,
  Search,
  BadgeInfo,
  ShieldCheck,
  UserX,
  MoreVertical
} from "lucide-react";

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
    status: 'ACTIVE' | 'BLOCKED';
}

export default function UsersManagementPage() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [magasins, setMagasins] = useState<{ id: string; name: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('ALL');
    const [statusFilter, setStatusFilter] = useState<string>('ACTIVE');
    const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
    
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
            
            // Fetch Users - include all status for management view
            const usersRes = await fetch(`${API_BASE_URL}/api/users?status=ALL`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const usersResult = await usersRes.json();
            if (usersResult.success) {
                setUsers(usersResult.data);
            }

            // Fetch Magasins for the drawer
            const magasinsRes = await fetch(`${API_BASE_URL}/api/showrooms`, {
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
            const res = await fetch(`${API_BASE_URL}/api/users/${userToDelete}`, {
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
                ? `${API_BASE_URL}/api/users/${selectedUser.id}` 
                : `${API_BASE_URL}/api/users`;
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

    const handleToggleStatus = async (userId: string, currentStatus: 'ACTIVE' | 'BLOCKED') => {
        try {
            const token = localStorage.getItem('auth_token');
            const newStatus = currentStatus === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
            
            const res = await fetch(`${API_BASE_URL}/api/users/${userId}/status`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            const result = await res.json();

            if (result.success) {
                toast.success(newStatus === 'ACTIVE' ? 'Utilisateur débloqué' : 'Utilisateur bloqué');
                setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
            } else {
                toast.error(result.error || 'Erreur lors du changement de statut');
            }
        } catch (error) {
            toast.error('Erreur réseau');
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
        const matchesStatus = statusFilter === 'ALL' || user.status === statusFilter;
        const matchesDate = !dateFilter || new Date(user.createdAt).toDateString() === dateFilter.toDateString();
        return matchesSearch && matchesRole && matchesStatus && matchesDate;
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

                    {/* Status Filter */}
                    <div className="relative min-w-[160px]">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-[18px]">verified_user</span>
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="appearance-none w-full bg-stone-50 dark:bg-stone-950/50 border border-transparent focus:border-yellow-500/30 rounded-2xl pl-12 pr-10 py-3 text-[13px] outline-none transition-all cursor-pointer"
                        >
                            <option value="ALL">Tous les statuts</option>
                            <option value="ACTIVE">Actif</option>
                            <option value="BLOCKED">Bloqué</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none text-[18px]">expand_more</span>
                    </div>

                    {/* Pro Date Picker */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "min-w-[180px] justify-start text-left font-normal bg-stone-50 dark:bg-stone-950/50 border-transparent rounded-2xl h-[46px] hover:bg-stone-100 transition-all",
                                    !dateFilter && "text-stone-400"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4 text-stone-400" />
                                {dateFilter ? format(dateFilter, "PPP", { locale: fr }) : <span>Date d'ajout</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                mode="single"
                                selected={dateFilter}
                                onSelect={setDateFilter}
                                initialFocus
                                locale={fr}
                            />
                            {dateFilter && (
                                <div className="p-2 border-t border-stone-100 flex justify-end">
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => setDateFilter(undefined)}
                                        className="text-[10px] uppercase tracking-widest font-bold"
                                    >
                                        Effacer
                                    </Button>
                                </div>
                            )}
                        </PopoverContent>
                    </Popover>
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
                                        <tr 
                                            key={user.id} 
                                            className="group hover:bg-stone-50/50 dark:hover:bg-stone-800/20 transition-colors cursor-pointer"
                                            onClick={() => router.push(`/owner/scorecard/commercial?id=${user.id}`)}
                                        >
                                            <td className="px-8 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 flex items-center justify-center shadow-sm">
                                                        <span className="material-symbols-outlined text-stone-400 text-[20px]">person</span>
                                                    </div>
                                                    <div className="text-[14px] font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                                                        {user.fullName}
                                                        {user.status === 'BLOCKED' && (
                                                            <span className="flex items-center text-[9px] text-red-500 font-black uppercase tracking-tighter bg-red-50 px-1.5 py-0.5 rounded">BLOQUÉ</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1.5">
                                                    <span className={`w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                        user.role === 'OWNER' ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30' :
                                                        user.role === 'ADMIN' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30' :
                                                        'bg-stone-100 text-stone-600 dark:bg-stone-800'
                                                    }`}>
                                                        {user.role}
                                                    </span>
                                                    <span className={`w-fit px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                                                        user.status === 'ACTIVE' 
                                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                                            : 'bg-red-50 text-red-600 border-red-100'
                                                    }`}>
                                                        {user.status}
                                                    </span>
                                                </div>
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
                                            <td className="px-8 py-4">
                                                <div className="flex items-center justify-end gap-3">
                                                    {/* Toggle Status (Block/Unblock) */}
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleToggleStatus(user.id, user.status);
                                                        }}
                                                        className={cn(
                                                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm",
                                                            user.status === 'ACTIVE' 
                                                                ? "bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100" 
                                                                : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100"
                                                        )}
                                                        title={user.status === 'ACTIVE' ? "Bloquer l'utilisateur" : "Activer l'utilisateur"}
                                                    >
                                                        {user.status === 'ACTIVE' ? <Ban size={18} /> : <ShieldCheck size={18} />}
                                                    </button>

                                                    {/* Edit Button */}
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEdit(user);
                                                        }}
                                                        className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center hover:bg-orange-100 transition-all duration-300 shadow-sm"
                                                        title="Modifier"
                                                    >
                                                        <Pencil size={18} />
                                                    </button>

                                                    {/* Delete Button */}
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteClick(user.id);
                                                        }}
                                                        className="w-10 h-10 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center hover:bg-red-100 transition-all duration-300 shadow-sm"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 size={18} />
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
