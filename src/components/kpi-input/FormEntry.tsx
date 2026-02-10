"use client";

import { ArrowLeft, CalendarDays, Send } from "lucide-react";
import type { GraduationCap } from "lucide-react";

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
    meaning_th?: string;
    meaning_en?: string;
    kpi_ids: string[];
    fields: FormField[];
}

interface FormEntryProps {
    selectedForm: FormDef;
    selectedPeriod: string;
    setSelectedPeriod: (p: string) => void;
    renderField: (field: FormField) => React.ReactNode;
    goBack: () => void;
    handleSubmit: () => void;
    meta: { icon: typeof GraduationCap; gradient: string };
    t: boolean;
}

export default function FormEntry({ selectedForm, selectedPeriod, setSelectedPeriod, renderField, goBack, handleSubmit, meta, t }: FormEntryProps) {
    const IconComp = meta.icon;

    return (
        <div className="space-y-6">
            {/* Form Header */}
            <div className={`bg-gradient-to-r ${meta.gradient} rounded-2xl p-6 text-white shadow-lg relative overflow-hidden`}>
                <button onClick={goBack} className="flex items-center gap-1 text-white/70 hover:text-white text-sm mb-3 transition-colors">
                    <ArrowLeft size={16} /> {t ? "กลับเลือกฟอร์ม" : "Back to Form Selection"}
                </button>
                <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm"><IconComp size={28} /></div>
                    <div>
                        <h2 className="text-xl font-bold flex flex-wrap items-center gap-x-2">
                            <span>{selectedForm.name_th}</span>
                            <span className="text-white/60 font-medium">/ {selectedForm.name_en}</span>
                        </h2>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                            <p className="text-white/60 text-xs font-mono bg-white/10 px-2 py-0.5 rounded">KPIs: {selectedForm.kpi_ids.join(", ")}</p>
                            {selectedForm.meaning_th && (
                                <p className="text-white/80 text-xs italic opacity-90">
                                    <span className="font-bold underline mr-1">{t ? "ความหมาย:" : "Meaning:"}</span>
                                    {t ? selectedForm.meaning_th : selectedForm.meaning_en}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Period Selector */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                    <CalendarDays size={16} className="text-blue-600" />
                    {t ? "งวดข้อมูล (Period)" : "Data Period"}
                </label>
                <div className="flex flex-wrap gap-2">
                    {["annual", "Q1", "Q2", "Q3", "Q4", "M01", "M02", "M03", "M04", "M05", "M06", "M07", "M08", "M09", "M10", "M11", "M12"].map((p) => (
                        <button
                            key={p}
                            onClick={() => setSelectedPeriod(p)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${selectedPeriod === p
                                    ? "bg-blue-600 text-white shadow-md"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                        >
                            {p === "annual" ? (t ? "รายปี" : "Annual") : p}
                        </button>
                    ))}
                </div>
            </div>

            {/* Form Fields */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedForm.fields.map((field) => renderField(field))}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between">
                    <p className="text-xs text-slate-400">{t ? "* ฟิลด์จำเป็นต้องกรอก | ข้อมูลจะบันทึกลง Firestore" : "* Required fields | Data saves to Firestore"}</p>
                    <div className="flex items-center gap-3">
                        <button onClick={goBack} className="px-5 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">{t ? "ยกเลิก" : "Cancel"}</button>
                        <button onClick={handleSubmit} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2">
                            <Send size={14} />{t ? "ตรวจสอบ & บันทึก" : "Review & Save"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
