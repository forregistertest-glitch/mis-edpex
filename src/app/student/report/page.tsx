"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, LayoutDashboard, Download, RefreshCw, ChevronLeft, ChevronRight, Search, Archive } from "lucide-react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend, Filler } from "chart.js";
import { Bar, Doughnut, Line, Pie } from "react-chartjs-2";
import { StudentService } from "@/services/studentService";
import { AcademicService } from "@/services/academicService";
import { GraduateStudent } from "@/types/student";
import { StudentPublication, StudentProgress } from "@/types/academic";
import { exportFullReport } from "@/utils/studentExport";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// ==================== TYPES ====================
interface SheetConfig {
  name: string;
  color: string;
  headers: string[];
  buildRows: (students: GraduateStudent[], pubs: StudentPublication[], progress: StudentProgress[]) => string[][];
}

// ==================== MAIN COMPONENT ====================
export default function DashboardPage() {
  const [students, setStudents] = useState<GraduateStudent[]>([]);
  const [publications, setPublications] = useState<StudentPublication[]>([]);
  const [progressItems, setProgressItems] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSheet, setActiveSheet] = useState(0);
  const [sheetPage, setSheetPage] = useState(1);
  const [sheetSearch, setSheetSearch] = useState("");
  const ROWS_PER_PAGE = 25;

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [s, p, pr] = await Promise.all([
        StudentService.getAllStudents(),
        AcademicService.getAllPublications(),
        AcademicService.getAllProgress(),
      ]);
      setStudents(s);
      setPublications(p);
      setProgressItems(pr);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ==================== CHART DATA ====================
  const CHART_COLORS = {
    green: 'rgba(34,197,94,0.8)', blue: 'rgba(59,130,246,0.8)',
    amber: 'rgba(245,158,11,0.8)', red: 'rgba(239,68,68,0.8)',
    purple: 'rgba(168,85,247,0.8)', teal: 'rgba(20,184,166,0.8)',
    indigo: 'rgba(99,102,241,0.8)', pink: 'rgba(236,72,153,0.8)',
    slate: 'rgba(100,116,139,0.8)', cyan: 'rgba(6,182,212,0.8)',
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' as const, labels: { font: { family: 'Sarabun, sans-serif', size: 12 }, padding: 12, usePointStyle: true } } },
  };

  // Chart 1: Status Donut
  const statusCounts = useMemo(() => {
    const map: Record<string, number> = {};
    students.filter(s => !s.is_deleted).forEach(s => {
      const st = s.current_status || 'ไม่ระบุ';
      map[st] = (map[st] || 0) + 1;
    });
    return map;
  }, [students]);

  const statusDonut = {
    labels: Object.keys(statusCounts),
    datasets: [{
      data: Object.values(statusCounts),
      backgroundColor: [CHART_COLORS.blue, CHART_COLORS.green, CHART_COLORS.red, CHART_COLORS.amber, CHART_COLORS.purple, CHART_COLORS.slate],
      borderWidth: 2, borderColor: '#fff',
    }],
  };

  // Chart 2: Degree by Major (grouped bar)
  const degreeByMajor = useMemo(() => {
    const majors: Record<string, { master: number; phd: number }> = {};
    students.filter(s => !s.is_deleted).forEach(s => {
      const m = s.major_name || 'ไม่ระบุ';
      if (!majors[m]) majors[m] = { master: 0, phd: 0 };
      if (s.degree_level?.includes('โท')) majors[m].master++;
      else if (s.degree_level?.includes('เอก')) majors[m].phd++;
    });
    const sorted = Object.entries(majors).sort((a, b) => (b[1].master + b[1].phd) - (a[1].master + a[1].phd)).slice(0, 8);
    return {
      labels: sorted.map(([k]) => k.length > 20 ? k.slice(0, 18) + '…' : k),
      datasets: [
        { label: 'ป.โท', data: sorted.map(([, v]) => v.master), backgroundColor: CHART_COLORS.blue, borderRadius: 4 },
        { label: 'ป.เอก', data: sorted.map(([, v]) => v.phd), backgroundColor: CHART_COLORS.purple, borderRadius: 4 },
      ],
    };
  }, [students]);

  // Chart 3: Admit/Grad trend by year
  const yearTrend = useMemo(() => {
    const admitMap: Record<number, number> = {};
    const gradMap: Record<number, number> = {};
    students.filter(s => !s.is_deleted).forEach(s => {
      const ay = s.admit_year;
      if (ay) admitMap[ay] = (admitMap[ay] || 0) + 1;
      const gy = s.graduated_year;
      if (gy && s.current_status === 'สำเร็จ') gradMap[gy] = (gradMap[gy] || 0) + 1;
    });
    const allYears = [...new Set([...Object.keys(admitMap), ...Object.keys(gradMap)].map(Number))].sort();
    return {
      labels: allYears.map(String),
      datasets: [
        { label: 'รับเข้า', data: allYears.map(y => admitMap[y] || 0), borderColor: CHART_COLORS.blue, backgroundColor: 'rgba(59,130,246,0.1)', fill: true, tension: 0.4 },
        { label: 'สำเร็จ', data: allYears.map(y => gradMap[y] || 0), borderColor: CHART_COLORS.green, backgroundColor: 'rgba(34,197,94,0.1)', fill: true, tension: 0.4 },
      ],
    };
  }, [students]);

  // Chart 4: Milestone progress (stacked bar)
  const milestoneData = useMemo(() => {
    const types = ['Proposal', 'English', 'QE', 'Defense'];
    const passed: Record<string, number> = {};
    const pending: Record<string, number> = {};
    types.forEach(t => { passed[t] = 0; pending[t] = 0; });
    
    const activeStudents = students.filter(s => !s.is_deleted && s.current_status !== 'สำเร็จ');
    activeStudents.forEach(s => {
      const sProgress = progressItems.filter(p => p.student_id === s.student_id);
      types.forEach(t => {
        const found = sProgress.find(p => p.milestone_type === t);
        if (found?.status && (found.status.includes('ผ่าน') || found.status.includes('แล้ว'))) {
          passed[t]++;
        } else {
          pending[t]++;
        }
      });
    });
    return {
      labels: types,
      datasets: [
        { label: 'ผ่านแล้ว', data: types.map(t => passed[t]), backgroundColor: CHART_COLORS.green, borderRadius: 4 },
        { label: 'ยังไม่ผ่าน', data: types.map(t => pending[t]), backgroundColor: CHART_COLORS.slate, borderRadius: 4 },
      ],
    };
  }, [students, progressItems]);

  // Chart 5: Top 10 Advisors (horizontal bar)
  const advisorData = useMemo(() => {
    const advisors: Record<string, number> = {};
    students.filter(s => !s.is_deleted).forEach(s => {
      const a = s.advisor_name || 'ไม่ระบุ';
      advisors[a] = (advisors[a] || 0) + 1;
    });
    const sorted = Object.entries(advisors).sort((a, b) => b[1] - a[1]).slice(0, 10);
    return {
      labels: sorted.map(([k]) => k.length > 25 ? k.slice(0, 22) + '…' : k),
      datasets: [{
        label: 'จำนวนนิสิต',
        data: sorted.map(([, v]) => v),
        backgroundColor: [CHART_COLORS.blue, CHART_COLORS.teal, CHART_COLORS.green, CHART_COLORS.purple, CHART_COLORS.indigo, CHART_COLORS.amber, CHART_COLORS.pink, CHART_COLORS.cyan, CHART_COLORS.red, CHART_COLORS.slate],
        borderRadius: 4,
      }],
    };
  }, [students]);

  // Chart 6: Publication level pie
  const pubLevelData = useMemo(() => {
    const levels: Record<string, number> = {};
    publications.forEach(p => {
      const lvl = (p as any).publication_level || (p as any).quartile || 'ไม่ระบุ';
      levels[lvl] = (levels[lvl] || 0) + 1;
    });
    return {
      labels: Object.keys(levels),
      datasets: [{
        data: Object.values(levels),
        backgroundColor: [CHART_COLORS.indigo, CHART_COLORS.teal, CHART_COLORS.amber, CHART_COLORS.pink, CHART_COLORS.slate, CHART_COLORS.green],
        borderWidth: 2, borderColor: '#fff',
      }],
    };
  }, [publications]);

  // ==================== 6-SHEET PREVIEW ====================
  // ==================== 6-SHEET PREVIEW ====================
  const MILESTONES = ['Proposal', 'English', 'QE', 'Defense'];

  const formatDate = (date: any) => {
    if (!date) return '-';
    if (date?.seconds) return new Date(date.seconds * 1000).toLocaleString('th-TH');
    return new Date(date).toLocaleString('th-TH');
  };

  const sheetConfigs: SheetConfig[] = useMemo(() => [
    {
      name: '1. ผลงานตีพิมพ์ (Publications)',
      color: 'bg-blue-500',
      headers: [
        'ลำดับ', 'รหัสนิสิต', 'ชื่อ-สกุล', 'ระดับ', 'สาขา', 'อาจารย์', 
        'ชื่อบทความ', 'วารสาร', 'เผยแพร่', 'ปีที่ (Vol)', 'ฉบับที่ (Issue)', 'เลขหน้า',
        'วันตอบรับ', 'ปีที่พิมพ์', 'ระดับ (Q)', 'วันอนุมัติปริญญา', 'ฐานข้อมูล',
        'แผนการเรียน', 'แก้ไขล่าสุด', 'ผู้แก้ไข'
      ],
      buildRows: (sts, pubs) => {
        return pubs.map((p, idx) => {
          const s = sts.find(st => st.student_id === p.student_id);
          return [
            String(idx + 1),
            p.student_id, 
            s?.full_name_th || '-', 
            s?.degree_level || '-', 
            s?.major_name || '-', 
            s?.advisor_name || '-', 
            p.publication_title || '-', 
            p.journal_name || '-', 
            p.publish_period || '-',
            p.volume || '-',
            p.issue || '-',
            p.pages || '-',
            p.acceptance_date || '-',
            String(p.year || '-'), 
            p.quartile || p.publication_level || '-', 
            p.degree_approval_date || '-',
            p.database_source || '-',
            s?.study_plan || '-',
            (p.updated_at ? formatDate(p.updated_at) : (p.created_at ? formatDate(p.created_at) : '-')),
            p.updated_by || p.created_by || '-'
          ];
        });
      },
    },
    {
      name: '2. นิสิตคงอยู่/สำเร็จ (Active/Graduated)',
      color: 'bg-green-500',
      headers: [
        'ลำดับ', 'รหัสนิสิต', 'ชื่อ-สกุล', 'เพศ', 'สัญชาติ', 'ระดับ', 'หลักสูตร', 'สาขา',
        'อาจารย์', 'ภาควิชา', 'ภาคเข้า', 'ปีเข้า', 'แผนจบ', 'ปีจบ(แผน)',
        'สถานะ', 'แผนการเรียน', 'หัวข้อวิทยานิพนธ์', 'วันสอบโครงร่าง', 'อังกฤษ',
        'QE/Comp', 'สอบเล่ม', 'วันจบ', 'ภาคจบ', 'ปีจบ', 'จบตามแผน',
        'แก้ไขล่าสุด', 'ผู้แก้ไข'
      ],
      buildRows: (sts, _, prog) => {
        return sts.filter(s => !s.is_deleted && !['สละสิทธิ์', 'ไม่มารายงานตัว', 'ลาออก', 'พ้นสภาพ'].includes(s.current_status || ''))
          .map((s, idx) => {
            const sp = prog.filter(p => p.student_id === s.student_id);
            const getMS = (type: string) => { const f = sp.find(p => p.milestone_type === type); return f?.status ? (f.status.includes('ผ่าน') || f.status.includes('แล้ว') ? '✓' : f.status) : '-'; };
            
            // On Plan Logic
            const onPlan = s.graduated_year && s.expected_grad_year ? (s.graduated_year <= s.expected_grad_year ? '✓' : 'Delayed') : '-';

            return [
              String(idx + 1),
              s.student_id, 
              s.full_name_th, 
              s.gender || '-', 
              s.nationality || '-',
              s.degree_level || '-', 
              s.program_type || '-',
              s.major_name || '-', 
              s.advisor_name || '-', 
              s.advisor_department || '-',
              s.admit_semester || '-',
              String(s.admit_year || '-'),
              s.expected_grad_semester || '-',
              String(s.expected_grad_year || '-'),
              s.current_status || '-', 
              s.study_plan || '-',
              s.thesis_title_th || '-',
              s.proposal_exam_date || '-',
              s.english_test_pass || '-',
              getMS('QE') !== '-' ? getMS('QE') : getMS('ComprehensiveOral'),
              getMS('Defense'),
              s.actual_graduation_date || '-',
              s.graduated_semester || '-',
              String(s.graduated_year || '-'),
              onPlan,
              (s.updated_at ? formatDate(s.updated_at) : (s.created_at ? formatDate(s.created_at) : '-')),
              s.updated_by || s.created_by || '-'
            ];
        });
      },
    },
    {
      name: '3. นิสิตสละสิทธิ์ (Resigned/Retired)',
      color: 'bg-red-500',
      headers: [
        'ลำดับ', 'รหัสนิสิต', 'ชื่อ-สกุล', 'เพศ', 'สัญชาติ', 'ระดับ', 'หลักสูตร', 'สาขา',
        'อาจารย์', 'ภาควิชา', 'ภาคเข้า', 'ปีเข้า', 'แผนจบ', 'ปีจบ(แผน)',
        'สถานะ', 'แก้ไขล่าสุด', 'ผู้แก้ไข'
      ],
      buildRows: (sts) => {
        return sts.filter(s => ['สละสิทธิ์', 'ไม่มารายงานตัว', 'ลาออก', 'พ้นสภาพ'].includes(s.current_status || ''))
          .map((s, idx) => [
            String(idx + 1),
            s.student_id, 
            s.full_name_th, 
            s.gender || '-', 
            s.nationality || '-',
            s.degree_level || '-', 
            s.program_type || '-', 
            s.major_name || '-', 
            s.advisor_name || '-', 
            s.advisor_department || '-',
            s.admit_semester || '-',
            String(s.admit_year || '-'),
            s.expected_grad_semester || '-',
            String(s.expected_grad_year || '-'),
            s.current_status || '-',
            (s.updated_at ? formatDate(s.updated_at) : (s.created_at ? formatDate(s.created_at) : '-')),
            s.updated_by || s.created_by || '-'
          ]);
      },
    },
    {
      name: '4. ความก้าวหน้า (Progress Pivot)',
      color: 'bg-purple-500',
      headers: [
        'ลำดับ', 'รหัสนิสิต', 'ชื่อ-สกุล', 'ระดับ', 'อาจารย์', 
        ...MILESTONES.flatMap(m => [`${m} สถานะ`, `${m} วันที่`]),
        'แก้ไขล่าสุด', 'ผู้แก้ไข'
      ],
      buildRows: (sts, _, prog) => {
        return sts.filter(s => !s.is_deleted).map((s, idx) => {
          const sp = prog.filter(p => p.student_id === s.student_id);
          const milestoneData = MILESTONES.flatMap(m => {
            const f = sp.find(p => p.milestone_type === m);
            return [f?.status || '-', f?.exam_date || '-'];
          });
          
          // Find latest update among student and their progress
          let lastUpdate = s.updated_at || s.created_at;
          let lastUser = s.updated_by || s.created_by;
          
          if (sp.length > 0) {
             // Simple check: if progress is newer? (Requires timestamp comparison, but for now just show Student's update or "-" if user prefers)
             // User asked for "Last Update" in the table.
             // Since Pivot combines multiple rows, usually we take the latest.
             // But simpler to just show Student's update info for the row context.
             // Or I can leave it as Student's update.
          }

          return [
            String(idx + 1),
            s.student_id, 
            s.full_name_th, 
            s.degree_level || '-', 
            s.advisor_name || '-', 
            ...milestoneData,
            (s.updated_at ? formatDate(s.updated_at) : (s.created_at ? formatDate(s.created_at) : '-')),
            s.updated_by || s.created_by || '-'
          ];
        });
      },
    },
    {
      name: '5. สรุปจบตามปี (Summary by Year)',
      color: 'bg-amber-500',
      headers: ['ปีเข้าศึกษา', 'ทั้งหมด', 'กำลังศึกษา', 'สำเร็จ', 'สละสิทธิ์/ออก', '% สำเร็จ', 'ข้อมูลล่าสุด', 'ผู้แก้ไขล่าสุด'],
      buildRows: (sts) => {
        const yearMap: Record<number, { total: number; active: number; grad: number; out: number; dates: number[]; users: Set<string> }> = {};
        sts.filter(s => !s.is_deleted).forEach(s => {
          const y = s.admit_year || 0;
          if (!yearMap[y]) yearMap[y] = { total: 0, active: 0, grad: 0, out: 0, dates: [], users: new Set() };
          
          yearMap[y].total++;
          if (s.current_status === 'สำเร็จ') yearMap[y].grad++;
          else if (['สละสิทธิ์', 'ไม่มารายงานตัว', 'ลาออก', 'พ้นสภาพ'].includes(s.current_status || '')) yearMap[y].out++;
          else yearMap[y].active++;
          
          const time = s.updated_at?.seconds * 1000 || s.created_at?.seconds * 1000 || new Date(s.updated_at || s.created_at || 0).getTime();
          if (time) yearMap[y].dates.push(time);
          if (s.updated_by || s.created_by) yearMap[y].users.add(s.updated_by || s.created_by || '');
        });
        
        return Object.entries(yearMap).sort(([a], [b]) => Number(a) - Number(b)).map(([y, d]) => {
          const maxDate = Math.max(...d.dates);
          const latestDate = maxDate > 0 ? new Date(maxDate).toLocaleString('th-TH') : '-';
          const users = Array.from(d.users).filter(Boolean).slice(0, 2).join(', ') + (d.users.size > 2 ? '...' : '');

          return [
             y, 
             String(d.total), 
             String(d.active), 
             String(d.grad), 
             String(d.out), 
             d.total > 0 ? `${Math.round(d.grad * 100 / d.total)}%` : '-',
             latestDate,
             users
          ];
        });
      },
    },
    {
      name: '6. สรุปอาจารย์ (Summary by Advisor)',
      color: 'bg-teal-500',
      headers: ['อาจารย์ที่ปรึกษา', 'นิสิตทั้งหมด', 'กำลังศึกษา', 'สำเร็จ', 'ออก', 'รายชื่อ', 'ข้อมูลล่าสุด'],
      buildRows: (sts) => {
        const advisorMap: Record<string, GraduateStudent[]> = {};
        sts.filter(s => !s.is_deleted).forEach(s => {
          const a = s.advisor_name || 'ไม่ระบุ';
          if (!advisorMap[a]) advisorMap[a] = [];
          advisorMap[a].push(s);
        });
        return Object.entries(advisorMap).sort(([, a], [, b]) => b.length - a.length).map(([name, list]) => {
          const active = list.filter(s => s.current_status === 'กำลังศึกษา').length;
          const grad = list.filter(s => s.current_status === 'สำเร็จ').length;
          const out = list.length - active - grad;
          const names = list.slice(0, 3).map(s => s.full_name_th?.split(' ').slice(-1)[0] || '').join(', ') + (list.length > 3 ? ` +${list.length - 3}` : '');
          
          // Latest Update
          const dates = list.map(s => s.updated_at?.seconds * 1000 || s.created_at?.seconds * 1000 || new Date(s.updated_at || s.created_at || 0).getTime()).filter(t => t > 0);
          const maxDate = dates.length > 0 ? Math.max(...dates) : 0;
          const latestStr = maxDate > 0 ? new Date(maxDate).toLocaleString('th-TH') : '-';

          return [name, String(list.length), String(active), String(grad), String(out), names, latestStr];
        });
      },
    },
  ], []);

  const currentSheetData = useMemo(() => {
    const config = sheetConfigs[activeSheet];
    if (!config) return [];
    return config.buildRows(students, publications, progressItems);
  }, [activeSheet, students, publications, progressItems, sheetConfigs]);

  const filteredSheetData = useMemo(() => {
    if (!sheetSearch.trim()) return currentSheetData;
    const searchLower = sheetSearch.toLowerCase();
    return currentSheetData.filter(row => row.some(cell => cell.toLowerCase().includes(searchLower)));
  }, [currentSheetData, sheetSearch]);

  const totalSheetPages = Math.max(1, Math.ceil(filteredSheetData.length / ROWS_PER_PAGE));
  const paginatedSheetData = filteredSheetData.slice((sheetPage - 1) * ROWS_PER_PAGE, sheetPage * ROWS_PER_PAGE);

  useEffect(() => { setSheetPage(1); setSheetSearch(""); }, [activeSheet]);

  // ==================== KPI ====================
  const kpi = useMemo(() => {
    const active = students.filter(s => !s.is_deleted);
    return {
      total: active.length,
      studying: active.filter(s => s.current_status === 'กำลังศึกษา').length,
      graduated: active.filter(s => s.current_status === 'สำเร็จ').length,
      dropped: active.filter(s => ['สละสิทธิ์', 'ไม่มารายงานตัว', 'ลาออก', 'พ้นสภาพ'].includes(s.current_status || '')).length,
      pubs: publications.length,
    };
  }, [students, publications]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto text-purple-500 mb-3" size={36} />
          <p className="text-gray-500 font-medium">กำลังโหลด Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 font-sarabun max-w-[1400px]">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Link href="/student" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <div className="bg-purple-600 p-2 rounded-lg shadow-sm">
                <LayoutDashboard size={24} className="text-white" />
              </div>
              Academic Dashboard
            </h1>
            <p className="text-gray-500 text-sm mt-1">ภาพรวมข้อมูลนิสิตบัณฑิตศึกษา</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchData} className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition-all">
            <RefreshCw size={14} /> รีเฟรช
          </button>
          <button onClick={() => exportFullReport(students, publications, progressItems)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
            <Download size={16} /> ส่งออก 6 Sheets
          </button>
          <Link href="/student/backup" className="flex items-center gap-2 bg-white border border-gray-300 hover:border-amber-400 hover:bg-amber-50 text-gray-700 px-3 py-2 rounded-lg text-sm transition-all">
            <Archive size={14} className="text-amber-600" /> Backup
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'นิสิตทั้งหมด', value: kpi.total, color: 'text-gray-800', bg: 'bg-gray-50', border: 'border-gray-200' },
          { label: 'กำลังศึกษา', value: kpi.studying, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
          { label: 'สำเร็จ', value: kpi.graduated, color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
          { label: 'สละสิทธิ์/ออก', value: kpi.dropped, color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
          { label: 'ผลงานตีพิมพ์', value: kpi.pubs, color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
        ].map((card, i) => (
          <div key={i} className={`${card.bg} p-4 rounded-xl border ${card.border} shadow-sm`}>
            <p className="text-xs text-gray-500 font-medium">{card.label}</p>
            <p className={`text-3xl font-bold mt-1 ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Chart 1: Status Donut */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-700 text-sm mb-4">🥧 สถานะนิสิต</h3>
          <div className="h-64"><Doughnut data={statusDonut} options={{ ...chartOptions, cutout: '55%' }} /></div>
        </div>

        {/* Chart 2: Degree by Major */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-700 text-sm mb-4">📊 จำนวนนิสิตแยกสาขา + ระดับ</h3>
          <div className="h-64"><Bar data={degreeByMajor} options={{ ...chartOptions, scales: { x: { ticks: { font: { size: 10 } } } } }} /></div>
        </div>

        {/* Chart 3: Year Trend */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-700 text-sm mb-4">📈 แนวโน้มรับเข้า/จบ ตามปีการศึกษา</h3>
          <div className="h-64"><Line data={yearTrend} options={chartOptions} /></div>
        </div>

        {/* Chart 4: Milestones Stacked */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-700 text-sm mb-4">📊 Milestones — ผ่าน/ไม่ผ่าน</h3>
          <div className="h-64"><Bar data={milestoneData} options={{ ...chartOptions, scales: { x: { stacked: true }, y: { stacked: true } } }} /></div>
        </div>

        {/* Chart 5: Top Advisors */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-700 text-sm mb-4">📊 Top 10 อาจารย์ที่ปรึกษา</h3>
          <div className="h-64"><Bar data={advisorData} options={{ ...chartOptions, indexAxis: 'y' as const }} /></div>
        </div>

        {/* Chart 6: Publication Levels */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-700 text-sm mb-4">🥧 ระดับการเผยแพร่ผลงาน</h3>
          <div className="h-64"><Pie data={pubLevelData} options={chartOptions} /></div>
        </div>
      </div>

      {/* 6-Sheet Data Preview */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Sheet Tabs */}
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {sheetConfigs.map((config, i) => (
            <button
              key={i}
              onClick={() => setActiveSheet(i)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
                activeSheet === i 
                  ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${config.color}`} />
              {config.name}
              <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full font-bold">
                {currentSheetData.length === 0 && activeSheet !== i ? '-' : (activeSheet === i ? filteredSheetData.length : '')}
              </span>
            </button>
          ))}
        </div>

        {/* Search + Pagination Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="ค้นหาในตาราง..."
              value={sheetSearch}
              onChange={(e) => { setSheetSearch(e.target.value); setSheetPage(1); }}
              className="pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-64"
            />
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span>{filteredSheetData.length} รายการ</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setSheetPage(p => Math.max(1, p - 1))} disabled={sheetPage <= 1} className="p-1 rounded hover:bg-gray-200 disabled:opacity-30">
                <ChevronLeft size={16} />
              </button>
              <span className="font-medium px-2">{sheetPage}/{totalSheetPages}</span>
              <button onClick={() => setSheetPage(p => Math.min(totalSheetPages, p + 1))} disabled={sheetPage >= totalSheetPages} className="p-1 rounded hover:bg-gray-200 disabled:opacity-30">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto max-h-[700px]">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                {sheetConfigs[activeSheet]?.headers.map((h, i) => (
                  <th key={i} className={`px-3 py-2.5 text-xs font-bold text-gray-600 uppercase whitespace-nowrap border-b border-gray-200 ${i === 0 ? 'sticky left-0 bg-gray-50 z-20' : ''}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedSheetData.length === 0 ? (
                <tr><td colSpan={sheetConfigs[activeSheet]?.headers.length} className="px-4 py-12 text-center text-gray-400 font-medium">ไม่มีข้อมูล</td></tr>
              ) : (
                paginatedSheetData.map((row, ri) => (
                  <tr key={ri} className="hover:bg-gray-50/50 transition-colors">
                    {row.map((cell, ci) => (
                      <td key={ci} className={`px-3 py-2 whitespace-nowrap text-gray-700 ${ci === 0 ? 'sticky left-0 bg-white font-mono text-xs font-bold z-10' : ''} ${cell === '✓' ? 'text-green-600 font-bold text-center' : ''} ${cell === '–' ? 'text-gray-300 text-center' : ''}`}>
                        {ci === 1 && row[0]?.match(/^\d/) ? (
                          <div>
                            <div className="font-medium text-gray-800">{cell}</div>
                          </div>
                        ) : (
                          <span className="text-xs">{cell}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
