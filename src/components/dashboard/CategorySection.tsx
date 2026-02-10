"use client";

import {
    GraduationCap,
    Loader2,
    RefreshCw,
} from "lucide-react";
import AcademicTrendChart from "@/components/AcademicTrendChart";
import type { Language, TranslationKey } from "@/lib/translations";

interface CategorySectionProps {
    categoryId: string;
    title: string;
    icon: typeof GraduationCap;
    color: string;
    categoryData: any[];
    dataLoading: boolean;
    lang: Language;
    activeTab: string;
    fmtVal: (v: number | null, unit?: string, agg?: string) => string;
    handleViewDetails: (categoryId: string, title: string) => void;
    fetchDashboard: () => void;
    t: (key: TranslationKey) => string;
}

export default function CategorySection({
    categoryId,
    title,
    icon: IconComp,
    color,
    categoryData,
    dataLoading,
    lang,
    activeTab,
    fmtVal,
    handleViewDetails,
    fetchDashboard,
    t,
}: CategorySectionProps) {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Stats bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <h4 className="text-slate-400 text-xs font-bold uppercase">{lang === 'th' ? 'KPIs ในหมวด' : 'KPIs in Category'}</h4>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{categoryData.length}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <h4 className="text-slate-400 text-xs font-bold uppercase">{lang === 'th' ? 'มีข้อมูลแล้ว' : 'With Data'}</h4>
                    <p className="text-2xl font-bold text-green-600 mt-1">{categoryData.filter((d: any) => d.latestValue !== null).length}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <h4 className="text-slate-400 text-xs font-bold uppercase">{lang === 'th' ? 'ยังไม่มีข้อมูล' : 'No Data Yet'}</h4>
                    <p className="text-2xl font-bold text-amber-500 mt-1">{categoryData.filter((d: any) => d.latestValue === null).length}</p>
                </div>
            </div>

            {/* KPI Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className={`px-8 py-5 border-b border-slate-200 flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                        <div className={`${color} bg-opacity-10 p-2 rounded-xl`}><IconComp size={20} /></div>
                        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => handleViewDetails(categoryId, title)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-semibold transition-colors">
                            {t('viewDetails')}
                        </button>
                        <button onClick={fetchDashboard} className="p-2 text-slate-400 hover:text-blue-600 transition-colors" title="Refresh"><RefreshCw size={16} /></button>
                    </div>
                </div>

                {dataLoading ? (
                    <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-blue-400" size={24} /></div>
                ) : categoryData.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">
                        {lang === 'th' ? 'ยังไม่มีข้อมูล — กรุณารัน Seed ก่อน (/seed)' : 'No data — run Seed first (/seed)'}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 text-left">
                                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">KPI</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{lang === 'th' ? 'ชื่อตัวชี้วัด' : 'Indicator Name'}</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">{lang === 'th' ? 'ค่าล่าสุด (2568)' : 'Latest (2568)'}</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">{lang === 'th' ? 'เป้าหมาย' : 'Target'}</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{lang === 'th' ? 'สถานะ' : 'Status'}</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">{lang === 'th' ? 'จำนวน entries' : 'Entries'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {categoryData.map((kpi: any) => {
                                    const hasTarget = kpi.target_value !== null && kpi.target_value !== undefined;
                                    const met = hasTarget && kpi.latestValue !== null && kpi.latestValue >= kpi.target_value;
                                    const formulaHint = kpi.aggregation === 'sum'
                                        ? (lang === 'th' ? 'ผลรวมของรายการทั้งหมด' : 'Sum of all entries')
                                        : (lang === 'th' ? 'ค่าเฉลี่ยของรายการทั้งหมด' : 'Average of all entries');

                                    return (
                                        <tr key={kpi.kpi_id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4 font-mono text-xs text-blue-600 font-bold whitespace-nowrap">{kpi.kpi_id}</td>
                                            <td className="px-6 py-4 text-slate-700 text-sm max-w-[300px]">{lang === 'th' ? kpi.name_th : kpi.name_en}</td>
                                            <td
                                                className="px-6 py-4 text-right font-bold text-slate-800 cursor-help"
                                                title={`${lang === 'th' ? 'สูตรคำนวณ' : 'Formula'}: ${formulaHint}`}
                                            >
                                                {kpi.latestValue !== null ? fmtVal(kpi.latestValue, kpi.unit, kpi.aggregation) : <span className="text-slate-300">—</span>}
                                            </td>
                                            <td className="px-6 py-4 text-right text-slate-500">{hasTarget ? fmtVal(kpi.target_value, kpi.unit) : "—"}</td>
                                            <td className="px-6 py-4">
                                                {kpi.latestValue === null ? (
                                                    <span className="inline-flex px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-400">{lang === 'th' ? 'ไม่มีข้อมูล' : 'No data'}</span>
                                                ) : met ? (
                                                    <span className="inline-flex px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">✓ {lang === 'th' ? 'ถึงเป้า' : 'Met'}</span>
                                                ) : hasTarget ? (
                                                    <span className="inline-flex px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-700">→ {lang === 'th' ? 'ยังไม่ถึง' : 'Below'}</span>
                                                ) : (
                                                    <span className="inline-flex px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-600">{lang === 'th' ? 'ติดตาม' : 'Track'}</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center"><span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full font-semibold text-slate-600">{kpi.entryCount}</span></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {activeTab === 'Academic' && (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><GraduationCap className="text-blue-600" />{t('academicExcellenceTrends')} (2564-2568)</h3>
                    </div>
                    <div className="h-[350px]"><AcademicTrendChart /></div>
                </div>
            )}
        </div>
    );
}
