"use client";

import {
    Users,
    GraduationCap,
    Stethoscope,
    TrendingUp,
    LayoutDashboard,
    FileText,
    ClipboardEdit,
    BookOpen,
    LogOut,
} from "lucide-react";
import type { Language, TranslationKey } from "@/lib/translations";

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    setShowDocs: (show: boolean) => void;
    t: (key: TranslationKey) => string;
    lang: Language;
    onSignOut?: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, setShowDocs, t, lang, onSignOut }: SidebarProps) {
    const navItems = [
        { id: 'Dashboard', name: t('dashboard'), icon: LayoutDashboard },
        { id: 'Academic', name: t('academic'), icon: GraduationCap },
        { id: 'Staff/HR', name: t('staff'), icon: Users },
        { id: 'Hospital', name: t('hospital'), icon: Stethoscope },
        { id: 'Strategic', name: t('strategic'), icon: TrendingUp },
        { id: 'Input', name: t('inputData'), icon: ClipboardEdit },
        { id: 'Reports', name: t('reports'), icon: FileText },
        { id: 'Docs', name: t('documentation'), icon: BookOpen },
    ];

    return (
        <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col">
            <div className="p-6">
                <div className="flex items-center gap-3 mb-2">
                    <img src="https://vet.ku.ac.th/vv2018/download/KU/KU_logo.png" alt="KU Logo" className="w-10 h-10 object-contain" />
                    <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                        {t('systemName')}
                    </h1>
                </div>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">{t('heroSub')}</p>
            </div>
            <nav className="mt-4 flex-1 px-4 space-y-1">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => item.id === 'Docs' ? setShowDocs(true) : setActiveTab(item.id)}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium w-full transition-all duration-200 ${activeTab === item.id ? 'bg-blue-600 text-white shadow-md scale-105' : 'text-slate-500 hover:bg-slate-100'}`}
                    >
                        <item.icon size={18} />
                        {item.name}
                    </button>
                ))}
            </nav>
            <div className="p-4 border-t border-slate-200 space-y-3">
                <p className="text-[10px] text-slate-400 font-medium text-center uppercase tracking-widest">{t('academicYear')} 2568</p>
                {onSignOut && (
                    <button
                        onClick={onSignOut}
                        className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                        <LogOut size={16} />
                        {lang === 'th' ? 'ออกจากระบบ' : 'Sign Out'}
                    </button>
                )}
            </div>
        </aside>
    );
}
