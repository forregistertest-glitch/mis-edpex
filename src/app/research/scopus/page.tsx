"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, Download, RefreshCw, ChevronDown, CheckCircle2, Globe, PlayCircle, Loader2, FileDown, Building2, Save, FileClock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ScopusService } from "@/services/scopusService";
import { ResearchService } from "@/services/researchService";
import { ScopusSyncLogService, ScopusSyncLog } from "@/services/scopusSyncLogService";

export default function ScopusSearchPage() {
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
    const [scopusAction, setScopusAction] = useState<"search" | "import">("search");

    // -- Scopus Search State --
    const [scopusQuery, setScopusQuery] = useState("");
    const [scopusScope, setScopusScope] = useState("vet"); // 'vet' for Faculty, '60021944' for KU
    const [scopusYear, setScopusYear] = useState(new Date().getFullYear().toString());
    const [scopusResults, setScopusResults] = useState<any[]>([]);
    const [scopusTotal, setScopusTotal] = useState(0);
    const [isSearchingScopus, setIsSearchingScopus] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // -- Progress Modal State --
    const [showProgressModal, setShowProgressModal] = useState(false);
    const [progressLogs, setProgressLogs] = useState<string[]>([]);
    const [progressAction, setProgressAction] = useState<"search" | "import">("search");
    const modalScrollRef = useRef<HTMLDivElement>(null);

    // -- History Modal State --
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [historyLogs, setHistoryLogs] = useState<ScopusSyncLog[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    useEffect(() => {
        if (modalScrollRef.current) {
            modalScrollRef.current.scrollTop = modalScrollRef.current.scrollHeight;
        }
    }, [progressLogs]);

    const handleScopusSearch = async (action: "search" | "import", isAppend: boolean = false) => {
        // Input Validation
        if (!isAppend && scopusScope !== 'vet' && scopusYear === 'all' && !scopusQuery.trim()) {
            alert("คำเตือน: การค้นหา 'มหาวิทยาลัยทั้งหมด' แบบ 'ทุกปี' โดยไม่ระบุคำสืบค้น จะได้ข้อมูลมหาศาล (26,000+ รายการ) ซึ่งอาจทำให้ระบบค้าง\n\nแนะนำให้: ระบุปีที่พิมพ์ หรือ ระบุชื่อผู้แต่ง/บทความ เพิ่มเติมครับ");
            return;
        }

        if (!isAppend) {
            setProgressAction('search');
            setIsSearchingScopus(true);
            setShowProgressModal(true);
            setProgressLogs([
                'เริ่มต้นกระบวนการสืบค้นข้อมูล...',
                'กำลังเชื่อมต่อฐานข้อมูลในระบบ (Database)...'
            ]);
            setScopusResults([]);
        } else {
            setIsLoadingMore(true);
        }

        const offset = isAppend ? scopusResults.length : 0;

        try {
            // 1. ดึงข้อมูลจาก Database ปัจจุบันมาเตรียมเปรียบเทียบ
            const localDbRecords = await ResearchService.getAllResearch();
            if (!isAppend) {
                setProgressLogs(prev => [...prev, `✅ โหลดข้อมูลในระบบสำเร็จ (${localDbRecords.length} รายการ)`]);
                setProgressLogs(prev => [...prev, 'กำลังร้องขอข้อมูลจาก Scopus API...']);
            }

            // 2. ดึงข้อมูลจาก Scopus API
            const response = await ScopusService.searchWithAffiliation(scopusQuery, scopusScope, scopusYear, offset);
            const { results, totalResults } = response;

            setTimeout(() => {
                if (!isAppend) {
                    setProgressLogs(prev => [...prev, `✅ พบผลลัพธ์จาก Scopus ทั้งสิ้น ${totalResults} รายการ`]);
                }
                setScopusTotal(totalResults);

                // 3. จัดการเปรียบเทียบข้อมูล (Mapping & Checking Duplicates)
                const formatted = results.map((item: any) => {
                    // สร้าง ID สำหรับเปรียบเทียบ (EID สำคัญที่สุด รองลงมาคือ DOI)
                    const scopusEID = item.eid || "";
                    const scopusDOI = item.doi || "";

                    // ค้นหาในฐานข้อมูลว่ามี record นี้อยู่แล้วหรือไม่
                    const existingRecord = localDbRecords.find((dbItem: any) =>
                        (dbItem.scopus_eid && dbItem.scopus_eid === scopusEID) ||
                        (dbItem.doi && dbItem.doi === scopusDOI && scopusDOI !== "")
                    );

                    return {
                        id: scopusEID || Math.random().toString(),
                        doi: scopusDOI,
                        title: item.title,
                        journal: item.journal,
                        year: item.coverDate ? item.coverDate.substring(0, 4) : "-",
                        authors: item.authorId || "Unknown",
                        class: item.aggregationType || "Journal",
                        status: existingRecord ? "duplicate" : "new",
                        localId: existingRecord?.id || undefined,
                        updatedAt: existingRecord?.updated_at || undefined,
                        abstract: item.abstract || "",
                        keywords: item.keywords || "",
                        citationCount: item.citationCount || 0,
                        openAccess: item.openAccess || false,
                        affiliations: item.affiliations || "",
                        raw: item.raw
                    };
                });

                if (isAppend) {
                    setScopusResults(prev => [...prev, ...formatted]);
                } else {
                    setScopusResults(formatted);
                }

                setIsSearchingScopus(false);
                setIsLoadingMore(false);

                if (!isAppend) {
                    setProgressLogs(prev => [...prev, '✅ เสร็จสิ้นกระบวนการสืบค้นข้อมูล']);
                    setTimeout(() => setShowProgressModal(false), 2000);
                }

            }, isAppend ? 0 : 500);

        } catch (error: any) {
            if (!isAppend) {
                setProgressLogs(prev => [...prev, `❌ เกิดข้อผิดพลาด: ${error.message}`]);
                setIsSearchingScopus(false);
            } else {
                alert("ไม่สามารถโหลดข้อมูลเพิ่มได้: " + error.message);
                setIsLoadingMore(false);
            }
        }
    };

    /** ฟังก์ชัน: นำเข้าทีละรายการ (แบบ Manual Single Row) */
    const handleSingleImport = async (item: any) => {
        try {
            if (!user) {
                alert("กรุณาเข้าสู่ระบบก่อนทำการนำเข้า");
                return;
            }

            const newRecord = {
                title: item.title || "",
                title_th: "",
                year: item.year || "-",
                faculty: "คณะสัตวแพทยศาสตร์",
                academic_year: (parseInt(item.year) + 543).toString(),
                authors: item.authors || "Unknown",
                authors_list: [],
                class: item.class || "Journal",
                reward: "none",
                scopus_eid: item.id !== item.doi ? item.id : "",
                doi: item.doi || "",
                journal: item.journal || "",
                note: "Imported from Scopus Search",
                status: "active" as "active",
                is_deleted: false,
                abstract: item.abstract || "",
                keywords: item.keywords || "",
                citation_count: item.citationCount || 0,
                is_open_access: item.openAccess || false,
                affiliations: item.affiliations || "",
                imported_from: 'scopus_api' as const,
                raw_data: item.raw || null
            };

            if (item.status === 'new') {
                await ResearchService.addResearch(newRecord, user.email || 'system');
                alert(`นำเข้า "${item.title.substring(0, 30)}..." สำเร็จ (ข้อมูลใหม่)`);

                // บันทึก Log การนำเข้าเดี่ยว
                await ScopusSyncLogService.logSync({
                    timestamp: new Date().toISOString(),
                    user: user.email || 'unknown',
                    scope: 'Single Import',
                    year: item.year || '-',
                    query: `EID: ${item.eid || item.id}`,
                    total_fetched: 1,
                    new_count: 1,
                    update_count: 0,
                    logs: []
                });

            } else if (item.localId) {
                await ResearchService.updateResearch(item.localId, newRecord, user.email || 'system');
                alert(`อัปเดต "${item.title.substring(0, 30)}..." เข้าทับข้อมูลเดิมสำเร็จ`);

                // บันทึก Log การอัปเดตเดี่ยว
                await ScopusSyncLogService.logSync({
                    timestamp: new Date().toISOString(),
                    user: user.email || 'unknown',
                    scope: 'Single Update',
                    year: item.year || '-',
                    query: `EID: ${item.eid || item.id}`,
                    total_fetched: 1,
                    new_count: 0,
                    update_count: 1,
                    logs: []
                });
            }

            // อัปเดต UI 
            setScopusResults(prev => prev.map(r =>
                r.id === item.id ? { ...r, status: 'duplicate', updatedAt: new Date().toISOString() } : r
            ));

        } catch (error: any) {
            console.error(error);
            alert("ดำเนินการไม่สำเร็จ: " + error.message);
        }
    };

    /** ฟังก์ชัน: ดึงข้อมูลและนำเข้าข้อมูลหลายหน้าพร้อมกันเป็น Batch */
    const handleBulkImportProcess = async (queryStr: string, scope: string, year: string, expectedTotal: number, currentDb: any[]) => {
        try {
            if (!user || expectedTotal === 0) {
                setProgressLogs(prev => [...prev, '❌ ไม่พบข้อมูลที่จะสามารถนำเข้าได้ หรือผู้ใช้ไม่มีสิทธิ์']);
                setIsSearchingScopus(false);
                return;
            }

            setProgressLogs(prev => [...prev, `กำลังดาวน์โหลดข้อมูลทั้งหมดจำนวน ${expectedTotal} รายการ... (อย่าปิดหน้าต่าง)`]);

            let allItems: any[] = [];
            let currentOffset = 0;
            setIsSearchingScopus(true);

            // Loop ดึงข้อมูล แบบแบ่งหน้า Paging
            while (allItems.length < expectedTotal && currentOffset < expectedTotal && currentOffset <= 1000) {
                setProgressLogs(prev => [...prev, `🔄 กำลังดึงข้อมูลหน้าที่ ${Math.floor(currentOffset / 25) + 1}... (${currentOffset}/${expectedTotal})`]);
                const res = await ScopusService.searchWithAffiliation(queryStr, scope, year, currentOffset);
                if (res.results.length === 0) break;
                allItems = [...allItems, ...res.results];
                currentOffset += 25;
            }

            setProgressLogs(prev => [...prev, `✅ ดึงข้อมูลสำเร็จรวม ${allItems.length} รายการ กำลังเตรียมเขียนลงฐานข้อมูล...`]);

            let newCount = 0;
            let updateCount = 0;

            const processedRecords = allItems.map(item => {
                const scopusEID = item.eid || "";
                const scopusDOI = item.doi || "";
                const existingRecord = currentDb.find(dbItem =>
                    (dbItem.scopus_eid && dbItem.scopus_eid === scopusEID) ||
                    (dbItem.doi && dbItem.doi === scopusDOI && scopusDOI !== "")
                );

                if (existingRecord) updateCount++;
                else newCount++;

                return {
                    id: existingRecord?.id || undefined,
                    title: item.title || "",
                    title_th: "",
                    year: item.coverDate ? item.coverDate.substring(0, 4) : "-",
                    faculty: "คณะสัตวแพทยศาสตร์",
                    academic_year: item.coverDate ? (parseInt(item.coverDate.substring(0, 4)) + 543).toString() : "-",
                    authors: item.authorId || "Unknown",
                    authors_list: existingRecord?.authors_list || [],
                    class: item.aggregationType || "Journal",
                    reward: existingRecord?.reward || "none",
                    scopus_eid: scopusEID,
                    doi: scopusDOI,
                    journal: item.journal || "",
                    note: existingRecord?.note || "Imported via Bulk Sync",
                    status: existingRecord?.status || "active",
                    is_deleted: existingRecord?.is_deleted || false,
                    abstract: item.abstract || "",
                    keywords: item.keywords || "",
                    citation_count: item.citationCount || 0,
                    is_open_access: item.openAccess || false,
                    affiliations: item.affiliations || "",
                    imported_from: 'scopus_api' as const,
                    raw_data: item.raw || null
                };
            });

            setProgressLogs(prev => [...prev, `💾 กำลังบันทึกลงฐานข้อมูล... (นำเข้าใหม่: ${newCount}, อัปเดตทับ: ${updateCount})`]);
            await ResearchService.upsertResearchBatch(processedRecords as any, user.email || 'system');

            // บันทึก Log การนำเข้าลง Firestore
            await ScopusSyncLogService.logSync({
                timestamp: new Date().toISOString(),
                user: user.email || 'unknown',
                scope: scope,
                year: year,
                query: queryStr,
                total_fetched: processedRecords.length,
                new_count: newCount,
                update_count: updateCount,
                logs: []
            });

            setProgressLogs(prev => [...prev, `🎉 ดำเนินการอัปเดต / นำเข้า ข้อมูล ${processedRecords.length} รายการ เรียบร้อยแล้ว`]);
            setProgressLogs(prev => [...prev, `👉 (ข้อมูลถูกบันทึกประวัติการ Sync เรียบร้อยแล้ว ท่านสามารถปิดหน้าต่างนี้ได้)`]);

            setIsSearchingScopus(false);

        } catch (error: any) {
            console.error("Bulk Import Error: ", error);
            setProgressLogs(prev => [...prev, `❌ เกิดข้อผิดพลาดร้ายแรงระหว่างนำเข้า: ${error.message}`]);
            setIsSearchingScopus(false);
        }
    };

    const handleExportA4 = () => {
        if (scopusResults.length === 0) {
            alert("ไม่พบข้อมูลที่จะส่งออก กรุณาสืบค้นข้อมูลก่อนครับ");
            return;
        }

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Scopus Search Report - ${new Date().toLocaleDateString()}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Prompt:wght@400;700&display=swap');
          
          body { font-family: 'Inter', 'Prompt', sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
          .page { width: 210mm; min-height: 297mm; padding: 20mm; margin: 10mm auto; background: white; box-shadow: 0 0 10px rgba(0,0,0,0.1); position: relative; box-sizing: border-box; }
          @media print {
            @page { size: A4; margin: 0; }
            body { background: none; padding: 0; margin: 0; }
            .page { margin: 0; box-shadow: none; width: 100%; padding: 15mm; }
            .no-print { display: none !important; }
          }
          .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 10px; margin-bottom: 20px; }
          .header h1 { color: #1e40af; margin: 0; font-size: 20px; }
          .header p { margin: 5px 0 0; font-size: 13px; color: #475569; }
          table { width: 100%; border-collapse: collapse; font-size: 10.5px; margin-top: 10px; }
          th { background-color: #f8fafc; color: #334155; font-weight: bold; text-align: left; padding: 10px 8px; border: 1px solid #cbd5e1; }
          td { padding: 10px 8px; border: 1px solid #cbd5e1; vertical-align: top; line-height: 1.4; }
          .doi { color: #2563eb; font-family: monospace; font-size: 9px; margin-top: 4px; }
          .authors { color: #64748b; font-style: italic; }
          .journal { font-weight: bold; color: #0f172a; }
          .footer { margin-top: 30px; padding-top: 10px; border-top: 1px solid #e2e8f0; text-align: right; font-size: 10px; color: #94a3b8; }
          .btn-print { position: fixed; top: 20px; right: 20px; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; border: none; cursor: pointer; font-family: inherit; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 8px; z-index: 100; }
          .btn-print:hover { background: #1d4ed8; }
        </style>
      </head>
      <body>
        <button class="btn-print no-print" onclick="window.print()">🖨️ พิมพ์รายงาน (Print to PDF/A4)</button>
        <div class="page">
          <div class="header">
            <h1>รายงานสรุปผลการสืบค้นข้อมูลวิจัยจากฐานข้อมูล Scopus</h1>
            <p>
                <strong>แหล่งข้อมูล:</strong> ${scopusScope === 'vet' ? 'คณะสัตวแพทยศาสตร์' : 'มหาวิทยาลัยเกษตรศาสตร์'} | 
                <strong>ปีที่พิมพ์:</strong> ${scopusYear === 'all' ? 'ทุกปี' : `ปี ${parseInt(scopusYear) + 543} (${scopusYear})`}
            </p>
            <p>สืบค้นเมื่อ: ${new Date().toLocaleString('th-TH')}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 40px; text-align: center;">ปี</th>
                <th>ชื่องานวิจัย / DOI</th>
                <th style="width: 180px;">ผู้แต่ง (Authors)</th>
                <th style="width: 160px;">วารสาร/แหล่งตีพิมพ์</th>
              </tr>
            </thead>
            <tbody>
              ${scopusResults.map(item => `
                <tr>
                  <td style="text-align: center; font-weight: bold;">${item.year}</td>
                  <td>
                    <div style="font-weight: bold; color: #1e293b; margin-bottom: 2px;">${item.title}</div>
                    <div class="doi">${item.doi || '-'}</div>
                  </td>
                  <td class="authors">${item.authors}</td>
                  <td class="journal">${item.journal}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            <p>พบข้อมูลในระบบ Scopus ทั้งหมด ${scopusTotal} รายการ | นำออกมาแสดงในรายงานนี้ ${scopusResults.length} รายการ</p>
            <p>© KUVET MIS System - Research Records Report</p>
          </div>
        </div>
      </body>
      </html>
    `;

        printWindow.document.write(html);
        printWindow.document.close();
    };

    if (loading || userRole !== 'admin') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-4 text-gray-500">
                    <Loader2 className="animate-spin text-blue-500" size={48} />
                    <p>กำลังตรวจสอบสิทธิ์หน้า Scopus...</p>
                </div>
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
                            <div className="bg-blue-600 p-2 rounded-lg shadow-sm">
                                <Globe size={24} className="text-white" />
                            </div>
                            สืบค้นข้อมูลจากระบบ Scopus (Admin Only)
                        </h1>
                    </div>
                </div>
            </div>

            {/* === SEARCH FILTER BAR === */}
            <div className="bg-white rounded-t-xl rounded-b-none border border-blue-200 border-b-0 overflow-hidden">
                <div className="p-4 bg-blue-50/50 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="flex flex-1 gap-3 w-full flex-wrap">
                        {/* Mode Toggles */}
                        <div className="flex bg-white rounded-lg p-1 border border-blue-200 shadow-sm mr-2">
                            <button
                                onClick={() => setScopusAction('search')}
                                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${scopusAction === 'search' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                สืบค้น
                            </button>
                            <button
                                onClick={() => setScopusAction('import')}
                                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${scopusAction === 'import' ? 'bg-amber-100 text-amber-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                Bulk Import
                            </button>
                        </div>

                        <div className="relative flex-[2] min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" size={18} />
                            <input
                                type="text"
                                placeholder="ค้นหา: Author ID, Name, Article Title..."
                                value={scopusQuery}
                                onChange={(e) => setScopusQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white placeholder:text-slate-400 text-sm"
                            />
                        </div>

                        <div className="relative w-48">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" size={18} />
                            <select
                                value={scopusScope}
                                onChange={(e) => setScopusScope(e.target.value)}
                                className="w-full pl-10 pr-8 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm font-medium text-slate-700 appearance-none"
                            >
                                <option value="vet">คณะสัตวแพทยศาสตร์ (VET)</option>
                                <option value="60021944">มหาวิทยาลัยเกษตรศาสตร์ (KU)</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none" size={16} />
                        </div>

                        <div className="relative w-32">
                            <select
                                value={scopusYear}
                                onChange={(e) => setScopusYear(e.target.value)}
                                className="w-full pl-4 pr-8 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm font-medium text-slate-700 appearance-none"
                            >
                                <option value="all">ทุกปี</option>
                                {Array.from({ length: 11 }, (_, i) => {
                                    const y = new Date().getFullYear() - i;
                                    return <option key={y} value={y.toString()}>ปี {y + 543}</option>;
                                })}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none" size={16} />
                        </div>

                        <button
                            onClick={() => handleScopusSearch('search')}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-sm transition-colors"
                        >
                            <PlayCircle size={18} /> ดึงข้อมูลเพื่อแสดงผล
                        </button>

                        {/* เมนูเสริมเฉพาะโหมด Bulk Import */}
                        {scopusAction === 'import' && (
                            <button
                                onClick={() => {
                                    setProgressAction('import');
                                    setIsSearchingScopus(true);
                                    setShowProgressModal(true);
                                    setProgressLogs(['⏳ เข้าสู่กระบวนการเตรียมกวาดข้อมูลทั้งหมดเข้า Database...']);
                                    // โหลด DB ก่อน
                                    ResearchService.getAllResearch().then(dbDocs => {
                                        handleBulkImportProcess(scopusQuery, scopusScope, scopusYear, scopusTotal || 1, dbDocs);
                                    });
                                }}
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
                                    const logs = await ScopusSyncLogService.getRecentLogs(10);
                                    setHistoryLogs(logs);
                                } catch (error) {
                                    alert('เกิดข้อผิดพลาดในการโหลดประวัติ');
                                } finally {
                                    setIsLoadingHistory(false);
                                }
                            }}
                            className="flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg text-sm font-bold shadow-sm transition-colors"
                        >
                            <FileClock size={18} /> ประวัติ
                        </button>
                    </div>
                </div>

                {/* Context Info Bar */}
                <div className="bg-white px-4 py-2 border-t border-blue-100 flex justify-between items-center text-sm">
                    <div className="text-slate-500 flex items-center gap-4">
                        <span>แสดง <span className="font-bold text-slate-700">{scopusResults.length}</span> จาก <span className="font-bold text-blue-600">{scopusTotal}</span> รายการ</span>
                        {scopusResults.length >= scopusTotal && scopusTotal > 0 && (
                            <span className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                <CheckCircle2 size={14} /> ดึงข้อมูลครบแล้ว
                            </span>
                        )}
                    </div>
                    {scopusResults.length < scopusTotal && (
                        <button
                            onClick={() => handleScopusSearch(scopusAction, true)}
                            disabled={isLoadingMore}
                            className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-xs font-bold hover:bg-blue-100 transition-colors shadow-sm disabled:opacity-50"
                        >
                            {isLoadingMore ? <RefreshCw size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                            โหลดข้อมูลเพิ่ม (+25 รายการ)
                        </button>
                    )}
                </div>
            </div>

            {/* === RESULTS TABLE === */}
            <div className="bg-white rounded-b-xl shadow-sm border border-t-0 border-blue-200 overflow-hidden">
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-blue-100/50 text-blue-900 border-b-2 border-blue-200 text-sm uppercase">
                                <th className="p-4 font-semibold w-24">ปีที่พิมพ์</th>
                                <th className="p-4 font-semibold">ชื่องานวิจัย / DOI</th>
                                <th className="p-4 font-semibold w-48">ผู้แต่ง / Author ID</th>
                                <th className="p-4 font-semibold w-64">ชื่อวารสาร / แหล่งพิมพ์</th>
                                <th className="p-4 font-semibold w-32">สถานะ (Status)</th>
                                <th className="p-4 font-semibold w-24 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {scopusResults.length === 0 ? (
                                <tr><td colSpan={6} className="p-20 text-center text-slate-400">
                                    <Globe size={48} className="text-slate-200 mx-auto mb-3" />
                                    <span className="font-medium text-lg">ไม่มีข้อมูลที่กำลังแสดง</span>
                                    <p className="text-sm mt-1">ตั้งค่าฟิลเตอร์ด้านบนและกด "ดึงข้อมูล Scopus"</p>
                                </td></tr>
                            ) : (
                                scopusResults.map((s, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                                        <td className="p-4 text-slate-700 font-mono text-sm font-bold">{s.year || "-"}</td>
                                        <td className="p-4">
                                            <div className="font-bold text-slate-800 leading-tight">{s.title}</div>
                                            <div className="text-xs text-blue-600 mt-1 font-mono">{s.doi || "No DOI"}</div>
                                        </td>
                                        <td className="p-4 text-sm text-slate-500">{s.authors}</td>
                                        <td className="p-4 text-slate-700 text-sm font-medium">{s.journal}</td>
                                        <td className="p-4">
                                            {s.status === 'new' ? (
                                                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full flex items-center w-max gap-1">New Data (ข้อมูลใหม่)</span>
                                            ) : (
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-full flex items-center w-max gap-1">Existing (ข้อมูลเดิม)</span>
                                                    {s.updatedAt && (
                                                        <span className="text-[10px] text-slate-500">
                                                            ล่าสุด: {new Date(s.updatedAt).toLocaleString('th-TH')}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleSingleImport(s)}
                                                className="px-3 py-1.5 text-xs font-bold rounded-lg transition-all shadow-sm border bg-blue-600 hover:bg-blue-700 text-white border-blue-700">
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

            {/* Progress Modal */}
            {showProgressModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
                        <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
                            <h3 className="text-white font-bold flex items-center gap-2">
                                {isSearchingScopus ? <Loader2 size={18} className="animate-spin text-blue-400" /> : <CheckCircle2 size={18} className="text-green-400" />}
                                Scopus Connection
                            </h3>
                            {!isSearchingScopus && (
                                <button onClick={() => setShowProgressModal(false)} className="text-slate-400 hover:text-white transition-colors">
                                    ปิดหน้าต่าง
                                </button>
                            )}
                        </div>
                        <div
                            ref={modalScrollRef}
                            className="p-4 h-64 overflow-y-auto bg-slate-900 font-mono text-sm space-y-2"
                        >
                            {progressLogs.map((log, idx) => (
                                <div key={idx} className={`${log.includes('✅') ? 'text-green-400 font-bold' : log.includes('❌') ? 'text-red-400' : 'text-slate-300'}`}>
                                    {log}
                                </div>
                            ))}
                        </div>
                        <div className="h-1 bg-slate-800 w-full relative overflow-hidden">
                            {isSearchingScopus ? (
                                <div className="absolute top-0 left-0 h-full bg-blue-500 w-1/3 animate-[progress_1s_ease-in-out_infinite] rounded-r-full" />
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
                                <FileClock size={18} className="text-blue-600" />
                                ประวัติการนำเข้าข้อมูล (Scopus Bulk Sync)
                            </h3>
                            <button onClick={() => setShowHistoryModal(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                                ปิดหน้าต่าง
                            </button>
                        </div>
                        <div className="p-4 overflow-y-auto bg-white flex-1 min-h-[50vh]">
                            {isLoadingHistory ? (
                                <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                                    <Loader2 className="animate-spin text-blue-500" size={32} />
                                    กำลังโหลดข้อมูลประวัติ...
                                </div>
                            ) : historyLogs.length === 0 ? (
                                <div className="text-center py-20 text-slate-400">ไม่มีประวัติการนำเข้า</div>
                            ) : (
                                <div className="space-y-4">
                                    {historyLogs.map(log => (
                                        <div key={log.id} className="border border-slate-200 rounded-xl p-4 shadow-sm relative hover:border-blue-300 transition-colors">
                                            <div className="flex justify-between items-start mb-2 border-b border-slate-100 pb-2">
                                                <div>
                                                    <span className="font-bold text-slate-700 block">{new Date(log.timestamp).toLocaleString('th-TH')}</span>
                                                    <span className="text-xs text-slate-500">โดย: {log.user} / คำค้นหา: {log.query || "ไม่ระบุ"} ({log.scope === 'vet' ? 'VET' : 'KU'}, ปี {log.year})</span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded-md mb-1 inline-block">ดึงข้อมูลมา {log.total_fetched} งาน</div>
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
        </div>
    );
}
