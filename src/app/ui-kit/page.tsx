"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import {
    Users,
    GraduationCap,
    FlaskConical,
    ArrowLeft,
    Plus,
    Upload,
    Search,
    ChevronLeft,
    ChevronRight,
    ArrowUp,
    Trash2,
    Edit,
    LayoutDashboard
} from 'lucide-react';

export default function UIKitPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="container mx-auto p-6 font-sarabun max-w-7xl">
                <div className="flex items-center gap-4 mb-12 border-b border-gray-200 pb-6">
                    <button onClick={() => router.push('/')} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-gray-700 bg-white shadow-sm border border-gray-100">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500">
                            KUVMIS UI Kit & Design System
                        </h1>
                        <p className="text-slate-500 mt-1">A unified repository of components and styles for AI Agents & Developers</p>
                    </div>
                </div>

                {/* --- Section 1: Colors & Themes --- */}
                <section className="mb-16">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm">1</span>
                        Theme Colors by Module
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                        {/* HR */}
                        <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm flex flex-col items-center">
                            <div className="bg-green-600 p-4 rounded-xl shadow-sm mb-4">
                                <Users size={32} className="text-white" />
                            </div>
                            <h3 className="font-bold text-lg text-slate-800">HR / Staff</h3>
                            <p className="text-sm text-green-600 font-mono mt-2 bg-green-50 px-3 py-1 rounded">Theme: Green</p>
                            <div className="w-full mt-4 space-y-2">
                                <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Primary Button</button>
                                <button className="w-full bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 px-4 py-2 rounded-lg text-sm font-bold transition-all">Secondary Action</button>
                            </div>
                        </div>

                        {/* Student */}
                        <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm flex flex-col items-center">
                            <div className="bg-blue-600 p-4 rounded-xl shadow-sm mb-4">
                                <GraduationCap size={32} className="text-white" />
                            </div>
                            <h3 className="font-bold text-lg text-slate-800">Academic</h3>
                            <p className="text-sm text-blue-600 font-mono mt-2 bg-blue-50 px-3 py-1 rounded">Theme: Blue</p>
                            <div className="w-full mt-4 space-y-2">
                                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Primary Button</button>
                                <button className="w-full bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 px-4 py-2 rounded-lg text-sm font-bold transition-all">Secondary Action</button>
                            </div>
                        </div>

                        {/* Research */}
                        <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm flex flex-col items-center">
                            <div className="bg-indigo-600 p-4 rounded-xl shadow-sm mb-4">
                                <FlaskConical size={32} className="text-white" />
                            </div>
                            <h3 className="font-bold text-lg text-slate-800">Research</h3>
                            <p className="text-sm text-indigo-600 font-mono mt-2 bg-indigo-50 px-3 py-1 rounded">Theme: Indigo</p>
                            <div className="w-full mt-4 space-y-2">
                                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Primary Button</button>
                                <button className="w-full bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 px-4 py-2 rounded-lg text-sm font-bold transition-all">Secondary Action</button>
                            </div>
                        </div>

                        {/* Strategic */}
                        <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm flex flex-col items-center">
                            <div className="bg-purple-600 p-4 rounded-xl shadow-sm mb-4">
                                <LayoutDashboard size={32} className="text-white" />
                            </div>
                            <h3 className="font-bold text-lg text-slate-800">Strategic</h3>
                            <p className="text-sm text-purple-600 font-mono mt-2 bg-purple-50 px-3 py-1 rounded">Theme: Purple</p>
                            <div className="w-full mt-4 space-y-2">
                                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Primary Button</button>
                                <button className="w-full bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 px-4 py-2 rounded-lg text-sm font-bold transition-all">Secondary Action</button>
                            </div>
                        </div>

                    </div>
                </section>

                {/* --- Section 2: Page Anatomy --- */}
                <section className="mb-16">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm">2</span>
                        Standard Page Anatomy (Example: HR Module)
                    </h2>

                    {/* Fake Page Wrapper */}
                    <div className="bg-slate-50 p-6 rounded-3xl border-2 border-dashed border-gray-300">

                        {/* ACTION BAR */}
                        <div className="flex flex-col gap-3 mb-6 relative">
                            <span className="absolute -left-3 -top-3 bg-slate-800 text-white text-[10px] px-2 py-0.5 rounded uppercase tracking-wide font-mono z-10">Action Bar</span>
                            <div className="flex justify-between items-center border-2 border-red-200 p-4 rounded-xl bg-white bg-opacity-50">
                                <div className="flex items-center gap-4">
                                    <h1 className="text-2xl font-bold flex items-center gap-3">
                                        <div className="bg-green-600 p-2 rounded-lg shadow-sm">
                                            <Users size={24} className="text-white" />
                                        </div>
                                        ระบบบุคลากร (HR)
                                    </h1>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="flex items-center gap-2 bg-white border border-gray-300 hover:border-green-400 hover:bg-green-50 text-gray-700 px-4 py-2 rounded-lg transition-all shadow-sm text-sm font-medium">
                                        <Upload size={16} /> นำเข้า
                                    </button>
                                    <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors text-sm font-medium">
                                        <Plus size={16} /> เพิ่มข้อมูล
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* MAIN CONTAINER */}
                        <div className="bg-white rounded-xl shadow-sm border-2 border-blue-200 overflow-hidden relative">
                            <span className="absolute -left-0 -top-0 bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-br uppercase tracking-wide font-mono z-10">Main Content Wrapper</span>

                            {/* FILTER BAR */}
                            <div className="p-4 pt-8 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center border-b-2 border-dashed border-purple-200 relative">
                                <span className="absolute left-4 top-2 text-purple-600 text-[10px] font-bold uppercase tracking-wide font-mono z-10">Filter & Tabs</span>
                                <div className="flex flex-1 gap-2 max-w-lg w-full">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder="ค้นหา..."
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            disabled
                                        />
                                    </div>
                                </div>
                                <div className="flex border-b border-gray-100">
                                    <button className="px-4 py-2 text-sm font-bold border-b-2 border-green-600 text-green-700">รายการปกติ (12)</button>
                                    <button className="px-4 py-2 text-sm font-bold border-b-2 border-transparent text-gray-400">รายการที่ยกเลิก (0)</button>
                                </div>
                            </div>

                            {/* TABLE */}
                            <div className="p-4 relative">
                                <span className="absolute right-4 top-4 text-orange-500 text-[10px] font-bold uppercase tracking-wide font-mono z-10">Data Table</span>
                                <table className="w-full text-left border-collapse border border-orange-100 rounded-lg overflow-hidden">
                                    <thead>
                                        <tr className="bg-gray-50 text-gray-600 text-sm uppercase">
                                            <th className="p-4 border-b font-semibold border-orange-100">Name</th>
                                            <th className="p-4 border-b font-semibold border-orange-100">Role</th>
                                            <th className="p-4 border-b font-semibold border-orange-100">Status</th>
                                            <th className="p-4 border-b font-semibold text-right border-orange-100">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="hover:bg-slate-50 transition-colors group">
                                            <td className="p-4 font-bold text-gray-900 border-b border-transparent group-hover:border-green-200 transition-all inline-block w-max">สมชาย ใจดี</td>
                                            <td className="p-4 text-sm text-gray-600">อาจารย์</td>
                                            <td className="p-4">
                                                <span className="text-[10px] bg-green-50 text-green-700 px-2 py-1 rounded-full font-bold border border-green-200">Active</span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-1 opacity-20 group-hover:opacity-100 transition-all">
                                                    <button className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"><Edit size={16} /></button>
                                                    <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                        </div>
                    </div>
                </section>

                {/* --- Section 3: Pagination & Back to Top --- */}
                <section className="mb-16">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm">3</span>
                        Pagination & Navigation
                    </h2>
                    <div className="bg-slate-50 p-6 rounded-3xl border-2 border-dashed border-gray-300">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative">
                            <span className="absolute -left-3 -top-3 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded uppercase tracking-wide font-mono z-10">Data Table Bottom</span>

                            {/* Mock Table Content */}
                            <div className="h-32 bg-slate-50 rounded-lg border border-slate-100 mb-6 flex items-center justify-center text-slate-400 text-sm">
                                [... Data Rows ...]
                            </div>

                            {/* Pagination Area */}
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-100">
                                <div className="text-sm text-gray-500">
                                    แสดง <span className="font-semibold text-gray-900">1</span> ถึง <span className="font-semibold text-gray-900">10</span> จากข้อมูลทั้งหมด <span className="font-semibold text-gray-900">12</span> รายการ
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-2 border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                        <ChevronLeft size={16} />
                                    </button>
                                    <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600 text-white font-medium text-sm">
                                        1
                                    </button>
                                    <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-700 font-medium text-sm transition-colors">
                                        2
                                    </button>
                                    <button className="p-2 border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Back to Top Example */}
                        <div className="mt-8 flex justify-end">
                            <div className="relative">
                                <span className="absolute right-14 top-3 text-gray-500 text-[10px] font-bold uppercase tracking-wide font-mono z-10 hidden sm:block">Back to Top (Fixed Bottom Right)</span>
                                <button className="bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-full shadow-lg transition-all hover:-translate-y-1">
                                    <ArrowUp size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- Section 4: Badges --- */}
                <section className="mb-16">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm">4</span>
                        Badges & Status Tags
                    </h2>
                    <div className="flex gap-4 flex-wrap p-6 border border-gray-200 rounded-2xl bg-white shadow-sm">
                        <span className="text-xs font-bold px-3 py-1 rounded-full inline-block border bg-green-50 text-green-700 border-green-200">Success Status</span>
                        <span className="text-xs font-bold px-3 py-1 rounded-full inline-block border bg-blue-50 text-blue-700 border-blue-200">Processing</span>
                        <span className="text-xs font-bold px-3 py-1 rounded-full inline-block border bg-gray-100 text-gray-600 border-gray-200">Neutral Info</span>

                        {/* Boxy variants */}
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded border border-emerald-200">IMPORT EXCEL</span>
                        <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold border border-red-200 uppercase">DELETED</span>
                    </div>
                </section>

            </div>
        </div>
    );
}
