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
  AlertCircle,
} from "lucide-react";

import formsData from "../../db_design/input_forms.json";
import { addKpiEntry, getAllKpiMaster } from "@/lib/data-service";
import type { KpiEntry, KpiMaster } from "@/lib/data-service";
import { useAuth } from "@/contexts/AuthContext";

import SuccessScreen from "@/components/kpi-input/SuccessScreen";
import PreviewModal from "@/components/kpi-input/PreviewModal";
import FormSelector from "@/components/kpi-input/FormSelector";
import FormEntry from "@/components/kpi-input/FormEntry";

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
  form_grad_matrix: { icon: BookOpen, color: "text-indigo-600", bg: "bg-indigo-50", gradient: "from-indigo-500 to-indigo-700" },
  form_research_funding: { icon: FlaskConical, color: "text-violet-600", bg: "bg-violet-50", gradient: "from-violet-500 to-violet-700" },
  form_hospital_stats: { icon: Stethoscope, color: "text-emerald-600", bg: "bg-emerald-50", gradient: "from-emerald-500 to-emerald-700" },
  form_hr_workforce: { icon: Users, color: "text-amber-600", bg: "bg-amber-50", gradient: "from-amber-500 to-amber-700" },
  form_strategic_governance: { icon: Landmark, color: "text-rose-600", bg: "bg-rose-50", gradient: "from-rose-500 to-rose-700" },
  form_narrative_entry: { icon: FileText, color: "text-cyan-600", bg: "bg-cyan-50", gradient: "from-cyan-500 to-cyan-700" },
};

// ─── Main Component ────────────────────────────────────────────
export default function KpiInputForm({ lang }: { lang: "th" | "en" }) {
  const { user } = useAuth();
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
    kpi_id: "", year: 2568, status: "all", period: "all", submitted_by: "all"
  });
  const [filters, setFilters] = useState({
    kpi_id: "", year: 2568, status: "all", period: "all", submitted_by: "all"
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
      for (const field of selectedForm.fields) {
        if (field.type === "number" && formValues[field.field_id]) {
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
            submitted_by: user?.email || "unknown",
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

    const baseInputCls = `w-full rounded-xl border-2 px-4 py-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${hasError ? "border-red-400 bg-red-50/50" : "border-slate-200 bg-white hover:border-blue-300 focus:border-blue-500 text-black font-normal"
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
  // RENDER — delegate to sub-components
  // ════════════════════════════════════════════════════════════════

  if (submitted) {
    return <SuccessScreen goBack={goBack} t={t} />;
  }

  if (showPreview && selectedForm) {
    const meta = formMeta[selectedForm.form_id] || formMeta.form_academic_yearly;
    return (
      <PreviewModal
        selectedForm={selectedForm}
        formValues={formValues}
        selectedPeriod={selectedPeriod}
        setShowPreview={setShowPreview}
        confirmSubmit={confirmSubmit}
        submitting={submitting}
        gradient={meta.gradient}
        t={t}
      />
    );
  }

  if (!selectedForm) {
    return (
      <FormSelector
        forms={forms}
        formMeta={formMeta}
        selectForm={selectForm}
        recentLogs={recentLogs}
        kpiMasters={kpiMasters}
        loadingLogs={loadingLogs}
        totalCount={totalCount}
        page={page}
        setPage={setPage}
        filters={filters}
        tempFilters={tempFilters}
        setTempFilters={setTempFilters}
        setFilters={setFilters}
        t={t}
      />
    );
  }

  const meta = formMeta[selectedForm.form_id] || formMeta.form_academic_yearly;
  return (
    <FormEntry
      selectedForm={selectedForm}
      selectedPeriod={selectedPeriod}
      setSelectedPeriod={setSelectedPeriod}
      renderField={renderField}
      goBack={goBack}
      handleSubmit={handleSubmit}
      meta={meta}
      t={t}
    />
  );
}
