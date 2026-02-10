"use client";

import { useState } from "react";
import { seedKpiMaster, seedKpiEntries, clearCollection } from "@/lib/data-service";
import type { KpiMaster } from "@/lib/data-service";
import { useAuth } from "@/contexts/AuthContext";
import { ShieldX, Loader2 } from "lucide-react";
import kpiMasterRaw from "../../../db_design/kpi_master.json";

// ─── Aggregation map by data_pattern ───────────────────────────
function getAggregation(pattern: string): "sum" | "avg" | "latest" | "count" | "append" {
  switch (pattern) {
    case "year_series": return "avg";
    case "matrix": return "sum";
    case "survey": return "latest";
    case "narrative": return "append";
    case "milestone": return "latest";
    default: return "avg";
  }
}

// ─── Generate sample entries ───────────────────────────────────
function generateSampleEntries() {
  const entries: any[] = [];
  const years = [2564, 2565, 2566, 2567, 2568];
  const periodsQ = ["Q1", "Q2", "Q3", "Q4"];
  const now = new Date().toISOString();

  const yearData: Record<string, number[]> = {
    "7.1.1": [76.3, 78.5, 79.2, 80.1, 81.7],
    "7.1.2": [70.0, 72.5, 75.0, 77.3, 79.8],
    "7.1.3": [150, 165, 180, 192, 210],
    "7.1.7": [800, 850, 920, 980, 1050],
    "7.1.13": [85, 90, 95, 98, 105],
    "7.1.14": [92.5, 93.0, 93.8, 94.2, 95.1],
    "7.1.16": [15, 17, 19, 21, 23],
    "7.1.17": [3500000, 4200000, 4800000, 5100000, 5500000],
    "7.1.18": [6, 8, 9, 10, 12],
    "7.1.19": [7000000, 8500000, 9200000, 10500000, 11200000],
    "7.2.3": [85, 88, 90, 93, 95],
    "7.2.6": [3.8, 3.9, 4.0, 4.1, 4.2],
    "7.2.7": [12000, 13500, 14200, 15000, 15800],
    "7.2.8": [1200000, 1500000, 1800000, 2100000, 2400000],
    "7.2.9": [4.2, 4.3, 4.4, 4.5, 4.6],
    "7.2.10": [3.9, 4.0, 4.1, 4.1, 4.2],
    "7.2.11": [450, 480, 520, 550, 600],
    "7.2.14": [120, 145, 160, 180, 210],
    "7.2.12": [200, 220, 250, 280, 310],
    "7.3.3": [320, 325, 330, 335, 340],
    "7.3.4": [5.2, 4.8, 4.5, 4.2, 3.9],
    "7.3.5": [2, 1, 1, 0, 0],
    "7.3.7": [8, 9, 10, 11, 12],
    "7.3.9": [88, 89, 90, 91, 92],
    "7.3.10": [3.8, 3.9, 4.0, 4.1, 4.33],
    "7.4.5": [3, 2, 1, 0, 0],
    "7.4.6": [0, 0, 0, 0, 0],
    "7.4.11": [3.8, 4.0, 4.2, 4.3, 4.5],
    "7.4.12": [1, 1, 2, 2, 3],
    "7.4.14": [4, 5, 6, 7, 8],
    "7.4.15": [2000, 2500, 3000, 3500, 4000],
  };

  for (const [kpiId, values] of Object.entries(yearData)) {
    const master = (kpiMasterRaw as any[]).find((k: any) => k.kpi_id === kpiId);
    const target = master?.target_value || null;
    for (let i = 0; i < years.length; i++) {
      entries.push({
        kpi_id: kpiId, fiscal_year: years[i], period: "annual",
        value: values[i], target, dimension: null, dimension_value: null,
        unit: master?.unit || "", notes: "", submitted_by: "system_seed",
        submitted_at: now, status: "approved",
      });
    }
  }

  // Quarterly data (2568 only)
  const quarterlyKpis: Record<string, number[]> = {
    "7.1.1": [78.5, 80.2, 81.7, 86.4],
    "7.3.4": [4.5, 3.8, 3.2, 4.1],
    "7.2.7": [3800, 4100, 3900, 4000],
  };
  for (const [kpiId, values] of Object.entries(quarterlyKpis)) {
    const master = (kpiMasterRaw as any[]).find((k: any) => k.kpi_id === kpiId);
    for (let q = 0; q < 4; q++) {
      entries.push({
        kpi_id: kpiId, fiscal_year: 2568, period: periodsQ[q],
        value: values[q], target: master?.target_value || null,
        dimension: null, dimension_value: null, unit: master?.unit || "",
        notes: `Quarter ${q + 1} data`, submitted_by: "system_seed",
        submitted_at: now, status: "approved",
      });
    }
  }

  // Matrix: Hospital branches (7.2.7)
  const branches = [
    { name: "รพส.มก.บางเขน", value: 8500 },
    { name: "รพส.มก.กำแพงแสน", value: 4200 },
    { name: "รพส.มก.หนองโว", value: 1800 },
    { name: "รพส.มก.หัวหิน", value: 1300 },
  ];
  for (const branch of branches) {
    entries.push({
      kpi_id: "7.2.7", fiscal_year: 2568, period: "annual",
      value: branch.value, target: null, dimension: "สาขา",
      dimension_value: branch.name, unit: "ราย", notes: "",
      submitted_by: "system_seed", submitted_at: now, status: "approved",
    });
  }

  // Matrix: Revenue sources (7.4.7)
  const revenues: Record<string, number[]> = {
    "CE": [500000, 600000, 750000, 900000, 1100000],
    "ศูนย์ประชุม": [200000, 300000, 350000, 400000, 500000],
    "วัคซีน": [800000, 950000, 1100000, 1300000, 1500000],
  };
  for (const [source, values] of Object.entries(revenues)) {
    for (let i = 0; i < years.length; i++) {
      entries.push({
        kpi_id: "7.4.7", fiscal_year: years[i], period: "annual",
        value: values[i], target: null, dimension: "แหล่งรายได้",
        dimension_value: source, unit: "บาท", notes: "",
        submitted_by: "system_seed", submitted_at: now, status: "approved",
      });
    }
  }

  // Matrix: Grad by field (7.1.5)
  const fields = ["วิทยาศาสตร์สุขภาพสัตว์", "คลินิกศึกษา", "เภสัชวิทยา", "ระบาดวิทยา"];
  for (const field of fields) {
    for (let i = 0; i < years.length; i++) {
      entries.push({
        kpi_id: "7.1.5", fiscal_year: years[i], period: "annual",
        value: Math.floor(Math.random() * 5) + 2, target: null,
        dimension: "สาขา", dimension_value: field, unit: "คน", notes: "",
        submitted_by: "system_seed", submitted_at: now, status: "approved",
      });
    }
  }

  // Matrix: Staff by type (7.3.3)
  const staffTypes: Record<string, number[]> = {
    "ข้าราชการ": [45, 43, 42, 40, 38],
    "พนักงาน มก.": [120, 125, 128, 130, 135],
    "พนักงานเงินรายได้": [80, 82, 85, 88, 90],
    "อาจารย์": [55, 56, 57, 58, 60],
    "สัตวแพทย์ รพ.": [20, 19, 18, 19, 17],
  };
  for (const [type, values] of Object.entries(staffTypes)) {
    for (let i = 0; i < years.length; i++) {
      entries.push({
        kpi_id: "7.3.3", fiscal_year: years[i], period: "annual",
        value: values[i], target: null, dimension: "ประเภทตำแหน่ง",
        dimension_value: type, unit: "คน", notes: "",
        submitted_by: "system_seed", submitted_at: now, status: "approved",
      });
    }
  }

  // Resignation data (7.3.11)
  const resignationBands = ["0-3 ปี", "3-7 ปี", "7+ ปี"];
  const resignationVals = [[3, 2, 2, 1, 1], [1, 1, 0, 1, 0], [0, 1, 0, 0, 0]];
  for (let b = 0; b < resignationBands.length; b++) {
    for (let i = 0; i < years.length; i++) {
      entries.push({
        kpi_id: "7.3.11", fiscal_year: years[i], period: "annual",
        value: resignationVals[b][i], target: null, dimension: "อายุงาน",
        dimension_value: resignationBands[b], unit: "คน", notes: "",
        submitted_by: "system_seed", submitted_at: now, status: "approved",
      });
    }
  }

  return entries;
}

// ─── Seed Page Component ───────────────────────────────────────
export default function SeedPage() {
  const { user, userRole, loading: authLoading } = useAuth();
  const [logs, setLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [masterCount, setMasterCount] = useState(0);
  const [entryCount, setEntryCount] = useState(0);
  const [mode, setMode] = useState<"idle" | "seed" | "clear" | "reseed">("idle");

  // ── Auth Guard: Admin only ──
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user || userRole !== "admin") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-10 max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto">
            <ShieldX size={32} className="text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">ไม่มีสิทธิ์เข้าถึง</h1>
          <p className="text-sm text-slate-500">
            หน้านี้สำหรับ Admin เท่านั้น
          </p>
          <a href="/" className="inline-block mt-4 text-sm text-blue-600 hover:underline">
            ← กลับไปหน้า Dashboard
          </a>
        </div>
      </div>
    );
  }

  const log = (msg: string) => setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString("th-TH")}] ${msg}`]);

  const buildKpiList = (): KpiMaster[] =>
    (kpiMasterRaw as any[]).map((k: any) => ({
      kpi_id: k.kpi_id, category_id: k.category_id, name_th: k.name_th,
      name_en: k.name_en, unit: k.unit, data_pattern: k.data_pattern,
      target_value: k.target_value, aggregation: getAggregation(k.data_pattern),
      frequency: k.frequency, department_id: k.department_id,
    }));

  // ── Seed Only ──
  const handleSeed = async () => {
    setIsRunning(true);
    setMode("seed");
    setLogs([]);
    try {
      log("📋 กำลัง seed kpi_master (61 KPI)...");
      const mc = await seedKpiMaster(buildKpiList());
      setMasterCount(mc);
      log(`✅ kpi_master: ${mc} records`);

      log("📊 กำลัง seed kpi_entries...");
      const entries = generateSampleEntries();
      const ec = await seedKpiEntries(entries);
      setEntryCount(ec);
      log(`✅ kpi_entries: ${ec} records`);
      log(`🎉 Seed เสร็จสิ้น! รวม ${mc + ec} documents`);
    } catch (error: any) {
      log(`❌ Error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  // ── Clear Only ──
  const handleClear = async () => {
    setIsRunning(true);
    setMode("clear");
    setLogs([]);
    try {
      log("🗑️ กำลังลบ kpi_entries...");
      const ec = await clearCollection("kpi_entries");
      log(`✅ ลบ kpi_entries: ${ec} documents`);

      log("🗑️ กำลังลบ kpi_master...");
      const mc = await clearCollection("kpi_master");
      log(`✅ ลบ kpi_master: ${mc} documents`);

      setMasterCount(0);
      setEntryCount(0);
      log(`🧹 ล้างข้อมูลเสร็จสิ้น! ลบทั้งหมด ${mc + ec} documents`);
    } catch (error: any) {
      log(`❌ Error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  // ── Clear + Re-seed ──
  const handleReseed = async () => {
    setIsRunning(true);
    setMode("reseed");
    setLogs([]);
    try {
      // Step 1: Clear
      log("🗑️ Step 1/3: กำลังลบ kpi_entries...");
      const delEntries = await clearCollection("kpi_entries");
      log(`   ลบ entries: ${delEntries} documents`);

      log("🗑️ Step 2/3: กำลังลบ kpi_master...");
      const delMasters = await clearCollection("kpi_master");
      log(`   ลบ masters: ${delMasters} documents`);
      log(`✅ ล้างข้อมูลเสร็จ — ลบทั้งหมด ${delEntries + delMasters} documents`);

      // Step 2: Re-seed
      log("📋 Step 3/3: กำลัง seed ข้อมูลใหม่...");
      const mc = await seedKpiMaster(buildKpiList());
      setMasterCount(mc);
      log(`   kpi_master: ${mc} records`);

      const entries = generateSampleEntries();
      const ec = await seedKpiEntries(entries);
      setEntryCount(ec);
      log(`   kpi_entries: ${ec} records`);

      log(`🎉 Re-seed เสร็จสิ้น! ข้อมูลใหม่ทั้งหมด ${mc + ec} documents`);
    } catch (error: any) {
      log(`❌ Error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-10 max-w-2xl w-full space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800">🌱 Database Seed Tool</h1>
          <p className="text-sm text-slate-500 mt-2">
            สร้าง / ล้าง / สร้างใหม่ ข้อมูลใน Firestore (kpi_master + kpi_entries)
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={handleSeed}
            disabled={isRunning}
            className={`py-4 rounded-2xl font-bold transition-all ${isRunning ? "bg-slate-200 text-slate-400 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 hover:scale-[1.02] active:scale-95"
              }`}
          >
            {isRunning && mode === "seed" ? "⏳ กำลัง seed..." : "🚀 Seed เพิ่ม"}
          </button>

          <button
            onClick={handleClear}
            disabled={isRunning}
            className={`py-4 rounded-2xl font-bold transition-all ${isRunning ? "bg-slate-200 text-slate-400 cursor-not-allowed"
              : "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20 hover:scale-[1.02] active:scale-95"
              }`}
          >
            {isRunning && mode === "clear" ? "⏳ กำลังลบ..." : "🗑️ ล้างข้อมูลทั้งหมด"}
          </button>

          <button
            onClick={handleReseed}
            disabled={isRunning}
            className={`py-4 rounded-2xl font-bold transition-all ${isRunning ? "bg-slate-200 text-slate-400 cursor-not-allowed"
              : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 hover:scale-[1.02] active:scale-95"
              }`}
          >
            {isRunning && mode === "reseed" ? "⏳ กำลัง re-seed..." : "♻️ ล้าง + Seed ใหม่"}
          </button>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800">
          <strong>💡 สำหรับการพรีเซ็นต์:</strong> กด <strong>"ล้าง + Seed ใหม่"</strong> เพื่อรีเซ็ตข้อมูลกลับสู่สถานะเริ่มต้น
          → จากนั้นกลับไปหน้า Dashboard เพื่อดูข้อมูลใหม่
        </div>

        {/* Log Console */}
        {logs.length > 0 && (
          <div className="bg-slate-900 rounded-xl p-5 max-h-64 overflow-y-auto">
            {logs.map((line, i) => (
              <div key={i} className="text-xs font-mono text-slate-300 leading-relaxed">
                {line}
              </div>
            ))}
            {isRunning && (
              <div className="text-xs font-mono text-blue-400 animate-pulse mt-1">▶ กำลังทำงาน...</div>
            )}
          </div>
        )}

        {/* Stats */}
        {masterCount > 0 && entryCount > 0 && !isRunning && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-700">{masterCount}</div>
              <div className="text-xs text-blue-500 mt-1">KPI Master</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-700">{entryCount}</div>
              <div className="text-xs text-green-500 mt-1">KPI Entries</div>
            </div>
          </div>
        )}

        <div className="text-center">
          <a href="/" className="text-sm text-blue-600 hover:underline">
            ← กลับไปหน้า Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
