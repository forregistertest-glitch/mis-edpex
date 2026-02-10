import { db } from "./firebase";
import {
  collection,
  doc,
  setDoc,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  Timestamp,
  deleteDoc,
} from "firebase/firestore";

// ─── Types ─────────────────────────────────────────────────────
export interface KpiMaster {
  kpi_id: string;
  category_id: string;
  name_th: string;
  name_en: string;
  unit: string;
  data_pattern: string;
  target_value: number | null;
  aggregation: string;
  frequency: string;
  department_id: string;
}

export interface KpiEntry {
  id?: string;
  kpi_id: string;
  fiscal_year: number;
  period: string;
  value: number | null;
  target: number | null;
  dimension: string | null;
  dimension_value: string | null;
  unit: string;
  notes: string;
  submitted_by: string;
  submitted_at: string;
  status: string;
}

// ─── KPI Master ────────────────────────────────────────────────
export async function getAllKpiMaster(): Promise<KpiMaster[]> {
  const snap = await getDocs(collection(db, "kpi_master"));
  return snap.docs.map((d) => ({ ...d.data(), kpi_id: d.id } as KpiMaster));
}

export async function getKpiMasterByCategory(categoryId: string): Promise<KpiMaster[]> {
  const q = query(collection(db, "kpi_master"), where("category_id", "==", categoryId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...d.data(), kpi_id: d.id } as KpiMaster));
}

// ─── KPI Entries ───────────────────────────────────────────────
export async function getKpiEntries(
  kpiId?: string,
  year?: number,
  period?: string
): Promise<KpiEntry[]> {
  let q = query(collection(db, "kpi_entries"));
  // Client-side filtering since compound queries need indexes
  const snap = await getDocs(q);
  let results = snap.docs.map((d) => ({ id: d.id, ...d.data() } as KpiEntry));

  if (kpiId) results = results.filter((e) => e.kpi_id === kpiId);
  if (year) results = results.filter((e) => e.fiscal_year === year);
  if (period) results = results.filter((e) => e.period === period);

  return results.sort((a, b) => {
    if (a.fiscal_year !== b.fiscal_year) return b.fiscal_year - a.fiscal_year;
    return (a.period || "").localeCompare(b.period || "");
  });
}

export async function getEntriesByCategory(categoryId: string): Promise<KpiEntry[]> {
  const masters = await getKpiMasterByCategory(categoryId);
  const kpiIds = masters.map((m) => m.kpi_id);
  const allEntries = await getKpiEntries();
  return allEntries.filter((e) => kpiIds.includes(e.kpi_id));
}

// ─── Aggregation ───────────────────────────────────────────────
export async function getAggregatedValue(
  kpiId: string,
  year: number,
  aggregation: string = "average"
): Promise<{ value: number | null; count: number; entries: KpiEntry[] }> {
  const entries = await getKpiEntries(kpiId, year);
  const numericEntries = entries.filter((e) => e.value !== null);

  if (numericEntries.length === 0) return { value: null, count: 0, entries };

  const values = numericEntries.map((e) => e.value!);
  let value: number;

  switch (aggregation) {
    case "sum":
      value = values.reduce((a, b) => a + b, 0);
      break;
    case "latest":
      value = values[0];
      break;
    case "count":
      value = values.length;
      break;
    case "average":
    default:
      value = values.reduce((a, b) => a + b, 0) / values.length;
      break;
  }

  return { value: Math.round(value * 100) / 100, count: numericEntries.length, entries };
}

export async function getCategoryOverview(categoryId: string, year: number) {
  const masters = await getKpiMasterByCategory(categoryId);
  const results: Array<KpiMaster & { latestValue: number | null; entryCount: number }> = [];

  for (const kpi of masters) {
    const agg = await getAggregatedValue(kpi.kpi_id, year, kpi.aggregation);
    results.push({
      ...kpi,
      latestValue: agg.value,
      entryCount: agg.count,
    });
  }

  return results;
}

// ─── Write Entry ───────────────────────────────────────────────
export async function addKpiEntry(data: Omit<KpiEntry, "id">): Promise<string> {
  const docRef = await addDoc(collection(db, "kpi_entries"), {
    ...data,
    submitted_at: new Date().toISOString(),
  });
  return docRef.id;
}

// ─── Recent Entries ────────────────────────────────────────────
export async function getRecentEntries(count: number = 20): Promise<KpiEntry[]> {
  const allEntries = await getKpiEntries();
  return allEntries
    .sort((a, b) => (b.submitted_at || "").localeCompare(a.submitted_at || ""))
    .slice(0, count);
}

// ─── Dashboard Summary ────────────────────────────────────────
export async function getDashboardSummary(year: number) {
  const allEntries = await getKpiEntries(undefined, year);
  const allMasters = await getAllKpiMaster();

  // Academic Pass Rate (7.1.1)
  const academic = allEntries.filter((e) => e.kpi_id === "7.1.1");
  const academicVal = academic.length > 0
    ? academic.reduce((s, e) => s + (e.value || 0), 0) / academic.length
    : null;

  // Customer Satisfaction (7.2.10)
  const customer = allEntries.filter((e) => e.kpi_id === "7.2.10");
  const customerVal = customer.length > 0
    ? customer.reduce((s, e) => s + (e.value || 0), 0) / customer.length
    : null;

  // Strategic Success (average across 7.4.x year_series KPIs)
  const strategicKpis = allEntries.filter((e) => e.kpi_id.startsWith("7.4"));
  const strategicVal = strategicKpis.length > 0
    ? strategicKpis.reduce((s, e) => s + (e.value || 0), 0) / strategicKpis.length
    : null;

  // Safety Incidents (7.1.11)
  const safety = allEntries.filter((e) => e.kpi_id === "7.1.11");
  const safetyVal = safety.length > 0
    ? safety.reduce((s, e) => s + (e.value || 0), 0)
    : null;

  // Total entries count
  const totalEntries = allEntries.length;
  const totalKpis = allMasters.length;
  const kpisWithData = new Set(allEntries.map((e) => e.kpi_id)).size;

  return {
    academicPassRate: academicVal,
    customerSatisfaction: customerVal,
    strategicSuccess: strategicVal,
    safetyIncidents: safetyVal,
    totalEntries,
    totalKpis,
    kpisWithData,
  };
}

// ─── Export Helpers ─────────────────────────────────────────────
export async function getExportData() {
  const masters = await getAllKpiMaster();
  const entries = await getKpiEntries();

  // Create summary by year
  const years = [...new Set(entries.map((e) => e.fiscal_year))].sort();
  const summaryByYear: Record<string, Record<string, number | null>> = {};

  for (const year of years) {
    summaryByYear[String(year)] = {};
    for (const kpi of masters) {
      const kpiEntries = entries.filter(
        (e) => e.kpi_id === kpi.kpi_id && e.fiscal_year === year
      );
      if (kpiEntries.length > 0) {
        const vals = kpiEntries.filter((e) => e.value !== null).map((e) => e.value!);
        if (vals.length > 0) {
          summaryByYear[String(year)][kpi.kpi_id] =
            kpi.aggregation === "sum"
              ? vals.reduce((a, b) => a + b, 0)
              : vals.reduce((a, b) => a + b, 0) / vals.length;
        }
      }
    }
  }

  return { masters, entries, summaryByYear, years };
}

// ─── Seed Functions ────────────────────────────────────────────
export async function seedKpiMaster(kpis: KpiMaster[]) {
  let count = 0;
  for (const kpi of kpis) {
    await setDoc(doc(db, "kpi_master", kpi.kpi_id), {
      category_id: kpi.category_id,
      name_th: kpi.name_th,
      name_en: kpi.name_en,
      unit: kpi.unit,
      data_pattern: kpi.data_pattern,
      target_value: kpi.target_value,
      aggregation: kpi.aggregation,
      frequency: kpi.frequency,
      department_id: kpi.department_id,
    });
    count++;
  }
  return count;
}

export async function seedKpiEntries(entries: Omit<KpiEntry, "id">[]) {
  let count = 0;
  for (const entry of entries) {
    await addDoc(collection(db, "kpi_entries"), entry);
    count++;
  }
  return count;
}

// ─── Clear Collection ──────────────────────────────────────────
export async function clearCollection(collectionName: string): Promise<number> {
  const snap = await getDocs(collection(db, collectionName));
  let count = 0;
  for (const d of snap.docs) {
    await deleteDoc(d.ref);
    count++;
  }
  return count;
}
