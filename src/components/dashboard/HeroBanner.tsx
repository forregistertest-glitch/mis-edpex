"use client";

import { Activity, BarChart3, RefreshCw } from "lucide-react";
import type { Language, TranslationKey } from "@/lib/translations";

interface HeroBannerProps {
    dashboardData: {
        totalEntries: number;
        kpisWithData: number;
        totalKpis: number;
    } | null;
    fetchDashboard: () => void;
    t: (key: TranslationKey) => string;
    lang: Language;
}

export default function HeroBanner({ dashboardData, fetchDashboard, t, lang }: HeroBannerProps) {
    return (
        <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 rounded-3xl p-10 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
                <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-semibold mb-4 backdrop-blur-sm">
                    🔥 LIVE DATA FROM FIRESTORE
                </span>
                <h2 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">{t('heroTitle')}</h2>
                <p className="opacity-80 max-w-2xl text-lg leading-relaxed">
                    {t('heroDesc')}
                </p>
                <div className="mt-6 flex items-center gap-4 text-sm">
                    <span className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-2">
                        <Activity size={14} />{dashboardData?.totalEntries || 0} {lang === 'th' ? 'รายการข้อมูล' : 'data entries'}
                    </span>
                    <span className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-2">
                        <BarChart3 size={14} />{dashboardData?.kpisWithData || 0}/{dashboardData?.totalKpis || 0} KPIs
                    </span>
                    <button onClick={fetchDashboard} className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-white/20 transition-colors">
                        <RefreshCw size={14} />{lang === 'th' ? 'รีเฟรช' : 'Refresh'}
                    </button>
                </div>
            </div>
            <div className="absolute right-0 top-0 w-80 h-80 bg-blue-400/20 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse"></div>
            <div className="absolute left-1/2 bottom-0 w-64 h-64 bg-indigo-500/20 rounded-full -ml-32 -mb-32 blur-3xl"></div>
        </div>
    );
}
