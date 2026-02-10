"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement,
    Title, Tooltip, Legend, Filler, RadialLinearScale,
} from "chart.js";
import { Line, Bar, Radar } from "react-chartjs-2";
import { Stethoscope, Loader2, RefreshCw, Heart, Users, Gift, GraduationCap } from "lucide-react";
import ChartFilterBar, { ChartViewMode } from "./ChartFilterBar";
import type { Language } from "@/lib/translations";
import {
    getKpiTrendData, getKpiMatrixData, getAvailableFilters, getCategoryOverview,
    type TrendPoint, type MatrixPoint, type AvailableFilters,
} from "@/lib/data-service";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler, RadialLinearScale);

const COLORS = [
    { border: "rgb(16,185,129)", bg: "rgba(16,185,129,0.15)" },
    { border: "rgb(59,130,246)", bg: "rgba(59,130,246,0.15)" },
    { border: "rgb(168,85,247)", bg: "rgba(168,85,247,0.15)" },
    { border: "rgb(249,115,22)", bg: "rgba(249,115,22,0.15)" },
    { border: "rgb(239,68,68)", bg: "rgba(239,68,68,0.15)" },
    { border: "rgb(20,184,166)", bg: "rgba(20,184,166,0.15)" },
];

interface HospitalDashboardProps { lang: Language; }

export default function HospitalDashboard({ lang }: HospitalDashboardProps) {
    const th = lang === "th";
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<AvailableFilters>({ years: [], periods: [], dimensions: [] });
    const [selectedYear, setSelectedYear] = useState<number | "all">("all");
    const [selectedDimension, setSelectedDimension] = useState("");
    const [viewMode, setViewMode] = useState<ChartViewMode>("bar");

    const [projectTrend, setProjectTrend] = useState<Record<string, TrendPoint[]>>({});
    const [satisfactionTrend, setSatisfactionTrend] = useState<Record<string, TrendPoint[]>>({});
    const [patientTrend, setPatientTrend] = useState<Record<string, TrendPoint[]>>({});
    const [donationTrend, setDonationTrend] = useState<Record<string, TrendPoint[]>>({});
    const [applicantMatrix, setApplicantMatrix] = useState<MatrixPoint[]>([]);
    const [graduateMatrix, setGraduateMatrix] = useState<MatrixPoint[]>([]);
    const [categoryData, setCategoryData] = useState<any[]>([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const avail = await getAvailableFilters("7.2");
            setFilters(avail);
            const dimFilter = selectedDimension ? { dimension: selectedDimension } : undefined;
            const yearNum = selectedYear === "all" ? undefined : selectedYear;

            const [projects, satisfaction, patients, donation, applicants, graduates, catOverview] = await Promise.all([
                getKpiTrendData(["7.2.1", "7.2.2"], dimFilter),
                getKpiTrendData(["7.2.6", "7.2.9", "7.2.10"], dimFilter),
                getKpiTrendData("7.2.7", dimFilter),
                getKpiTrendData("7.2.8", dimFilter),
                getKpiMatrixData("7.2.5", yearNum),
                getKpiMatrixData("7.2.4", yearNum),
                getCategoryOverview("7.2", yearNum || 2568),
            ]);

            setProjectTrend(projects);
            setSatisfactionTrend(satisfaction);
            setPatientTrend(patients);
            setDonationTrend(donation);
            setApplicantMatrix(applicants);
            setGraduateMatrix(graduates);
            setCategoryData(catOverview);
        } catch (err) { console.error("HospitalDashboard error:", err); }
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

    // Summary cards
    const satData = satisfactionTrend["7.2.10"] || [];
    const latestSat = satData.length > 0 ? satData[satData.length - 1] : null;
    const donData = donationTrend["7.2.8"] || [];
    const latestDon = donData.length > 0 ? donData[donData.length - 1] : null;

    const cards = [
        { label: th ? "ความพึงพอใจ" : "Satisfaction", value: latestSat?.value, unit: th ? "คะแนน" : "pts", icon: Heart, color: "from-emerald-500 to-emerald-600" },
        { label: th ? "เงินบริจาค" : "Donations", value: latestDon?.value ? latestDon.value.toLocaleString() : null, unit: "฿", icon: Gift, color: "from-orange-500 to-orange-600" },
        { label: th ? "ผู้สมัครเรียน" : "Applicants", value: applicantMatrix.reduce((s, m) => s + m.value, 0) || null, unit: th ? "คน" : "ppl", icon: GraduationCap, color: "from-blue-500 to-blue-600" },
        { label: th ? "บัณฑิตสำเร็จ" : "Graduates", value: graduateMatrix.reduce((s, m) => s + m.value, 0) || null, unit: th ? "คน" : "ppl", icon: Users, color: "from-purple-500 to-purple-600" },
    ];

    if (loading) return <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-emerald-400 mb-3" size={32} /><p className="text-sm text-slate-400">{th ? "กำลังโหลด..." : "Loading..."}</p></div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <ChartFilterBar years={filters.years} selectedYear={selectedYear} onYearChange={setSelectedYear}
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
                        <p className="text-2xl font-black text-slate-800">{card.value ? `${card.value} ${card.unit}` : "—"}</p>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Satisfaction Trend (Radar) */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
                    <div className="h-[320px]">
                        {Object.keys(satisfactionTrend).length > 0 ? (
                            viewMode === "line" ? (
                                <Line options={chartOpts(th ? "ความพึงพอใจ 3 ด้าน" : "3-Area Satisfaction")} data={buildTrend(satisfactionTrend, {
                                    "7.2.6": th ? "ผู้เรียนบัณฑิต" : "Student Satisfaction", "7.2.9": th ? "สัมมนาวิชาการ" : "Seminar", "7.2.10": th ? "บริการรวม" : "Overall Service",
                                })} />
                            ) : (
                                <Bar options={chartOpts(th ? "ความพึงพอใจ 3 ด้าน" : "3-Area Satisfaction")} data={buildTrend(satisfactionTrend, {
                                    "7.2.6": th ? "ผู้เรียนบัณฑิต" : "Student", "7.2.9": th ? "สัมมนา" : "Seminar", "7.2.10": th ? "บริการรวม" : "Overall",
                                })} />
                            )
                        ) : <div className="flex flex-col items-center justify-center h-full text-slate-400"><p className="font-bold text-sm mb-1">{th ? "ความพึงพอใจ 3 ด้าน (7.2.6/7.2.9/7.2.10)" : "3-Area Satisfaction"}</p><p className="text-xs">{th ? "ยังไม่มีข้อมูล — กรุณากรอกข้อมูลในแบบฟอร์ม" : "No data — please submit via input form"}</p></div>}
                    </div>
                </div>

                {/* Projects */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
                    <div className="h-[320px]">
                        <Bar options={chartOpts(th ? "โครงการสำคัญ & ทุนอุดหนุน" : "Major Projects & Grants")} data={buildTrend(projectTrend, {
                            "7.2.1": th ? "โครงการสำคัญ" : "Projects", "7.2.2": th ? "ทุนอุดหนุนระดับประเทศ" : "National Grants",
                        })} />
                    </div>
                </div>

                {/* Applicants */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
                    <div className="h-[320px]">
                        {applicantMatrix.length > 0 ? (
                            <Bar options={{ ...chartOpts(th ? "ผู้สมัครเรียน แยกหลักสูตร (7.2.5)" : "Applicants by Program (7.2.5)"), indexAxis: "y" as const }} data={{
                                labels: applicantMatrix.map(m => m.dimension_value.length > 30 ? m.dimension_value.slice(0, 30) + "…" : m.dimension_value),
                                datasets: [{ label: th ? "จำนวน" : "Count", data: applicantMatrix.map(m => m.value), backgroundColor: COLORS.map(c => c.bg), borderColor: COLORS.map(c => c.border), borderWidth: 1 }],
                            }} />
                        ) : <div className="flex flex-col items-center justify-center h-full text-slate-400"><p className="font-bold text-sm mb-1">{th ? "ผู้สมัครเรียน แยกหลักสูตร (7.2.5)" : "Applicants by Program (7.2.5)"}</p><p className="text-xs">{th ? "ยังไม่มีข้อมูล — กรุณากรอกข้อมูลในแบบฟอร์ม" : "No data — please submit via input form"}</p></div>}
                    </div>
                </div>

                {/* Donations */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
                    <div className="h-[320px]">
                        <Line options={chartOpts(th ? "เงินบริจาคช่วยเหลือสัตว์ป่วยอนาถา (7.2.8)" : "Animal Charity Donations (7.2.8)")} data={buildTrend(donationTrend, { "7.2.8": th ? "บาท" : "THB" })} />
                    </div>
                </div>

                {/* Graduates */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm lg:col-span-2">
                    <div className="h-[280px]">
                        {graduateMatrix.length > 0 ? (
                            <Bar options={chartOpts(th ? "นิสิตสำเร็จ แยกระดับ (7.2.4)" : "Graduates by Level (7.2.4)")} data={{
                                labels: graduateMatrix.map(m => m.dimension_value),
                                datasets: [{ label: th ? "จำนวน" : "Count", data: graduateMatrix.map(m => m.value), backgroundColor: COLORS.map(c => c.bg), borderColor: COLORS.map(c => c.border), borderWidth: 1 }],
                            }} />
                        ) : <div className="flex flex-col items-center justify-center h-full text-slate-400"><p className="font-bold text-sm mb-1">{th ? "นิสิตสำเร็จ แยกระดับ (7.2.4)" : "Graduates by Level (7.2.4)"}</p><p className="text-xs">{th ? "ยังไม่มีข้อมูล — กรุณากรอกข้อมูลในแบบฟอร์ม" : "No data — please submit via input form"}</p></div>}
                    </div>
                </div>
            </div>

            {/* KPI Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-8 py-5 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="text-emerald-600 bg-emerald-50 p-2 rounded-xl"><Stethoscope size={20} /></div>
                        <h3 className="text-lg font-bold text-slate-800">{th ? "ตัวชี้วัดโรงพยาบาล/ลูกค้าทั้งหมด" : "All Hospital/Customer KPIs"}</h3>
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
