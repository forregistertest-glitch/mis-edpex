"use client";

import { useState, useEffect } from "react";
import {
    UserPlus,
    Trash2,
    Shield,
    Loader2,
    Users,
    ChevronDown,
    AlertCircle,
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
        loadUsers();
    }, []);

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

    return (
        <div className="space-y-6">
            {/* Header */}
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
                            {lang === "th" ? "เพิ่ม/ลบ/เปลี่ยน Role ผู้ใช้" : "Add/Remove/Change roles"}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 hover:scale-[1.02] active:scale-95"
                >
                    <UserPlus size={16} />
                    {lang === "th" ? "เพิ่มผู้ใช้" : "Add User"}
                </button>
            </div>

            {/* Add User Form */}
            {showAddForm && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
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
                            className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-300 outline-none"
                        />
                        <input
                            type="text"
                            placeholder="ชื่อ-สกุล"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-300 outline-none"
                        />
                        <div className="relative">
                            <select
                                value={newRole}
                                onChange={(e) => setNewRole(e.target.value)}
                                className="appearance-none w-full border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-300 outline-none bg-white cursor-pointer"
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
                                            {isSelf ? (
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${rc.bg} ${rc.color}`}>
                                                    {rc.label}
                                                </span>
                                            ) : (
                                                <div className="relative inline-block">
                                                    <select
                                                        value={u.role}
                                                        onChange={(e) => handleRoleChange(u.email, e.target.value)}
                                                        className={`appearance-none px-3 py-1 pr-7 rounded-lg text-xs font-semibold border cursor-pointer ${rc.bg} ${rc.color} outline-none`}
                                                    >
                                                        <option value="user">User</option>
                                                        <option value="reviewer">Reviewer</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                    <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-5 py-3 text-xs text-slate-400">{formatDate(u.added_at)}</td>
                                        <td className="px-5 py-3 text-center">
                                            {!isSelf && (
                                                <button
                                                    onClick={() => setDeleteEmail(u.email)}
                                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                    title="ลบผู้ใช้"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
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
