"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Archive, Download, Upload, Trash2, GraduationCap, FileSpreadsheet, BarChart3, AlertTriangle, RefreshCw, Shield, Users, FileJson } from "lucide-react";
import { StudentService } from "@/services/studentService";
import { AcademicService } from "@/services/academicService";
import { AdvisorService } from "@/services/advisorService";
import { GraduateStudent } from "@/types/student";
import { StudentPublication, StudentProgress } from "@/types/academic";
import { Advisor } from "@/types/advisor";
import { exportStudentsToExcel, exportFullReport } from "@/utils/studentExport";
import { parseMultiSheetExcel, deduplicateStudents, deduplicatePublications, deduplicateProgress, deduplicateAdvisors } from "@/utils/studentImport";
import { useAuth } from "@/contexts/AuthContext";

const BACKUP_VERSION = "1.0";

interface BackupJSON {
  version: string;
  timestamp: string;
  metadata: {
    exported_by: string;
    student_count: number;
    publication_count: number;
    progress_count: number;
    advisor_count: number;
  };
  data: {
    students: GraduateStudent[];
    publications: StudentPublication[];
    progress: StudentProgress[];
    advisors: Advisor[];
  };
}

export default function BackupPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.email === "nipon.w@ku.th";

  const [students, setStudents] = useState<GraduateStudent[]>([]);
  const [publications, setPublications] = useState<StudentPublication[]>([]);
  const [progressItems, setProgressItems] = useState<StudentProgress[]>([]);
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [backupFormat, setBackupFormat] = useState<'3sheets' | '6sheets' | 'json'>('json');
  const [backupProgress, setBackupProgress] = useState<{ phase: string; percent: number } | null>(null);
  const [restoreProgress, setRestoreProgress] = useState<{ phase: string; percent: number } | null>(null);
  const [purgeTarget, setPurgeTarget] = useState<string | null>(null);
  const [clearBeforeRestore, setClearBeforeRestore] = useState(false);
  const [restoreSummary, setRestoreSummary] = useState<string | null>(null);

  useEffect(() => { fetchCounts(); }, []);

  const fetchCounts = async () => {
    try {
      setLoading(true);
      const [s, p, pr, a] = await Promise.all([
        StudentService.getAllStudents(),
        AcademicService.getAllPublications(),
        AcademicService.getAllProgress(),
        AdvisorService.getAllAdvisors(),
      ]);
      setStudents(s);
      setPublications(p);
      setProgressItems(pr);
      setAdvisors(a);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  // ==================== BACKUP ====================
  const handleBackup = async () => {
    try {
      setBackupProgress({ phase: "กำลังรวบรวมข้อมูล...", percent: 10 });
      await new Promise(r => setTimeout(r, 300));
      setBackupProgress({ phase: "กำลังสร้างไฟล์...", percent: 40 });

      if (backupFormat === 'json') {
        const backup: BackupJSON = {
          version: BACKUP_VERSION,
          timestamp: new Date().toISOString(),
          metadata: {
            exported_by: user?.email || 'unknown',
            student_count: students.length,
            publication_count: publications.length,
            progress_count: progressItems.length,
            advisor_count: advisors.length,
          },
          data: { students, publications, progress: progressItems, advisors }
        };
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const dateStr = new Date().toISOString().slice(0, 16).replace(/[T:]/g, '-');
        a.href = url;
        a.download = `backup_academic_${dateStr}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (backupFormat === '6sheets') {
        exportFullReport(students, publications, progressItems, advisors);
      } else {
        exportStudentsToExcel(students, publications, progressItems, advisors);
      }

      setBackupProgress({ phase: "เสร็จสิ้น!", percent: 100 });
      await new Promise(r => setTimeout(r, 1000));
    } catch (error) {
      console.error("Backup failed:", error);
      alert("การสำรองข้อมูลล้มเหลว");
    } finally {
      setBackupProgress(null);
    }
  };

  // ==================== RESTORE ====================
  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user?.email) { alert("กรุณาเข้าสู่ระบบ"); return; }
    if (!isSuperAdmin) { alert("เฉพาะ Superadmin เท่านั้น"); return; }
    const file = e.target.files?.[0];
    if (!file) return;

    const isJSON = file.name.endsWith('.json');
    if (!confirm(`⚠️ กู้คืนข้อมูลจากไฟล์ "${file.name}"?\n${clearBeforeRestore ? '⚠️ ข้อมูลเก่าจะถูกลบก่อนนำเข้า!' : '✅ ระบบจะตรวจซ้ำ: ข้อมูลซ้ำจะถูกอัปเดต, ข้อมูลใหม่จะเพิ่ม'}`)) {
      e.target.value = "";
      return;
    }

    try {
      setLoading(true);
      setRestoreSummary(null);
      setRestoreProgress({ phase: "กำลังอ่านไฟล์...", percent: 10 });

      if (clearBeforeRestore) {
        setRestoreProgress({ phase: "กำลังลบข้อมูลเก่า...", percent: 15 });
        await StudentService.deleteAllStudents(user.email);
        await AcademicService.deleteAllPublications(user.email);
        await AcademicService.deleteAllProgress(user.email);
      }

      let incomingStudents: GraduateStudent[] = [];
      let incomingPubs: StudentPublication[] = [];
      let incomingProgress: StudentProgress[] = [];
      let incomingAdvisors: Advisor[] = [];

      if (isJSON) {
        setRestoreProgress({ phase: "กำลังถอดรหัส JSON...", percent: 20 });
        const text = await file.text();
        const backup: BackupJSON = JSON.parse(text);
        if (!backup.version || !backup.data) {
          alert("ไฟล์ JSON ไม่ถูกต้อง — ไม่พบ version หรือ data");
          return;
        }
        incomingStudents = backup.data.students || [];
        incomingPubs = backup.data.publications || [];
        incomingProgress = backup.data.progress || [];
        incomingAdvisors = backup.data.advisors || [];
      } else {
        setRestoreProgress({ phase: "กำลังอ่าน Excel...", percent: 20 });
        const result = await parseMultiSheetExcel(file, user.email);
        if (!result.success) {
          alert("ไม่สามารถอ่านไฟล์: " + result.errors.join("\n"));
          return;
        }
        incomingStudents = result.students || [];
        incomingPubs = result.publications || [];
        incomingProgress = result.progress || [];
        incomingAdvisors = result.advisors || [];
      }

      // Dedup against existing data
      setRestoreProgress({ phase: "กำลังตรวจสอบข้อมูลซ้ำ...", percent: 35 });
      const [currentS, currentP, currentPR, currentA] = clearBeforeRestore
        ? [[], [], [], []]
        : await Promise.all([
            StudentService.getAllStudents(),
            AcademicService.getAllPublications(),
            AcademicService.getAllProgress(),
            AdvisorService.getAllAdvisors(),
          ]);

      const dedupS = deduplicateStudents(incomingStudents, currentS);
      const dedupP = deduplicatePublications(incomingPubs, currentP);
      const dedupPR = deduplicateProgress(incomingProgress, currentPR);
      const dedupA = deduplicateAdvisors(incomingAdvisors, currentA);

      let totalOps = 0;

      // Students: inserts + updates
      if (dedupS.inserts.length > 0) {
        setRestoreProgress({ phase: `Students: เพิ่ม ${dedupS.inserts.length} รายการ...`, percent: 45 });
        await StudentService.addStudentBatch(dedupS.inserts, user.email);
        totalOps += dedupS.inserts.length;
      }
      if (dedupS.updates.length > 0) {
        setRestoreProgress({ phase: `Students: อัปเดต ${dedupS.updates.length} รายการ...`, percent: 50 });
        for (const u of dedupS.updates) {
          if (u.merged.id) await StudentService.updateStudent(u.merged.id, u.merged, user.email);
        }
        totalOps += dedupS.updates.length;
      }

      // Publications: inserts only (skip duplicates)
      if (dedupP.inserts.length > 0) {
        setRestoreProgress({ phase: `Publications: เพิ่ม ${dedupP.inserts.length} รายการ...`, percent: 60 });
        await AcademicService.addPublicationBatch(dedupP.inserts, user.email);
        totalOps += dedupP.inserts.length;
      }

      // Progress: inserts + updates
      if (dedupPR.inserts.length > 0) {
        setRestoreProgress({ phase: `Progress: เพิ่ม ${dedupPR.inserts.length} รายการ...`, percent: 70 });
        await AcademicService.addProgressBatch(dedupPR.inserts, user.email);
        totalOps += dedupPR.inserts.length;
      }

      // Advisors: inserts + updates
      if (dedupA.inserts.length > 0) {
        setRestoreProgress({ phase: `Advisors: เพิ่ม ${dedupA.inserts.length} รายการ...`, percent: 80 });
        await AdvisorService.addAdvisorBatch(dedupA.inserts, user.email);
        totalOps += dedupA.inserts.length;
      }
      if (dedupA.updates.length > 0) {
        setRestoreProgress({ phase: `Advisors: อัปเดต ${dedupA.updates.length} รายการ...`, percent: 85 });
        for (const u of dedupA.updates) {
          if (u.merged.id) await AdvisorService.updateAdvisor(u.merged.id, u.merged, user.email);
        }
        totalOps += dedupA.updates.length;
      }

      setRestoreProgress({ phase: "เสร็จสิ้น!", percent: 100 });
      await new Promise(r => setTimeout(r, 800));

      const summaryParts = [
        `✅ นำเข้าสำเร็จ — ${totalOps} รายการ`,
        `   Students: เพิ่ม ${dedupS.summary.newCount}, อัปเดต ${dedupS.summary.updateCount}`,
        `   Publications: เพิ่ม ${dedupP.summary.newCount}, ข้าม ${dedupP.summary.skipCount}`,
        `   Progress: เพิ่ม ${dedupPR.summary.newCount}, อัปเดต ${dedupPR.summary.updateCount}`,
        `   Advisors: เพิ่ม ${dedupA.summary.newCount}, อัปเดต ${dedupA.summary.updateCount}`,
      ];
      setRestoreSummary(summaryParts.join('\n'));
      fetchCounts();
    } catch (error) {
      console.error("Restore failed:", error);
      alert("การกู้คืนล้มเหลว: " + String(error));
    } finally {
      setLoading(false);
      setRestoreProgress(null);
      e.target.value = "";
    }
  };

  // ==================== PURGE ====================
  const handlePurge = async (collection: 'students' | 'publications' | 'progress' | 'advisors') => {
    if (!user?.email || !isSuperAdmin) { alert("เฉพาะ Superadmin เท่านั้น"); return; }
    
    const names: Record<string, string> = { students: "ข้อมูลนิสิต", publications: "ผลงานตีพิมพ์", progress: "ความก้าวหน้า", advisors: "อาจารย์ที่ปรึกษา" };
    const counts: Record<string, number> = { students: students.length, publications: publications.length, progress: progressItems.length, advisors: advisors.length };
    
    if (!confirm(`🗑️ ลบ${names[collection]}ทั้งหมด (${counts[collection]} รายการ) อย่างถาวร?\n\n⚠️ การดำเนินการนี้ไม่สามารถย้อนกลับได้!`)) return;
    if (!confirm(`❗ ยืนยันอีกครั้ง — ลบ ${counts[collection]} ${names[collection]} จริงๆ?`)) return;

    try {
      setPurgeTarget(collection);
      if (collection === 'students') {
        await StudentService.deleteAllStudents(user.email);
      } else if (collection === 'publications') {
        await AcademicService.deleteAllPublications(user.email);
      } else if (collection === 'progress') {
        await AcademicService.deleteAllProgress(user.email);
      } else if (collection === 'advisors') {
        // Delete advisors one by one (soft delete)
        const allAdvisors = await AdvisorService.getAllAdvisors();
        for (const a of allAdvisors) {
          if (a.id) await AdvisorService.deleteAdvisor(a.id, user.email);
        }
      }
      alert(`ลบ${names[collection]}สำเร็จ!`);
      fetchCounts();
    } catch (error) {
      console.error("Purge failed:", error);
      alert("ลบข้อมูลล้มเหลว");
    } finally {
      setPurgeTarget(null);
    }
  };

  const ProgressBar = ({ data }: { data: { phase: string; percent: number } }) => (
    <div className="mt-4 space-y-2">
      <div className="flex justify-between text-xs text-gray-600">
        <span className="font-medium">{data.phase}</span>
        <span className="font-bold">{data.percent}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-blue-500 to-blue-600"
          style={{ width: `${data.percent}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-6 font-sarabun max-w-4xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Link href="/student" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <div className="bg-amber-500 p-2 rounded-lg shadow-sm">
                <Archive size={24} className="text-white" />
              </div>
              Backup & Restore
            </h1>
            <p className="text-gray-500 text-sm mt-1">สำรองและกู้คืนข้อมูลนิสิต — Academic Module</p>
          </div>
        </div>
        <button 
          onClick={fetchCounts}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200 rounded-lg text-sm transition-all"
        >
          <RefreshCw className={loading ? "animate-spin" : ""} size={16} /> รีเฟรช
        </button>
      </div>

      {/* Data Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-green-50 rounded-lg"><GraduationCap size={20} className="text-green-600" /></div>
            <div>
              <p className="text-xs text-gray-500 font-medium">ข้อมูลนิสิต</p>
              <p className="text-2xl font-bold text-gray-800">{loading ? '...' : students.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 rounded-lg"><FileSpreadsheet size={20} className="text-blue-600" /></div>
            <div>
              <p className="text-xs text-gray-500 font-medium">ผลงานตีพิมพ์</p>
              <p className="text-2xl font-bold text-gray-800">{loading ? '...' : publications.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-50 rounded-lg"><BarChart3 size={20} className="text-purple-600" /></div>
            <div>
              <p className="text-xs text-gray-500 font-medium">ความก้าวหน้า</p>
              <p className="text-2xl font-bold text-gray-800">{loading ? '...' : progressItems.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 rounded-lg"><Users size={20} className="text-amber-600" /></div>
            <div>
              <p className="text-xs text-gray-500 font-medium">อาจารย์ที่ปรึกษา</p>
              <p className="text-2xl font-bold text-gray-800">{loading ? '...' : advisors.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* === Backup Section === */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
            <h2 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
              <Download size={20} className="text-blue-600" />
              สร้างไฟล์สำรอง (Backup)
            </h2>
            <p className="text-sm text-gray-500 mt-1">ส่งออกข้อมูลทั้งหมดรวมอาจารย์ที่ปรึกษา</p>
          </div>
          <div className="p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="format" checked={backupFormat === 'json'} onChange={() => setBackupFormat('json')} className="accent-blue-600" />
                <div>
                  <span className="font-medium text-gray-700 text-sm flex items-center gap-1"><FileJson size={14} /> JSON System Backup</span>
                  <p className="text-xs text-gray-400">ข้อมูลสมบูรณ์ทุก collection (กู้คืนได้ 100%)</p>
                </div>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="format" checked={backupFormat === '3sheets'} onChange={() => setBackupFormat('3sheets')} className="accent-blue-600" />
                <div>
                  <span className="font-medium text-gray-700 text-sm">Excel 4 Sheets (ข้อมูลดิบ)</span>
                  <p className="text-xs text-gray-400">Students, Publications, Progress, Advisors</p>
                </div>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="format" checked={backupFormat === '6sheets'} onChange={() => setBackupFormat('6sheets')} className="accent-blue-600" />
                <div>
                  <span className="font-medium text-gray-700 text-sm">Excel 7 Sheets (ฉบับสมบูรณ์)</span>
                  <p className="text-xs text-gray-400">รายงาน + สรุป + Pivot + Advisors</p>
                </div>
              </label>
            </div>
            
            <button
              onClick={handleBackup}
              disabled={loading || students.length === 0 || !!backupProgress}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg transition-colors shadow-sm font-medium text-sm"
            >
              <Download size={16} />
              สร้าง Backup {backupFormat === 'json' ? '(.json)' : '(.xlsx)'}
            </button>

            {backupProgress && <ProgressBar data={backupProgress} />}
          </div>
        </div>

        {/* === Restore Section === */}
        <div className={`bg-white rounded-xl border shadow-sm overflow-hidden ${isSuperAdmin ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
          <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-white">
            <h2 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
              <Upload size={20} className="text-amber-600" />
              กู้คืนข้อมูล (Restore)
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <Shield size={14} className="text-amber-500" />
              <p className="text-sm text-amber-600 font-medium">เฉพาะ Superadmin — รองรับ .json และ .xlsx</p>
            </div>
          </div>
          <div className="p-5">
            {isSuperAdmin ? (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm text-blue-700">
                  <strong>🔍 ระบบตรวจซ้ำอัตโนมัติ:</strong>
                  <ul className="mt-1 ml-4 list-disc text-xs space-y-0.5">
                    <li><strong>นิสิต</strong> — ซ้ำ student_id → อัปเดตข้อมูล</li>
                    <li><strong>ผลงาน</strong> — ซ้ำ student_id + ชื่อบทความ → ข้าม</li>
                    <li><strong>ความก้าวหน้า</strong> — ซ้ำ student_id + milestone → อัปเดตสถานะ</li>
                    <li><strong>อาจารย์</strong> — ซ้ำ advisor_id หรือ ชื่อ → อัปเดต</li>
                  </ul>
                </div>

                <label className="flex items-center gap-2 mb-4 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={clearBeforeRestore} 
                    onChange={(e) => setClearBeforeRestore(e.target.checked)}
                    className="accent-amber-600 w-4 h-4"
                  />
                  <span className="text-sm text-gray-700 font-medium">ลบข้อมูลเก่าทั้งหมดก่อน Restore</span>
                  {clearBeforeRestore && <span className="text-xs text-red-500 font-bold">⚠️ ข้อมูลเก่าจะถูกลบ!</span>}
                </label>
                
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-all group">
                  <div className="flex flex-col items-center gap-2 text-gray-500 group-hover:text-amber-600 transition-colors">
                    <Upload size={28} />
                    <span className="text-sm font-medium">เลือกไฟล์ JSON / Excel</span>
                    <span className="text-xs text-gray-400">.json, .xlsx, .xls</span>
                  </div>
                  <input 
                    type="file" 
                    accept=".json,.xlsx,.xls"
                    onChange={handleRestore}
                    className="hidden"
                    disabled={!isSuperAdmin || loading}
                  />
                </label>

                {restoreProgress && <ProgressBar data={restoreProgress} />}

                {restoreSummary && (
                  <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                    <pre className="text-xs text-green-800 whitespace-pre-wrap font-mono">{restoreSummary}</pre>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Shield size={40} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">ต้องเข้าสู่ระบบด้วยบัญชี Superadmin</p>
              </div>
            )}
          </div>
        </div>

        {/* === Purge Section === */}
        <div className={`bg-white rounded-xl border shadow-sm overflow-hidden ${isSuperAdmin ? 'border-red-200' : 'border-gray-100 opacity-60'}`}>
          <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-red-50 to-white">
            <h2 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
              <Trash2 size={20} className="text-red-500" />
              ลบข้อมูลทดสอบ (Purge Test Data)
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <AlertTriangle size={14} className="text-red-500" />
              <p className="text-sm text-red-500 font-medium">เฉพาะ Superadmin — ลบข้อมูลจริงอย่างถาวร</p>
            </div>
          </div>
          <div className="p-5">
            {isSuperAdmin ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(['students', 'publications', 'progress', 'advisors'] as const).map((collection) => {
                  const icons: Record<string, any> = { students: GraduationCap, publications: FileSpreadsheet, progress: BarChart3, advisors: Users };
                  const labels: Record<string, string> = { students: 'Students', publications: 'Publications', progress: 'Progress', advisors: 'Advisors' };
                  const counts: Record<string, number> = { students: students.length, publications: publications.length, progress: progressItems.length, advisors: advisors.length };
                  const Icon = icons[collection];
                  return (
                    <button
                      key={collection}
                      onClick={() => handlePurge(collection)}
                      disabled={loading || counts[collection] === 0 || !!purgeTarget}
                      className="flex flex-col items-center gap-2 bg-white border-2 border-red-200 hover:border-red-400 hover:bg-red-50 text-red-600 px-4 py-3 rounded-lg transition-all disabled:opacity-40 text-sm font-medium"
                    >
                      {purgeTarget === collection ? <RefreshCw size={18} className="animate-spin" /> : <Icon size={18} />}
                      <span>ลบ {labels[collection]}</span>
                      <span className="text-xs text-red-400">({counts[collection]})</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Shield size={40} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">ต้องเข้าสู่ระบบด้วยบัญชี Superadmin</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
