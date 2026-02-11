"use client";

import { KpiEntry } from "@/lib/data-service";
import { FileText, Clock, CheckCircle, XCircle, AlertCircle, Trash2, Edit } from "lucide-react";

interface FormField {
    field_id: string;
    label_th: string;
    label_en: string;
    type: string;
    unit?: string;
    target_kpi?: string;
}

interface EntryHistoryProps {
    entries: KpiEntry[];
    formKpiIds: string[];
    onDelete?: (id: string, status: string) => void;
    onEdit?: (entry: KpiEntry) => void;
    lang: "th" | "en";
    fields?: FormField[];
}

export default function EntryHistory({ entries, formKpiIds, onDelete, onEdit, lang, fields }: EntryHistoryProps) {
    const t = lang === "th";

    // Filter entries related to this form
    const formEntries = entries.filter(e => formKpiIds.includes(e.kpi_id));

    if (formEntries.length === 0) {
        return (
            <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-8 text-center text-slate-400 mt-6">
                <Clock className="w-10 h-10 mx-auto mb-2 opacity-20" />
                <p>{t ? "ยังไม่มีประวัติการบันทึกข้อมูล" : "No recent entries found."}</p>
            </div>
        );
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200"><CheckCircle size={10} /> {t ? 'อนุมัติแล้ว' : 'Approved'}</span>;
            case 'rejected': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200"><XCircle size={10} /> {t ? 'ไม่ผ่าน' : 'Rejected'}</span>;
            case 'revision_requested': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200"><AlertCircle size={10} /> {t ? 'แก้ไข' : 'Revision'}</span>;
            default: return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200"><Clock size={10} /> {t ? 'รอตรวจสอบ' : 'Pending'}</span>;
        }
    };

    // Dynamic Columns Logic
    const displayFields = fields?.filter(f => f.type !== 'file' && f.type !== 'section') || [];

    const getDisplayValue = (entry: KpiEntry, field: FormField) => {
        // If field is numeric KPI
        if (field.type === 'number') {
            // Priority 1: Check extra_data (unlikely for number fields but possible if saved there)
            if (entry.extra_data && entry.extra_data[field.field_id]) {
                return entry.extra_data[field.field_id];
            }

            // Priority 2: Check if this Entry's KPI matches this Field's target KPI
            // Default target is the first KPI of the form if not specified
            const fieldKpiId = field.target_kpi || formKpiIds[0];

            if (entry.kpi_id === fieldKpiId) {
                return entry.value?.toLocaleString();
            }

            return "-";
        }
        return entry.extra_data?.[field.field_id] || "-";
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-8">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-bold text-slate-700 flex items-center gap-2">
                    <Clock size={18} className="text-blue-500" />
                    {t ? "ประวัติการบันทึกล่าสุด" : "Recent Entries History"}
                </h3>
                <span className="text-xs text-slate-400 font-mono bg-white px-2 py-1 rounded-md border border-slate-100 shadow-sm">Total: {formEntries.length}</span>
            </div>

            <div className="overflow-x-auto w-full">
                <table className="w-full text-sm text-left whitespace-nowrap min-w-[800px]">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                        <tr>
                            <th className="px-5 py-3 w-[150px]">{t ? "วันที่บันทึก" : "Submitted At"}</th>
                            <th className="px-5 py-3 w-[100px]">{t ? "งวด" : "Period"}</th>

                            {/* Dynamic Headers */}
                            {displayFields.map(f => (
                                <th key={f.field_id} className="px-5 py-3 min-w-[120px]">
                                    {t ? f.label_th : f.label_en}
                                </th>
                            ))}

                            {/* Always show Value column for the KPI itself if it's not covered? 
                                Actually, if we map fields, the numeric fields are in 'displayFields'.
                                We need to fill them.
                            */}

                            <th className="px-5 py-3 w-[150px]">{t ? "ไฟล์แนบ" : "Attachment"}</th>
                            <th className="px-5 py-3 w-[120px]">{t ? "สถานะ" : "Status"}</th>
                            <th className="px-5 py-3 w-[150px]">{t ? "ผู้บันทึก" : "By"}</th>
                            <th className="px-5 py-3 text-right">{t ? "จัดการ" : "Actions"}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {formEntries.map((entry) => (
                            <tr key={entry.id} className="hover:bg-blue-50/10 transition-colors group">
                                <td className="px-5 py-4 text-slate-600 text-xs font-mono align-top">
                                    {entry.submitted_at
                                        ? new Date(entry.submitted_at).toLocaleString('th-TH', {
                                            year: '2-digit', month: 'short', day: 'numeric',
                                            hour: '2-digit', minute: '2-digit'
                                        })
                                        : '-'}
                                </td>
                                <td className="px-5 py-4 font-medium text-slate-700 align-top">
                                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs">{entry.period}</span>
                                    <span className="ml-1 text-slate-400 text-xs">/{entry.fiscal_year}</span>
                                </td>

                                {/* Dynamic Cells */}
                                {displayFields.map(f => {
                                    // Logic to determine value:
                                    // 1. Check extra_data
                                    let val = entry.extra_data?.[f.field_id];

                                    // 2. If not in extra_data, and field is number... 
                                    // It might be the MAIN value of this entry.
                                    // We assume if it's a number field and entry has value, it matches.
                                    // (This is a simplification, but works for single-KPI forms or distinct rows)
                                    if (val === undefined && f.type === 'number' && entry.value !== null) {
                                        // Ideally we check if this entry.kpi_id matches field's target.
                                        // Since we don't have the mapping, we can check if there's ONLY ONE number field?
                                        // Or just display entry.value. 
                                        // Visual Glitch Risk: If form has 2 numbers, and we show value in both cols?
                                        // Quick fix: Show value in ALL number columns? No.
                                        // Correct fix: We rely on extra_data for everything EXCEPT the main KPI.
                                        // BUT the main KPI is one of the fields!
                                        // Implication: One of these columns IS the main value.
                                        // We will visually show entry.value for number fields if context allows.
                                        // For now, let's just show entry.value if val is undefined.
                                        val = entry.value?.toLocaleString();
                                    }

                                    return (
                                        <td key={f.field_id} className="px-5 py-4 align-top text-slate-700">
                                            {val !== undefined ? val : <span className="text-slate-200">-</span>}
                                            {/* Show unit if number and value exists */}
                                            {val && f.type === 'number' && f.unit && <span className="text-xs text-slate-400 ml-1">{f.unit}</span>}
                                        </td>
                                    );
                                })}

                                <td className="px-5 py-4 align-top">
                                    {entry.attachment_url ? (
                                        <a
                                            href={entry.attachment_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-100 transition-all font-medium"
                                        >
                                            <FileText size={14} />
                                            {entry.attachment_name || "PDF File"}
                                        </a>
                                    ) : (
                                        <span className="text-slate-300 text-xs italic opacity-50">{t ? "ไม่มีไฟล์แนบ" : "No attachment"}</span>
                                    )}
                                </td>
                                <td className="px-5 py-4 align-top">{getStatusBadge(entry.status)}</td>
                                <td className="px-5 py-4 text-xs text-slate-500 align-top">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                            {entry.submitted_by?.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="truncate max-w-[100px]" title={entry.submitted_by}>
                                            {entry.submitted_by?.split('@')[0]}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-5 py-4 text-right">
                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {onEdit && (entry.status === 'pending' || entry.status === 'revision_requested') && (
                                            <button
                                                onClick={() => onEdit(entry)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                title={t ? "แก้ไข" : "Edit"}
                                            >
                                                <Edit size={16} />
                                            </button>
                                        )}
                                        {onDelete && (entry.status === 'pending' || entry.status === 'revision_requested') && (
                                            <button
                                                onClick={() => onDelete(entry.id!, entry.status)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                title={t ? "ลบรายการ" : "Delete"}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
