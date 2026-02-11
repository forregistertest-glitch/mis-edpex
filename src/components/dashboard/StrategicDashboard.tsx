"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement,
    Title, Tooltip, Legend, Filler, RadialLinearScale,
} from "chart.js";
import { Line, Bar, Radar } from "react-chartjs-2";
import { TrendingUp, Loader2, RefreshCw, Award, Globe, Shield, Landmark, PawPrint } from "lucide-react";
import ChartFilterBar, { ChartViewMode } from "./ChartFilterBar";
import DashboardCard from "./DashboardCard";
import type { Language } from "@/lib/translations";
import {
    getKpiTrendData, getKpiMatrixData, getAvailableFilters, getCategoryOverview,
    type TrendPoint, type MatrixPoint, type AvailableFilters,
} from "@/lib/data-service";
import { formatNumber } from "@/lib/utils";


ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler, RadialLinearScale);

const COLORS = [
    { border: "rgb(139,92,246)", bg: "rgba(139,92,246,0.15)" },
    { border: "rgb(59,130,246)", bg: "rgba(59,130,246,0.15)" },
    { border: "rgb(34,197,94)", bg: "rgba(34,197,94,0.15)" },
    { border: "rgb(249,115,22)", bg: "rgba(249,115,22,0.15)" },
    { border: "rgb(239,68,68)", bg: "rgba(239,68,68,0.15)" },
    { border: "rgb(20,184,166)", bg: "rgba(20,184,166,0.15)" },
];

interface StrategicDashboardProps { lang: Language; }

export default function StrategicDashboard({ lang }: StrategicDashboardProps) {
    const th = lang === "th";
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<AvailableFilters>({ years: [], periods: [], dimensions: [] });
    const [selectedYear, setSelectedYear] = useState<number | "all">("all");
    const [selectedDimension, setSelectedDimension] = useState("");
    const [viewMode, setViewMode] = useState<ChartViewMode>("bar");

    const [soMatrix, setSoMatrix] = useState<MatrixPoint[]>([]);
    const [revenueMatrix, setRevenueMatrix] = useState<MatrixPoint[]>([]);
    const [animalTrend, setAnimalTrend] = useState<Record<string, TrendPoint[]>>({});
    const [labTrend, setLabTrend] = useState<Record<string, TrendPoint[]>>({});
    const [isoTrend, setIsoTrend] = useState<Record<string, TrendPoint[]>>({});
    const [governanceMatrix, setGovernanceMatrix] = useState<MatrixPoint[]>([]);
    const [categoryData, setCategoryData] = useState<any[]>([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const avail = await getAvailableFilters("7.4");
            setFilters(avail);
            const yearNum = selectedYear === "all" ? undefined : selectedYear;

            const [so, revenue, animal, lab, iso, governance, catOverview] = await Promise.all([
                getKpiMatrixData("7.4.4", yearNum, "ยุทธศาสตร์"),
                getKpiMatrixData("7.4.7", yearNum),
                getKpiTrendData(["7.4.14", "7.4.15"]),
                getKpiTrendData("7.4.12"),
                getKpiTrendData("7.4.5"),
                getKpiMatrixData("7.4.11", yearNum, "ประเด็น"),
                getCategoryOverview("7.4", yearNum || 2568),
            ]);

            setSoMatrix(so);
            setRevenueMatrix(revenue);
            setAnimalTrend(animal);
            setLabTrend(lab);
            setIsoTrend(iso);
            setGovernanceMatrix(governance);
            setCategoryData(catOverview);
        } catch (err) { console.error("StrategicDashboard error:", err); }
        finally { setLoading(false); }
    }, [selectedYear, selectedDimension]);

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

    // Summary
    const soAvg = soMatrix.length > 0 ? Math.round(soMatrix.reduce((s, m) => s + m.value * 100, 0) / soMatrix.length) : null;

    const cards = [
        { label: th ? "ความสำเร็จยุทธศาสตร์" : "SO Progress", value: soAvg ? `${soAvg}%` : null, icon: TrendingUp, color: "from-purple-500 to-purple-600" },
        { label: th ? "แหล่งรายได้ใหม่" : "New Revenue", value: revenueMatrix.length > 0 ? revenueMatrix.reduce((s, m) => s + m.value, 0).toLocaleString() + " ฿" : null, icon: Landmark, color: "from-blue-500 to-blue-600" },
        { label: th ? "สัตว์ทำหมัน" : "Animal Welfare", value: (animalTrend["7.4.15"] || []).slice(-1)[0]?.value ?? null, icon: PawPrint, color: "from-green-500 to-green-600" },
        { label: th ? "ธรรมาภิบาล" : "Governance", value: governanceMatrix.length > 0 ? (governanceMatrix.reduce((s, m) => s + m.value, 0) / governanceMatrix.length).toFixed(1) : null, icon: Shield, color: "from-teal-500 to-teal-600" },
    ];

    if (loading) return <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-purple-400 mb-3" size={32} /><p className="text-sm text-slate-400">{th ? "กำลังโหลด..." : "Loading..."}</p></div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <ChartFilterBar years={filters.years} selectedYear={selectedYear} onYearChange={setSelectedYear}
                dimensions={filters.dimensions} selectedDimension={selectedDimension} onDimensionChange={setSelectedDimension}
                viewMode={viewMode} onViewModeChange={setViewMode} lang={lang} />

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map(card => {
                    // Logic & Source Mapping
                    let logic = "", source = "";
                    if (card.icon === TrendingUp) { logic = th ? "ความสำเร็จตามแผนยุทธศาสตร์" : "Strategic Plan Success"; source = "KPI-7.4.4"; }
                    else if (card.icon === Landmark) { logic = th ? "มูลค่าแหล่งรายได้ใหม่" : "New Revenue Value"; source = "KPI-7.4.7"; }
                    else if (card.icon === PawPrint) { logic = th ? "จำนวนสัตว์ที่ทำหมัน" : "Sterilized Animals Count"; source = "KPI-7.4.15"; }
                    else if (card.icon === Shield) { logic = th ? "คะแนนการประเมินธรรมาภิบาล" : "Governance Score"; source = "KPI-7.4.11"; }

                    return (
                        <DashboardCard
                            key={card.label}
                            title={card.label}
                            value={card.value !== null && card.value !== undefined ? (typeof card.value === 'number' ? formatNumber(card.value) : card.value) : "—"}
                            trend="→ Tracking"
                            icon={card.icon}
                            iconColor="text-white"
                            iconBg={`bg-gradient-to-br ${card.color}`}
                            logic={logic}
                            source={source}
                        />
                    );
                })}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Strategic Objectives — Horizontal Bar */}
                <div className="lg:col-span-2">
                    <DashboardCard
                        title={th ? "ความก้าวหน้าดำเนินงานตามแผนยุทธศาสตร์ (7.4.4)" : "Strategic Objectives Progress (7.4.4)"}
                        logic={th ? "ร้อยละความสำเร็จของโครงการตามแผนยุทธศาสตร์" : "Percentage of completion for strategic projects"}
                        source={th ? "งานนโยบายและแผน" : "Policy & Planning"}
                    >
                        <div className="h-[320px]">
                            {soMatrix.length > 0 ? (
                                <Bar options={{
                                    ...chartOpts(th ? "ความก้าวหน้าดำเนินงานตามแผนยุทธศาสตร์ (7.4.4)" : "Strategic Objectives Progress (7.4.4)"),
                                    indexAxis: "y" as const,
                                    scales: { x: { beginAtZero: true, max: 1, ticks: { format: { style: "percent" as const }, callback: (v: any) => `${Math.round(Number(v) * 100)}%` }, grid: { color: "rgba(0,0,0,0.04)" } }, y: { grid: { display: false } } },
                                }} data={{
                                    labels: soMatrix.map(m => m.dimension_value.length > 40 ? m.dimension_value.slice(0, 40) + "…" : m.dimension_value),
                                    datasets: [{
                                        label: th ? "ร้อยละสำเร็จ" : "% Complete",
                                        data: soMatrix.map(m => m.value),
                                        backgroundColor: soMatrix.map((_, i) => COLORS[i % COLORS.length].bg),
                                        borderColor: soMatrix.map((_, i) => COLORS[i % COLORS.length].border),
                                        borderWidth: 1,
                                    }],
                                }} />
                            ) : <div className="flex flex-col items-center justify-center h-full text-slate-400"><p className="font-bold text-sm mb-1">{th ? "ความก้าวหน้ายุทธศาสตร์ (7.4.4)" : "Strategic Objectives Progress (7.4.4)"}</p><p className="text-xs">{th ? "ยังไม่มีข้อมูล — กรุณากรอกข้อมูลในแบบฟอร์ม" : "No data — please submit via input form"}</p></div>}
                        </div>
                    </DashboardCard>
                </div>

                {/* Revenue Sources */}
                <DashboardCard
                    title={th ? "แหล่งรายได้ใหม่ (7.4.7)" : "New Revenue Sources (7.4.7)"}
                    logic={th ? "มูลค่ารายได้จากแหล่งทุนใหม่และบริการวิชาการ" : "Revenue value from new funding sources and academic services"}
                    source={th ? "งานคลังและพัสดุ" : "Finance & Procurement"}
                >
                    <div className="h-[320px]">
                        {revenueMatrix.length > 0 ? (
                            <Bar options={chartOpts(th ? "แหล่งรายได้ใหม่ (7.4.7)" : "New Revenue Sources (7.4.7)")} data={{
                                labels: revenueMatrix.map(m => m.dimension_value),
                                datasets: [{ label: th ? "บาท" : "THB", data: revenueMatrix.map(m => m.value), backgroundColor: COLORS.map(c => c.bg), borderColor: COLORS.map(c => c.border), borderWidth: 1 }],
                            }} />
                        ) : <div className="flex flex-col items-center justify-center h-full text-slate-400"><p className="font-bold text-sm mb-1">{th ? "แหล่งรายได้ใหม่ (7.4.7)" : "New Revenue Sources (7.4.7)"}</p><p className="text-xs">{th ? "ยังไม่มีข้อมูล — กรุณากรอกข้อมูลในแบบฟอร์ม" : "No data — please submit via input form"}</p></div>}
                    </div>
                </DashboardCard>

                {/* Governance Radar */}
                <DashboardCard
                    title={th ? "ธรรมาภิบาล จริยธรรม (7.4.11)" : "Governance & Ethics (7.4.11)"}
                    logic={th ? "ผลการประเมินธรรมาภิบาลและความโปร่งใส (ITA)" : "Integrity and Transparency Assessment (ITA) results"}
                    source={th ? "คณะกรรมการจริยธรรม" : "Ethics Committee"}
                >
                    <div className="h-[320px]">
                        {governanceMatrix.length > 0 ? (
                            <Radar options={{
                                responsive: true, maintainAspectRatio: false,
                                plugins: { title: { display: false } },
                                scales: { r: { beginAtZero: true, max: 5, ticks: { stepSize: 1 } } },
                            }} data={{
                                labels: governanceMatrix.map(m => m.dimension_value.length > 18 ? m.dimension_value.slice(0, 18) + "…" : m.dimension_value),
                                datasets: [{ label: th ? "คะแนน" : "Score", data: governanceMatrix.map(m => m.value), borderColor: COLORS[0].border, backgroundColor: COLORS[0].bg, pointBackgroundColor: COLORS[0].border }],
                            }} />
                        ) : <div className="flex flex-col items-center justify-center h-full text-slate-400"><p className="font-bold text-sm mb-1">{th ? "ธรรมาภิบาล จริยธรรม (7.4.11)" : "Governance & Ethics (7.4.11)"}</p><p className="text-xs">{th ? "ยังไม่มีข้อมูล — กรุณากรอกข้อมูลในแบบฟอร์ม" : "No data — please submit via input form"}</p></div>}
                    </div>
                </DashboardCard>

                {/* Animal Welfare */}
                <DashboardCard
                    title={th ? "สัตว์ปลอดโรค & ทำหมัน (7.4.14-15)" : "Animal Disease Control & Sterilization"}
                    logic={th ? "จำนวนการให้บริการฉีดวัคซีนและทำหมันสัตว์จรจัด" : "Number of vaccinations and sterilizations for stray animals"}
                    source={th ? "หน่วยสัตวแพทย์เคลื่อนที่" : "Mobile Vet Unit"}
                >
                    <div className="h-[320px]">
                        <Bar options={chartOpts(th ? "สัตว์ปลอดโรค & ทำหมัน (7.4.14-15)" : "Animal Disease Control & Sterilization")} data={buildTrend(animalTrend, {
                            "7.4.14": th ? "จำนวนครั้ง" : "Events", "7.4.15": th ? "จำนวนสัตว์" : "Animals",
                        })} />
                    </div>
                </DashboardCard>

                {/* Lab Standards */}
                <DashboardCard
                    title={th ? "สถานที่ได้รับรองมาตรฐานสัตว์ทดลอง (7.4.12)" : "Accredited Lab Facilities (7.4.12)"}
                    logic={th ? "จำนวนห้องปฏิบัติการที่ได้รับการรับรองมาตรฐานสากล" : "Number of internationally accredited laboratories"}
                    source={th ? "ศูนย์สัตว์ทดลอง" : "Lab Animal Center"}
                >
                    <div className="h-[320px]">
                        <Bar options={chartOpts(th ? "สถานที่ได้รับรองมาตรฐานสัตว์ทดลอง (7.4.12)" : "Accredited Lab Facilities (7.4.12)")} data={buildTrend(labTrend, { "7.4.12": th ? "แห่ง" : "Sites" })} />
                    </div>
                </DashboardCard>
            </div>

            {/* KPI Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-8 py-5 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="text-purple-600 bg-purple-50 p-2 rounded-xl"><TrendingUp size={20} /></div>
                        <h3 className="text-lg font-bold text-slate-800">{th ? "ตัวชี้วัดยุทธศาสตร์ทั้งหมด" : "All Strategic KPIs"}</h3>
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
                                        <td className="px-6 py-3 text-right font-bold text-slate-800">{kpi.latestValue !== null ? formatNumber(kpi.latestValue) : <span className="text-slate-300">—</span>}</td>
                                        <td className="px-6 py-3 text-right text-slate-500">{hasTarget ? formatNumber(kpi.target_value) : "—"}</td>
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
