"use client";

import { useState, useEffect, useCallback } from "react";
import DataExplorer from "@/components/DataExplorer";
import AcademicTrendChart from "@/components/AcademicTrendChart";
import KpiInputForm from "@/components/KpiInputForm";
import DocViewer from "@/components/DocViewer";
import { translations, Language, TranslationKey } from "@/lib/translations";
import { 
  Users, 
  GraduationCap, 
  Stethoscope, 
  LineChart, 
  ShieldAlert, 
  TrendingUp,
  LayoutDashboard,
  FileText,
  Settings,
  Languages,
  Download,
  FileCode,
  FileSpreadsheet,
  ClipboardEdit,
  Loader2,
  RefreshCw,
  Database,
  BarChart3,
  Activity,
  BookOpen,
} from "lucide-react";
import * as XLSX from 'xlsx';
import {
  getDashboardSummary,
  getKpiEntries,
  getAllKpiMaster,
  getExportData,
  getCategoryOverview,
  getEntriesByCategory,
} from "@/lib/data-service";
import type { KpiEntry, KpiMaster } from "@/lib/data-service";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [lang, setLang] = useState<Language>('th');
  
  // Data Explorer State
  const [showExplorer, setShowExplorer] = useState(false);
  const [explorerData, setExplorerData] = useState<any[]>([]);
  const [explorerTitle, setExplorerTitle] = useState('');
  const [explorerLoading, setExplorerLoading] = useState(false);

  // Real data from Firestore
  const [dashboardData, setDashboardData] = useState<{
    academicPassRate: number | null;
    customerSatisfaction: number | null;
    strategicSuccess: number | null;
    safetyIncidents: number | null;
    totalEntries: number;
    totalKpis: number;
    kpisWithData: number;
  } | null>(null);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [showDocs, setShowDocs] = useState(false);

  const t = (key: TranslationKey) => translations[lang][key] || key;

  // Fetch dashboard summary from Firestore
  const fetchDashboard = useCallback(async () => {
    setDataLoading(true);
    try {
      const summary = await getDashboardSummary(2568);
      setDashboardData(summary);
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard().then(() => setLoading(false));
  }, [fetchDashboard]);

  // Fetch category data when tab changes
  useEffect(() => {
    const fetchCategory = async () => {
      setDataLoading(true);
      try {
        let catId = '';
        if (activeTab === 'Academic') catId = '7.1';
        else if (activeTab === 'Staff/HR') catId = '7.3';
        else if (activeTab === 'Hospital') catId = '7.2';
        else if (activeTab === 'Strategic') catId = '7.4';
        
        if (catId) {
          const overview = await getCategoryOverview(catId, 2568);
          setCategoryData(overview);
        }
      } catch (error) {
        console.error("Error fetching category:", error);
      } finally {
        setDataLoading(false);
      }
    };
    
    if (['Academic', 'Staff/HR', 'Hospital', 'Strategic'].includes(activeTab)) {
      fetchCategory();
    }
  }, [activeTab]);

  // Handle View Details button click from dashboard
  const handleViewDetails = async (categoryId: string, title: string) => {
    setExplorerLoading(true);
    setExplorerTitle(title);
    try {
      // Filter by the dashboard's current year (2568) for context-aware exploration
      const data = await getEntriesByCategory(categoryId, 2568);
      setExplorerData(data);
      setShowExplorer(true);
    } catch (error) {
      console.error("Fetch detail error:", error);
    } finally {
      setExplorerLoading(false);
    }
  };

  const handleGlobalExport = async () => {
    setExplorerLoading(true);
    try {
      const { masters, entries, summaryByYear, years } = await getExportData();
      const wb = XLSX.utils.book_new();

      // Sheet 1: KPI Master
      const masterRows = masters.map((m) => ({
        KPI_ID: m.kpi_id,
        Category: m.category_id,
        Name_TH: m.name_th,
        Name_EN: m.name_en,
        Unit: m.unit,
        Target: m.target_value,
        Aggregation: m.aggregation,
        Frequency: m.frequency,
        Department: m.department_id,
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(masterRows), "KPI_Master");

      // Sheet 2: All Entries
      const entryRows = entries.map((e) => ({
        KPI_ID: e.kpi_id,
        Fiscal_Year: e.fiscal_year,
        Period: e.period,
        Value: e.value,
        Target: e.target,
        Dimension: e.dimension || "",
        Dimension_Value: e.dimension_value || "",
        Unit: e.unit,
        Status: e.status,
        Submitted_By: e.submitted_by,
        Submitted_At: e.submitted_at,
        Notes: e.notes,
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(entryRows), "All_Entries");

      // Sheet 3: Summary by Year
      const summaryRows: any[] = [];
      for (const year of years) {
        const yearData = summaryByYear[String(year)] || {};
        for (const [kpiId, value] of Object.entries(yearData)) {
          const master = masters.find((m) => m.kpi_id === kpiId);
          summaryRows.push({
            Fiscal_Year: year,
            KPI_ID: kpiId,
            Name: master?.name_en || kpiId,
            Aggregated_Value: Math.round((value as number) * 100) / 100,
            Target: master?.target_value || "",
            Unit: master?.unit || "",
          });
        }
      }
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryRows), "Summary_by_Year");

      XLSX.writeFile(wb, `KUVMIS_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error("Global export error:", error);
    } finally {
      setExplorerLoading(false);
    }
  };

  const handleJsonExport = async () => {
    setExplorerLoading(true);
    try {
      const { masters, entries } = await getExportData();
      const json = JSON.stringify({ kpi_master: masters, kpi_entries: entries }, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `KUVMIS_RawData_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("JSON export error:", error);
    } finally {
      setExplorerLoading(false);
    }
  };

  // Format display values with professional decimal handling
  const fmtVal = (v: number | null, unit?: string, agg?: string) => {
    if (v === null) return "—";
    
    // Percentages: 1 decimal
    if (unit === "ร้อยละ" || unit === "%") return `${v.toFixed(1)}%`;
    
    // Scores/Ratings: 2 decimals
    if (unit === "คะแนน") return `${v.toFixed(2)}/5`;
    
    // Currency/Large Numbers
    if (v >= 1000000) return `${(v / 1000000).toFixed(2)}M`;
    if (v >= 1000) return v.toLocaleString(undefined, { minimumFractionDigits: agg === "avg" ? 2 : 0, maximumFractionDigits: 2 });
    
    // Default: 0 for counts/sums, 2 for averages
    return agg === "avg" ? v.toFixed(2) : v.toString();
  };

  // Build KPI cards from real data
  const kpis = [
    { 
      title: t('academicPassRate'), 
      value: fmtVal(dashboardData?.academicPassRate ?? null, "%", "avg"), 
      trend: dashboardData?.academicPassRate && dashboardData.academicPassRate > 80 ? "✓ On Target" : "→ Tracking",
      icon: GraduationCap, 
      color: "text-blue-600", 
      bg: "bg-blue-100",
    },
    { 
      title: t('customerSatisfaction'), 
      value: fmtVal(dashboardData?.customerSatisfaction ?? null, "คะแนน", "avg"),
      trend: dashboardData?.customerSatisfaction && dashboardData.customerSatisfaction >= 4.0 ? "✓ ≥ 4.0" : "→ Tracking",
      icon: Users, 
      color: "text-green-600", 
      bg: "bg-green-100",
    },
    { 
      title: t('successRateStrategic'),
      value: fmtVal(dashboardData?.strategicSuccess ?? null, "%", "avg"),
      trend: `${dashboardData?.kpisWithData || 0}/${dashboardData?.totalKpis || 0} KPIs`,
      icon: LineChart, 
      color: "text-purple-600", 
      bg: "bg-purple-100",
    },
    { 
      title: t('safetyIncidents'), 
      value: dashboardData?.safetyIncidents !== null && dashboardData?.safetyIncidents !== undefined ? String(dashboardData.safetyIncidents) : "—",
      trend: dashboardData?.safetyIncidents === 0 ? "✓ Zero" : "⚠ Alert",
      icon: ShieldAlert, 
      color: "text-red-600", 
      bg: "bg-red-100",
    },
  ];

  if (loading) {
      return (
          <div className="flex items-center justify-center min-h-screen bg-white">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                <p className="text-sm text-slate-500">{lang === 'th' ? 'กำลังโหลดข้อมูลจาก Firestore...' : 'Loading from Firestore...'}</p>
              </div>
          </div>
      );
  }

  // ─── Category Section Component ──────────────────────────────
  const CategorySection = ({ categoryId, title, icon: IconComp, color }: { categoryId: string; title: string; icon: typeof GraduationCap; color: string }) => (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Stats bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h4 className="text-slate-400 text-xs font-bold uppercase">{lang === 'th' ? 'KPIs ในหมวด' : 'KPIs in Category'}</h4>
          <p className="text-2xl font-bold text-slate-800 mt-1">{categoryData.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h4 className="text-slate-400 text-xs font-bold uppercase">{lang === 'th' ? 'มีข้อมูลแล้ว' : 'With Data'}</h4>
          <p className="text-2xl font-bold text-green-600 mt-1">{categoryData.filter((d: any) => d.latestValue !== null).length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h4 className="text-slate-400 text-xs font-bold uppercase">{lang === 'th' ? 'ยังไม่มีข้อมูล' : 'No Data Yet'}</h4>
          <p className="text-2xl font-bold text-amber-500 mt-1">{categoryData.filter((d: any) => d.latestValue === null).length}</p>
        </div>
      </div>

      {/* KPI Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className={`px-8 py-5 border-b border-slate-200 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className={`${color} bg-opacity-10 p-2 rounded-xl`}><IconComp size={20} /></div>
            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => handleViewDetails(categoryId, title)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-semibold transition-colors">
              {t('viewDetails')}
            </button>
            <button onClick={fetchDashboard} className="p-2 text-slate-400 hover:text-blue-600 transition-colors" title="Refresh"><RefreshCw size={16} /></button>
          </div>
        </div>
        
        {dataLoading ? (
          <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-blue-400" size={24} /></div>
        ) : categoryData.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            {lang === 'th' ? 'ยังไม่มีข้อมูล — กรุณารัน Seed ก่อน (/seed)' : 'No data — run Seed first (/seed)'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">KPI</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{lang === 'th' ? 'ชื่อตัวชี้วัด' : 'Indicator Name'}</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">{lang === 'th' ? 'ค่าล่าสุด (2568)' : 'Latest (2568)'}</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">{lang === 'th' ? 'เป้าหมาย' : 'Target'}</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{lang === 'th' ? 'สถานะ' : 'Status'}</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">{lang === 'th' ? 'จำนวน entries' : 'Entries'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categoryData.map((kpi: any) => {
                  const hasTarget = kpi.target_value !== null && kpi.target_value !== undefined;
                  const met = hasTarget && kpi.latestValue !== null && kpi.latestValue >= kpi.target_value;
                  const formulaHint = kpi.aggregation === 'sum' 
                    ? (lang === 'th' ? 'ผลรวมของรายการทั้งหมด' : 'Sum of all entries')
                    : (lang === 'th' ? 'ค่าเฉลี่ยของรายการทั้งหมด' : 'Average of all entries');

                  return (
                    <tr key={kpi.kpi_id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 font-mono text-xs text-blue-600 font-bold whitespace-nowrap">{kpi.kpi_id}</td>
                      <td className="px-6 py-4 text-slate-700 text-sm max-w-[300px]">{lang === 'th' ? kpi.name_th : kpi.name_en}</td>
                      <td 
                        className="px-6 py-4 text-right font-bold text-slate-800 cursor-help"
                        title={`${lang === 'th' ? 'สูตรคำนวณ' : 'Formula'}: ${formulaHint}`}
                      >
                        {kpi.latestValue !== null ? fmtVal(kpi.latestValue, kpi.unit, kpi.aggregation) : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-500">{hasTarget ? fmtVal(kpi.target_value, kpi.unit) : "—"}</td>
                      <td className="px-6 py-4">
                        {kpi.latestValue === null ? (
                          <span className="inline-flex px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-400">{lang === 'th' ? 'ไม่มีข้อมูล' : 'No data'}</span>
                        ) : met ? (
                          <span className="inline-flex px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">✓ {lang === 'th' ? 'ถึงเป้า' : 'Met'}</span>
                        ) : hasTarget ? (
                          <span className="inline-flex px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-700">→ {lang === 'th' ? 'ยังไม่ถึง' : 'Below'}</span>
                        ) : (
                          <span className="inline-flex px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-600">{lang === 'th' ? 'ติดตาม' : 'Track'}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center"><span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full font-semibold text-slate-600">{kpi.entryCount}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {activeTab === 'Academic' && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><GraduationCap className="text-blue-600" />{t('academicExcellenceTrends')} (2564-2568)</h3>
          </div>
          <div className="h-[350px]"><AcademicTrendChart /></div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <img src="https://vet.ku.ac.th/vv2018/download/KU/KU_logo.png" alt="KU Logo" className="w-10 h-10 object-contain" />
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              {t('systemName')}
            </h1>
          </div>
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">{t('heroSub')}</p>
        </div>
        <nav className="mt-4 flex-1 px-4 space-y-1">
          {[
            { id: 'Dashboard', name: t('dashboard'), icon: LayoutDashboard },
            { id: 'Academic', name: t('academic'), icon: GraduationCap },
            { id: 'Staff/HR', name: t('staff'), icon: Users },
            { id: 'Hospital', name: t('hospital'), icon: Stethoscope },
            { id: 'Strategic', name: t('strategic'), icon: TrendingUp },
            { id: 'Input', name: t('inputData'), icon: ClipboardEdit },
            { id: 'Reports', name: t('reports'), icon: FileText },
            { id: 'Docs', name: t('documentation'), icon: BookOpen },
          ].map((item) => (
            <button 
                key={item.id} 
                onClick={() => item.id === 'Docs' ? setShowDocs(true) : setActiveTab(item.id)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium w-full transition-all duration-200 ${activeTab === item.id ? 'bg-blue-600 text-white shadow-md scale-105' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              <item.icon size={18} />
              {item.name}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-200">
          <p className="text-[10px] text-slate-400 font-medium text-center uppercase tracking-widest">{t('academicYear')} 2568</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-slate-800">
            {activeTab === 'Dashboard' ? t('executiveOverview') : activeTab}
          </h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              <Database size={13} className="text-blue-500" />
              <span>{dashboardData?.totalEntries || 0} Entries</span>
            </div>
            
            <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden sm:block" />

            {/* Language Toggle */}
            <button 
              onClick={() => setLang(lang === 'th' ? 'en' : 'th')}
              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all relative group"
              title={lang === 'th' ? 'Switch to English' : 'เปลี่ยนเป็นภาษาไทย'}
            >
              <Languages size={20} />
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity">
                {lang === 'th' ? 'EN' : 'TH'}
              </span>
            </button>

            {/* Settings */}
            <button 
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
              title={t('settings')}
            >
              <Settings size={20} />
            </button>

            <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden sm:block" />

            <div className="flex items-center gap-2 text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {t('academicYear')} 2568
            </div>

            <div className="w-9 h-9 rounded-full bg-blue-600 border-2 border-white shadow-sm flex items-center justify-center text-white text-xs font-bold">
              ADM
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-8">
          {activeTab === 'Dashboard' ? (
              <>
                {/* Hero Banner */}
                <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 rounded-3xl p-10 text-white shadow-xl relative overflow-hidden">
                    <div className="relative z-10">
                    <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-semibold mb-4 backdrop-blur-sm">
                      🔥 LIVE DATA FROM FIRESTORE
                    </span>
                    <h2 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">{t('heroTitle')}</h2>
                    <p className="opacity-80 max-w-2xl text-lg leading-relaxed">
                        {t('heroDesc')}
                    </p>
                    <div className="mt-6 flex items-center gap-4 text-sm">
                      <span className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-2">
                        <Activity size={14} />{dashboardData?.totalEntries || 0} {lang === 'th' ? 'รายการข้อมูล' : 'data entries'}
                      </span>
                      <span className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-2">
                        <BarChart3 size={14} />{dashboardData?.kpisWithData || 0}/{dashboardData?.totalKpis || 0} KPIs
                      </span>
                      <button onClick={fetchDashboard} className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-white/20 transition-colors">
                        <RefreshCw size={14} />{lang === 'th' ? 'รีเฟรช' : 'Refresh'}
                      </button>
                    </div>
                    </div>
                    <div className="absolute right-0 top-0 w-80 h-80 bg-blue-400/20 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse"></div>
                    <div className="absolute left-1/2 bottom-0 w-64 h-64 bg-indigo-500/20 rounded-full -ml-32 -mb-32 blur-3xl"></div>
                </div>

                {/* KPI Cards Grid — Real Data */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {kpis.map((kpi) => (
                    <div key={kpi.title} className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-lg transition-all transform hover:-translate-y-1 group">
                        <div className="flex items-center justify-between mb-4">
                        <div className={`${kpi.bg} ${kpi.color} p-3 rounded-2xl group-hover:scale-110 transition-transform`}>
                            <kpi.icon size={22} />
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${kpi.trend.includes('✓') ? 'text-green-600 bg-green-50' : 'text-slate-600 bg-slate-50'}`}>
                            {kpi.trend}
                        </span>
                        </div>
                        <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider">{kpi.title}</h3>
                        <p className="text-3xl font-bold text-slate-800 mt-2">
                          {dataLoading ? <Loader2 size={24} className="animate-spin text-blue-400" /> : kpi.value}
                        </p>
                    </div>
                    ))}
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-7 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col min-h-[420px]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-slate-800 font-bold text-lg">{t('academicExcellenceTrends')}</h3>
                        <button 
                          onClick={() => handleViewDetails('7.1', t('academic'))} 
                          className="text-blue-600 text-sm font-semibold hover:underline"
                        >
                          {t('viewDetails')}
                        </button>
                    </div>
                    <div className="flex-1 min-h-[300px]">
                        <AcademicTrendChart />
                    </div>
                    </div>

                    <div className="bg-white p-7 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col min-h-[420px]">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-slate-800 font-bold text-lg">{t('strategicObjectivesProgress')}</h3>
                          <button 
                            onClick={() => handleViewDetails('7.4', t('strategic'))} 
                            className="text-blue-600 text-sm font-semibold hover:underline"
                          >
                            {t('viewDetails')}
                          </button>
                        </div>
                        <div className="flex-1 space-y-6 pt-2">
                            {[
                            { label: "SO2: International Standards (AVBC/ISO)", pct: 73, color: "from-purple-500 to-purple-600", shadow: "shadow-purple-200" },
                            { label: "SO1: Revenue Growth & Structure", pct: 87, color: "from-blue-500 to-blue-600", shadow: "shadow-blue-200" },
                            { label: "SO3: Workforce Capability", pct: 70, color: "from-green-500 to-green-600", shadow: "shadow-green-200" },
                            { label: "SO4: Digital MIS Central Database", pct: 50, color: "from-orange-500 to-orange-600", shadow: "shadow-orange-200" },
                            { label: "SO5: Partnership & Reputation", pct: 90, color: "from-teal-500 to-teal-600", shadow: "shadow-teal-200" },
                            ].map(so => (
                            <div key={so.label} className="space-y-2">
                                <div className="flex justify-between items-center">
                                <span className="text-sm font-semibold text-slate-700">{so.label}</span>
                                <span className="text-sm font-bold text-slate-900">{so.pct}%</span>
                                </div>
                                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                <div className={`h-full bg-gradient-to-r ${so.color} rounded-full transition-all duration-1000 ${so.shadow} shadow-lg`} style={{ width: `${so.pct}%` }}></div>
                                </div>
                            </div>
                            ))}
                        </div>
                    </div>
                </div>
              </>
          ) : activeTab === 'Academic' ? (
              <CategorySection categoryId="7.1" title={t('academic')} icon={GraduationCap} color="text-blue-600" />
          ) : activeTab === 'Staff/HR' ? (
              <CategorySection categoryId="7.3" title={t('staff')} icon={Users} color="text-amber-600" />
          ) : activeTab === 'Hospital' ? (
              <CategorySection categoryId="7.2" title={t('hospital')} icon={Stethoscope} color="text-emerald-600" />
          ) : activeTab === 'Strategic' ? (
              <CategorySection categoryId="7.4" title={t('strategic')} icon={TrendingUp} color="text-purple-600" />
          ) : activeTab === 'Input' ? (
              <div className="animate-in fade-in duration-500">
                <KpiInputForm lang={lang} />
              </div>
          ) : activeTab === 'Reports' ? (
              <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="bg-white p-10 rounded-3xl border border-slate-200/60 shadow-sm text-center max-w-3xl mx-auto">
                      <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <FileSpreadsheet size={40} />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-800 mb-2">
                        {lang === 'th' ? 'รายงานสรุปผลและข้อมูลดิบ' : 'Summary Reports & Raw Data'}
                      </h3>
                      <p className="text-slate-500 mb-8">
                        {lang === 'th' ? 
                          'ส่งออกข้อมูลทั้งหมดจาก Firestore ออกเป็นไฟล์ Excel (3 sheets: KPI Master, All Entries, Summary by Year) หรือ JSON dump' : 
                          'Export all data from Firestore into Excel (3 sheets: KPI Master, All Entries, Summary by Year) or JSON dump'}
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button 
                          onClick={handleGlobalExport}
                          className="flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition-all hover:scale-105 active:scale-95"
                        >
                          <Download size={20} />
                          {lang === 'th' ? 'Excel 3 Sheets (.xlsx)' : 'Download Excel (.xlsx)'}
                        </button>
                        <button 
                          onClick={handleJsonExport}
                          className="flex items-center justify-center gap-3 px-8 py-4 bg-slate-800 text-white rounded-2xl font-bold shadow-lg hover:bg-slate-900 transition-all hover:scale-105 active:scale-95"
                        >
                          <FileCode size={20} />
                          {lang === 'th' ? 'ข้อมูลดิบ JSON (Dev)' : 'Raw JSON Dump (Dev)'}
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
          ) : (
              <div className="bg-white p-12 rounded-3xl border border-slate-200/60 shadow-sm text-center">
                  <h3 className="text-2xl font-bold text-slate-800 mb-4">{activeTab} Section</h3>
                  <p className="text-slate-500 max-w-md mx-auto mb-8">
                      {t('populatingData')}
                  </p>
              </div>
          )}
        </div>
      </main>

      {/* Data Explorer Overlay */}
      {showExplorer && (
        <DataExplorer 
          data={explorerData} 
          title={explorerTitle} 
          lang={lang}
          onClose={() => setShowExplorer(false)} 
        />
      )}

      {/* Documentation Viewer Overlay */}
      {showDocs && (
        <DocViewer t={lang === 'th'} onClose={() => setShowDocs(false)} />
      )}

      {/* Global Fetching Loader */}
      {explorerLoading && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-[60] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            <p className="text-sm font-bold text-blue-600">{lang === 'th' ? 'กำลังดึงข้อมูลจาก Firestore...' : 'Fetching from Firestore...'}</p>
          </div>
        </div>
      )}
    </div>
  );
}
