"use client";

import { Info } from "lucide-react";

interface DashboardCardProps {
    title: string;
    trend?: string;
    value?: string | number | React.ReactNode;
    icon?: any;
    iconColor?: string;
    iconBg?: string;
    logic: string;
    source: string;
    children?: React.ReactNode; // For charts or complex content
    isLoading?: boolean;
}

export default function DashboardCard({
    title,
    trend,
    value,
    icon: Icon,
    iconColor = "text-blue-600",
    iconBg = "bg-blue-100",
    logic,
    source,
    children,
    isLoading
}: DashboardCardProps) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-lg transition-all flex flex-col overflow-hidden h-full group">
            {/* Top Layer: Data/Chart */}
            <div className="p-6 flex-1 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        {Icon && (
                            <div className={`${iconBg} ${iconColor} p-2.5 rounded-xl group-hover:scale-110 transition-transform`}>
                                <Icon size={20} />
                            </div>
                        )}
                        <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider">{title}</h3>
                    </div>
                    {trend && (
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${trend.includes('✓') || trend.includes('Active') || trend.includes('≥') ? 'text-green-600 bg-green-50' : 'text-slate-600 bg-slate-50'}`}>
                            {trend}
                        </span>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1">
                    {isLoading ? (
                        <div className="h-full flex items-center justify-center min-h-[60px]">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500/30"></div>
                        </div>
                    ) : children ? (
                        <div className="w-full h-full min-h-[200px]">
                            {children}
                        </div>
                    ) : (
                        <p className="text-3xl font-bold text-slate-800 mt-2">{value}</p>
                    )}
                </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-slate-100 w-full" />

            {/* Bottom Layer: Logic & Source */}
            <div className="bg-slate-50/50 p-4 min-h-[70px] flex flex-col justify-center text-xs">
                <div className="flex items-start gap-2 text-slate-500 mb-1">
                    <Info size={14} className="mt-0.5 text-blue-400 shrink-0" />
                    <p className="leading-snug"><span className="font-semibold text-slate-600">Logic:</span> {logic}</p>
                </div>
                <div className="flex items-center gap-2 text-slate-400 ml-6">
                    <span className="font-semibold">Source:</span> <span className="font-mono bg-slate-100 px-1.5 rounded">{source}</span>
                </div>
            </div>
        </div>
    );
}
