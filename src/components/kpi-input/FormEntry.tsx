import EntryHistory from "./EntryHistory";
import { KpiEntry } from "@/lib/data-service";
import { ArrowLeft, CalendarDays, Send, FileText, AlertCircle } from "lucide-react";
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
    recentLogs: KpiEntry[];
    onDelete: (id: string, status: string) => void;
    onEdit: (entry: KpiEntry) => void;
    t: boolean;
}

export default function FormEntry({ selectedForm, selectedPeriod, setSelectedPeriod, renderField, goBack, handleSubmit, meta, recentLogs, onDelete, onEdit, t }: FormEntryProps) {
    const IconComp = meta.icon;

    // Filter fields to separate main fields from notes/file
    // User Request: Only 'file' and 'notes' go to footer (Section 3). 
    // Other textareas (description, funding_sources etc.) stay in mainFields (Section 2).
    const isFooterField = (f: FormField) => f.type === "file" || f.field_id === "notes";
    const mainFields = selectedForm.fields.filter(f => !isFooterField(f));
    const footerFields = selectedForm.fields.filter(f => isFooterField(f));

    // Sort footer fields so file comes last ideally, or based on original order. 
    // Usually file input is last.
    footerFields.sort((a, b) => {
        if (a.type === 'file') return 1;
        if (b.type === 'file') return -1;
        return 0;
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
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
                        </div>
                    </div>
                </div>
            </div>

            {/* Editing Conditions & Meaning */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                    <h4 className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-2">
                        <AlertCircle size={16} />
                        {t ? "เงื่อนไขการแก้ไขข้อมูล" : "Editing Conditions"}
                    </h4>
                    <ul className="text-xs text-blue-700/80 space-y-1 list-disc pl-4">
                        <li>
                            {t ? "สถานะ Pending (รอตรวจสอบ): ผู้กรอกสามารถ ลบ หรือ แก้ไข ได้" : "Pending: Can edit or delete by submitter."}
                        </li>
                        <li>
                            {t ? "สถานะ Approved (อนุมัติแล้ว): ล็อค ห้ามแก้ไข (ต้องแจ้ง Admin/Reviewer ยกเลิกก่อน)" : "Approved: Locked. Cannot edit."}
                        </li>
                        <li>
                            {t ? "สถานะ Rejected (ปฏิเสธ): ให้สิทธิ์แก้ไขเพื่อส่งใหม่ได้" : "Rejected: Unlocked for revision."}
                        </li>
                        <li>
                            {t ? "ไฟล์แนบ: รองรับ PDF ขนาดไม่เกิน 10MB" : "Attachment: PDF max 10MB."}
                        </li>
                    </ul>
                </div>
                {selectedForm.meaning_th && (
                    <div className="flex-1 border-t md:border-t-0 md:border-l border-blue-200 pt-4 md:pt-0 md:pl-6">
                        <h4 className="text-sm font-bold text-slate-700 mb-2">{t ? "คำอธิบายตัวชี้วัด" : "KPI Description"}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                            {t ? selectedForm.meaning_th : selectedForm.meaning_en}
                        </p>
                    </div>
                )}
            </div>

            {/* Form Area */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                {/* Period Selector */}
                <div className="mb-8 border-b border-slate-100 pb-8">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
                        <CalendarDays size={18} className="text-blue-600" />
                        {t ? "1. เลือกงวดข้อมูล (Period)" : "1. Select Data Period"}
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {["annual", "Q1", "Q2", "Q3", "Q4", "M01", "M02", "M03", "M04", "M05", "M06", "M07", "M08", "M09", "M10", "M11", "M12"].map((p) => (
                            <button
                                key={p}
                                onClick={() => setSelectedPeriod(p)}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${selectedPeriod === p
                                    ? "bg-blue-600 text-white shadow-md ring-2 ring-blue-200"
                                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                                    }`}
                            >
                                {p === "annual" ? (t ? "รายปี" : "Annual") : p}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Fields */}
                <div className="mb-8">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-4">
                        <Send size={18} className="text-blue-600" />
                        {t ? "2. กรอกข้อมูลตัวชี้วัด" : "2. Enter KPI Data"}
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                        {mainFields.map((field) => renderField(field))}
                    </div>
                </div>

                {/* Footer Fields (Notes & File) */}
                {footerFields.length > 0 && (
                    <div className="mb-8">
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-4">
                            <FileText size={18} className="text-blue-600" />
                            {t ? "3. ข้อมูลเพิ่มเติม & ไฟล์แนบ" : "3. Additional Info & Attachments"}
                        </label>
                        <div className="grid grid-cols-1 gap-6">
                            {footerFields.map((field) => renderField(field))}
                        </div>
                    </div>
                )}

                <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between">
                    <p className="text-xs text-slate-400">{t ? "* ฟิลด์จำเป็นต้องกรอก | ข้อมูลจะบันทึกลง Firestore" : "* Required fields | Data saves to Firestore"}</p>
                    <div className="flex items-center gap-3">
                        <button onClick={goBack} className="px-5 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">{t ? "ยกเลิก" : "Cancel"}</button>
                        <button onClick={handleSubmit} className="px-8 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 transform active:scale-95">
                            <Send size={16} />{t ? "ตรวจสอบ & บันทึก" : "Review & Save"}
                        </button>
                    </div>
                </div>
            </div>

            {/* History Table */}
            <EntryHistory
                entries={recentLogs}
                formKpiIds={selectedForm.kpi_ids}
                onDelete={onDelete}
                onEdit={onEdit}
                lang={t ? 'th' : 'en'}
                fields={selectedForm.fields}
            />
        </div>
    );
}
