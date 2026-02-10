"use client";

import { BarChart3, LineChart as LineChartIcon, Table2 } from "lucide-react";

export type ChartViewMode = "line" | "bar" | "table";

interface ChartFilterBarProps {
    years: number[];
    selectedYear: number | "all";
    onYearChange: (year: number | "all") => void;
    periods?: string[];
    selectedPeriod?: string;
    onPeriodChange?: (period: string) => void;
    dimensions?: string[];
    selectedDimension?: string;
    onDimensionChange?: (dimension: string) => void;
    compareYear?: number | null;
    onCompareYearChange?: (year: number | null) => void;
    viewMode?: ChartViewMode;
    onViewModeChange?: (mode: ChartViewMode) => void;
    lang?: "th" | "en";
}

export default function ChartFilterBar({
    years,
    selectedYear,
    onYearChange,
    periods,
    selectedPeriod,
    onPeriodChange,
    dimensions,
    selectedDimension,
    onDimensionChange,
    compareYear,
    onCompareYearChange,
    viewMode = "bar",
    onViewModeChange,
    lang = "th",
}: ChartFilterBarProps) {
    const t = lang === "th";

    return (
        <div className="flex flex-wrap items-center gap-3 p-4 bg-gradient-to-r from-slate-50 to-blue-50/50 rounded-2xl border border-slate-200/80 mb-6">
            {/* Year */}
            <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t ? "ปี" : "Year"}</label>
                <select
                    value={String(selectedYear)}
                    onChange={(e) => onYearChange(e.target.value === "all" ? "all" : Number(e.target.value))}
                    className="px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400/40 transition-all hover:border-blue-300 shadow-sm"
                >
                    <option value="all">{t ? "ทุกปี" : "All Years"}</option>
                    {years.map((y) => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>
            </div>

            {/* Period */}
            {periods && periods.length > 0 && onPeriodChange && (
                <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t ? "งวด" : "Period"}</label>
                    <select
                        value={selectedPeriod || "all"}
                        onChange={(e) => onPeriodChange(e.target.value)}
                        className="px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400/40 transition-all hover:border-blue-300 shadow-sm"
                    >
                        <option value="all">{t ? "ทั้งหมด" : "All"}</option>
                        {periods.map((p) => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Dimension */}
            {dimensions && dimensions.length > 0 && onDimensionChange && (
                <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t ? "มิติ" : "Dim"}</label>
                    <select
                        value={selectedDimension || "all"}
                        onChange={(e) => onDimensionChange(e.target.value === "all" ? "" : e.target.value)}
                        className="px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400/40 transition-all hover:border-blue-300 shadow-sm"
                    >
                        <option value="all">{t ? "รวม" : "All"}</option>
                        {dimensions.map((d) => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Compare */}
            {onCompareYearChange && (
                <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t ? "เทียบกับ" : "vs"}</label>
                    <select
                        value={compareYear ? String(compareYear) : "none"}
                        onChange={(e) => onCompareYearChange(e.target.value === "none" ? null : Number(e.target.value))}
                        className="px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-400/40 transition-all hover:border-purple-300 shadow-sm"
                    >
                        <option value="none">—</option>
                        {years.filter((y) => y !== selectedYear).map((y) => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* View Mode Toggle */}
            {onViewModeChange && (
                <div className="flex bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    {([
                        { mode: "line" as ChartViewMode, icon: LineChartIcon, label: "Line" },
                        { mode: "bar" as ChartViewMode, icon: BarChart3, label: "Bar" },
                        { mode: "table" as ChartViewMode, icon: Table2, label: "Table" },
                    ]).map(({ mode, icon: Icon, label }) => (
                        <button
                            key={mode}
                            onClick={() => onViewModeChange(mode)}
                            className={`p-2 transition-all ${viewMode === mode ? "bg-blue-600 text-white" : "text-slate-400 hover:text-blue-600 hover:bg-blue-50"}`}
                            title={label}
                        >
                            <Icon size={16} />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
