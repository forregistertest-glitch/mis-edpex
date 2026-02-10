"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement,
    Title, Tooltip, Legend, Filler, RadialLinearScale,
} from "chart.js";
import { Line, Bar, Radar } from "react-chartjs-2";
import { Users, Loader2, RefreshCw, HeartPulse, Shield, Award, UserCheck } from "lucide-react";
import ChartFilterBar, { ChartViewMode } from "./ChartFilterBar";
import type { Language } from "@/lib/translations";
import {
    getKpiTrendData, getKpiMatrixData, getAvailableFilters, getCategoryOverview,
    type TrendPoint, type MatrixPoint, type AvailableFilters,
} from "@/lib/data-service";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler, RadialLinearScale);

const COLORS = [
    { border: "rgb(59,130,246)", bg: "rgba(59,130,246,0.15)" },
    { border: "rgb(168,85,247)", bg: "rgba(168,85,247,0.15)" },
    { border: "rgb(34,197,94)", bg: "rgba(34,197,94,0.15)" },
    { border: "rgb(249,115,22)", bg: "rgba(249,115,22,0.15)" },
    { border: "rgb(239,68,68)", bg: "rgba(239,68,68,0.15)" },
    { border: "rgb(20,184,166)", bg: "rgba(20,184,166,0.15)" },
];

interface StaffDashboardProps { lang: Language; }

export default function StaffDashboard({ lang }: StaffDashboardProps) {
    const th = lang === "th";
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<AvailableFilters>({ years: [], periods: [], dimensions: [] });
    const [selectedYear, setSelectedYear] = useState<number | "all">("all");
    const [selectedPeriod, setSelectedPeriod] = useState("all");
    const [selectedDimension, setSelectedDimension] = useState("");
    const [viewMode, setViewMode] = useState<ChartViewMode>("bar");

    const [sickLeaveTrend, setSickLeaveTrend] = useState<Record<string, TrendPoint[]>>({});
    const [safetyTrend, setSafetyTrend] = useState<Record<string, TrendPoint[]>>({});
    const [benefitsTrend, setBenefitsTrend] = useState<Record<string, TrendPoint[]>>({});
    const [engagementMatrix, setEngagementMatrix] = useState<MatrixPoint[]>([]);
    const [turnoverMatrix, setTurnoverMatrix] = useState<MatrixPoint[]>([]);
    const [talentMatrix, setTalentMatrix] = useState<MatrixPoint[]>([]);
    const [categoryData, setCategoryData] = useState<any[]>([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const avail = await getAvailableFilters("7.3");
            setFilters(avail);
            const dimFilter = selectedDimension ? { dimension: selectedDimension } : undefined;
            const yearNum = selectedYear === "all" ? undefined : selectedYear;

            const [sick, safety, benefits, engagement, turnover, talent, catOverview] = await Promise.all([
                getKpiTrendData("7.3.4", { ...dimFilter, period: selectedPeriod !== "all" ? selectedPeriod : undefined }),
                getKpiTrendData("7.3.5", dimFilter),
                getKpiTrendData("7.3.7", dimFilter),
                getKpiMatrixData("7.3.10", yearNum, "ด้าน"),
                getKpiMatrixData("7.3.11", yearNum, "ช่วงอายุงาน"),
                getKpiMatrixData("7.3.12", yearNum),
                getCategoryOverview("7.3", yearNum || 2568),
            ]);

            setSickLeaveTrend(sick);
            setSafetyTrend(safety);
            setBenefitsTrend(benefits);
            setEngagementMatrix(engagement);
            setTurnoverMatrix(turnover);
            setTalentMatrix(talent);
            setCategoryData(catOverview);
        } catch (err) { console.error("StaffDashboard error:", err); }
        finally { setLoading(false); }
    }, [selectedYear, selectedPeriod, selectedDimension]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const chartOpts = (title: string) => ({
        responsive: true, maintainAspectRatio: false,
        plugins: {
            legend: { position: "top" as const, labels: { usePointStyle: true, padding: 16, font: { size: 11 } } },
            title: { display: true, text: title, font: { size: 14, weight: "bold" as const }, padding: { bottom: 16 } },
            tooltip: { mode: "index" as const, intersect: false },
        },
        scales: { y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.04)" } }, x: { grid: { display: false } } },
    });

    const buildTrend = (data: Record<string, TrendPoint[]>, labels: Record<string, string>) => {
        const allYears = new Set<string>();
        Object.values(data).forEach(pts => pts.forEach(p => allYears.add(String(p.year))));
        const sorted = [...allYears].sort();
        const datasets = Object.entries(labels).map(([kpiId, name], i) => ({
            label: name,
            data: sorted.map(yr => (data[kpiId] || []).find(p => String(p.year) === yr)?.value ?? null),
            borderColor: COLORS[i % COLORS.length].border,
            backgroundColor: COLORS[i % COLORS.length].bg,
            fill: true, tension: 0.4, pointRadius: 5, pointHoverRadius: 7,
        }));
        return { labels: sorted, datasets };
    };

    // Summary cards
    const engScore = engagementMatrix.length > 0 ? (engagementMatrix.reduce((s, m) => s + m.value, 0) / engagementMatrix.length).toFixed(2) : null;
    const sickData = sickLeaveTrend["7.3.4"] || [];
    const latestSick = sickData.length > 0 ? sickData[sickData.length - 1] : null;
    const safetyD = safetyTrend["7.3.5"] || [];
    const latestSafety = safetyD.length > 0 ? safetyD[safetyD.length - 1] : null;

    const cards = [
        { label: th ? "ความผูกพัน" : "Engagement", value: engScore, unit: th ? "คะแนน" : "pts", icon: HeartPulse, color: "from-purple-500 to-purple-600" },
        { label: th ? "วันลาป่วยเฉลี่ย" : "Avg Sick Leave", value: latestSick?.value, unit: th ? "วัน" : "days", icon: Users, color: "from-blue-500 to-blue-600" },
        { label: th ? "อุบัติเหตุ" : "Incidents", value: latestSafety?.value, unit: th ? "ครั้ง" : "cases", icon: Shield, color: "from-red-500 to-red-600" },
        { label: th ? "Talent Pool" : "Talent Pool", value: talentMatrix.reduce((s, m) => s + m.value, 0) || null, unit: th ? "คน" : "ppl", icon: Award, color: "from-teal-500 to-teal-600" },
    ];

    if (loading) return <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-blue-400 mb-3" size={32} /><p className="text-sm text-slate-400">{th ? "กำลังโหลด..." : "Loading..."}</p></div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <ChartFilterBar years={filters.years} selectedYear={selectedYear} onYearChange={setSelectedYear}
                periods={filters.periods} selectedPeriod={selectedPeriod} onPeriodChange={setSelectedPeriod}
                dimensions={filters.dimensions} selectedDimension={selectedDimension} onDimensionChange={setSelectedDimension}
                viewMode={viewMode} onViewModeChange={setViewMode} lang={lang} />

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map(card => (
                    <div key={card.label} className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center gap-2 mb-3">
                            <div className={`p-2 rounded-xl bg-gradient-to-br ${card.color} text-white`}><card.icon size={16} /></div>
                            <span className="text-xs font-bold text-slate-400 uppercase">{card.label}</span>
                        </div>
                        <p className="text-2xl font-black text-slate-800">{card.value !== null && card.value !== undefined ? `${card.value} ${card.unit}` : "—"}</p>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Engagement Radar */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
                    <div className="h-[320px]">
                        {engagementMatrix.length > 0 ? (
                            <Radar options={{
                                responsive: true, maintainAspectRatio: false,
                                plugins: { title: { display: true, text: th ? "ความผูกพันบุคลากร (7.3.10)" : "Staff Engagement (7.3.10)", font: { size: 14, weight: "bold" as const } } },
                                scales: { r: { beginAtZero: true, max: 5, ticks: { stepSize: 1 } } },
                            }} data={{
                                labels: engagementMatrix.map(m => m.dimension_value.length > 20 ? m.dimension_value.slice(0, 20) + "…" : m.dimension_value),
                                datasets: [{ label: th ? "คะแนน" : "Score", data: engagementMatrix.map(m => m.value), borderColor: COLORS[0].border, backgroundColor: COLORS[0].bg, pointBackgroundColor: COLORS[0].border }],
                            }} />
                        ) : <div className="flex flex-col items-center justify-center h-full text-slate-400"><p className="font-bold text-sm mb-1">{th ? "ความผูกพันบุคลากร (7.3.10)" : "Staff Engagement (7.3.10)"}</p><p className="text-xs">{th ? "ยังไม่มีข้อมูล — กรุณากรอกข้อมูลในแบบฟอร์ม" : "No data — please submit via input form"}</p></div>}
                    </div>
                </div>

                {/* Sick Leave */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
                    <div className="h-[320px]">
                        <Bar options={chartOpts(th ? "วันลาป่วยเฉลี่ย (7.3.4)" : "Avg Sick Leave Days (7.3.4)")} data={buildTrend(sickLeaveTrend, { "7.3.4": th ? "วัน/คน" : "Days/Person" })} />
                    </div>
                </div>

                {/* Turnover by tenure */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
                    <div className="h-[320px]">
                        {turnoverMatrix.length > 0 ? (
                            <Bar options={chartOpts(th ? "อาจารย์/สัตวแพทย์ลาออก (7.3.11)" : "Faculty Turnover (7.3.11)")} data={{
                                labels: turnoverMatrix.map(m => m.dimension_value),
                                datasets: [{ label: th ? "จำนวนคน" : "Count", data: turnoverMatrix.map(m => m.value), backgroundColor: COLORS.map(c => c.bg), borderColor: COLORS.map(c => c.border), borderWidth: 1 }],
                            }} />
                        ) : <div className="flex flex-col items-center justify-center h-full text-slate-400"><p className="font-bold text-sm mb-1">{th ? "อาจารย์/สัตวแพทย์ลาออก (7.3.11)" : "Faculty Turnover (7.3.11)"}</p><p className="text-xs">{th ? "ยังไม่มีข้อมูล — กรุณากรอกข้อมูลในแบบฟอร์ม" : "No data — please submit via input form"}</p></div>}
                    </div>
                </div>

                {/* Talent Pipeline */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
                    <div className="h-[320px]">
                        {talentMatrix.length > 0 ? (
                            <Bar options={{ ...chartOpts(th ? "Talent Successor (7.3.12)" : "Talent Successor (7.3.12)"), indexAxis: "y" as const }} data={{
                                labels: talentMatrix.map(m => m.dimension_value.length > 25 ? m.dimension_value.slice(0, 25) + "…" : m.dimension_value),
                                datasets: [{ label: th ? "จำนวนคน" : "Count", data: talentMatrix.map(m => m.value), backgroundColor: COLORS.map(c => c.bg), borderColor: COLORS.map(c => c.border), borderWidth: 1 }],
                            }} />
                        ) : <div className="flex flex-col items-center justify-center h-full text-slate-400"><p className="font-bold text-sm mb-1">{th ? "Talent Successor (7.3.12)" : "Talent Successor (7.3.12)"}</p><p className="text-xs">{th ? "ยังไม่มีข้อมูล — กรุณากรอกข้อมูลในแบบฟอร์ม" : "No data — please submit via input form"}</p></div>}
                    </div>
                </div>

                {/* Safety */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
                    <div className="h-[320px]">
                        <Bar options={chartOpts(th ? "อุบัติเหตุจากการทำงาน (7.3.5)" : "Workplace Incidents (7.3.5)")} data={buildTrend(safetyTrend, { "7.3.5": th ? "ครั้ง" : "Cases" })} />
                    </div>
                </div>

                {/* Benefits */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
                    <div className="h-[320px]">
                        <Bar options={chartOpts(th ? "สิทธิประโยชน์เพิ่มขึ้น (7.3.7)" : "Additional Benefits (7.3.7)")} data={buildTrend(benefitsTrend, { "7.3.7": th ? "รายการ" : "Items" })} />
                    </div>
                </div>
            </div>

            {/* KPI Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-8 py-5 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="text-amber-600 bg-amber-50 p-2 rounded-xl"><Users size={20} /></div>
                        <h3 className="text-lg font-bold text-slate-800">{th ? "ตัวชี้วัดบุคลากรทั้งหมด" : "All Staff KPIs"}</h3>
                    </div>
                    <button onClick={fetchData} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><RefreshCw size={16} /></button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead><tr className="bg-slate-50 text-left">
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">KPI</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">{th ? "ชื่อตัวชี้วัด" : "Indicator"}</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-right">{th ? "ค่าล่าสุด" : "Latest"}</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-right">{th ? "เป้าหมาย" : "Target"}</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">{th ? "สถานะ" : "Status"}</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-center">Entries</th>
                        </tr></thead>
                        <tbody className="divide-y divide-slate-100">
                            {categoryData.map((kpi: any) => {
                                const hasTarget = kpi.target_value != null;
                                const met = hasTarget && kpi.latestValue != null && kpi.latestValue >= kpi.target_value;
                                return (
                                    <tr key={kpi.kpi_id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-3 font-mono text-xs text-blue-600 font-bold">{kpi.kpi_id}</td>
                                        <td className="px-6 py-3 text-slate-700 text-sm max-w-[300px]">{th ? kpi.name_th : kpi.name_en}</td>
                                        <td className="px-6 py-3 text-right font-bold text-slate-800">{kpi.latestValue ?? <span className="text-slate-300">—</span>}</td>
                                        <td className="px-6 py-3 text-right text-slate-500">{hasTarget ? kpi.target_value : "—"}</td>
                                        <td className="px-6 py-3">{kpi.latestValue == null ? <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-400">{th ? "ไม่มีข้อมูล" : "No data"}</span> : met ? <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">✓ {th ? "ถึงเป้า" : "Met"}</span> : hasTarget ? <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-700">→ {th ? "ยังไม่ถึง" : "Below"}</span> : <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-600">{th ? "ติดตาม" : "Track"}</span>}</td>
                                        <td className="px-6 py-3 text-center"><span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full font-semibold text-slate-600">{kpi.entryCount}</span></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
