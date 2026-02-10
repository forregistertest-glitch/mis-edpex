"use client";

import { FileSpreadsheet, Download, FileCode } from "lucide-react";
import type { Language } from "@/lib/translations";

interface ReportsSectionProps {
    dashboardData: {
        totalKpis: number;
        totalEntries: number;
        kpisWithData: number;
    } | null;
    handleGlobalExport: () => void;
    handleJsonExport: () => void;
    lang: Language;
}

export default function ReportsSection({ dashboardData, handleGlobalExport, handleJsonExport, lang }: ReportsSectionProps) {
    const t = lang === 'th';

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-white p-10 rounded-3xl border border-slate-200/60 shadow-sm text-center max-w-3xl mx-auto">
                <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <FileSpreadsheet size={40} />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">
                    {t ? 'รายงานสรุปผลและข้อมูลดิบ' : 'Summary Reports & Raw Data'}
                </h3>
                <p className="text-slate-500 mb-8">
                    {t ?
                        'ส่งออกข้อมูลทั้งหมดจาก Firestore ออกเป็นไฟล์ Excel (3 sheets: KPI Master, All Entries, Summary by Year) หรือ JSON dump' :
                        'Export all data from Firestore into Excel (3 sheets: KPI Master, All Entries, Summary by Year) or JSON dump'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                        onClick={handleGlobalExport}
                        className="flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition-all hover:scale-105 active:scale-95"
                    >
                        <Download size={20} />
                        {t ? 'Excel 3 Sheets (.xlsx)' : 'Download Excel (.xlsx)'}
                    </button>
                    <button
                        onClick={handleJsonExport}
                        className="flex items-center justify-center gap-3 px-8 py-4 bg-slate-800 text-white rounded-2xl font-bold shadow-lg hover:bg-slate-900 transition-all hover:scale-105 active:scale-95"
                    >
                        <FileCode size={20} />
                        {t ? 'ข้อมูลดิบ JSON (Dev)' : 'Raw JSON Dump (Dev)'}
                    </button>
                </div>

                <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                    <div className="bg-blue-50 rounded-xl p-3">
                        <p className="text-xl font-bold text-blue-700">{dashboardData?.totalKpis || 0}</p>
                        <p className="text-xs text-blue-500">KPI Master</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-3">
                        <p className="text-xl font-bold text-green-700">{dashboardData?.totalEntries || 0}</p>
                        <p className="text-xs text-green-500">Entries</p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-3">
                        <p className="text-xl font-bold text-purple-700">{dashboardData?.kpisWithData || 0}</p>
                        <p className="text-xs text-purple-500">With Data</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
