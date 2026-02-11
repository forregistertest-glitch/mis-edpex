"use client";

import { useState, useEffect } from "react";
import {
    UserPlus,
    Trash2,
    Shield,
    Loader2,
    Users,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    Calendar,
} from "lucide-react";
import {
    getAuthorizedUsers,
    addAuthorizedUser,
    removeAuthorizedUser,
    updateUserRole,
} from "@/lib/data-service";
import type { AuthorizedUser } from "@/lib/data-service";
import { useAuth } from "@/contexts/AuthContext";

const roleColors: Record<string, { label: string; color: string; bg: string }> = {
    admin: { label: "Admin", color: "text-red-700", bg: "bg-red-50 border-red-200" },
    reviewer: { label: "Reviewer", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
    user: { label: "User", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
};

interface Props {
    lang: "th" | "en";
}

export default function AdminPanel({ lang }: Props) {
    const { user } = useAuth();
    const [users, setUsers] = useState<AuthorizedUser[]>([]);
    const [loginLogs, setLoginLogs] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // Add user form
    const [showAddForm, setShowAddForm] = useState(false);
    const [newEmail, setNewEmail] = useState("");
    const [newName, setNewName] = useState("");
    const [newRole, setNewRole] = useState("user");
    const [formError, setFormError] = useState("");

    // Delete confirm
    const [deleteEmail, setDeleteEmail] = useState<string | null>(null);

    useEffect(() => {
        if (activeTab === 'users') loadUsers();
        else loadLogs();
    }, [activeTab]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const data = await getAuthorizedUsers();
            setUsers(data.sort((a, b) => {
                const roleOrder: Record<string, number> = { admin: 0, reviewer: 1, user: 2 };
                return (roleOrder[a.role] ?? 3) - (roleOrder[b.role] ?? 3);
            }));
        } catch (err) {
            console.error("Load users error:", err);
        } finally {
            setLoading(false);
        }
    };

    const loadLogs = async () => {
        setLoading(true);
        try {
            const { getLoginLogs } = await import("@/lib/data-service");
            const logs = await getLoginLogs();
            setLoginLogs(logs);
        } catch (err) {
            console.error("Load logs error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = async () => {
        setFormError("");
        if (!newEmail.trim()) { setFormError("กรุณากรอก Email"); return; }
        if (!newEmail.includes("@")) { setFormError("Email ไม่ถูกต้อง"); return; }
        if (!newName.trim()) { setFormError("กรุณากรอกชื่อ"); return; }
        if (users.find((u) => u.email === newEmail.trim())) { setFormError("Email นี้มีอยู่แล้ว"); return; }

        setActionLoading(true);
        try {
            await addAuthorizedUser(newEmail.trim(), newRole, newName.trim());
            setNewEmail("");
            setNewName("");
            setNewRole("user");
            setShowAddForm(false);
            await loadUsers();
        } catch (err: any) {
            setFormError(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleRemoveUser = async () => {
        if (!deleteEmail) return;
        if (deleteEmail === user?.email) {
            setDeleteEmail(null);
            return; // ห้ามลบตัวเอง
        }
        setActionLoading(true);
        try {
            await removeAuthorizedUser(deleteEmail);
            setDeleteEmail(null);
            await loadUsers();
        } catch (err) {
            console.error("Remove error:", err);
        } finally {
            setActionLoading(false);
        }
    };

    const handleRoleChange = async (email: string, newRoleValue: string) => {
        if (email === user?.email) return; // ห้ามเปลี่ยน role ตัวเอง
        setActionLoading(true);
        try {
            await updateUserRole(email, newRoleValue);
            await loadUsers();
        } catch (err) {
            console.error("Role change error:", err);
        } finally {
            setActionLoading(false);
        }
    };

    const formatDate = (d: string) => {
        try {
            return new Date(d).toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" });
        } catch { return d; }
    };

    const [editUser, setEditUser] = useState<AuthorizedUser | null>(null);
    const [editName, setEditName] = useState("");
    const [editRole, setEditRole] = useState("user");

    const handleEditClick = (u: AuthorizedUser) => {
        setEditUser(u);
        setEditName(u.name);
        setEditRole(u.role);
    };

    const handleSaveEdit = async () => {
        if (!editUser) return;
        setActionLoading(true);
        try {
            // Dynamic import to avoid circular dependency if any, though regular import is fine here
            const { updateUserDetails } = await import("@/lib/data-service");
            await updateUserDetails(editUser.email, editName, editRole);
            setEditUser(null);
            await loadUsers();
        } catch (err) {
            console.error("Update error:", err);
            alert("Update failed");
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Dashboard Tabs (Users / Logs) */}
            <div className="flex gap-4 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('users')}
                    className={`pb-3 text-sm font-bold transition-all px-2 border-b-2 ${activeTab === 'users' ? 'text-[#133045] border-[#71C5E8]' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                >
                    {lang === 'th' ? 'ผู้ใช้งาน (Users)' : 'Users'}
                </button>
                <button
                    onClick={() => setActiveTab('logs')}
                    className={`pb-3 text-sm font-bold transition-all px-2 border-b-2 ${activeTab === 'logs' ? 'text-[#133045] border-[#71C5E8]' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                >
                    {lang === 'th' ? 'ประวัติการเข้าใช้งาน (Login Logs)' : 'Login Logs'}
                </button>
            </div>

            {/* Users Tab Content */}
            {activeTab === 'users' && (
                <>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-red-700 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20">
                                <Users size={20} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">
                                    {lang === "th" ? "จัดการผู้ใช้งาน" : "Manage Users"}
                                </h2>
                                <p className="text-xs text-slate-500">
                                    {lang === "th" ? "เพิ่ม/ลบ/แก้ไขข้อมูลผู้ใช้" : "Add/Remove/Edit users"}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowAddForm(!showAddForm)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-[#71C5E8] text-white rounded-xl text-sm font-medium hover:bg-[#5ab0d5] transition-all shadow-lg shadow-[#71C5E8]/20 hover:scale-[1.02] active:scale-95"
                        >
                            <UserPlus size={16} />
                            {lang === "th" ? "เพิ่มผู้ใช้" : "Add User"}
                        </button>
                    </div>

                    {/* Add User Form */}
                    {showAddForm && (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 animate-in slide-in-from-top-2">
                            <h3 className="font-bold text-slate-800 text-sm">เพิ่มผู้ใช้ใหม่</h3>
                            {formError && (
                                <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2 text-sm">
                                    <AlertCircle size={14} />
                                    {formError}
                                </div>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <input
                                    type="email"
                                    placeholder="Email (เช่น staff@ku.th)"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-200 focus:border-blue-300 outline-none"
                                />
                                <input
                                    type="text"
                                    placeholder="ชื่อ-สกุล"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-200 focus:border-blue-300 outline-none"
                                />
                                <div className="relative">
                                    <select
                                        value={newRole}
                                        onChange={(e) => setNewRole(e.target.value)}
                                        className="appearance-none w-full border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm text-slate-900 focus:ring-2 focus:ring-blue-200 focus:border-blue-300 outline-none bg-white cursor-pointer"
                                    >
                                        <option value="user">User</option>
                                        <option value="reviewer">Reviewer</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => { setShowAddForm(false); setFormError(""); }}
                                    className="px-4 py-2 text-sm text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    onClick={handleAddUser}
                                    disabled={actionLoading}
                                    className="px-5 py-2 text-sm text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
                                >
                                    {actionLoading ? <Loader2 size={14} className="animate-spin" /> : "บันทึก"}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Users Table */}
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 size={28} className="animate-spin text-blue-600" />
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="text-left px-5 py-3 font-semibold text-slate-600">ชื่อ</th>
                                        <th className="text-left px-5 py-3 font-semibold text-slate-600">Email</th>
                                        <th className="text-left px-5 py-3 font-semibold text-slate-600">Role</th>
                                        <th className="text-left px-5 py-3 font-semibold text-slate-600">เพิ่มเมื่อ</th>
                                        <th className="text-center px-5 py-3 font-semibold text-slate-600">จัดการ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u) => {
                                        const rc = roleColors[u.role] || roleColors.user;
                                        const isSelf = u.email === user?.email;
                                        return (
                                            <tr key={u.email} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                                <td className="px-5 py-3 font-medium text-slate-800">
                                                    {u.name}
                                                    {isSelf && <span className="ml-2 text-[10px] text-blue-500 font-bold">(คุณ)</span>}
                                                </td>
                                                <td className="px-5 py-3 text-slate-500">{u.email}</td>
                                                <td className="px-5 py-3">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${rc.bg} ${rc.color}`}>
                                                        {rc.label}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3 text-xs text-slate-400">{formatDate(u.added_at)}</td>
                                                <td className="px-5 py-3 text-center">
                                                    {!isSelf && (
                                                        <div className="flex items-center justify-center gap-1">
                                                            <button
                                                                onClick={() => handleEditClick(u)}
                                                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                                title="แก้ไข"
                                                            >
                                                                <UserPlus size={14} className="rotate-45" /> {/* Use a different icon or simple edit icon if available in import, using UserPlus for now */}
                                                            </button>
                                                            <button
                                                                onClick={() => setDeleteEmail(u.email)}
                                                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                                title="ลบผู้ใช้"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
                                ผู้ใช้ทั้งหมด {users.length} คน
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Logs Tab Content */}
            {activeTab === 'logs' && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 size={28} className="animate-spin text-blue-600" />
                        </div>
                    ) : (
                        <LogsTable logs={loginLogs} lang={lang} />
                    )}
                </div>
            )}

            {/* Edit User Modal */}
            {editUser && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full space-y-4">
                        <h3 className="font-bold text-slate-800">แก้ไขผู้ใช้งาน</h3>
                        <p className="text-sm text-slate-500 font-mono bg-slate-50 p-2 rounded block break-all">{editUser.email}</p>

                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-slate-600 mb-1 block">ชื่อ-สกุล</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-blue-200 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-600 mb-1 block">Role</label>
                                <div className="relative">
                                    <select
                                        value={editRole}
                                        onChange={(e) => setEditRole(e.target.value)}
                                        className="appearance-none w-full border border-slate-200 rounded-xl px-4 py-2 pr-10 text-sm text-slate-900 focus:ring-2 focus:ring-blue-200 outline-none bg-white cursor-pointer"
                                    >
                                        <option value="user">User</option>
                                        <option value="reviewer">Reviewer</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 justify-end pt-2">
                            <button
                                onClick={() => setEditUser(null)}
                                className="px-4 py-2 text-sm text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                disabled={actionLoading}
                                className="px-5 py-2 text-sm text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
                            >
                                {actionLoading ? <Loader2 size={14} className="animate-spin" /> : "บันทึกการแก้ไข"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            {deleteEmail && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full space-y-4 text-center">
                        <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto">
                            <Trash2 size={24} className="text-red-500" />
                        </div>
                        <h3 className="font-bold text-slate-800">ลบผู้ใช้</h3>
                        <p className="text-sm text-slate-500">
                            ต้องการลบ <strong>{deleteEmail}</strong> ออกจากระบบ?
                        </p>
                        <p className="text-xs text-red-500">ผู้ใช้จะไม่สามารถเข้าระบบได้อีก</p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => setDeleteEmail(null)}
                                className="px-5 py-2 text-sm text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={handleRemoveUser}
                                disabled={actionLoading}
                                className="px-5 py-2 text-sm text-white bg-red-500 rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
                            >
                                {actionLoading ? <Loader2 size={14} className="animate-spin" /> : "🗑️ ลบ"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─── LogsTable Sub-Component ──────────────────────────────── */
const PAGE_SIZE = 100;

function LogsTable({ logs, lang }: { logs: any[]; lang: "th" | "en" }) {
    const th = lang === "th";
    const [page, setPage] = useState(1);
    const [selectedMonth, setSelectedMonth] = useState<string>("latest");

    // Extract unique months from logs (format: YYYY-MM)
    const months = Array.from(
        new Set(
            logs.map(log => {
                const d = new Date(log.timestamp);
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            })
        )
    ).sort().reverse();

    // Resolve "latest" to actual latest month
    const activeMonth = selectedMonth === "latest" ? (months[0] || "") : selectedMonth;

    // Filter logs by selected month
    const filtered = activeMonth
        ? logs.filter(log => {
            const d = new Date(log.timestamp);
            const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            return m === activeMonth;
        })
        : logs;

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageData = filtered.slice(start, start + PAGE_SIZE);

    // Reset page when month changes
    useEffect(() => { setPage(1); }, [selectedMonth]);

    // Format month label for dropdown
    const monthLabel = (ym: string) => {
        const [y, m] = ym.split('-');
        const monthNames = th
            ? ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
            : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${monthNames[parseInt(m) - 1]} ${th ? parseInt(y) + 543 : y}`;
    };

    return (
        <div>
            {/* Toolbar: Month Filter + Stats */}
            <div className="flex flex-wrap items-center gap-3 px-5 py-3 bg-slate-50 border-b border-slate-200">
                <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-slate-400" />
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 bg-white focus:ring-2 focus:ring-blue-200 outline-none"
                    >
                        <option value="latest">{th ? 'เดือนล่าสุด' : 'Latest Month'}</option>
                        {months.map(m => (
                            <option key={m} value={m}>{monthLabel(m)}</option>
                        ))}
                    </select>
                </div>
                <span className="text-xs text-slate-500">
                    {th ? `ทั้งหมด ${filtered.length.toLocaleString()} รายการ` : `Total: ${filtered.length.toLocaleString()} records`}
                    {filtered.length > PAGE_SIZE && (
                        <> · {th ? `หน้า ${currentPage}/${totalPages}` : `Page ${currentPage}/${totalPages}`}</>
                    )}
                </span>
                <span className="text-xs text-slate-400 ml-auto">
                    {th ? `(ข้อมูลทั้งระบบ ${logs.length.toLocaleString()} รายการ)` : `(${logs.length.toLocaleString()} total in system)`}
                </span>
            </div>

            {/* Scrollable Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[1100px]">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="text-left px-5 py-3 font-semibold text-slate-600 whitespace-nowrap">Time</th>
                            <th className="text-left px-5 py-3 font-semibold text-slate-600 whitespace-nowrap">Email</th>
                            <th className="text-left px-5 py-3 font-semibold text-slate-600 whitespace-nowrap">Status</th>
                            <th className="text-left px-5 py-3 font-semibold text-slate-600 whitespace-nowrap">IP Address</th>
                            <th className="text-left px-5 py-3 font-semibold text-slate-600 whitespace-nowrap">Reason</th>
                            <th className="text-left px-5 py-3 font-semibold text-slate-600 whitespace-nowrap">📍 Location</th>
                            <th className="text-left px-5 py-3 font-semibold text-slate-600 whitespace-nowrap">User Agent</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pageData.length === 0 ? (
                            <tr><td colSpan={7} className="px-5 py-8 text-center text-slate-400 text-sm">{th ? 'ไม่มีข้อมูล' : 'No data'}</td></tr>
                        ) : pageData.map((log) => (
                            <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                                <td className="px-5 py-3 text-slate-500 font-mono text-xs whitespace-nowrap">
                                    {new Date(log.timestamp).toLocaleString("th-TH")}
                                </td>
                                <td className="px-5 py-3 text-slate-700 whitespace-nowrap">{log.email}</td>
                                <td className="px-5 py-3">
                                    {log.success ? (
                                        <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs font-bold">Success</span>
                                    ) : (
                                        <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded text-xs font-bold">Failed</span>
                                    )}
                                </td>
                                <td className="px-5 py-3 text-slate-600 text-xs font-mono whitespace-nowrap">{log.ip_address || "—"}</td>
                                <td className="px-5 py-3 text-slate-500 text-xs whitespace-nowrap">{log.reason || log.method}</td>
                                <td className="px-5 py-3 text-xs whitespace-nowrap">
                                    {log.geo_location ? (
                                        <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{log.geo_location}</span>
                                    ) : (
                                        <span className="text-slate-300">—</span>
                                    )}
                                </td>
                                <td className="px-5 py-3 text-slate-400 text-xs">
                                    {log.user_agent === "unknown" ? "—" : log.user_agent || "—"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-t border-slate-200">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft size={14} /> {th ? 'ก่อนหน้า' : 'Previous'}
                    </button>
                    <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                            let p: number;
                            if (totalPages <= 7) {
                                p = i + 1;
                            } else if (currentPage <= 4) {
                                p = i + 1;
                            } else if (currentPage >= totalPages - 3) {
                                p = totalPages - 6 + i;
                            } else {
                                p = currentPage - 3 + i;
                            }
                            return (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${p === currentPage ? 'bg-[#71C5E8] text-white shadow' : 'text-slate-500 hover:bg-slate-100'
                                        }`}
                                >
                                    {p}
                                </button>
                            );
                        })}
                    </div>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        {th ? 'ถัดไป' : 'Next'} <ChevronRight size={14} />
                    </button>
                </div>
            )}
        </div>
    );
}
