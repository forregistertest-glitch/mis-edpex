"use client";

import {
    GraduationCap,
    ChevronRight,
    ArrowLeft,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Clock,
} from "lucide-react";
import type { KpiEntry, KpiMaster } from "@/lib/data-service";

// ─── Types ─────────────────────────────────────────────────────
interface FormField {
    field_id: string;
    label_th: string;
    label_en: string;
    type: string;
    required: boolean;
    options?: (string | number)[];
    min?: number;
    max?: number;
    unit?: string;
    target_kpi?: string;
}

interface FormDef {
    form_id: string;
    name_th: string;
    name_en: string;
    department_id: string;
    frequency: string;
    kpi_ids: string[];
    fields: FormField[];
}

interface FormMeta {
    icon: typeof GraduationCap;
    color: string;
    bg: string;
    gradient: string;
}

const statusBadge: Record<string, { label_th: string; label_en: string; cls: string; icon: typeof CheckCircle2 }> = {
    approved: { label_th: "อนุมัติแล้ว", label_en: "Approved", cls: "bg-green-100 text-green-700", icon: CheckCircle2 },
    pending: { label_th: "รอตรวจสอบ", label_en: "Pending", cls: "bg-yellow-100 text-yellow-700", icon: Clock },
    pending_review: { label_th: "รอตรวจสอบ", label_en: "Pending", cls: "bg-yellow-100 text-yellow-700", icon: Clock },
    rejected: { label_th: "ปฏิเสธ", label_en: "Rejected", cls: "bg-red-100 text-red-700", icon: AlertCircle },
};

interface FormSelectorProps {
    forms: FormDef[];
    formMeta: Record<string, FormMeta>;
    selectForm: (form: FormDef) => void;
    recentLogs: KpiEntry[];
    kpiMasters: KpiMaster[];
    loadingLogs: boolean;
    totalCount: number;
    page: number;
    setPage: (fn: (p: number) => number) => void;
    filters: any;
    tempFilters: any;
    setTempFilters: (filters: any) => void;
    setFilters: (filters: any) => void;
    t: boolean;
}

export default function FormSelector({
    forms, formMeta, selectForm, recentLogs, kpiMasters, loadingLogs,
    totalCount, page, setPage, filters, tempFilters, setTempFilters, setFilters, t,
}: FormSelectorProps) {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-semibold mb-3 backdrop-blur-sm">
                        {t ? "ระบบกรอกข้อมูล → Firestore" : "DATA INPUT → FIRESTORE"}
                    </span>
                    <h2 className="text-2xl lg:text-3xl font-bold mb-2">{t ? "กรอกข้อมูล KPI" : "KPI Data Entry"}</h2>
                    <p className="text-white/70 max-w-xl text-sm">
                        {t
                            ? "เลือกฟอร์ม → กรอกข้อมูล → เลือกงวด (ปี/ไตรมาส/เดือน) → ข้อมูลบันทึกลง Firestore ทันที"
                            : "Select form → fill data → choose period (annual/quarterly/monthly) → data saves directly to Firestore"}
                    </p>
                </div>
                <div className="absolute right-0 top-0 w-64 h-64 bg-blue-400/20 rounded-full -mr-16 -mt-16 blur-3xl" />
            </div>

            {/* Form Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {forms.map((form) => {
                    const meta = formMeta[form.form_id] || formMeta.form_academic_yearly;
                    const IconComp = meta.icon;
                    return (
                        <button key={form.form_id} onClick={() => selectForm(form)} className="group bg-white rounded-2xl border border-slate-200/80 p-6 text-left hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                            <div className={`${meta.bg} ${meta.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                <IconComp size={22} />
                            </div>
                            <div className="space-y-0.5 mb-2">
                                <h3 className="font-bold text-slate-800 text-sm leading-snug">{form.name_th.split(" / ")[0]}</h3>
                                <p className="text-[11px] font-medium text-slate-500 leading-tight italic">{form.name_th.split(" / ")[1] || form.name_en}</p>
                            </div>
                            <p className="text-xs text-slate-400 mb-3">{form.kpi_ids.length} KPIs · {form.fields.length} {t ? "ช่อง" : "fields"}</p>
                            <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                {t ? "เปิดฟอร์ม" : "Open Form"} <ChevronRight size={14} />
                            </div>
                            <div className={`absolute inset-0 bg-gradient-to-br ${meta.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity rounded-2xl`} />
                        </button>
                    );
                })}
            </div>

            {/* Recent Submissions from Firestore (Audit Trail) */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
                <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <h3 className="font-bold text-slate-800">{t ? "ข้อมูลล่าสุดจาก Firestore" : "Recent Entries from Firestore"}</h3>
                        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                            {loadingLogs ? "..." : `${totalCount} ${t ? "รายการ" : "entries"}`}
                        </span>
                    </div>

                    {/* Top Pagination & Counter */}
                    {!loadingLogs && (
                        <div className="flex items-center gap-4">
                            <div className="hidden lg:block text-[11px] font-medium text-slate-400">
                                {t ? `แสดง ${recentLogs.length} จาก ${totalCount}` : `Showing ${recentLogs.length} of ${totalCount}`}
                            </div>
                            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    className="p-1 px-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 disabled:opacity-30 transition-all flex items-center gap-1"
                                >
                                    <ArrowLeft size={12} />
                                    <span className="text-[10px] font-bold uppercase hidden sm:inline">{t ? "ก่อนหน้า" : "Prev"}</span>
                                </button>

                                <div className="flex items-center gap-1 mx-1">
                                    {Array.from({ length: Math.min(5, Math.ceil(totalCount / 20)) }, (_, i) => {
                                        const totalPages = Math.ceil(totalCount / 20);
                                        let pageNum = i + 1;
                                        if (totalPages > 5 && page > 3) {
                                            pageNum = page - 3 + i;
                                            if (pageNum + (4 - i) > totalPages) pageNum = totalPages - 4 + i;
                                        }
                                        if (pageNum > totalPages) return null;
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setPage(() => pageNum)}
                                                className={`w-7 h-7 flex items-center justify-center rounded-lg text-[11px] font-black transition-all ${page === pageNum ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    disabled={page >= Math.ceil(totalCount / 20)}
                                    onClick={() => setPage(p => p + 1)}
                                    className="p-1 px-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 disabled:opacity-30 transition-all flex items-center gap-1"
                                >
                                    <span className="text-[10px] font-bold uppercase hidden sm:inline">{t ? "ถัดไป" : "Next"}</span>
                                    <ChevronRight size={12} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Filter Controls */}
                <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-col lg:flex-row items-end gap-4 overflow-visible">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 flex-1 w-full">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">{t ? "หมวดหมู่" : "Category"}</label>
                            <select
                                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-blue-500/20"
                                value={tempFilters.kpi_id}
                                onChange={(e) => setTempFilters({ ...tempFilters, kpi_id: e.target.value })}
                            >
                                <option value="">{t ? "ทั้งหมด" : "All"}</option>
                                {forms.map(f => (
                                    <option key={f.form_id} value={f.kpi_ids[0]}>{t ? f.name_th : f.name_en}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">{t ? "ปีงบประมาณ" : "Fiscal Year"}</label>
                            <select
                                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-blue-500/20"
                                value={tempFilters.year}
                                onChange={(e) => setTempFilters({ ...tempFilters, year: Number(e.target.value) })}
                            >
                                <option value={0}>{t ? "ทั้งหมด" : "All Years"}</option>
                                {[2568, 2567, 2566, 2565, 2564].map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">{t ? "งวดข้อมูล" : "Period"}</label>
                            <select
                                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-blue-500/20"
                                value={tempFilters.period}
                                onChange={(e) => setTempFilters({ ...tempFilters, period: e.target.value })}
                            >
                                <option value="all">{t ? "ทั้งหมด" : "All"}</option>
                                <option value="annual">{t ? "รายปี" : "Annual"}</option>
                                {Array.from({ length: 4 }, (_, i) => `Q${i + 1}`).map(q => <option key={q} value={q}>{q}</option>)}
                                {Array.from({ length: 12 }, (_, i) => `M${String(i + 1).padStart(2, '0')}`).map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">{t ? "ผู้กรอก" : "User"}</label>
                            <select
                                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-blue-500/20"
                                value={tempFilters.submitted_by}
                                onChange={(e) => setTempFilters({ ...tempFilters, submitted_by: e.target.value })}
                            >
                                <option value="all">{t ? "ทั้งหมด" : "All"}</option>
                                <option value="user">User</option>
                                <option value="system_seed">System Seed</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">{t ? "สถานะ" : "Status"}</label>
                            <select
                                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-blue-500/20"
                                value={tempFilters.status}
                                onChange={(e) => setTempFilters({ ...tempFilters, status: e.target.value })}
                            >
                                <option value="all">{t ? "ทั้งหมด" : "All"}</option>
                                {Object.entries(statusBadge).map(([key, data]) => (
                                    <option key={key} value={key}>{t ? data.label_th : data.label_en}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Filter Actions */}
                    <div className="flex items-center gap-2 w-full lg:w-auto mt-2 lg:mt-0">
                        <button
                            onClick={() => {
                                const reset = { kpi_id: "", year: 2568, status: "all", period: "all", submitted_by: "all" };
                                setTempFilters(reset);
                                setFilters(reset);
                                setPage(() => 1);
                            }}
                            className="flex-1 lg:flex-none px-4 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-300 transition-colors"
                        >
                            {t ? "ล้าง" : "Clear"}
                        </button>
                        <button
                            onClick={() => { setFilters(tempFilters); setPage(() => 1); }}
                            className="flex-1 lg:flex-none px-5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5"
                            disabled={loadingLogs}
                        >
                            {loadingLogs ? <Loader2 size={12} className="animate-spin" /> : null}
                            {t ? "ค้นหา" : "Refresh"}
                        </button>
                    </div>
                </div>

                {/* Audit Table Area */}
                <div className="relative flex-1">
                    {loadingLogs && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center transition-all">
                            <div className="bg-white px-6 py-4 rounded-2xl shadow-xl border border-slate-100 flex flex-col items-center gap-3">
                                <Loader2 size={24} className="animate-spin text-blue-600" />
                                <p className="text-xs font-bold text-slate-500">{t ? "กำลังดึงข้อมูล..." : "Refreshing Table..."}</p>
                            </div>
                        </div>
                    )}

                    {!loadingLogs && recentLogs.length === 0 ? (
                        <div className="p-20 text-center text-slate-400">
                            <AlertCircle size={32} className="mx-auto mb-3 opacity-20" />
                            <p className="text-sm font-medium">{t ? "ไม่พบข้อมูลตามเงื่อนไข" : "No results found for these filters"}</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-slate-50 text-left border-b border-slate-100">
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">KPI</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t ? "ชื่อตัวชี้วัด" : "Indicator Name"}</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t ? "ปี" : "Year"}</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t ? "งวด" : "Period"}</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t ? "ค่า" : "Value"}</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t ? "สถานะ" : "Status"}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {recentLogs.map((log, i) => {
                                        const badge = statusBadge[log.status] || statusBadge.pending;
                                        const BadgeIcon = badge.icon;
                                        const master = kpiMasters.find((m) => m.kpi_id === log.kpi_id);
                                        return (
                                            <tr key={log.id || i} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4 font-mono text-xs text-blue-600 font-bold">{log.kpi_id}</td>
                                                <td className="px-6 py-4 text-slate-700 text-xs max-w-[200px] truncate" title={master ? (t ? master.name_th : master.name_en) : ""}>{master ? (t ? master.name_th : master.name_en) : "—"}</td>
                                                <td className="px-6 py-4 text-slate-600 text-xs">{log.fiscal_year}</td>
                                                <td className="px-6 py-4"><span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold uppercase">{log.period}</span></td>
                                                <td className="px-6 py-4 font-bold text-slate-800 text-xs">{log.value !== null ? log.value.toLocaleString() : "—"} <span className="text-slate-400 font-normal text-[10px]">{log.unit}</span></td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${badge.cls}`}>
                                                        <BadgeIcon size={10} />{t ? badge.label_th : badge.label_en}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
