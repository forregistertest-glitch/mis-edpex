"use client";

import { ArrowLeft, Send, Loader2 } from "lucide-react";

interface FormField {
    field_id: string;
    label_th: string;
    label_en: string;
    type: string;
    required: boolean;
    unit?: string;
}

interface FormDef {
    form_id: string;
    name_th: string;
    name_en: string;
    fields: FormField[];
}

interface PreviewModalProps {
    selectedForm: FormDef;
    formValues: Record<string, string>;
    selectedPeriod: string;
    setShowPreview: (show: boolean) => void;
    confirmSubmit: () => void;
    submitting: boolean;
    gradient: string;
    t: boolean;
}

export default function PreviewModal({ selectedForm, formValues, selectedPeriod, setShowPreview, confirmSubmit, submitting, gradient, t }: PreviewModalProps) {
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                <div className={`bg-gradient-to-r ${gradient} px-8 py-5 text-white`}>
                    <h3 className="text-xl font-bold">{t ? "ตรวจสอบข้อมูลก่อนบันทึก" : "Review Before Saving"}</h3>
                    <p className="text-white/70 text-sm mt-1">{t ? selectedForm.name_th : selectedForm.name_en} · {t ? "งวด:" : "Period:"} {selectedPeriod}</p>
                </div>
                <div className="p-8 space-y-4">
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                        <span className="text-sm text-slate-500 font-medium">{t ? "งวดข้อมูล" : "Data Period"}</span>
                        <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{selectedPeriod}</span>
                    </div>
                    {selectedForm.fields.map((field) => {
                        const val = formValues[field.field_id];
                        if (!val) return null;
                        return (
                            <div key={field.field_id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                                <span className="text-sm text-slate-500 font-medium">{t ? field.label_th : field.label_en}</span>
                                <span className="text-sm font-bold text-slate-800">
                                    {val} {field.unit && <span className="text-slate-400 font-normal">{field.unit}</span>}
                                </span>
                            </div>
                        );
                    })}
                </div>
                <div className="px-8 py-5 bg-slate-50 border-t border-slate-200 flex items-center gap-3 justify-end">
                    <button onClick={() => setShowPreview(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">
                        <ArrowLeft size={14} className="inline mr-1" />{t ? "กลับแก้ไข" : "Go Back"}
                    </button>
                    <button onClick={confirmSubmit} disabled={submitting} className="px-6 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 flex items-center gap-2 disabled:opacity-50">
                        {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                        {submitting ? (t ? "กำลังบันทึก..." : "Saving...") : (t ? "ยืนยันบันทึก" : "Confirm & Save")}
                    </button>
                </div>
            </div>
        </div>
    );
}
