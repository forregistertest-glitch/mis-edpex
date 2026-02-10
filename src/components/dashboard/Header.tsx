"use client";

import {
    Languages,
    Settings,
    Database,
    LogOut,
} from "lucide-react";
import type { Language, TranslationKey } from "@/lib/translations";
import type { User } from "firebase/auth";

interface HeaderProps {
    activeTab: string;
    lang: Language;
    setLang: (lang: Language) => void;
    dashboardData: { totalEntries: number } | null;
    t: (key: TranslationKey) => string;
    user?: User | null;
    onSignOut?: () => void;
}

export default function Header({ activeTab, lang, setLang, dashboardData, t, user, onSignOut }: HeaderProps) {
    return (
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
            <h2 className="text-lg font-semibold text-slate-800">
                {activeTab === 'Dashboard' ? t('executiveOverview') : activeTab}
            </h2>
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                    <Database size={13} className="text-blue-500" />
                    <span>{dashboardData?.totalEntries || 0} Entries</span>
                </div>

                <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden sm:block" />

                {/* Language Toggle */}
                <button
                    onClick={() => setLang(lang === 'th' ? 'en' : 'th')}
                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all relative group"
                    title={lang === 'th' ? 'Switch to English' : 'เปลี่ยนเป็นภาษาไทย'}
                >
                    <Languages size={20} />
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity">
                        {lang === 'th' ? 'EN' : 'TH'}
                    </span>
                </button>

                {/* Settings */}
                <button
                    className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
                    title={t('settings')}
                >
                    <Settings size={20} />
                </button>

                <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden sm:block" />

                <div className="flex items-center gap-2 text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    {t('academicYear')} 2568
                </div>

                {/* User Avatar & Sign Out */}
                <div className="flex items-center gap-2">
                    {user?.photoURL ? (
                        <img
                            src={user.photoURL}
                            alt={user.displayName || "User"}
                            className="w-9 h-9 rounded-full border-2 border-white shadow-sm"
                            title={user.displayName || user.email || ""}
                        />
                    ) : (
                        <div className="w-9 h-9 rounded-full bg-blue-600 border-2 border-white shadow-sm flex items-center justify-center text-white text-xs font-bold">
                            {user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                    )}
                    {onSignOut && (
                        <button
                            onClick={onSignOut}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            title={lang === 'th' ? 'ออกจากระบบ' : 'Sign Out'}
                        >
                            <LogOut size={18} />
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}
