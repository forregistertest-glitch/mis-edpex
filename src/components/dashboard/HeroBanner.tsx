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
        <div className="rounded-3xl p-10 shadow-xl relative overflow-hidden"
            style={{ backgroundColor: '#71C5E8' }}>
            <div className="relative z-10">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 backdrop-blur-sm"
                    style={{ backgroundColor: 'rgba(255,255,255,0.3)', color: '#133045' }}>
                    🔥 LIVE DATA FROM FIRESTORE
                </span>
                <h2 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight text-white"
                    style={{ textShadow: '0 2px 4px rgba(0,0,0,0.15)' }}>
                    {t('heroTitle')}
                </h2>
                <p className="max-w-2xl text-lg leading-relaxed"
                    style={{ color: '#133045' }}>
                    {t('heroDesc')}
                </p>
                <div className="mt-6 flex items-center gap-4 text-sm">
                    <span className="backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-2"
                        style={{ backgroundColor: 'rgba(255,255,255,0.35)', color: '#133045' }}>
                        <Activity size={14} />{dashboardData?.totalEntries || 0} {lang === 'th' ? 'รายการข้อมูล' : 'data entries'}
                    </span>
                    <span className="backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-2"
                        style={{ backgroundColor: 'rgba(255,255,255,0.35)', color: '#133045' }}>
                        <BarChart3 size={14} />{dashboardData?.kpisWithData || 0}/{dashboardData?.totalKpis || 0} KPIs
                    </span>
                    <button onClick={fetchDashboard}
                        className="backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors"
                        style={{ backgroundColor: 'rgba(255,255,255,0.35)', color: '#133045' }}>
                        <RefreshCw size={14} />{lang === 'th' ? 'รีเฟรช' : 'Refresh'}
                    </button>
                </div>
            </div>
            {/* Subtle decorations */}
            <div className="absolute right-0 top-0 w-80 h-80 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
            <div className="absolute left-1/2 bottom-0 w-64 h-64 rounded-full -ml-32 -mb-32 blur-3xl"
                style={{ backgroundColor: 'rgba(19,48,69,0.08)' }} />
        </div>
    );
}
