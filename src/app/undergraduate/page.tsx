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
  Stethoscope,
  Info
} from "lucide-react";

export default function UndergraduatePage() {
  const [searchTerm, setSearchTerm] = useState("");

  const stats = [
    { label: "นิสิตทั้งหมด", value: "0", sub: "คน", color: "text-sky-600" },
    { label: "นิสิตใหม่", value: "0", sub: "คน", color: "text-emerald-600" },
    { label: "อัตราการคงอยู่", value: "0%", sub: "Average", color: "text-amber-600" },
    { label: "คะแนนเฉลี่ย", value: "0.00", sub: "GPAX", color: "text-purple-600" },
  ];

  return (
    <div className="container mx-auto p-6 font-sarabun min-h-screen bg-slate-50/30">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Link href="/?tab=Input" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-3 text-slate-800">
            <div className="bg-sky-600 p-2 rounded-xl shadow-md">
              <Stethoscope size={24} className="text-white" />
            </div>
            ข้อมูลการศึกษา ป.ตรี (Undergraduate Education)
          </h1>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-sky-50 border border-sky-100 rounded-2xl p-6 mb-8 flex items-start gap-4">
        <div className="bg-sky-100 p-2 rounded-full text-sky-600 mt-1">
            <Info size={20} />
        </div>
        <div>
            <h3 className="text-sky-800 font-bold mb-1">ส่วนงานนี้ยังอยู่ระหว่างการพัฒนา</h3>
            <p className="text-sky-700/80 text-sm leading-relaxed">
                ขณะนี้ระบบกำลังเตรียมความพร้อมของฐานข้อมูลนิสิตระดับปริญญาตรี เพื่อนำเข้าข้อมูลจากระบบทะเบียนและระบบสารสนเทศอื่น ๆ ของคณะ 
                ท่านสามารถดูโครงสร้างหน้าจอนี้เพื่อเป็นตัวอย่างการแสดงผลในอนาคตได้ครับ
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
        <div className="flex flex-1 gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาชื่อนิสิต, รหัสประจำตัว (ขณะนี้ยังไม่มีข้อมูล)..."
              disabled
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:outline-none cursor-not-allowed"
            />
          </div>
          <button disabled className="px-4 py-2 bg-white text-slate-400 border border-slate-200 rounded-xl flex items-center gap-2 text-sm font-medium cursor-not-allowed group">
            <Filter size={16} className="text-sky-600" />
            กรอง
          </button>
        </div>
        <div className="flex gap-2">
            <button disabled className="px-4 py-2 bg-white text-slate-400 border border-slate-200 rounded-xl flex items-center gap-2 text-sm font-medium opacity-50 cursor-not-allowed group">
                <Download size={16} className="text-sky-600" />
                Export
            </button>
            <button disabled className="px-5 py-2.5 bg-sky-600 text-white rounded-xl flex items-center gap-2 text-sm font-bold opacity-30 cursor-not-allowed shadow-sm">
                <Plus size={18} />
                เพิ่มข้อมูล
            </button>
        </div>
      </div>

      {/* Data Table Area */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-20 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-50 mb-4 border-2 border-dashed border-slate-200">
                <Database size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">ไม่พบข้อมูลนิสิต</h3>
            <p className="text-slate-400 text-sm max-w-xs mx-auto">
                ขออภัย ขณะนี้ยังไม่มีการนำเข้าข้อมูลนิสิตระดับปริญญาตรีเข้าสู่ระบบ สถิติที่ท่านเห็นจึงเป็นศูนย์
            </p>
        </div>
        
        {/* Placeholder Table Lines */}
        <div className="border-t border-slate-100 px-6 py-4 flex flex-col gap-4 opacity-10 select-none">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-10 bg-slate-200 rounded-lg w-full"></div>
            ))}
        </div>
      </div>
    </div>
  );
}
