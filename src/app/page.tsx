"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import DataExplorer from "@/components/DataExplorer";
import InputHub from "@/components/InputHub";
import DocViewer from "@/components/DocViewer";
import LoginPage from "@/components/LoginPage";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import HeroBanner from "@/components/dashboard/HeroBanner";
import ReportsSection from "@/components/dashboard/ReportsSection";
import ReviewerDashboard from "@/components/dashboard/ReviewerDashboard";
import AdminPanel from "@/components/dashboard/AdminPanel";
import AcademicDashboard from "@/components/dashboard/AcademicDashboard";
import StaffDashboard from "@/components/dashboard/StaffDashboard";
import HospitalDashboard from "@/components/dashboard/HospitalDashboard";
import StrategicDashboard from "@/components/dashboard/StrategicDashboard";
import ChartGallery from "@/components/dashboard/ChartGallery";
import AnnualReportDashboard from "@/components/dashboard/AnnualReportDashboard";
import DashboardCard from "@/components/dashboard/DashboardCard";
import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams, useRouter } from "next/navigation";
import { translations, Language, TranslationKey } from "@/lib/translations";
import {
  Users,
  GraduationCap,
  LineChart,
  ShieldAlert,
  TrendingUp,
  Database,
  LibraryBig,
  Stethoscope,
  Landmark,
  UserStar,
  CheckSquare,
  Keyboard
} from "lucide-react";
import * as XLSX from 'xlsx';
import {
  getDashboardSummary,
  getExportData,
  getCategoryOverview,
  getEntriesByCategory,
} from "@/lib/data-service";
import { formatNumber } from "@/lib/utils";

function DashboardContent() {
  const { user, userRole, loading: authLoading, error: authError, signInWithGoogle, signOut } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [lang, setLang] = useState<Language>('th');

  // Data Explorer State
  const [showExplorer, setShowExplorer] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [explorerData, setExplorerData] = useState<any[]>([]);
  const [explorerTitle, setExplorerTitle] = useState('');
  const [explorerLoading, setExplorerLoading] = useState(false);

  // Real data from Firestore
  const [dashboardData, setDashboardData] = useState<{
    academicPassRate: number | null;
    customerSatisfaction: number | null;
    strategicSuccess: number | null;
    safetyIncidents: number | null;
    researchFunding: number | null;
    workforceEngagement: number | null;
    totalEntries: number;
    totalKpis: number;
    kpisWithData: number;
  } | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    fetchDashboard();
  }, [fetchDashboard]);

  // Handle Tab from Query Param
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ['Dashboard', 'Academic', 'Staff/HR', 'Hospital', 'Strategic', 'Input', 'Review', 'Admin', 'Reports', 'AnnualReport'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);
  useEffect(() => {
    const fetchCategory = async () => {
      setDataLoading(true);
      try {
        let catId = '';
        if (activeTab === 'Postgraduate') catId = '7.1';
        else if (activeTab === 'Personnel') catId = '7.3';
        else if (activeTab === 'Undergraduate') catId = '7.2'; // Temporary map to Hospital data or empty
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

    if (['Postgraduate', 'Personnel', 'Undergraduate', 'Strategic'].includes(activeTab)) {
      fetchCategory();
    }
  }, [activeTab]);

  // Handle View Details button click from dashboard
  const handleViewDetails = async (categoryId: string, title: string) => {
    setExplorerLoading(true);
    setExplorerTitle(title);
    try {
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

      const masterRows = masters.map((m) => ({
        KPI_ID: m.kpi_id, Category: m.category_id, Name_TH: m.name_th, Name_EN: m.name_en,
        Unit: m.unit, Target: m.target_value, Aggregation: m.aggregation, Frequency: m.frequency, Department: m.department_id,
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(masterRows), "KPI_Master");

      const entryRows = entries.map((e) => ({
        KPI_ID: e.kpi_id, Fiscal_Year: e.fiscal_year, Period: e.period, Value: e.value, Target: e.target,
        Dimension: e.dimension || "", Dimension_Value: e.dimension_value || "", Unit: e.unit,
        Status: e.status, Submitted_By: e.submitted_by, Submitted_At: e.submitted_at, Notes: e.notes,
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(entryRows), "All_Entries");

      const summaryRows: any[] = [];
      for (const year of years) {
        const yearData = summaryByYear[String(year)] || {};
        for (const [kpiId, value] of Object.entries(yearData)) {
          const master = masters.find((m) => m.kpi_id === kpiId);
          summaryRows.push({
            Fiscal_Year: year, KPI_ID: kpiId, Name: master?.name_en || kpiId,
            Aggregated_Value: Math.round((value as number) * 100) / 100,
            Target: master?.target_value || "", Unit: master?.unit || "",
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

  // Format display values using global utility
  const fmtVal = (v: number | null, unit?: string, agg?: string) => {
    if (v === null) return "—";

    // Check if unit is percentage
    if (unit === "ร้อยละ" || unit === "%") {
      return `${formatNumber(v, 1)}%`;
    }

    // Check if unit is score (max 5)
    if (unit === "คะแนน") {
      return `${formatNumber(v, 2)}/5`;
    }

    // Large numbers (Millions)
    if (v >= 1000000) {
      return `${formatNumber(v / 1000000, 2)}M`;
    }

    // Standard formatting
    return formatNumber(v, agg === "avg" ? 2 : 0);
  };

  // Build KPI cards from real data
  const kpis = [
    {
      title: t('academicPassRate'),
      value: fmtVal(dashboardData?.academicPassRate ?? null, "%", "avg"),
      trend: dashboardData?.academicPassRate && dashboardData.academicPassRate > 80 ? "✓ On Target" : "→ Tracking",
      icon: GraduationCap,
      color: "text-[var(--ku-vet-blue-dark)]", // Customized KU Blue
      bg: "bg-[var(--ku-vet-blue-light)]",
      logic: lang === 'th' ? "ร้อยละของผู้สำเร็จการศึกษาที่สอบผ่านใบประกอบวิชาชีพ" : "Percentage of graduates passing licensure exam",
      source: "KPI-7.1.1"
    },

    {
      title: t('customerSatisfaction'),
      value: fmtVal(dashboardData?.customerSatisfaction ?? null, "คะแนน", "avg"),
      trend: dashboardData?.customerSatisfaction && dashboardData.customerSatisfaction >= 4.0 ? "✓ ≥ 4.0" : "→ Tracking",
      icon: Users, color: "text-green-600", bg: "bg-green-100",
      logic: lang === 'th' ? "ค่าเฉลี่ยความพึงพอใจของผู้รับบริการ" : "Average customer satisfaction score",
      source: "KPI-7.2.10"
    },
    {
      title: lang === 'th' ? 'ทุนวิจัยรวม' : 'Research Funding',
      value: fmtVal(dashboardData?.researchFunding ?? null, "บาท", "sum"),
      trend: dashboardData?.researchFunding ? '✓ Active' : '→ Tracking',
      icon: LineChart, color: "text-indigo-600", bg: "bg-indigo-100",
      logic: lang === 'th' ? "จำนวนเงินทุนวิจัยภายนอกและภายในรวมกัน" : "Total external and internal research funding",
      source: "KPI-7.1.17, 7.1.19"
    },
    {
      title: lang === 'th' ? 'ความผูกพันบุคลากร' : 'Staff Engagement',
      value: fmtVal(dashboardData?.workforceEngagement ?? null, "คะแนน", "avg"),
      trend: dashboardData?.workforceEngagement && dashboardData.workforceEngagement >= 4.0 ? '✓ ≥ 4.0' : '→ Tracking',
      icon: Users, color: "text-green-600", bg: "bg-green-100",
      logic: lang === 'th' ? "ค่าเฉลี่ยความผูกพันของบุคลากร" : "Average workforce engagement score",
      source: "KPI-7.3.10"
    },
    {
      title: t('successRateStrategic'),
      value: fmtVal(dashboardData?.strategicSuccess ?? null, "%", "avg"),
      trend: `${dashboardData?.kpisWithData || 0}/${dashboardData?.totalKpis || 0} KPIs`,
      icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-100",
      logic: lang === 'th' ? "ร้อยละความสำเร็จของแผนยุทธศาสตร์" : "Percentage of strategic plan achievement",
      source: "KPI-7.4.x"
    },
    {
      title: t('safetyIncidents'),
      value: dashboardData?.safetyIncidents !== null && dashboardData?.safetyIncidents !== undefined ? String(dashboardData.safetyIncidents) : "—",
      trend: dashboardData?.safetyIncidents === 0 ? "✓ Zero" : "⚠ Alert",
      icon: ShieldAlert, color: "text-red-600", bg: "bg-red-100",
      logic: lang === 'th' ? "จำนวนอุบัติการณ์ความปลอดภัย" : "Number of safety incidents",
      source: "KPI-7.1.11"
    },
  ];

  // Auth gate
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-800 via-blue-900 to-indigo-950">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          <p className="text-sm text-blue-200">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onSignIn={signInWithGoogle} loading={authLoading} error={authError} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} setShowDocs={setShowDocs} t={t} lang={lang} onSignOut={signOut} userRole={userRole} userName={user?.displayName || user?.email || null} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-slate-50">
        <Header activeTab={activeTab} lang={lang} setLang={setLang} dashboardData={dashboardData} t={t} user={user} onSignOut={signOut} userRole={userRole} setActiveTab={setActiveTab} />

        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
          {activeTab === 'Dashboard' ? (
            <>
              <HeroBanner dashboardData={dashboardData} fetchDashboard={fetchDashboard} t={t} lang={lang} />

              {/* KPI Cards Grid — 6 cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {kpis.map((kpi) => (
                  <DashboardCard
                    key={kpi.title}
                    title={kpi.title}
                    value={kpi.value}
                    trend={kpi.trend}
                    icon={kpi.icon}
                    iconColor={kpi.color}
                    iconBg={kpi.bg}
                    logic={kpi.logic}
                    source={kpi.source}
                    isLoading={dataLoading}
                  />
                ))}
              </div>

              {/* Quick-View Category Cards - 7-8 Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl">
                {[
                  { id: 'Personnel', label: t('personnel'), sub: lang === 'th' ? 'จัดการฐานข้อมูลบุคคลากรของคณะสัตวแพทยศาสตร์' : 'Manage faculty personnel records database', color: 'from-blue-500 to-blue-600', icon: Users },
                  { id: 'Instructor', label: t('instructor'), sub: lang === 'th' ? 'จัดการฐานข้อมูลอาจารย์ผู้สอนของคณะสัตวแพทยศาสตร์' : 'Manage instructor database of VetKU', color: 'from-teal-500 to-teal-600', icon: UserStar },
                  { id: 'Undergraduate', label: t('undergrad'), sub: lang === 'th' ? 'จัดการฐานข้อมูลนิสิตและอื่นๆในระดับปริญญาตรี' : 'Manage undergraduate studies database', color: 'from-sky-500 to-sky-600', icon: Stethoscope },
                  { id: 'Postgraduate', label: t('postgrad'), sub: lang === 'th' ? 'จัดการฐานข้อมูลบัณฑิตระดับสูงกว่าปริญญาตรี' : 'Manage postgraduate studies database', color: 'from-purple-500 to-purple-600', icon: GraduationCap },
                  { id: 'Research', id_real: 'research', label: t('research'), sub: lang === 'th' ? 'จัดการฐานข้อมูลงานวิจัยและผลงานตีพิมพ์' : 'Manage research projects and publications database', color: 'from-amber-500 to-amber-600', icon: LibraryBig },
                  { id: 'Department', label: t('department'), sub: lang === 'th' ? 'จัดการฐานข้อมูลภาควิชาต่างๆของคณะสัตวแพทยศาสตร์' : 'Manage department database projects', color: 'from-slate-500 to-slate-600', icon: Landmark },
                  { id: 'Strategic', label: t('strategic'), sub: lang === 'th' ? 'จัดการฐานข้อมูลตัวชี้วัด KPI และผลการดำเนินงาน (SAR)' : 'Manage KPI data and strategic outcomes results', color: 'from-emerald-500 to-emerald-600', icon: TrendingUp },
                  { id: 'Input', label: t('inputHubHeading'), sub: lang === 'th' ? 'จัดการฐานข้อมูลกลางและแบบฟอร์มบันทึกข้อมูล' : 'Central database management and input forms', color: 'from-indigo-500 to-indigo-600', icon: Keyboard },
                  { id: 'MyTasks', label: t('myTasks'), sub: lang === 'th' ? 'ติดตามงาน, อนุมัติ, ข้อความ' : 'Track tasks, approvals, messages', color: 'from-rose-500 to-rose-600', icon: CheckSquare },
                ].map(c => (
                  <div key={c.id} className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-lg transition-all group hover:-translate-y-1 transform flex flex-col justify-between">
                    <button onClick={() => {
                        if (c.id === 'Research') router.push('/research');
                        else if (c.id === 'Instructor') router.push('/faculty');
                        else if (c.id === 'Undergraduate') router.push('/undergraduate');
                        else if (c.id === 'Department') router.push('/department');
                        else setActiveTab(c.id);
                    }} className="text-left w-full">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`p-1.5 rounded-lg bg-gradient-to-br ${c.color} text-white`}>
                            <c.icon size={16} />
                        </div>
                        <div className={`text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r ${c.color}`}>{c.label}</div>
                      </div>
                      <p className="text-xs text-slate-400 mb-3 line-clamp-1">{c.sub}</p>
                      <span className="text-[10px] font-semibold text-blue-600 group-hover:underline mb-4 inline-block">{lang === 'th' ? 'ดูรายละเอียด →' : 'View Details →'}</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (c.id === 'Research') router.push('/research');
                        else if (c.id === 'Instructor') router.push('/faculty');
                        else handleViewDetails(c.id_real || c.id, c.label);
                      }}
                      className="mt-2 w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10px] font-semibold rounded-lg border border-slate-200 transition-colors"
                    >
                      <Database size={12} />
                      {lang === 'th' ? 'ดูข้อมูล / Export' : 'Data & Export'}
                    </button>
                  </div>
                ))}
              </div>

              {/* Chart Gallery Section */}
              <div className="mt-8">
                <ChartGallery lang={lang} />
              </div>

            </>
          ) : activeTab === 'Postgraduate' ? (
            <AcademicDashboard lang={lang} />
          ) : activeTab === 'Personnel' ? (
            <StaffDashboard lang={lang} />
          ) : activeTab === 'Undergraduate' ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200/60 shadow-sm text-center">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">{t('undergrad')}</h3>
              <p className="text-slate-500 max-w-md mx-auto mb-8">{t('populatingData')}</p>
            </div>
          ) : activeTab === 'Strategic' ? (
            <StrategicDashboard lang={lang} />
          ) : activeTab === 'Input' ? (
            <div className="animate-in fade-in duration-500">
              <InputHub lang={lang} />
            </div>
          ) : activeTab === 'MyTasks' ? (
            <div className="animate-in fade-in duration-500">
              <ReviewerDashboard lang={lang} />
            </div>
          ) : activeTab === 'Department' ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200/60 shadow-sm text-center">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">{t('department')}</h3>
              <p className="text-slate-500 max-w-md mx-auto mb-8">{t('populatingData')}</p>
            </div>
          ) : activeTab === 'Admin' ? (
            <div className="animate-in fade-in duration-500">
              <AdminPanel lang={lang} />
            </div>
          ) : activeTab === 'Reports' ? (
            <ReportsSection dashboardData={dashboardData} handleGlobalExport={handleGlobalExport} handleJsonExport={handleJsonExport} lang={lang} />
          ) : activeTab === 'AnnualReport' ? (
            <div className="animate-in fade-in duration-500">
              <AnnualReportDashboard lang={lang} />
            </div>
          ) : (
            <div className="bg-white p-12 rounded-3xl border border-slate-200/60 shadow-sm text-center">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">{activeTab} Section</h3>
              <p className="text-slate-500 max-w-md mx-auto mb-8">{t('populatingData')}</p>
            </div>
          )}
        </div>
    </main>

      {/* Data Explorer Overlay */}
      {showExplorer && (
        <DataExplorer data={explorerData} title={explorerTitle} lang={lang} onClose={() => setShowExplorer(false)} />
      )}

      {/* Documentation Viewer Overlay */}
      {showDocs && (
        <DocViewer t={lang === 'th'} onClose={() => setShowDocs(false)} userEmail={user?.email} />
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

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
