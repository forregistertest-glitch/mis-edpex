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
  type QueryDocumentSnapshot,
  type DocumentData,
  type QuerySnapshot,
} from "firebase/firestore";

// ─── Types ─────────────────────────────────────────────────────
export interface KpiMaster {
  kpi_id: string;
  category_id: string;
  name_th: string;
  name_en: string;
  unit: string;
  target_value: number | null;
  aggregation: "sum" | "avg" | "latest" | "count" | "append";
  frequency: string;
  department_id: string;
  data_pattern?: string;
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
  // Review fields
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  // Attachment fields
  attachment_url?: string;
  attachment_name?: string;
  // Soft delete fields
  deleted_by?: string;
  deleted_at?: string;
  previous_status?: string;
  // Extra form data (for context like Project Name, etc.)
  extra_data?: Record<string, any>;
}

// ─── KPI Master ────────────────────────────────────────────────
export async function getAllKpiMaster(): Promise<KpiMaster[]> {
  const snap = await getDocs(collection(db, "kpi_master"));
  return snap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => ({ ...d.data(), kpi_id: d.id } as KpiMaster));
}

export async function getKpiMasterByCategory(categoryId: string): Promise<KpiMaster[]> {
  const q = query(collection(db, "kpi_master"), where("category_id", "==", categoryId));
  const snap = await getDocs(q);
  return snap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => ({ ...d.data(), kpi_id: d.id } as KpiMaster));
}

// ─── KPI Entries ───────────────────────────────────────────────
export async function getKpiEntries(
  kpiId?: string,
  year?: number,
  period?: string
): Promise<KpiEntry[]> {
  const constraints: any[] = [];

  // Optimize: Use server-side filtering where possible without needing composite indexes
  // If kpiId is provided, filter by it (Single field index)
  if (kpiId) {
    constraints.push(where("kpi_id", "==", kpiId));
  }
  // Else if year is provided, filter by it (Single field index)
  else if (year) {
    constraints.push(where("fiscal_year", "==", year));
  }

  const q = query(collection(db, "kpi_entries"), ...constraints);
  const snap = await getDocs(q);
  let results = snap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => ({ id: d.id, ...d.data() } as KpiEntry));

  // Client-side filtering ensures correctness even if mixed params were passed
  if (kpiId) results = results.filter((e) => e.kpi_id === kpiId);
  if (year) results = results.filter((e) => e.fiscal_year === year);
  if (period) results = results.filter((e) => e.period === period);

  return results.sort((a: KpiEntry, b: KpiEntry) => {
    if (a.fiscal_year !== b.fiscal_year) return b.fiscal_year - a.fiscal_year;
    return (a.period || "").localeCompare(b.period || "");
  });
}

export async function getEntriesByCategory(categoryId: string, year?: number): Promise<KpiEntry[]> {
  const masters = await getKpiMasterByCategory(categoryId);
  const kpiIds = masters.map((m) => m.kpi_id);
  const allEntries = await getKpiEntries(undefined, year);
  return allEntries.filter((e) => kpiIds.includes(e.kpi_id));
}

// ─── Aggregation ───────────────────────────────────────────────
export async function getAggregatedValue(
  kpiId: string,
  year: number,
  aggregation: "sum" | "avg" | "latest" | "count" | "append" = "avg"
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
    case "avg":
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

// ─── Recent Entries & Filtering ───────────────────────────────
export async function getRecentEntries(count: number = 20): Promise<KpiEntry[]> {
  const allEntries = await getKpiEntries();
  return allEntries
    .sort((a, b) => (b.submitted_at || "").localeCompare(a.submitted_at || ""))
    .slice(0, count);
}

export interface EntryFilters {
  kpi_id?: string;
  year?: number;
  period?: string;
  status?: string;
  submitted_by?: string;
}

export async function getRecentEntriesFiltered(
  filters: EntryFilters,
  page: number = 1,
  pageSize: number = 20
): Promise<{ entries: KpiEntry[]; total: number }> {
  const allEntries = await getKpiEntries();

  // Sort by submitted_at DESC
  allEntries.sort((a, b) => (b.submitted_at || "").localeCompare(a.submitted_at || ""));

  // Apply filters
  let filtered = allEntries;
  if (filters.kpi_id) filtered = filtered.filter(e => e.kpi_id === filters.kpi_id);
  if (filters.year) filtered = filtered.filter(e => e.fiscal_year === filters.year);
  if (filters.period && filters.period !== "all") filtered = filtered.filter(e => e.period === filters.period);
  if (filters.status && filters.status !== "all") filtered = filtered.filter(e => e.status === filters.status);
  if (filters.submitted_by && filters.submitted_by !== "all")
    filtered = filtered.filter(e => e.submitted_by === filters.submitted_by);

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const entries = filtered.slice(start, start + pageSize);

  return { entries, total };
}

export async function updateKpiEntryStatus(
  id: string,
  status: "approved" | "rejected" | "pending" | "revision_requested" | "deleted",
  reviewerEmail?: string,
  reason?: string
): Promise<void> {
  const docRef = doc(db, "kpi_entries", id);
  const updateData: Record<string, any> = { status };
  if (reviewerEmail) {
    updateData.reviewed_by = reviewerEmail;
    updateData.reviewed_at = new Date().toISOString();
  }
  if (reason) updateData.rejection_reason = reason;
  await setDoc(docRef, updateData, { merge: true });
}

// ─── Review Functions ──────────────────────────────────────────
export async function getPendingEntries(): Promise<KpiEntry[]> {
  const allEntries = await getKpiEntries();
  return allEntries
    .filter((e) => e.status === "pending")
    .sort((a, b) => (b.submitted_at || "").localeCompare(a.submitted_at || ""));
}

export async function getEntriesBySubmitter(email: string): Promise<KpiEntry[]> {
  const allEntries = await getKpiEntries();
  return allEntries
    .filter((e) => e.submitted_by === email && e.status !== "deleted")
    .sort((a, b) => (b.submitted_at || "").localeCompare(a.submitted_at || ""));
}

// ─── Soft Delete ───────────────────────────────────────────────
export async function softDeleteEntry(id: string, deletedBy: string, currentStatus: string): Promise<void> {
  const docRef = doc(db, "kpi_entries", id);
  await setDoc(docRef, {
    status: "deleted",
    deleted_by: deletedBy,
    deleted_at: new Date().toISOString(),
    previous_status: currentStatus,
  }, { merge: true });
}

// ─── Authorized Users (Admin) ──────────────────────────────────
export interface AuthorizedUser {
  email: string;
  role: string;
  name: string;
  added_at: string;
}

export async function getAuthorizedUsers(): Promise<AuthorizedUser[]> {
  const snap = await getDocs(collection(db, "authorized_users"));
  return snap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => ({ email: d.id, ...d.data() } as AuthorizedUser));
}

export async function addAuthorizedUser(email: string, role: string, name: string): Promise<void> {
  await setDoc(doc(db, "authorized_users", email), {
    email,
    role,
    name,
    added_at: new Date().toISOString(),
  });
}

export async function removeAuthorizedUser(email: string): Promise<void> {
  await deleteDoc(doc(db, "authorized_users", email));
}

export async function updateUserRole(email: string, newRole: string): Promise<void> {
  await setDoc(doc(db, "authorized_users", email), { role: newRole }, { merge: true });
}

export async function updateUserDetails(email: string, name: string, role: string): Promise<void> {
  await setDoc(doc(db, "authorized_users", email), { name, role }, { merge: true });
}

// ─── Login Logs ────────────────────────────────────────────────
export interface LoginLog {
  id: string;
  email: string;
  timestamp: string;
  success: boolean;
  method: string;
  ip_address: string;
  user_agent: string;
  reason: string;
  geo_location?: string;
}

// ─── Logging ───────────────────────────────────────────────────
export async function addLoginLog(email: string, success: boolean, method: string = "google"): Promise<void> {
  try {
    // 1. Get Client Info (IP/UA/Geo) from our own API
    let ip = "unknown";
    let userAgent = "unknown";
    let geoLocation = "";

    try {
      const res = await fetch("/api/auth/whoami");
      if (res.ok) {
        const data = await res.json();
        ip = data.ip;
        userAgent = data.userAgent;
        // Build geo string e.g. "Bangkok, Bangkok, Thailand (True Internet)"
        if (data.geo && (data.geo.city || data.geo.region)) {
          const parts = [data.geo.city, data.geo.region, data.geo.country].filter(Boolean);
          geoLocation = parts.join(", ");
          if (data.geo.isp) geoLocation += ` (${data.geo.isp})`;
        }
      }
    } catch (e) {
      console.warn("Failed to fetch client info for log:", e);
    }

    // 2. Save to Firestore
    await addDoc(collection(db, "login_logs"), {
      email,
      timestamp: Timestamp.now(),
      success,
      method,
      ip_address: ip,
      user_agent: userAgent,
      geo_location: geoLocation || "",
      reason: success ? "Login Successful" : "Unauthorized Email or Login Failed",
    });
  } catch (err) {
    console.error("Error adding login log:", err);
  }
}

export async function getLoginLogs(limitCount?: number): Promise<LoginLog[]> {
  const constraints: any[] = [orderBy("timestamp", "desc")];
  if (limitCount) constraints.push(firestoreLimit(limitCount));
  const q = query(collection(db, "login_logs"), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => {
    const data = d.data();
    // Convert Firestore Timestamp to ISO string for safe Date parsing in UI
    if (data.timestamp && typeof data.timestamp.toDate === "function") {
      data.timestamp = data.timestamp.toDate().toISOString();
    }
    return { id: d.id, ...data } as LoginLog;
  });
}

// Subscribe to real-time updates
import { onSnapshot, getCountFromServer } from "firebase/firestore";

export async function getLoginLogsCount(): Promise<number> {
  try {
    const coll = collection(db, "login_logs");
    const snapshot = await getCountFromServer(coll);
    return snapshot.data().count;
  } catch (error) {
    console.error("Error getting log count:", error);
    return 0;
  }
}


export async function getLoginLogsByMonth(yearMonth: string): Promise<LoginLog[]> {
  // yearMonth format: "YYYY-MM" e.g. "2026-01"
  const start = new Date(`${yearMonth}-01T00:00:00`);
  // End date is start of next month
  const [y, m] = yearMonth.split('-').map(Number);
  const end = new Date(y, m, 1); // Month is 0-indexed in Date constructor, so 'm' (1-12) is actually next month index if we use 0-11 logic. Wait.
  // new Date(2026, 1, 1) -> Feb 1st 2026. Correct.

  const q = query(
    collection(db, "login_logs"),
    where("timestamp", ">=", Timestamp.fromDate(start)),
    where("timestamp", "<", Timestamp.fromDate(end)),
    orderBy("timestamp", "desc")
  );

  const snap = await getDocs(q);
  return snap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => {
    const data = d.data();
    if (data.timestamp && typeof data.timestamp.toDate === "function") {
      data.timestamp = data.timestamp.toDate().toISOString();
    }
    return { id: d.id, ...data } as LoginLog;
  });
}

export function subscribeToLoginLogs(callback: (logs: LoginLog[]) => void, limitCount: number = 100) {
  const q = query(collection(db, "login_logs"), orderBy("timestamp", "desc"), firestoreLimit(limitCount));
  return onSnapshot(q, (snap: QuerySnapshot<DocumentData>) => {
    const logs = snap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => {
      const data = d.data();
      if (data.timestamp && typeof data.timestamp.toDate === "function") {
        data.timestamp = data.timestamp.toDate().toISOString();
      }
      return { id: d.id, ...data } as LoginLog;
    });
    callback(logs);
  });
}

// Helper to seed data for testing
export async function seedLoginLogs() {
  const logs = [
    {
      email: "mock.demo1@ku.th",
      timestamp: Timestamp.fromDate(new Date("2026-01-15T09:30:00")),
      success: true,
      method: "google",
      ip_address: "158.108.1.1",
      user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      geo_location: "Bangkok, Thailand (KU Network)",
      reason: "Login Successful"
    },
    {
      email: "mock.demo2@ku.th",
      timestamp: Timestamp.fromDate(new Date("2026-01-20T14:15:00")),
      success: false,
      method: "google",
      ip_address: "49.228.1.1",
      user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      geo_location: "Chiang Mai, Thailand (AIS Fibre)",
      reason: "Unauthorized Email"
    },
    {
      email: "mock.demo3@ku.th",
      timestamp: Timestamp.fromDate(new Date("2026-01-25T18:45:00")),
      success: true,
      method: "google",
      ip_address: "171.7.1.1",
      user_agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      geo_location: "Phuket, Thailand (True Online)",
      reason: "Login Successful"
    }
  ];
  for (const log of logs) {
    await addDoc(collection(db, "login_logs"), log);
  }
  console.log("Seeded January logs");
}

export async function clearMockLoginLogs() {
  const q = query(
    collection(db, "login_logs"),
    where("email", ">=", "mock.demo"),
    where("email", "<=", "mock.demo\uf8ff")
  );
  const snap = await getDocs(q);
  const promises = snap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => deleteDoc(d.ref));
  await Promise.all(promises);
  console.log(`Cleared ${promises.length} mock logs.`);
  return promises.length;
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

  // Strategic Success (average % of target achievement across 7.4.x KPIs)
  const strategicKpis = allEntries.filter((e) => e.kpi_id.startsWith("7.4"));
  const strategicVal = strategicKpis.length > 0
    ? (strategicKpis.reduce((total, e) => {
      const master = allMasters.find(m => m.kpi_id === e.kpi_id);
      const target = master?.target_value || 100;
      const pct = (e.value || 0) / target * 100;
      return total + Math.min(pct, 100); // Cap achievement at 100% for the summary
    }, 0) / strategicKpis.length)
    : 0;

  // Safety Incidents (7.1.11)
  const safety = allEntries.filter((e) => e.kpi_id === "7.1.11");
  const safetyVal = safety.length > 0
    ? safety.reduce((s, e) => s + (e.value || 0), 0)
    : null;

  // Research Funding (7.1.17 + 7.1.19)
  const researchInternal = allEntries.filter((e) => e.kpi_id === "7.1.17");
  const researchExternal = allEntries.filter((e) => e.kpi_id === "7.1.19");
  const researchVal = [...researchInternal, ...researchExternal]
    .reduce((s, e) => s + (e.value || 0), 0) || null;

  // Workforce Engagement (7.3.10)
  const engagement = allEntries.filter((e) => e.kpi_id === "7.3.10");
  const engagementVal = engagement.length > 0
    ? engagement.reduce((s, e) => s + (e.value || 0), 0) / engagement.length
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
    researchFunding: researchVal,
    workforceEngagement: engagementVal,
    totalEntries,
    totalKpis,
    kpisWithData,
  };
}

// ─── Chart Data Functions ──────────────────────────────────────
export interface ChartFilters {
  years?: number[];
  period?: string;
  dimension?: string;
}

export interface TrendPoint {
  year: number;
  value: number | null;
  target: number | null;
}

export async function getKpiTrendData(
  kpiId: string | string[],
  filters?: ChartFilters
): Promise<Record<string, TrendPoint[]>> {
  const kpiIds = Array.isArray(kpiId) ? kpiId : [kpiId];
  const allEntries = await getKpiEntries();
  const masters = await getAllKpiMaster();
  const result: Record<string, TrendPoint[]> = {};

  for (const kid of kpiIds) {
    let entries = allEntries.filter((e) => e.kpi_id === kid && e.status !== "deleted");
    if (filters?.period && filters.period !== "all") {
      entries = entries.filter((e) => e.period === filters.period);
    }
    if (filters?.dimension) {
      entries = entries.filter((e) => e.dimension === filters.dimension || !e.dimension);
    }

    // Group by year
    const byYear = new Map<number, number[]>();
    for (const e of entries) {
      if (e.value === null) continue;
      const arr = byYear.get(e.fiscal_year) || [];
      arr.push(e.value);
      byYear.set(e.fiscal_year, arr);
    }

    const master = masters.find((m) => m.kpi_id === kid);
    const targetVal = master?.target_value ?? null;
    const agg = master?.aggregation || "avg";

    const years = filters?.years
      ? filters.years
      : [...byYear.keys()].sort();

    result[kid] = years.map((yr) => {
      const vals = byYear.get(yr) || [];
      let value: number | null = null;
      if (vals.length > 0) {
        value = agg === "sum"
          ? vals.reduce((a, b) => a + b, 0)
          : agg === "count"
            ? vals.length
            : vals.reduce((a, b) => a + b, 0) / vals.length;
        value = Math.round(value * 100) / 100;
      }
      return { year: yr, value, target: targetVal };
    });
  }

  return result;
}

export interface MatrixPoint {
  dimension_value: string;
  value: number;
  extra?: Record<string, any>;
}

export async function getKpiMatrixData(
  kpiId: string,
  year?: number,
  dimensionFilter?: string
): Promise<MatrixPoint[]> {
  let entries = (await getKpiEntries(kpiId)).filter((e) => e.status !== "deleted");
  if (year) entries = entries.filter((e) => e.fiscal_year === year);
  if (dimensionFilter) entries = entries.filter((e) => e.dimension === dimensionFilter);

  // Group by dimension_value
  const grouped = new Map<string, number[]>();
  for (const e of entries) {
    if (e.value === null || !e.dimension_value) continue;
    const key = e.dimension_value;
    const arr = grouped.get(key) || [];
    arr.push(e.value);
    grouped.set(key, arr);
  }

  return [...grouped.entries()].map(([dv, vals]) => ({
    dimension_value: dv,
    value: Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100,
  }));
}

export interface AvailableFilters {
  years: number[];
  periods: string[];
  dimensions: string[];
}

export async function getAvailableFilters(categoryId?: string): Promise<AvailableFilters> {
  let entries = await getKpiEntries();
  if (categoryId) {
    const masters = await getKpiMasterByCategory(categoryId);
    const kpiIds = new Set(masters.map((m) => m.kpi_id));
    entries = entries.filter((e) => kpiIds.has(e.kpi_id));
  }

  const years = [...new Set(entries.map((e) => e.fiscal_year).filter(Boolean))].sort() as number[];
  const periods = [...new Set(entries.map((e) => e.period).filter(Boolean))].sort() as string[];
  const dimensions = [...new Set(entries.map((e) => e.dimension).filter((d): d is string => d !== null && d !== undefined))].sort();

  return { years, periods, dimensions };
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

// ─── Personnel Management ──────────────────────────────────────
import { Personnel } from "@/types/personnel";

// Get all personnel
export async function getPersonnel(): Promise<Personnel[]> {
  const q = collection(db, "personnel");
  const snap = await getDocs(q);
  
  // Map all records and sort by latest updated
  return snap.docs
    .map((d: QueryDocumentSnapshot<DocumentData>) => ({ id: d.id, ...d.data() } as Personnel))
    .sort((a: Personnel, b: Personnel) => {
      const timeA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
      const timeB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
      return timeB - timeA;
    });
}

// Check if personnel_id exists
export async function checkPersonnelIdExists(personnelId: string): Promise<string | null> {
  // 1. Try string query
  let q = query(
    collection(db, "personnel"),
    where("personnel_id", "==", String(personnelId))
  );
  let snap = await getDocs(q);
  
  // 2. If not found and is numeric, try number query (to handle legacy data)
  if (snap.empty && /^\d+$/.test(personnelId)) {
    const numericId = parseInt(personnelId, 10);
    q = query(
      collection(db, "personnel"),
      where("personnel_id", "==", numericId)
    );
    snap = await getDocs(q);
  }
  
  // Filter client-side for non-deleted records
  const activeDoc = snap.docs.find((d: QueryDocumentSnapshot<DocumentData>) => {
    const data = d.data();
    return data.is_deleted !== true;
  });
  
  if (activeDoc) {
    return activeDoc.id; // Return Firestore Doc ID
  }
  return null;
}

// Create new personnel
export async function createPersonnel(data: Partial<Personnel>, userEmail: string): Promise<string> {
  // Check duplicate ID
  if (data.personnel_id) {
    const existingId = await checkPersonnelIdExists(data.personnel_id);
    if (existingId) {
      throw new Error(`DuplicateID:${existingId}`);
    }
  }

  const { id, ...rest } = data;
  const now = new Date().toISOString();
  
  const docRef = await addDoc(collection(db, "personnel"), {
    ...rest,
    created_at: now,
    created_by: userEmail,
    updated_at: now,
    updated_by: userEmail,
    is_deleted: false
  });
  return docRef.id;
}

// Update personnel
export async function updatePersonnel(docId: string, data: Partial<Personnel>, userEmail: string): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, created_at, created_by, ...rest } = data; 
  const docRef = doc(db, "personnel", docId);
  await setDoc(docRef, {
    ...rest,
    updated_at: new Date().toISOString(),
    updated_by: userEmail
  }, { merge: true });
}

// Soft delete personnel
export async function softDeletePersonnel(docId: string, userEmail: string): Promise<void> {
  const docRef = doc(db, "personnel", docId);
  await setDoc(docRef, {
    is_deleted: true,
    updated_at: new Date().toISOString(),
    updated_by: userEmail,
    deleted_at: new Date().toISOString(),
    deleted_by: userEmail
  }, { merge: true });
}
