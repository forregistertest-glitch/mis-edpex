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
    Shield,
    UserCheck,
    User,
    BarChart3,
} from "lucide-react";
import type { Language, TranslationKey } from "@/lib/translations";

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    setShowDocs: (show: boolean) => void;
    t: (key: TranslationKey) => string;
    lang: Language;
    onSignOut?: () => void;
    userRole?: string | null;
    userName?: string | null;
}

const roleBadge: Record<string, { label: string; color: string; bg: string; icon: typeof Shield }> = {
    admin: { label: "Admin", color: "text-red-600", bg: "bg-red-50 border-red-200", icon: Shield },
    reviewer: { label: "Reviewer", color: "text-amber-600", bg: "bg-amber-50 border-amber-200", icon: UserCheck },
    user: { label: "User", color: "text-[#236c96]", bg: "bg-[#e0f2fb] border-[#c1eaf9]", icon: User },
};

export default function Sidebar({ activeTab, setActiveTab, setShowDocs, t, lang, onSignOut, userRole, userName }: SidebarProps) {
    const isReviewer = userRole === "reviewer" || userRole === "admin";

    const navItems = [
        { id: 'Dashboard', name: t('dashboard'), icon: LayoutDashboard, show: true },
        { id: 'Academic', name: t('academic'), icon: GraduationCap, show: true },
        { id: 'Staff/HR', name: t('staff'), icon: Users, show: true },
        { id: 'Hospital', name: t('hospital'), icon: Stethoscope, show: true },
        { id: 'Strategic', name: t('strategic'), icon: TrendingUp, show: true },
        { id: 'Input', name: t('inputData'), icon: ClipboardEdit, show: true },
        { id: 'Review', name: lang === 'th' ? 'ตรวจสอบข้อมูล' : 'Review', icon: UserCheck, show: isReviewer },
        { id: 'Reports', name: t('reports'), icon: FileText, show: true },
        { id: 'AnnualReport', name: lang === 'th' ? 'รายงานประจำปี' : 'Annual Report', icon: BarChart3, show: true },
        { id: 'Docs', name: t('documentation'), icon: BookOpen, show: true },
    ].filter(item => item.show);

    const badge = roleBadge[userRole || "user"] || roleBadge.user;
    const BadgeIcon = badge.icon;

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

            {/* Role Badge */}
            <div className="px-4 mb-3">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${badge.bg} transition-all`}>
                    <BadgeIcon size={14} className={badge.color} />
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-700 truncate">{userName || "User"}</p>
                        <p className={`text-[10px] font-semibold ${badge.color}`}>{badge.label}</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-1">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => item.id === 'Docs' ? setShowDocs(true) : setActiveTab(item.id)}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium w-full transition-all duration-200 ${activeTab === item.id ? 'bg-[#71C5E8] text-white shadow-md scale-105' : 'text-slate-500 hover:bg-slate-100'}`}
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
