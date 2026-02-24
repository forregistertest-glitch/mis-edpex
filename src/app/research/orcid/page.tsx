"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Search, RefreshCw, Loader2, Globe, CheckCircle2, 
  User, BookOpen, Save, History, ChevronDown, Database, 
  FileClock, Building2, PlayCircle, Download, Info, ChevronUp
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { OrcidService } from "@/services/orcidService";
import { ResearchService } from "@/services/researchService";
import { OrcidSyncLogService, OrcidSyncLog } from "@/services/orcidSyncLogService";
import * as XLSX from 'xlsx';

export default function OrcidSearchPage() {
  const { user, userRole, loading } = useAuth();
  const router = useRouter();

  // Redirect if not admin (and not loading)
  useEffect(() => {
    if (!loading && userRole !== 'admin') {
      alert("คุณไม่มีสิทธิ์เข้าถึงหน้านี้ เฉพาะผู้ดูแลระบบเท่านั้น");
      router.push('/research');
    }
  }, [userRole, loading, router]);

  // -- View Mode State --
  const [orcidAction, setOrcidAction] = useState<"search" | "import">("search");
  
  // -- ORCiD Search State --
  const [searchQuery, setSearchQuery] = useState("");
  const [orcidScope, setOrcidScope] = useState("vet");
  const [orcidYear, setOrcidYear] = useState("all");
  const [isSearching, setIsSearching] = useState(false);
  const [orcidResults, setOrcidResults] = useState<any[]>([]); // To store current "authors" chunk
  const [orcidTotal, setOrcidTotal] = useState(0); // This will store the total number of members found
  const [authorWorks, setAuthorWorks] = useState<any[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(25);
  
  // -- Progress Modal State --
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressLogs, setProgressLogs] = useState<string[]>([]);
  const [progressAction, setProgressAction] = useState<"search" | "import">("search");
  const modalScrollRef = useRef<HTMLDivElement>(null);

  // -- History Modal State --
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyLogs, setHistoryLogs] = useState<OrcidSyncLog[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // -- Scroll State --
  const [showFloatingTop, setShowFloatingTop] = useState(false);
  useEffect(() => {
    const handleScroll = () => setShowFloatingTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (modalScrollRef.current) {
      modalScrollRef.current.scrollTop = modalScrollRef.current.scrollHeight;
    }
  }, [progressLogs]);

  // --- Logic: Search ---
  const handleOrcidSearch = async (isAppend: boolean = false) => {
    if (!isAppend) {
      setProgressAction('search');
      setIsSearching(true);
      setShowProgressModal(true);
      setProgressLogs([
        'เริ่มต้นกระบวนการสืบค้นข้อมูลจาก ORCiD...',
        'กำลังเชื่อมต่อฐานข้อมูลในระบบ (Database)...'
      ]);
      setOrcidResults([]);
      setAuthorWorks([]);
    } else {
      setIsLoadingMore(true);
    }

    const currentOffset = isAppend ? orcidResults.length : 0;

    try {
      // 1. ดึงข้อมูลจาก Database ปัจจุบันมาเตรียมเปรียบเทียบ
      const localDbRecords = await ResearchService.getAllResearch();
      
      if (!isAppend) {
        setProgressLogs(prev => [...prev, `✅ โหลดข้อมูลในระบบสำเร็จ (${localDbRecords.length} รายการ)`]);
        setProgressLogs(prev => [...prev, 'กำลังร้องขอข้อมูลชุดเป้าหมายจาก ORCiD API (Expanded Search)...']);
      }

      // 2. สืบค้นรายชื่อผู้แต่ง/ผู้ร่วมงาน (Records)
      const { results: batchAuthors, numFound } = await OrcidService.searchPerson(searchQuery, orcidScope, currentOffset, 25);
      
      setOrcidTotal(numFound);
      if (isAppend) {
        setOrcidResults(prev => [...prev, ...batchAuthors]);
      } else {
        setOrcidResults(batchAuthors);
      }

      if (batchAuthors.length === 0) {
        if (!isAppend) {
          setProgressLogs(prev => [...prev, '❓ ไม่พบรายชื่อที่ตรงตามเงื่อนไข (Affiliation Search)']);
          setTimeout(() => setShowProgressModal(false), 2000);
        }
        setIsSearching(false);
        setIsLoadingMore(false);
        return;
      }

      if (!isAppend) {
        setProgressLogs(prev => [...prev, `✅ ตรวจพบความเกี่ยวข้องกับสังกัดเป้าหมายจำนวนมาก (${numFound} รายการข้อมูล)`]);
        setProgressLogs(prev => [...prev, `⏳ กำลังรวบรวมไฟล์งานวิจัยจากชุดข้อมูลกลุ่มที่ 1...`]);
      } else {
        setProgressLogs(prev => [...prev, `🔄 กำลังขยายขอบเขตการดึงข้อมูลไปยังชุดที่ ${currentOffset + 1}...`]);
      }

      const newAggregatedWorks: any[] = [];

      // ดึงงานทีละคนใน Batch นี้
      for (const author of batchAuthors) {
        try {
          const works = await OrcidService.getWorks(author.orcidId);
          
          // กรองปี
          const filtered = orcidYear === 'all' 
            ? works 
            : works.filter(w => w.year === orcidYear);

          // จัดรูปแบบและเช็คซ้ำ
          const mapped = filtered.map(w => {
            const existing = localDbRecords.find((dbItem: any) => 
              (dbItem.scopus_eid === `ORCID:${author.orcidId}/${w.doi || w.title}`) ||
              (dbItem.doi && dbItem.doi === w.doi && w.doi !== "") ||
              (dbItem.title.toLowerCase() === w.title.toLowerCase())
            );

            return {
              ...w,
              authors: `${author.givenNames} ${author.familyNames}`,
              authorId: author.orcidId,
              status: existing ? "duplicate" : "new",
              localId: existing?.id,
              updatedAt: existing?.updated_at
            };
          });

          newAggregatedWorks.push(...mapped);
        } catch (e) {
          console.error(`Skip author ${author.orcidId}`, e);
        }
      }

      // De-duplicate within the new batch results
      const uniqueBatchWorks = newAggregatedWorks.reduce((acc: any[], current) => {
        const x = acc.find(item => (item.doi && item.doi === current.doi) || (item.title === current.title));
        if (!x) return acc.concat([current]);
        return acc;
      }, []);

      if (isAppend) {
        setAuthorWorks(prev => [...prev, ...uniqueBatchWorks]);
      } else {
        setAuthorWorks(uniqueBatchWorks);
      }

      if (!isAppend) {
        setProgressLogs(prev => [...prev, `✅ เสร็จสิ้นกระบวนการสืบค้นข้อมูล`]);
        setProgressLogs(prev => [...prev, `🎉 พบงานวิจัยรวม ${uniqueBatchWorks.length} รายการ`]);
        setDisplayLimit(25); // Reset display limit for new search
        setTimeout(() => setShowProgressModal(false), 2000);
      }

    } catch (error: any) {
      console.error(error);
      if (!isAppend) setProgressLogs(prev => [...prev, `❌ เกิดข้อผิดพลาดในการดึงข้อมูล: ${error.message}`]);
      else alert("โหลดข้อมูลเพิ่มล้มเหลว: " + error.message);
    } finally {
      setIsSearching(false);
      setIsLoadingMore(false);
    }
  };


  // --- Logic: Single Import ---
  const handleSingleImport = async (work: any) => {
    if (!user?.email) return;
    
    try {
      const newRecord = {
        title: work.title,
        year: work.year || "-",
        faculty: orcidScope === 'vet' ? "คณะสัตวแพทยศาสตร์" : "มหาวิทยาลัยเกษตรศาสตร์",
        academic_year: work.year !== "Unknown" ? (parseInt(work.year) + 543).toString() : "-",
        authors: work.authors,
        journal: work.journal || "-",
        doi: work.doi || "",
        scopus_eid: `ORCID:${work.authorId}/${work.doi || work.title}`,
        status: "active" as const,
        is_deleted: false,
        imported_from: "orcid_api" as const,
        note: `Imported from ORCiD (${work.authorId})`,
      };

      if (work.status === 'new') {
        await ResearchService.addResearch(newRecord, user.email);
        alert("นำเข้าข้อมูลงานวิจัยใหม่สำเร็จ");

        // บันทึก Log การนำเข้าเดี่ยว
        await OrcidSyncLogService.logSync({
            timestamp: new Date().toISOString(),
            user: user.email || 'unknown',
            scope: 'Single Import',
            year: work.year || '-',
            query: `ORCID: ${work.authorId}`,
            total_fetched: 1,
            new_count: 1,
            update_count: 0,
            logs: []
        });

      } else if (work.localId) {
        await ResearchService.updateResearch(work.localId, newRecord, user.email);
        alert("อัปเดตข้อมูลทับรายการเดิมสำเร็จ");

        // บันทึก Log การอัปเดตเดี่ยว
        await OrcidSyncLogService.logSync({
            timestamp: new Date().toISOString(),
            user: user.email || 'unknown',
            scope: 'Single Update',
            year: work.year || '-',
            query: `ORCID: ${work.authorId}`,
            total_fetched: 1,
            new_count: 0,
            update_count: 1,
            logs: []
        });
      }
      
      setAuthorWorks(prev => prev.map(w => 
        (w.doi === work.doi && w.title === work.title) ? { ...w, status: "duplicate", updatedAt: new Date().toISOString() } : w
      ));
    } catch (error: any) {
      alert("Import failed: " + error.message);
    }
  };

  // Logic: Bulk Import (For all fetched works)
  const handleBulkImport = async () => {
    if (authorWorks.length === 0) {
      alert("ไม่มีข้อมูลที่จะนำเข้าครับ");
      return;
    }

    setProgressAction('import');
    setIsSearching(true);
    setShowProgressModal(true);
    setProgressLogs(['⏳ เข้าสู่กระบวนการเตรียมกวาดข้อมูล ORCiD เข้า Database...']);

    try {
      const localDbRecords = await ResearchService.getAllResearch();
      let newCount = 0;
      let updateCount = 0;

      const processedRecords = authorWorks.map(work => {
        const existing = localDbRecords.find((dbItem: any) => 
          (dbItem.scopus_eid === `ORCID:${work.authorId}/${work.doi || work.title}`) ||
          (dbItem.doi && dbItem.doi === work.doi && work.doi !== "")
        );

        if (existing) updateCount++;
        else newCount++;

        return {
          id: existing?.id || undefined,
          title: work.title,
          year: work.year || "-",
          faculty: orcidScope === 'vet' ? "คณะสัตวแพทยศาสตร์" : "มหาวิทยาลัยเกษตรศาสตร์",
          academic_year: work.year !== "Unknown" ? (parseInt(work.year) + 543).toString() : "-",
          authors: work.authors,
          journal: work.journal || "-",
          doi: work.doi || "",
          scopus_eid: `ORCID:${work.authorId}/${work.doi || work.title}`,
          status: "active" as const,
          is_deleted: false,
          imported_from: "orcid_api" as const,
          note: `Imported via ORCiD Bulk (${work.authorId})`,
        };
      });

      setProgressLogs(prev => [...prev, `💾 กำลังบันทึกลงฐานข้อมูล... (นำเข้าใหม่: ${newCount}, อัปเดตทับ: ${updateCount})`]);
      await ResearchService.upsertResearchBatch(processedRecords as any, user?.email || 'system');
      
      // บันทึก Log การนำเข้าลง Firestore
      await OrcidSyncLogService.logSync({
        timestamp: new Date().toISOString(),
        user: user?.email || 'unknown',
        scope: orcidScope,
        year: orcidYear,
        query: searchQuery,
        total_fetched: processedRecords.length,
        new_count: newCount,
        update_count: updateCount,
        logs: []
      });

      setProgressLogs(prev => [...prev, `🎉 ดำเนินการอัปเดต / นำเข้า ข้อมูล ${processedRecords.length} รายการ เรียบร้อยแล้ว`]);
      setProgressLogs(prev => [...prev, `👉 (ข้อมูลถูกบันทึกประวัติการ Sync เรียบร้อยแล้ว ท่านสามารถปิดหน้าต่างนี้ได้)`]);
      
      // Update UI
      setAuthorWorks(prev => prev.map(w => ({ ...w, status: 'duplicate' })));
      
      setTimeout(() => setIsSearching(false), 2000);
    } catch (error: any) {
      setProgressLogs(prev => [...prev, `❌ เกิดข้อผิดพลาด: ${error.message}`]);
      setIsSearching(false);
    }
  };

  if (loading || userRole !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 font-sarabun">
      {/* === HEADER === */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/research" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700">
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg shadow-sm">
                <Globe size={24} className="text-white" />
              </div>
              สืบค้นข้อมูลจากระบบ ORCiD (International API)
            </h1>
          </div>
        </div>
      </div>

      {/* === SEARCH FILTER BAR (Parity with Scopus/NCBI) === */}
      <div className="bg-white rounded-t-xl rounded-b-none border border-indigo-200 border-b-0 overflow-hidden">
        <div className="p-4 bg-indigo-50/50 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex flex-1 gap-3 w-full flex-wrap">
            {/* Mode Toggles */}
            <div className="flex bg-white rounded-lg p-1 border border-indigo-200 shadow-sm mr-2">
              <button
                onClick={() => setOrcidAction('search')}
                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${orcidAction === 'search' ? 'bg-indigo-100 text-indigo-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                สืบค้น
              </button>
              <button
                onClick={() => setOrcidAction('import')}
                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${orcidAction === 'import' ? 'bg-amber-100 text-amber-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                Bulk Import
              </button>
            </div>

            <div className="relative flex-[2] min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" size={18} />
              <input
                type="text"
                placeholder="ค้นหา: Author Name, Article Title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleOrcidSearch()}
                className="w-full pl-10 pr-4 py-2 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white placeholder:text-slate-400 text-sm"
              />
            </div>

            <div className="relative w-56">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" size={18} />
              <select
                value={orcidScope}
                onChange={(e) => setOrcidScope(e.target.value)}
                className="w-full pl-10 pr-8 py-2 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm font-medium text-slate-700 appearance-none font-bold"
              >
                <option value="vet">คณะสัตวแพทยศาสตร์ (VET)</option>
                <option value="ku">มหาวิทยาลัยเกษตรศาสตร์ (KU)</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none" size={16} />
            </div>

            <div className="relative w-32">
              <select
                value={orcidYear}
                onChange={(e) => setOrcidYear(e.target.value)}
                className="w-full pl-4 pr-8 py-2 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm font-medium text-slate-700 appearance-none font-bold"
              >
                <option value="all">ทุกปี</option>
                {Array.from({ length: 11 }, (_, i) => {
                  const y = new Date().getFullYear() - i;
                  return <option key={y} value={y.toString()}>ปี {y + 543}</option>;
                })}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none" size={16} />
            </div>

            <button
              onClick={() => handleOrcidSearch()}
              disabled={isSearching}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-sm transition-all disabled:opacity-50"
            >
              <PlayCircle size={18} /> ดึงข้อมูลเพื่อแสดงผล
            </button>

            {/* Bulk Action Button (Like NCBI) */}
            {orcidAction === 'import' && (
              <button
                onClick={handleBulkImport}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-bold shadow-sm transition-colors"
              >
                <Save size={18} /> นำเข้าทั้งหมด (Bulk)
              </button>
            )}

            <button
                onClick={async () => {
                    setShowHistoryModal(true);
                    setIsLoadingHistory(true);
                    try {
                        const logs = await OrcidSyncLogService.getRecentLogs(10);
                        setHistoryLogs(logs);
                    } catch (error) {
                        alert('เกิดข้อผิดพลาดในการโหลดประวัติ');
                    } finally {
                        setIsLoadingHistory(false);
                    }
                }}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg text-sm font-bold shadow-sm transition-colors"
            >
                <History size={18} /> ประวัติ
            </button>
          </div>
        </div>
      </div>

      {/* === PRINCIPLE EXPLANATION BOX (Transparency) === */}
      <div className="bg-indigo-50 border-x border-indigo-200 p-4 border-t border-indigo-100">
        <div className="flex gap-3">
            <Info size={20} className="text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-800 leading-relaxed">
                <p className="font-bold mb-1">💡 หลักการทำงานของ ORCiD Service:</p>
                <p>เนื่องจากระบบ ORCiD ไม่รองรับการค้นหาบทความโดยระบุชื่อสังกัดโดยตรง ระบบจึงทำการสืบค้นผ่าน <span className="font-bold">"รายชื่อบุคลากร"</span> ที่ระบุสังกัดนั้นๆ แล้วจึงเข้าไปดึงบทความจากแต่ละรายชื่อมาแสดงผล</p>
                <p className="mt-1 font-medium text-indigo-700">หมายเหตุ: ข้อมูลบทความที่ปรากฏด้านล่าง นำมาจากกลุ่มตัวอย่างบุคลากร <span className="font-bold">25 รายการแรก</span> จากข้อมูลทั้งหมด {orcidTotal.toLocaleString()} รายการ โปรดกด "โหลดชุดข้อมูลถัดไป" เพื่อตรวจสอบผลลัพธ์จากบุคลากรกลุ่มอื่น</p>
            </div>
        </div>
      </div>

      {/* === CONTEXT INFO BAR (Absolute Parity with Scopus/NCBI) === */}
      <div className="bg-white px-4 py-2 border-t border-indigo-100 flex justify-between items-center text-sm border-x border-indigo-200">
        <div className="text-slate-500 flex items-center gap-4">
          <span>แสดง <span className="font-bold text-slate-700">{Math.min(authorWorks.length, displayLimit)}</span> จาก <span className="font-bold text-indigo-600">{authorWorks.length}</span> รายการ</span>
          {displayLimit >= authorWorks.length && authorWorks.length > 0 && (
            <span className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
              <CheckCircle2 size={14} /> ดึงข้อมูลครบแล้ว
            </span>
          )}
        </div>
        {displayLimit < authorWorks.length ? (
          <button
            onClick={() => setDisplayLimit(prev => prev + 25)}
            className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md text-xs font-bold hover:bg-indigo-100 transition-colors shadow-sm"
          >
            <RefreshCw size={12} />
            โหลดข้อมูลเพิ่ม (+25 รายการ)
          </button>
        ) : (
          orcidResults.length < orcidTotal && orcidTotal > 0 && (
            <button
                onClick={() => handleOrcidSearch(true)}
                disabled={isLoadingMore}
                className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-xs font-bold hover:bg-emerald-100 transition-colors shadow-sm disabled:opacity-50"
            >
                {isLoadingMore ? <RefreshCw size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                ดึงชุดข้อมูลถัดไป (+25)
            </button>
          )
        )}
      </div>

      {/* === RESULTS TABLE (Standard UI Full Width) === */}
      <div className="bg-white rounded-b-xl shadow-sm border border-indigo-200 overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-indigo-100/50 text-indigo-900 border-b-2 border-indigo-200 text-sm uppercase">
                <th className="p-4 font-semibold w-24">ปีที่พิมพ์</th>
                <th className="p-4 font-semibold">ชื่องานวิจัย / DOI</th>
                <th className="p-4 font-semibold w-56">ผู้แต่ง / Author ID</th>
                <th className="p-4 font-semibold w-64">ชื่อวารสาร / แหล่งพิมพ์</th>
                <th className="p-4 font-semibold w-32">สถานะ (Status)</th>
                <th className="p-4 font-semibold w-24 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {authorWorks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-32 text-center text-slate-400">
                    <Globe size={48} className="text-slate-100 mx-auto mb-3" />
                    <span className="font-medium text-lg">ไม่มีข้อมูลที่กำลังแสดง</span>
                    <p className="text-sm mt-1">ตั้งค่าฟิลเตอร์ด้านบนและกด &quot;ดึงข้อมูลเพื่อแสดงผล&quot;</p>
                  </td>
                </tr>
              ) : (
                authorWorks.slice(0, displayLimit).map((w, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4 text-slate-700 font-mono text-sm font-bold">{w.year || "-"}</td>
                    <td className="p-4">
                      <div className="font-bold text-slate-800 leading-tight">{w.title}</div>
                      <div className="text-xs text-indigo-600 mt-1 font-mono font-bold">{w.doi || "No DOI"}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-slate-600 font-medium">{w.authors}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{w.authorId}</div>
                    </td>
                    <td className="p-4 text-slate-700 text-sm font-medium">{w.journal || "-"}</td>
                    <td className="p-4">
                      {w.status === 'new' ? (
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full flex items-center w-max gap-1">New Data (ข้อมูลใหม่)</span>
                      ) : (
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-full flex items-center w-max gap-1">Existing (ข้อมูลเดิม)</span>
                          {w.updatedAt && (
                            <span className="text-[9px] text-slate-500 italic mt-0.5">ล่าสุด: {new Date(w.updatedAt).toLocaleDateString('th-TH')}</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleSingleImport(w)}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg transition-all shadow-sm border bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-700">
                        นำเข้า/อัปเดต
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* === PROGRESS MODAL (STANDARD Scopus/NCBI Style) === */}
      {showProgressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
            <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
              <h3 className="text-white font-bold flex items-center gap-2">
                {isSearching ? <Loader2 size={18} className="animate-spin text-indigo-400" /> : <CheckCircle2 size={18} className="text-green-400" />}
                ORCiD Service Connection
              </h3>
              {!isSearching && (
                <button onClick={() => setShowProgressModal(false)} className="text-slate-400 hover:text-white transition-all text-sm font-bold flex items-center gap-1 bg-slate-700 px-3 py-1 rounded-lg">
                  ปิดหน้าต่าง
                </button>
              )}
            </div>
            <div
              ref={modalScrollRef}
              className="p-4 h-64 overflow-y-auto bg-slate-900 font-mono text-sm space-y-2"
            >
              {progressLogs.map((log, idx) => (
                <div key={idx} className={`${log.includes('✅') || log.includes('🎉') ? 'text-green-400 font-bold' : log.includes('❌') ? 'text-red-400' : 'text-slate-300'}`}>
                  {log}
                </div>
              ))}
            </div>
            <div className="h-1 bg-slate-800 w-full relative overflow-hidden">
              {isSearching ? (
                <div className="absolute top-0 left-0 h-full bg-indigo-500 w-1/3 animate-[progress_1s_ease-in-out_infinite] rounded-r-full" />
              ) : (
                <div className="absolute top-0 left-0 h-full bg-green-500 w-full" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* History Logs Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[80vh]">
            <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-slate-800 font-bold flex items-center gap-2">
                <History size={18} className="text-indigo-600" />
                ประวัติการนำเข้าข้อมูล (ORCiD Bulk Sync)
              </h3>
              <button onClick={() => setShowHistoryModal(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                ปิดหน้าต่าง
              </button>
            </div>

            <div className="p-4 overflow-y-auto bg-white flex-1 min-h-[50vh]">
              {isLoadingHistory ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                  <Loader2 className="animate-spin text-indigo-500" size={32} />
                  กำลังโหลดข้อมูลประวัติ...
                </div>
              ) : historyLogs.length === 0 ? (
                <div className="text-center py-20 text-slate-400">ไม่มีประวัติการนำเข้า</div>
              ) : (
                <div className="space-y-4">
                  {historyLogs.map(log => (
                    <div key={log.id} className="border border-slate-200 rounded-xl p-4 shadow-sm relative hover:border-indigo-300 transition-colors">
                      <div className="flex justify-between items-start mb-2 border-b border-slate-100 pb-2">
                        <div>
                          <span className="font-bold text-slate-700 block">{new Date(log.timestamp).toLocaleString('th-TH')}</span>
                          <span className="text-xs text-slate-500">โดย: {log.user} / คำค้นหา: {log.query || "ไม่ระบุ"} ({log.scope === 'vet' ? 'VET' : 'KU'}, ปี {log.year})</span>
                        </div>
                        <div className="text-right">
                          <div className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2 py-1 rounded-md mb-1 inline-block">ดึงข้อมูลมา {log.total_fetched} งาน</div>
                        </div>
                      </div>
                      <div className="flex gap-4 items-center pl-2 pt-1 text-sm">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                          <span className="font-bold text-slate-700">{log.new_count}</span>
                          <span className="text-slate-500">รายการใหม่</span>
                        </div>
                        <div className="w-px h-6 bg-slate-200"></div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                          <span className="font-bold text-slate-700">{log.update_count}</span>
                          <span className="text-slate-500">อัปเดตแก้ไข</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Floating Action Button (Scroll to Top) */}
      {showFloatingTop && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-full shadow-2xl transition-all hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-slate-300 group"
            aria-label="Back to top"
          >
            <ChevronUp size={20} className="group-hover:animate-bounce" />
          </button>
        </div>
      )}
    </div>
  );
}
