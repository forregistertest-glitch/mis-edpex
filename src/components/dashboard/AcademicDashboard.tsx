"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { GraduationCap, Loader2, RefreshCw, TrendingUp, BookOpen, FlaskConical, Users, Shield } from "lucide-react";
import ChartFilterBar, { ChartViewMode } from "./ChartFilterBar";
import DashboardCard from "./DashboardCard";
import type { Language } from "@/lib/translations";
import {
    getKpiTrendData,
    getKpiMatrixData,
    getAvailableFilters,
    getCategoryOverview,
    type TrendPoint,
    type AvailableFilters,
} from "@/lib/data-service";
import { formatNumber } from "@/lib/utils";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

// ── Chart color palettes ─────────────────────────────────────
const COLORS = {
    blue: { border: "rgb(59, 130, 246)", bg: "rgba(59, 130, 246, 0.15)" },
    purple: { border: "rgb(168, 85, 247)", bg: "rgba(168, 85, 247, 0.15)" },
    green: { border: "rgb(34, 197, 94)", bg: "rgba(34, 197, 94, 0.15)" },
    orange: { border: "rgb(249, 115, 22)", bg: "rgba(249, 115, 22, 0.15)" },
    red: { border: "rgb(239, 68, 68)", bg: "rgba(239, 68, 68, 0.15)" },
    teal: { border: "rgb(20, 184, 166)", bg: "rgba(20, 184, 166, 0.15)" },
};

const TARGET_LINE = { border: "rgb(220, 38, 38)", bg: "rgba(220, 38, 38, 0.08)" };

interface AcademicDashboardProps {
    lang: Language;
}

export default function AcademicDashboard({ lang }: AcademicDashboardProps) {
    const th = lang === "th";

    // ── State ──────────────────────────────────────────────────
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<AvailableFilters>({ years: [], periods: [], dimensions: [] });
    const [selectedYear, setSelectedYear] = useState<number | "all">("all");
    const [selectedDimension, setSelectedDimension] = useState("");
    const [viewMode, setViewMode] = useState<ChartViewMode>("bar");
    const [compareYear, setCompareYear] = useState<number | null>(null);

    // Chart data
    const [examTrend, setExamTrend] = useState<Record<string, TrendPoint[]>>({});
    const [researchTrend, setResearchTrend] = useState<Record<string, TrendPoint[]>>({});
    const [supplyTrend, setSupplyTrend] = useState<Record<string, TrendPoint[]>>({});
    const [retentionTrend, setRetentionTrend] = useState<Record<string, TrendPoint[]>>({});
    const [safetyTrend, setSafetyTrend] = useState<Record<string, TrendPoint[]>>({});
    const [categoryData, setCategoryData] = useState<any[]>([]);

    // ── Data Fetching ──────────────────────────────────────────
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const avail = await getAvailableFilters("7.1");
            setFilters(avail);

            const yearFilter = selectedYear === "all" ? undefined : { years: [selectedYear] };
            const dimFilter = selectedDimension ? { ...yearFilter, dimension: selectedDimension } : yearFilter;

            const [exam, research, supply, retention, safety, catOverview] = await Promise.all([
                getKpiTrendData(["7.1.1", "7.1.2"], dimFilter),
                getKpiTrendData(["7.1.16", "7.1.17", "7.1.18", "7.1.19"], dimFilter),
                getKpiTrendData("7.1.13", dimFilter),
                getKpiTrendData("7.1.14", dimFilter),
                getKpiTrendData("7.1.11", dimFilter),
                getCategoryOverview("7.1", selectedYear === "all" ? 2568 : selectedYear),
            ]);

            setExamTrend(exam);
            setResearchTrend(research);
            setSupplyTrend(supply);
            setRetentionTrend(retention);
            setSafetyTrend(safety);
            setCategoryData(catOverview);
        } catch (err) {
            console.error("AcademicDashboard fetch error:", err);
        } finally {
            setLoading(false);
        }
    }, [selectedYear, selectedDimension]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // ── Chart Options ──────────────────────────────────────────
    const lineOpts = (title: string, yMax?: number) => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: "top" as const, labels: { usePointStyle: true, padding: 16, font: { size: 11 } } },
            title: { display: true, text: title, font: { size: 14, weight: "bold" as const }, padding: { bottom: 16 } },
            tooltip: { mode: "index" as const, intersect: false },
        },
        scales: {
            y: { beginAtZero: true, ...(yMax ? { max: yMax } : {}), grid: { color: "rgba(0,0,0,0.04)" } },
            x: { grid: { display: false } },
        },
        interaction: { mode: "nearest" as const, axis: "x" as const },
    });

    const barOpts = (title: string) => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: "top" as const, labels: { usePointStyle: true, padding: 16, font: { size: 11 } } },
            title: { display: true, text: title, font: { size: 14, weight: "bold" as const }, padding: { bottom: 16 } },
            tooltip: { mode: "index" as const, intersect: false },
        },
        scales: {
            y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.04)" } },
            x: { grid: { display: false } },
        },
    });

    // ── Build chart data ───────────────────────────────────────
    const buildTrendChart = (data: Record<string, TrendPoint[]>, labels: Record<string, { name: string; color: typeof COLORS.blue }>) => {
        const allLabels = new Set<string>();
        Object.values(data).forEach((pts) => pts.forEach((p) => allLabels.add(String(p.year))));
        const sortedLabels = [...allLabels].sort();

        const datasets = Object.entries(labels).map(([kpiId, { name, color }]) => {
            const pts = data[kpiId] || [];
            return {
                label: name,
                data: sortedLabels.map((yr) => {
                    const p = pts.find((pt) => String(pt.year) === yr);
                    return p?.value ?? null;
                }),
                borderColor: color.border,
                backgroundColor: color.bg,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointHoverRadius: 7,
            };
        });

        // Add target line if first KPI has a target
        const firstKpi = Object.keys(labels)[0];
        const firstTarget = data[firstKpi]?.[0]?.target;
        if (firstTarget !== null && firstTarget !== undefined) {
            datasets.push({
                label: th ? "เป้าหมาย" : "Target",
                data: sortedLabels.map(() => firstTarget),
                borderColor: TARGET_LINE.border,
                backgroundColor: TARGET_LINE.bg,
                fill: false,
                tension: 0,
                pointRadius: 0,
                pointHoverRadius: 0,
                // @ts-ignore
                borderDash: [6, 4],
                borderWidth: 2,
            });
        }

        return { labels: sortedLabels, datasets };
    };

    // Summary cards
    const examData = examTrend["7.1.1"] || [];
    const latestExam = examData.length > 0 ? examData[examData.length - 1] : null;
    const osceData = examTrend["7.1.2"] || [];
    const latestOsce = osceData.length > 0 ? osceData[osceData.length - 1] : null;
    const retData = retentionTrend["7.1.14"] || [];
    const latestRet = retData.length > 0 ? retData[retData.length - 1] : null;
    const safetyData = safetyTrend["7.1.11"] || [];
    const latestSafety = safetyData.length > 0 ? safetyData[safetyData.length - 1] : null;

    const summaryCards = [
        { label: th ? "สอบใบประกอบ" : "Licensure Exam", value: latestExam?.value, unit: "%", icon: GraduationCap, color: "blue", target: latestExam?.target },
        { label: th ? "สอบ OSCE" : "OSCE Pass", value: latestOsce?.value, unit: "%", icon: BookOpen, color: "purple", target: latestOsce?.target },
        { label: th ? "อัตราคงอยู่" : "Retention Rate", value: latestRet?.value, unit: "%", icon: Users, color: "green", target: latestRet?.target },
        { label: th ? "อุบัติเหตุ" : "Safety", value: latestSafety?.value, unit: th ? "ครั้ง" : "cases", icon: Shield, color: "red", target: latestSafety?.target },
    ];

    if (loading) {
        return (
            <div className="p-12 text-center">
                <Loader2 className="animate-spin mx-auto text-blue-400 mb-3" size={32} />
                <p className="text-sm text-slate-400">{th ? "กำลังโหลดข้อมูลวิชาการ..." : "Loading academic data..."}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Filter Bar */}
            <ChartFilterBar
                years={filters.years}
                selectedYear={selectedYear}
                onYearChange={setSelectedYear}
                dimensions={filters.dimensions}
                selectedDimension={selectedDimension}
                onDimensionChange={setSelectedDimension}
                compareYear={compareYear}
                onCompareYearChange={setCompareYear}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                lang={lang}
            />

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {summaryCards.map((card) => {
                    const colorMap: Record<string, { t: string, b: string }> = {
                        blue: { t: "text-blue-600", b: "bg-blue-100" },
                        purple: { t: "text-purple-600", b: "bg-purple-100" },
                        green: { t: "text-green-600", b: "bg-green-100" },
                        red: { t: "text-red-600", b: "bg-red-100" },
                    };
                    const met = card.target !== null && card.target !== undefined && card.value !== null && card.value !== undefined && card.value >= card.target;

                    // Logic & Source Mapping
                    let logic = "", source = "";
                    if (card.icon === GraduationCap) { logic = th ? "ร้อยละผู้สอบผ่านใบประกอบวิชาชีพ" : "% Passing Licensure Exam"; source = "KPI-7.1.1"; }
                    else if (card.icon === BookOpen) { logic = th ? "ร้อยละผู้สอบผ่าน OSCE" : "% Passing OSCE"; source = "KPI-7.1.2"; }
                    else if (card.icon === Users) { logic = th ? "อัตราการคงอยู่ของนิสิต" : "Student Retention Rate"; source = "KPI-7.1.14"; }
                    else if (card.icon === Shield) { logic = th ? "จำนวนอุบัติเหตุ" : "Safety Incidents"; source = "KPI-7.1.11"; }

                    return (
                        <DashboardCard
                            key={card.label}
                            title={card.label}
                            value={card.value !== null && card.value !== undefined ? `${formatNumber(card.value)}${card.unit === "%" ? "%" : ` ${card.unit}`}` : "—"}
                            trend={card.target !== null && card.target !== undefined ? (met ? "✓ Met Target" : "→ Tracking") : undefined}
                            icon={card.icon}
                            iconColor={colorMap[card.color].t}
                            iconBg={colorMap[card.color].b}
                            logic={logic}
                            source={source}
                        />
                    );
                })}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Licensure Exam + OSCE Trend */}
                <DashboardCard
                    title={th ? "แนวโน้มสอบใบประกอบ & OSCE" : "Licensure & OSCE Trend"}
                    logic={th ? "เปรียบเทียบผลสอบใบประกอบวิชาชีพและ OSCE ย้อนหลัง 5 ปี" : "5-Year trend of Licensure and OSCE pass rates"}
                    source={th ? "ฝ่ายวิชาการ / สัตวแพทยสภา" : "Academic Affairs / Vet Council"}
                >
                    <div className="h-[320px]">
                        {viewMode === "table" ? (
                            <SimpleTable data={examTrend} labels={{ "7.1.1": th ? "สอบใบประกอบ (%)" : "Licensure (%)", "7.1.2": th ? "OSCE (%)" : "OSCE (%)" }} />
                        ) : viewMode === "line" ? (
                            <Line options={lineOpts(th ? "แนวโน้มสอบใบประกอบ & OSCE" : "Licensure & OSCE Trend", 100)} data={buildTrendChart(examTrend, {
                                "7.1.1": { name: th ? "สอบใบประกอบ (%)" : "Licensure (%)", color: COLORS.blue },
                                "7.1.2": { name: "OSCE (%)", color: COLORS.purple },
                            })} />
                        ) : (
                            <Bar options={barOpts(th ? "แนวโน้มสอบใบประกอบ & OSCE" : "Licensure & OSCE Trend")} data={buildTrendChart(examTrend, {
                                "7.1.1": { name: th ? "สอบใบประกอบ (%)" : "Licensure (%)", color: COLORS.blue },
                                "7.1.2": { name: "OSCE (%)", color: COLORS.purple },
                            })} />
                        )}
                    </div>
                </DashboardCard>

                {/* 2. Research Funding */}
                <DashboardCard
                    title={th ? "ทุนวิจัย: ภายใน vs ภายนอก" : "Research Funding: Internal vs External"}
                    logic={th ? "เปรียบเทียบจำนวนเงินและจำนวนโครงการทุนวิจัยแยกตามแหล่งทุน" : "Comparison of funding amounts and grants by source"}
                    source={th ? "ฝ่ายวิจัยและนวัตกรรม" : "Research & Innovation Dept"}
                >
                    <div className="h-[320px]">
                        {viewMode === "table" ? (
                            <SimpleTable data={researchTrend} labels={{
                                "7.1.16": th ? "จำนวนทุนภายใน" : "Internal Grants",
                                "7.1.17": th ? "เงินทุนภายใน (บาท)" : "Internal Fund (฿)",
                                "7.1.18": th ? "จำนวนทุนภายนอก" : "External Grants",
                                "7.1.19": th ? "เงินทุนภายนอก (บาท)" : "External Fund (฿)",
                            }} />
                        ) : (
                            <Bar options={barOpts(th ? "ทุนวิจัย: ภายใน vs ภายนอก" : "Research Funding: Internal vs External")} data={buildTrendChart(researchTrend, {
                                "7.1.16": { name: th ? "จำนวนทุนภายใน" : "Int. Grants", color: COLORS.blue },
                                "7.1.17": { name: th ? "เงินทุนภายใน" : "Int. Fund", color: COLORS.teal },
                                "7.1.18": { name: th ? "จำนวนทุนภายนอก" : "Ext. Grants", color: COLORS.orange },
                                "7.1.19": { name: th ? "เงินทุนภายนอก" : "Ext. Fund", color: COLORS.purple },
                            })} />
                        )}
                    </div>
                </DashboardCard>

                {/* 3. Retention Rate */}
                <DashboardCard
                    title={th ? "อัตราคงอยู่นิสิต (ปี 2 ขึ้นไป)" : "Student Retention Rate (Year 2+)"}
                    logic={th ? "ร้อยละของนิสิตที่คงอยู่เทียบกับจำนวนรับเข้าในรุ่นเดียวกัน" : "Percentage of retained students vs intake cohort"}
                    source={th ? "งานบริการการศึกษา" : "Education Service Division"}
                >
                    <div className="h-[320px]">
                        {viewMode === "table" ? (
                            <SimpleTable data={retentionTrend} labels={{ "7.1.14": th ? "อัตราคงอยู่ (%)" : "Retention (%)" }} />
                        ) : (
                            <Line options={lineOpts(th ? "อัตราคงอยู่นิสิต (ปี 2 ขึ้นไป)" : "Student Retention Rate (Year 2+)", 100)} data={buildTrendChart(retentionTrend, {
                                "7.1.14": { name: th ? "อัตราคงอยู่ (%)" : "Retention (%)", color: COLORS.green },
                            })} />
                        )}
                    </div>
                </DashboardCard>

                {/* 4. Supply Chain / Network Schools */}
                <DashboardCard
                    title={th ? "เครือข่ายโรงเรียนมัธยม (Supply Chain)" : "High School Network (Supply Chain)"}
                    logic={th ? "จำนวนโรงเรียนมัธยมในเครือข่ายความร่วมมือทางวิชาการ" : "Number of high schools in academic partnership network"}
                    source={th ? "งานประชาสัมพันธ์และสื่อสารองค์กร" : "PR & Corp Comm"}
                >
                    <div className="h-[320px]">
                        {viewMode === "table" ? (
                            <SimpleTable data={supplyTrend} labels={{ "7.1.13": th ? "โรงเรียนเครือข่าย" : "Network Schools" }} />
                        ) : (
                            <Bar options={barOpts(th ? "เครือข่ายโรงเรียนมัธยม (Supply Chain)" : "High School Network (Supply Chain)")} data={buildTrendChart(supplyTrend, {
                                "7.1.13": { name: th ? "จำนวนโรงเรียน" : "Schools", color: COLORS.teal },
                            })} />
                        )}
                    </div>
                </DashboardCard>

                {/* 5. Safety Incidents */}
                <div className="lg:col-span-2">
                    <DashboardCard
                        title={th ? "อุบัติเหตุด้านความปลอดภัย" : "Safety Incidents"}
                        logic={th ? "จำนวนอุบัติเหตุที่เกิดขึ้นกับนิสิตและบุคลากรในคณะ" : "Number of safety incidents involving students and staff"}
                        source={th ? "คณะกรรมการความปลอดภัย (Safety Committee)" : "Safety Committee"}
                    >
                        <div className="h-[280px]">
                            {viewMode === "table" ? (
                                <SimpleTable data={safetyTrend} labels={{ "7.1.11": th ? "อุบัติเหตุ (ครั้ง)" : "Incidents" }} />
                            ) : (
                                <Bar options={barOpts(th ? "อุบัติเหตุด้านความปลอดภัย" : "Safety Incidents")} data={buildTrendChart(safetyTrend, {
                                    "7.1.11": { name: th ? "จำนวนอุบัติเหตุ" : "Incidents", color: COLORS.red },
                                })} />
                            )}
                        </div>
                    </DashboardCard>
                </div>
            </div>

            {/* KPI Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-8 py-5 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="text-blue-600 bg-blue-50 p-2 rounded-xl"><GraduationCap size={20} /></div>
                        <h3 className="text-lg font-bold text-slate-800">{th ? "ตัวชี้วัดวิชาการทั้งหมด" : "All Academic KPIs"}</h3>
                    </div>
                    <button onClick={fetchData} className="p-2 text-slate-400 hover:text-blue-600 transition-colors" title="Refresh"><RefreshCw size={16} /></button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 text-left">
                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">KPI</th>
                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">{th ? "ชื่อตัวชี้วัด" : "Indicator"}</th>
                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-right">{th ? "ค่าล่าสุด" : "Latest"}</th>
                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-right">{th ? "เป้าหมาย" : "Target"}</th>
                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">{th ? "สถานะ" : "Status"}</th>
                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-center">Entries</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {categoryData.map((kpi: any) => {
                                const hasTarget = kpi.target_value !== null && kpi.target_value !== undefined;
                                const met = hasTarget && kpi.latestValue !== null && kpi.latestValue >= kpi.target_value;
                                return (
                                    <tr key={kpi.kpi_id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-3 font-mono text-xs text-blue-600 font-bold">{kpi.kpi_id}</td>
                                        <td className="px-6 py-3 text-slate-700 text-sm max-w-[300px]">{th ? kpi.name_th : kpi.name_en}</td>
                                        <td className="px-6 py-3 text-right font-bold text-slate-800">
                                            {kpi.latestValue !== null ? formatNumber(kpi.latestValue) : <span className="text-slate-300">—</span>}
                                        </td>
                                        <td className="px-6 py-3 text-right text-slate-500">{hasTarget ? formatNumber(kpi.target_value) : "—"}</td>
                                        <td className="px-6 py-3">
                                            {kpi.latestValue === null ? (
                                                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-400">{th ? "ไม่มีข้อมูล" : "No data"}</span>
                                            ) : met ? (
                                                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">✓ {th ? "ถึงเป้า" : "Met"}</span>
                                            ) : hasTarget ? (
                                                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-700">→ {th ? "ยังไม่ถึง" : "Below"}</span>
                                            ) : (
                                                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-600">{th ? "ติดตาม" : "Track"}</span>
                                            )}
                                        </td>
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

// ── Simple Table for "table" view mode ───────────────────────
function SimpleTable({ data, labels }: { data: Record<string, TrendPoint[]>; labels: Record<string, string> }) {
    const allYears = new Set<number>();
    Object.values(data).forEach((pts) => pts.forEach((p) => allYears.add(p.year)));
    const sorted = [...allYears].sort();

    return (
        <div className="overflow-auto h-full">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-slate-50">
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500">KPI</th>
                        {sorted.map((y) => <th key={y} className="px-4 py-2 text-right text-xs font-semibold text-slate-500">{y}</th>)}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {Object.entries(labels).map(([kpiId, name]) => (
                        <tr key={kpiId} className="hover:bg-slate-50/50">
                            <td className="px-4 py-2 text-slate-700 font-medium">{name}</td>
                            {sorted.map((y) => {
                                const pt = (data[kpiId] || []).find((p) => p.year === y);
                                return <td key={y} className="px-4 py-2 text-right font-bold text-slate-800">{pt?.value !== undefined ? formatNumber(pt.value) : "—"}</td>;
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
