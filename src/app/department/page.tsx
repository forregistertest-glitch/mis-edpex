"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Search, 
  Download, 
  Plus, 
  Filter, 
  Database,
  Landmark,
  Info,
  MapPin,
  Users
} from "lucide-react";

export default function DepartmentPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const stats = [
    { label: "ภาควิชาทั้งหมด", value: "0", sub: "Departments", color: "text-slate-600" },
    { label: "หน่วยงานสนับสนุน", value: "0", sub: "Units", color: "text-blue-600" },
    { label: "งบประมาณจัดสรร", value: "0", sub: "Million THB", color: "text-indigo-600" },
    { label: "พื้นที่รวม", value: "0", sub: "sq.m.", color: "text-amber-600" },
  ];

  return (
    <div className="container mx-auto p-6 font-sarabun min-h-screen bg-slate-100/30">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Link href="/?tab=Input" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-3 text-slate-800">
            <div className="bg-slate-600 p-2 rounded-xl shadow-md">
              <Landmark size={24} className="text-white" />
            </div>
            ภาควิชา
          </h1>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-slate-100 border border-slate-200 rounded-2xl p-6 mb-8 flex items-start gap-4">
        <div className="bg-white p-2 rounded-full text-slate-600 shadow-sm mt-1">
            <Info size={20} />
        </div>
        <div>
            <h3 className="text-slate-800 font-bold mb-1">ส่วนงานนี้ยังอยู่ระหว่างการเตรียมฐานข้อมูล</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
                ขณะนี้กำลังจัดทำฐานข้อมูลกลางสำหรับหน่วยงานภายในคณะ (Master Data) ทั้งภาควิชาและส่วนงานสนับสนุน เพื่อให้ข้อมูลอาคาร สถานที่ และงบประมาณเชื่อมโยงกันอย่างเป็นระบบครับ
            </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
            <div className="flex items-baseline gap-1">
              <span className={`text-3xl font-bold ${stat.color}`}>{stat.value}</span>
              <span className="text-xs text-slate-400 font-medium">{stat.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Action Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นชื่อภาควิชา..."
              disabled
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-gray-100 rounded-xl text-sm opacity-50 cursor-not-allowed"
            />
          </div>
        </div>
        <div className="flex gap-2">
            <button disabled className="px-4 py-2 bg-white text-slate-400 border border-slate-200 rounded-xl flex items-center gap-2 text-sm font-medium opacity-50 cursor-not-allowed group">
                <MapPin size={16} className="text-slate-600" />
                ดูแผนที่
            </button>
            <button disabled className="px-5 py-2.5 bg-slate-600 text-white rounded-xl flex items-center gap-2 text-sm font-bold opacity-30 cursor-not-allowed shadow-sm">
                <Plus size={18} />
                เพิ่มหน่วยงาน
            </button>
        </div>
      </div>

      {/* Grid View Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm opacity-40 select-none">
                <div className="w-12 h-12 bg-slate-100 rounded-lg mb-4"></div>
                <div className="h-4 bg-slate-100 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-50 rounded w-1/2 mb-6"></div>
                <div className="flex flex-col gap-2">
                    <div className="h-2 bg-slate-50 rounded w-full"></div>
                    <div className="h-2 bg-slate-50 rounded w-full"></div>
                </div>
            </div>
        ))}
      </div>

      <div className="p-20 text-center">
          <h3 className="text-xl font-bold text-slate-400">อยู่ระหว่างนำเข้าข้อมูลภาควิชา</h3>
      </div>
    </div>
  );
}
