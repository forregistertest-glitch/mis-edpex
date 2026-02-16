"use client";

import { useState, useEffect } from "react";
import {
    CheckCircle2,
    XCircle,
    RotateCcw,
    Trash2,
    Loader2,
    ClipboardList,
    ChevronDown,
    Search,
    AlertCircle,
} from "lucide-react";
import {
    getPendingEntries,
    getKpiEntries,
    updateKpiEntryStatus,
    softDeleteEntry,
    getAllKpiMaster,
} from "@/lib/data-service";
import type { KpiEntry, KpiMaster } from "@/lib/data-service";
import { useAuth } from "@/contexts/AuthContext";

// ─── Status Config ─────────────────────────────────────────────
const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: "รอตรวจสอบ", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
    approved: { label: "อนุมัติแล้ว", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
    rejected: { label: "ปฏิเสธ", color: "text-red-700", bg: "bg-red-50 border-red-200" },
    revision_requested: { label: "ส่งกลับแก้ไข", color: "text-orange-700", bg: "bg-orange-50 border-orange-200" },
    deleted: { label: "ลบแล้ว", color: "text-slate-500", bg: "bg-slate-100 border-slate-200" },
};

interface Props {
    lang: "th" | "en";
}

export default function ReviewerDashboard({ lang }: Props) {
    const { user, userRole } = useAuth();
    const [entries, setEntries] = useState<KpiEntry[]>([]);
    const [masters, setMasters] = useState<KpiMaster[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>("pending");
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Rejection modal
    const [rejectId, setRejectId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState("");

    // Delete confirm
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, [filter]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [allEntries, allMasters] = await Promise.all([
                getKpiEntries(),
                getAllKpiMaster(),
            ]);
            setMasters(allMasters);

            let filtered = allEntries.filter((e) => e.status !== "deleted");
            if (filter !== "all") {
                filtered = filtered.filter((e) => e.status === filter);
            }
            filtered.sort((a, b) => (b.submitted_at || "").localeCompare(a.submitted_at || ""));
            setEntries(filtered);
        } catch (err) {
            console.error("Load error:", err);
        } finally {
            setLoading(false);
        }
    };

    const getKpiName = (kpiId: string) => {
        const m = masters.find((k) => k.kpi_id === kpiId);
        return lang === "th" ? m?.name_th || kpiId : m?.name_en || kpiId;
    };

    const handleApprove = async (id: string) => {
        setActionLoading(id);
        await updateKpiEntryStatus(id, "approved", user?.email || "");
        await loadData();
        setActionLoading(null);
    };

    const handleReject = async () => {
        if (!rejectId) return;
        setActionLoading(rejectId);
        await updateKpiEntryStatus(rejectId, "rejected", user?.email || "", rejectReason);
        setRejectId(null);
        setRejectReason("");
        await loadData();
        setActionLoading(null);
    };

    const handleRevision = async (id: string) => {
        setActionLoading(id);
        await updateKpiEntryStatus(id, "revision_requested", user?.email || "", "กรุณาตรวจสอบข้อมูลอีกครั้ง");
        await loadData();
        setActionLoading(null);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        const entry = entries.find((e) => e.id === deleteId);
        if (!entry) return;
        setActionLoading(deleteId);
        await softDeleteEntry(deleteId, user?.email || "", entry.status);
        setDeleteId(null);
        await loadData();
        setActionLoading(null);
    };

    const canDelete = (entry: KpiEntry) => {
        if (userRole === "admin") return true;
        if (entry.submitted_by === user?.email && entry.status === "pending") return true;
        return false;
    };

    const isReviewer = userRole === "reviewer" || userRole === "admin";

    const pendingCount = entries.length;
    const formatDate = (d: string) => {
        try {
            return new Date(d).toLocaleDateString("th-TH", {
                day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
            });
        } catch {
            return d;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-700 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
                        <ClipboardList size={20} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">
                            {lang === "th" ? "ตรวจสอบข้อมูล" : "Review Data"}
                        </h2>
                        <p className="text-xs text-slate-500">
                            {lang === "th" ? "Approve / Reject ข้อมูลที่กรอก" : "Approve / Reject submitted data"}
                        </p>
                    </div>
                </div>

                {/* Filter */}
                <div className="relative">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium text-slate-700 shadow-sm hover:border-slate-300 transition-all cursor-pointer"
                    >
                        <option value="pending">🟡 รอตรวจสอบ</option>
                        <option value="approved">🟢 อนุมัติแล้ว</option>
                        <option value="rejected">🔴 ปฏิเสธ</option>
                        <option value="revision_requested">🟠 ส่งกลับแก้ไข</option>
                        <option value="all">📋 ทั้งหมด</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 size={28} className="animate-spin text-blue-600" />
                </div>
            ) : entries.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                    <Search size={40} className="text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">ไม่มีรายการ</p>
                    <p className="text-xs text-slate-400 mt-1">ไม่พบข้อมูลในสถานะที่เลือก</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="text-left px-4 py-3 font-semibold text-slate-600">KPI</th>
                                    <th className="text-left px-4 py-3 font-semibold text-slate-600">ค่า</th>
                                    <th className="text-left px-4 py-3 font-semibold text-slate-600">ปี/งวด</th>
                                    <th className="text-left px-4 py-3 font-semibold text-slate-600">ผู้กรอก</th>
                                    <th className="text-left px-4 py-3 font-semibold text-slate-600">วันที่</th>
                                    <th className="text-left px-4 py-3 font-semibold text-slate-600">สถานะ</th>
                                    <th className="text-center px-4 py-3 font-semibold text-slate-600">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {entries.map((entry) => {
                                    const sc = statusConfig[entry.status] || statusConfig.pending;
                                    const isProcessing = actionLoading === entry.id;
                                    return (
                                        <tr key={entry.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-slate-800">{entry.kpi_id}</div>
                                                <div className="text-xs text-slate-400 truncate max-w-[200px]">{getKpiName(entry.kpi_id)}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="font-bold text-blue-700">{entry.value}</span>
                                                <span className="text-xs text-slate-400 ml-1">{entry.unit}</span>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">{entry.fiscal_year} / {entry.period}</td>
                                            <td className="px-4 py-3 text-xs text-slate-500">{entry.submitted_by}</td>
                                            <td className="px-4 py-3 text-xs text-slate-400">{formatDate(entry.submitted_at)}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${sc.bg} ${sc.color}`}>
                                                    {sc.label}
                                                </span>
                                                {entry.rejection_reason && (
                                                    <div className="text-[10px] text-red-500 mt-1 italic">&ldquo;{entry.rejection_reason}&rdquo;</div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {isProcessing ? (
                                                    <div className="flex justify-center">
                                                        <Loader2 size={16} className="animate-spin text-blue-500" />
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center gap-1">
                                                        {/* Approve */}
                                                        {isReviewer && entry.status === "pending" && (
                                                            <button
                                                                onClick={() => handleApprove(entry.id!)}
                                                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                                title="อนุมัติ"
                                                            >
                                                                <CheckCircle2 size={16} />
                                                            </button>
                                                        )}
                                                        {/* Reject */}
                                                        {isReviewer && entry.status === "pending" && (
                                                            <button
                                                                onClick={() => setRejectId(entry.id!)}
                                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                                title="ปฏิเสธ"
                                                            >
                                                                <XCircle size={16} />
                                                            </button>
                                                        )}
                                                        {/* Request Revision */}
                                                        {isReviewer && entry.status === "pending" && (
                                                            <button
                                                                onClick={() => handleRevision(entry.id!)}
                                                                className="p-1.5 text-orange-500 hover:bg-orange-50 rounded-lg transition-all"
                                                                title="ส่งกลับแก้ไข"
                                                            >
                                                                <RotateCcw size={16} />
                                                            </button>
                                                        )}
                                                        {/* Delete */}
                                                        {canDelete(entry) && (
                                                            <button
                                                                onClick={() => setDeleteId(entry.id!)}
                                                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                                title="ลบ"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
                        แสดง {entries.length} รายการ
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {rejectId && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                                <XCircle size={20} className="text-red-500" />
                            </div>
                            <h3 className="font-bold text-slate-800">ปฏิเสธข้อมูล</h3>
                        </div>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="ระบุเหตุผล..."
                            rows={3}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm resize-none focus:ring-2 focus:ring-red-200 focus:border-red-300 outline-none"
                        />
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => { setRejectId(null); setRejectReason(""); }}
                                className="px-4 py-2 text-sm text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={handleReject}
                                className="px-4 py-2 text-sm text-white bg-red-500 rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                            >
                                ยืนยันปฏิเสธ
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            {deleteId && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full space-y-4 text-center">
                        <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto">
                            <Trash2 size={24} className="text-red-500" />
                        </div>
                        <h3 className="font-bold text-slate-800">ยืนยันการลบ</h3>
                        <p className="text-sm text-slate-500">ข้อมูลจะถูก soft delete สามารถกู้คืนได้ในภายหลัง</p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="px-5 py-2 text-sm text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-5 py-2 text-sm text-white bg-red-500 rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                            >
                                🗑️ ลบ
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
