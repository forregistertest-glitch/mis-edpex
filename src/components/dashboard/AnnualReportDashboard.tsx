"use client";

import { useEffect, useState } from "react";
import {
    BarChart3, TrendingUp, Target, CheckCircle2, XCircle,
    GraduationCap, Stethoscope, Users, Award, Loader2,
    ArrowUpRight, ArrowDownRight, Minus,
} from "lucide-react";
import type { Language } from "@/lib/translations";
import { getAllKpiMaster, getKpiEntries, getAggregatedValue } from "@/lib/data-service";
import type { KpiMaster, KpiEntry } from "@/lib/data-service";
import { formatNumber } from "@/lib/utils";

interface AnnualReportDashboardProps {
    lang: Language;
}

interface KpiScorecard {
    kpi: KpiMaster;
    value: number | null;
    target: number | null;
    met: boolean;
    entryCount: number;
    trend: "up" | "down" | "flat";
}

const categoryConfig: Record<string, { label_th: string; label_en: string; icon: typeof GraduationCap; color: string; bg: string }> = {
    "7.1": { label_th: "วิชาการ", label_en: "Academic", icon: GraduationCap, color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
    "7.2": { label_th: "โรงพยาบาล / บริการ", label_en: "Hospital / Services", icon: Stethoscope, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
    "7.3": { label_th: "บุคลากร / HR", label_en: "Staff / HR", icon: Users, color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
    "7.4": { label_th: "ยุทธศาสตร์", label_en: "Strategic", icon: Award, color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
};

export default function AnnualReportDashboard({ lang }: AnnualReportDashboardProps) {
    const th = lang === "th";
    const [loading, setLoading] = useState(true);
    const [year, setYear] = useState(new Date().getFullYear() + 543);
    const [scorecards, setScorecards] = useState<Record<string, KpiScorecard[]>>({});
    const [summary, setSummary] = useState({ total: 0, met: 0, notMet: 0, noData: 0 });

    const availableYears = [2569, 2568, 2567, 2566];

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                // 1. Fetch Masters
                const allMasters = await getAllKpiMaster();

                // 2. Bulk Fetch Entries for Current Year and Previous Year
                // Now getKpiEntries supports server-side filtering by year!
                const [currentEntries, prevEntries] = await Promise.all([
                    getKpiEntries(undefined, year),
                    getKpiEntries(undefined, year - 1)
                ]);

                // 3. Group by KPI ID in memory
                const currentMap = new Map<string, KpiEntry[]>();
                currentEntries.forEach(e => {
                    const list = currentMap.get(e.kpi_id) || [];
                    list.push(e);
                    currentMap.set(e.kpi_id, list);
                });

                const prevMap = new Map<string, KpiEntry[]>();
                prevEntries.forEach(e => {
                    const list = prevMap.get(e.kpi_id) || [];
                    list.push(e);
                    prevMap.set(e.kpi_id, list);
                });

                const grouped: Record<string, KpiScorecard[]> = {};
                let total = 0, met = 0, notMet = 0, noData = 0;

                for (const master of allMasters) {
                    const catId = master.category_id;
                    if (!grouped[catId]) grouped[catId] = [];

                    // Calculate Current Value (Local Aggregation logic matches getAggregatedValue)
                    const entries = currentMap.get(master.kpi_id) || [];
                    const numericEntries = entries.filter(e => e.value !== null);
                    let aggValue: number | null = null;

                    if (numericEntries.length > 0) {
                        const values = numericEntries.map(e => e.value!);
                        if (master.aggregation === "sum") aggValue = values.reduce((a, b) => a + b, 0);
                        else if (master.aggregation === "latest") aggValue = values[0];
                        else if (master.aggregation === "count") aggValue = values.length;
                        else aggValue = values.reduce((a, b) => a + b, 0) / values.length; // avg

                        aggValue = Math.round(aggValue * 100) / 100;
                    }

                    const target = master.target_value;
                    const isMet = target !== null && aggValue !== null && aggValue >= target;

                    // Calculate Trend
                    let trend: "up" | "down" | "flat" = "flat";
                    const prevList = prevMap.get(master.kpi_id) || [];
                    const prevValues = prevList.filter(e => e.value !== null).map(e => e.value!);

                    if (prevValues.length > 0 && aggValue !== null) {
                        const prevAvg = prevValues.reduce((a, b) => a + b, 0) / prevValues.length;
                        if (aggValue > prevAvg * 1.01) trend = "up";
                        else if (aggValue < prevAvg * 0.99) trend = "down";
                    }

                    grouped[catId].push({
                        kpi: master,
                        value: aggValue,
                        target,
                        met: isMet,
                        entryCount: numericEntries.length,
                        trend,
                    });

                    total++;
                    if (aggValue === null) noData++;
                    else if (isMet) met++;
                    else notMet++;
                }

                setScorecards(grouped);
                setSummary({ total, met, notMet, noData });
            } catch (err) {
                console.error("Annual report fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [year]);

    const metPct = summary.total > 0 ? Math.round((summary.met / summary.total) * 100) : 0;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header with Year Selector */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-1 flex items-center gap-3">
                        {th ? `📊 รายงานสรุปภาพรวมรายปี` : `📊 Annual Performance Report`}
                        <select
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                            className="text-lg bg-white border border-slate-200 rounded-lg px-3 py-1 cursor-pointer focus:ring-2 focus:ring-blue-200 outline-none text-[#133045] font-bold"
                        >
                            {availableYears.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </h2>
                    <p className="text-sm text-slate-500">
                        {th ? "สรุปผลการดำเนินงานเทียบเป้าหมายทั้ง 4 ด้าน" : "Overall performance vs. targets across all 4 categories"}
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="p-12 text-center">
                    <Loader2 className="animate-spin mx-auto mb-3" size={32} style={{ color: '#71C5E8' }} />
                    <p className="text-sm text-slate-400">{th ? "กำลังรวบรวมข้อมูลรายงานประจำปี..." : "Compiling annual report data..."}</p>
                </div>
            ) : (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <SummaryCard label={th ? "KPI ทั้งหมด" : "Total KPIs"} value={summary.total} icon={BarChart3} color="bg-slate-100" textColor="text-slate-700" />
                        <SummaryCard label={th ? "บรรลุเป้า" : "Met Target"} value={summary.met} icon={CheckCircle2} color="bg-green-50" textColor="text-green-700" />
                        <SummaryCard label={th ? "ต่ำกว่าเป้า" : "Below Target"} value={summary.notMet} icon={XCircle} color="bg-red-50" textColor="text-red-600" />
                        <SummaryCard label={th ? "ยังไม่มีข้อมูล" : "No Data"} value={summary.noData} icon={Minus} color="bg-amber-50" textColor="text-amber-600" />
                    </div>

                    {/* Overall Achievement Bar */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-bold text-slate-700">{th ? "อัตราการบรรลุเป้าหมายรวม" : "Overall Target Achievement"}</span>
                            <span className="text-2xl font-bold" style={{ color: '#133045' }}>{metPct}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                            <div
                                className="h-4 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${metPct}%`, background: metPct >= 70 ? 'linear-gradient(90deg, #34d399, #10b981)' : metPct >= 40 ? 'linear-gradient(90deg, #fbbf24, #f59e0b)' : 'linear-gradient(90deg, #f87171, #ef4444)' }}
                            />
                        </div>
                        <div className="flex justify-between text-xs text-slate-400 mt-1">
                            <span>0%</span>
                            <span>50%</span>
                            <span>100%</span>
                        </div>
                    </div>

                    {/* Category Sections */}
                    {Object.entries(categoryConfig).map(([catId, config]) => {
                        const items = scorecards[catId] || [];
                        const CatIcon = config.icon;
                        const catMet = items.filter(i => i.met).length;
                        const catTotal = items.length;

                        return (
                            <div key={catId} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                                {/* Category Header */}
                                <div className={`flex items-center justify-between px-6 py-4 border-b ${config.bg}`}>
                                    <div className="flex items-center gap-3">
                                        <CatIcon size={20} className={config.color} />
                                        <h3 className={`text-lg font-bold ${config.color}`}>
                                            {th ? config.label_th : config.label_en} ({catId})
                                        </h3>
                                    </div>
                                    <span className="text-sm font-semibold text-slate-600">
                                        {catMet}/{catTotal} {th ? "บรรลุเป้า" : "met"}
                                    </span>
                                </div>

                                {/* KPI Table */}
                                {items.length === 0 ? (
                                    <div className="p-8 text-center text-slate-400 text-sm">{th ? "ยังไม่มีข้อมูล" : "No data"}</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-slate-100">
                                                    <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs">KPI ID</th>
                                                    <th className="text-left px-5 py-3 font-semibold text-slate-500 text-xs">{th ? "ชื่อ" : "Name"}</th>
                                                    <th className="text-right px-5 py-3 font-semibold text-slate-500 text-xs">{th ? "ค่าจริง" : "Actual"}</th>
                                                    <th className="text-right px-5 py-3 font-semibold text-slate-500 text-xs">{th ? "เป้าหมาย" : "Target"}</th>
                                                    <th className="text-center px-5 py-3 font-semibold text-slate-500 text-xs">{th ? "สถานะ" : "Status"}</th>
                                                    <th className="text-center px-5 py-3 font-semibold text-slate-500 text-xs">{th ? "แนวโน้ม" : "Trend"}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {items.map(item => (
                                                    <tr key={item.kpi.kpi_id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-5 py-3 font-mono text-xs text-slate-500">{item.kpi.kpi_id}</td>
                                                        <td className="px-5 py-3 text-slate-700 font-medium">{th ? item.kpi.name_th : item.kpi.name_en}</td>
                                                        <td className="px-5 py-3 text-right font-bold text-slate-800">
                                                            {item.value !== null ? `${formatNumber(item.value)} ${item.kpi.unit}` : <span className="text-slate-300 font-normal">—</span>}
                                                        </td>
                                                        <td className="px-5 py-3 text-right text-slate-500">
                                                            {item.target !== null ? `${formatNumber(item.target)} ${item.kpi.unit}` : "—"}
                                                        </td>
                                                        <td className="px-5 py-3 text-center">
                                                            {item.value === null ? (
                                                                <span className="inline-flex items-center gap-1 text-xs text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full font-semibold">
                                                                    <Minus size={10} /> {th ? "ว่าง" : "N/A"}
                                                                </span>
                                                            ) : item.met ? (
                                                                <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-bold">
                                                                    <CheckCircle2 size={12} /> {th ? "บรรลุ" : "Met"}
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full font-bold">
                                                                    <XCircle size={12} /> {th ? "ไม่บรรลุ" : "Miss"}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-5 py-3 text-center">
                                                            {item.trend === "up" ? <ArrowUpRight size={16} className="text-green-500 mx-auto" /> :
                                                                item.trend === "down" ? <ArrowDownRight size={16} className="text-red-400 mx-auto" /> :
                                                                    <Minus size={16} className="text-slate-300 mx-auto" />}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </>
            )}
        </div>
    );
}

/* ─── Helper Component ────────────────────────────────────── */
function SummaryCard({ label, value, icon: Icon, color, textColor }: {
    label: string; value: number; icon: typeof BarChart3; color: string; textColor: string;
}) {
    return (
        <div className={`${color} rounded-2xl p-5 border border-slate-200/60`}>
            <div className="flex items-center gap-3 mb-1">
                <Icon size={18} className={textColor} />
                <span className="text-xs font-semibold text-slate-500">{label}</span>
            </div>
            <p className={`text-3xl font-bold ${textColor} mt-1`}>{value}</p>
        </div>
    );
}
