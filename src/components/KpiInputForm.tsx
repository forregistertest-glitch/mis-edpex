"use client";

import { useState, useEffect } from "react";
import {
  GraduationCap,
  FlaskConical,
  Stethoscope,
  Users,
  Landmark,
  FileText,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronRight,
  Send,
  X,
  ArrowLeft,
  CalendarDays,
  Loader2,
} from "lucide-react";

import formsData from "../../db_design/input_forms.json";
import { addKpiEntry, getRecentEntries, getAllKpiMaster } from "@/lib/data-service";
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
  meaning_th?: string;
  meaning_en?: string;
  department_id: string;
  frequency: string;
  kpi_ids: string[];
  fields: FormField[];
}

// ─── Icon & Color Map ──────────────────────────────────────────
const formMeta: Record<string, { icon: typeof GraduationCap; color: string; bg: string; gradient: string }> = {
  form_academic_yearly: { icon: GraduationCap, color: "text-blue-600", bg: "bg-blue-50", gradient: "from-blue-500 to-blue-700" },
  form_grad_matrix:     { icon: BookOpen, color: "text-indigo-600", bg: "bg-indigo-50", gradient: "from-indigo-500 to-indigo-700" },
  form_research_funding:{ icon: FlaskConical, color: "text-violet-600", bg: "bg-violet-50", gradient: "from-violet-500 to-violet-700" },
  form_hospital_stats:  { icon: Stethoscope, color: "text-emerald-600", bg: "bg-emerald-50", gradient: "from-emerald-500 to-emerald-700" },
  form_hr_workforce:    { icon: Users, color: "text-amber-600", bg: "bg-amber-50", gradient: "from-amber-500 to-amber-700" },
  form_strategic_governance: { icon: Landmark, color: "text-rose-600", bg: "bg-rose-50", gradient: "from-rose-500 to-rose-700" },
  form_narrative_entry:  { icon: FileText, color: "text-cyan-600", bg: "bg-cyan-50", gradient: "from-cyan-500 to-cyan-700" },
};

const statusBadge: Record<string, { label_th: string; label_en: string; cls: string; icon: typeof CheckCircle2 }> = {
  approved:       { label_th: "อนุมัติแล้ว", label_en: "Approved", cls: "bg-green-100 text-green-700", icon: CheckCircle2 },
  pending:        { label_th: "รอตรวจสอบ", label_en: "Pending", cls: "bg-yellow-100 text-yellow-700", icon: Clock },
  pending_review: { label_th: "รอตรวจสอบ", label_en: "Pending", cls: "bg-yellow-100 text-yellow-700", icon: Clock },
  rejected:       { label_th: "ปฏิเสธ", label_en: "Rejected", cls: "bg-red-100 text-red-700", icon: AlertCircle },
};

// ─── Main Component ────────────────────────────────────────────
export default function KpiInputForm({ lang }: { lang: "th" | "en" }) {
  const forms = formsData as FormDef[];

  const [selectedForm, setSelectedForm] = useState<FormDef | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [selectedPeriod, setSelectedPeriod] = useState<string>("annual");
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Audit Trail State
  const [recentLogs, setRecentLogs] = useState<KpiEntry[]>([]);
  const [kpiMasters, setKpiMasters] = useState<KpiMaster[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [tempFilters, setTempFilters] = useState({
    kpi_id: "",
    year: 2568,
    status: "all",
    period: "all",
    submitted_by: "all"
  });
  const [filters, setFilters] = useState({
    kpi_id: "",
    year: 2568,
    status: "all",
    period: "all",
    submitted_by: "all"
  });

  const t = lang === "th";

  // Load data from Firestore
  useEffect(() => {
    const loadData = async () => {
      setLoadingLogs(true);
      try {
        const [filteredResults, masters] = await Promise.all([
          import("@/lib/data-service").then(m => m.getRecentEntriesFiltered({
            ...filters,
            year: filters.year === 0 ? undefined : filters.year
          }, page, 20)),
          getAllKpiMaster(),
        ]);
        setRecentLogs(filteredResults.entries);
        setTotalCount(filteredResults.total);
        setKpiMasters(masters);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoadingLogs(false);
      }
    };
    loadData();
  }, [submitted, filters, page]);

  const resetForm = () => {
    setFormValues({});
    setErrors({});
    setShowPreview(false);
    setSubmitted(false);
    setSelectedPeriod("annual");
  };

  const selectForm = (form: FormDef) => {
    setSelectedForm(form);
    resetForm();
  };

  const goBack = () => {
    setSelectedForm(null);
    resetForm();
  };

  // ── Validation ──
  const validate = (): boolean => {
    if (!selectedForm) return false;
    const newErrors: Record<string, boolean> = {};
    let valid = true;
    for (const field of selectedForm.fields) {
      if (field.required && (!formValues[field.field_id] || formValues[field.field_id].trim() === "")) {
        newErrors[field.field_id] = true;
        valid = false;
      }
      if (field.type === "number" && formValues[field.field_id]) {
        const num = parseFloat(formValues[field.field_id]);
        if (field.min !== undefined && num < field.min) { newErrors[field.field_id] = true; valid = false; }
        if (field.max !== undefined && num > field.max) { newErrors[field.field_id] = true; valid = false; }
      }
    }
    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = () => {
    if (validate()) setShowPreview(true);
  };

  // ── Submit to Firestore ──
  const confirmSubmit = async () => {
    if (!selectedForm) return;
    setSubmitting(true);

    try {
      // Create one kpi_entry per numeric field
      for (const field of selectedForm.fields) {
        if (field.type === "number" && formValues[field.field_id]) {
          // Use specific KPI ID for this field if provided, else fallback to primary form KPI
          const kpiId = field.target_kpi || selectedForm.kpi_ids[0];
          
          await addKpiEntry({
            kpi_id: kpiId,
            fiscal_year: parseInt(formValues["fiscal_year"] || "2568"),
            period: selectedPeriod,
            value: parseFloat(formValues[field.field_id]),
            target: field.max || null,
            dimension: null,
            dimension_value: null,
            unit: field.unit || "",
            notes: formValues["notes"] || "",
            submitted_by: "user",
            submitted_at: new Date().toISOString(),
            status: "pending",
          });
        }
      }

      setShowPreview(false);
      setSubmitted(true);
    } catch (error: any) {
      console.error("Submit error:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render Field ──
  const renderField = (field: FormField) => {
    const label = t ? field.label_th : field.label_en;
    const hasError = errors[field.field_id];
    const value = formValues[field.field_id] || "";

    const baseInputCls = `w-full rounded-xl border-2 px-4 py-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
      hasError ? "border-red-400 bg-red-50/50" : "border-slate-200 bg-white hover:border-blue-300 focus:border-blue-500 text-black font-normal"
    }`;

    return (
      <div key={field.field_id} className="space-y-1.5">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          {label}
          {field.required && <span className="text-red-400 text-xs">*</span>}
          {field.unit && (
            <span className="ml-auto text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {field.unit}
            </span>
          )}
        </label>

        {field.type === "select" ? (
          <select 
            className={`${baseInputCls} appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%23000000%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25em_1.25em] bg-[right_0.5rem_center] bg-no-repeat pr-10`} 
            value={value} 
            onChange={(e) => setFormValues({ ...formValues, [field.field_id]: e.target.value })}
          >
            <option value="" className="text-slate-400">{t ? "— เลือก —" : "— Select —"}</option>
            {field.options?.map((opt) => (
              <option key={String(opt)} value={String(opt)} className="text-black font-normal bg-white">{String(opt)}</option>
            ))}
          </select>
        ) : field.type === "textarea" ? (
          <textarea className={`${baseInputCls} min-h-[80px] resize-y`} value={value} onChange={(e) => setFormValues({ ...formValues, [field.field_id]: e.target.value })} placeholder={t ? "กรุณากรอกข้อมูล..." : "Enter data..."} />
        ) : field.type === "file" ? (
          <div className={`${baseInputCls} flex items-center justify-center py-6 cursor-pointer border-dashed`}>
            <span className="text-slate-400 text-sm">{t ? "คลิกเพื่อแนบไฟล์" : "Click to attach file"}</span>
          </div>
        ) : (
          <input type={field.type === "number" ? "number" : "text"} className={baseInputCls} value={value} min={field.min} max={field.max} onChange={(e) => setFormValues({ ...formValues, [field.field_id]: e.target.value })} placeholder={field.type === "number" ? `${field.min ?? 0}${field.max ? ` – ${field.max}` : ""}` : t ? "กรุณากรอก..." : "Enter..."} />
        )}
        {hasError && (
          <p className="text-red-500 text-xs flex items-center gap-1">
            <AlertCircle size={12} />
            {t ? "กรุณากรอกข้อมูลให้ถูกต้อง" : "This field is required or invalid"}
          </p>
        )}
      </div>
    );
  };

  // ════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════

  // ── Success Screen ──
  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
          <CheckCircle2 size={40} className="text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800">{t ? "บันทึกลง Firestore สำเร็จ!" : "Saved to Firestore!"}</h3>
        <p className="text-slate-500 text-center max-w-md">
          {t ? "ข้อมูลถูกบันทึกลง Firestore เรียบร้อย สถานะ: Pending (รอตรวจสอบ)" : "Data saved to Firestore. Status: Pending review."}
        </p>
        <button onClick={goBack} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
          {t ? "กลับเลือกฟอร์ม" : "Back to Form Selection"}
        </button>
      </div>
    );
  }

  // ── Preview Modal ──
  if (showPreview && selectedForm) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
          <div className={`bg-gradient-to-r ${formMeta[selectedForm.form_id]?.gradient || "from-blue-500 to-blue-700"} px-8 py-5 text-white`}>
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

  // ── Form Selector (no form selected) ──
  if (!selectedForm) {
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
                      
                      // Simple logic to show pages around current page
                      if (totalPages > 5 && page > 3) {
                        pageNum = page - 3 + i;
                        if (pageNum + (4-i) > totalPages) pageNum = totalPages - 4 + i;
                      }

                      if (pageNum > totalPages) return null;

                      return (
                        <button 
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
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
                  onChange={(e) => setTempFilters({...tempFilters, kpi_id: e.target.value})}
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
                  onChange={(e) => setTempFilters({...tempFilters, year: Number(e.target.value)})}
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
                  onChange={(e) => setTempFilters({...tempFilters, period: e.target.value})}
                >
                  <option value="all">{t ? "ทั้งหมด" : "All"}</option>
                  <option value="annual">{t ? "รายปี" : "Annual"}</option>
                  {Array.from({length: 4}, (_, i) => `Q${i+1}`).map(q => <option key={q} value={q}>{q}</option>)}
                  {Array.from({length: 12}, (_, i) => `M${String(i+1).padStart(2, '0')}`).map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">{t ? "ผู้กรอก" : "User"}</label>
                <select 
                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-blue-500/20"
                  value={tempFilters.submitted_by}
                  onChange={(e) => setTempFilters({...tempFilters, submitted_by: e.target.value})}
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
                  onChange={(e) => setTempFilters({...tempFilters, status: e.target.value})}
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
                  setPage(1);
                }}
                className="flex-1 lg:flex-none px-4 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-300 transition-colors"
              >
                {t ? "ล้าง" : "Clear"}
              </button>
              <button 
                onClick={() => { setFilters(tempFilters); setPage(1); }}
                className="flex-1 lg:flex-none px-5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5"
                disabled={loadingLogs}
              >
                {loadingLogs ? <Loader2 size={12} className="animate-spin" /> : null}
                {t ? "ค้นหา" : "Refresh"}
              </button>
            </div>
          </div>

          {/* Audit Table Area (Stable) */}
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

  // ── Active Form ──
  const meta = formMeta[selectedForm.form_id] || formMeta.form_academic_yearly;
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
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                selectedPeriod === p
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
