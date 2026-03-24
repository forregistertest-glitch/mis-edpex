"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Search, Download, Upload, RefreshCw, Stethoscope } from "lucide-react";

export default function AcademicPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSheet, setActiveSheet] = useState<"residency" | "intern">("residency");

  return (
    <div className="container mx-auto p-6 font-sarabun">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/data-management" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-3 text-slate-800">
            <div className="bg-sky-600 p-2 rounded-xl shadow-md">
              <Stethoscope size={24} className="text-white" />
            </div>
            การศึกษา
          </h1>
        </div>
      </div>

      {/* Description */}
      <div className="bg-sky-50 border border-sky-100 rounded-2xl p-6 mb-6">
        <p className="text-sky-800 text-sm">
          <strong>ตัวอย่างการออกแบบ:</strong> หน้านี้จะแสดงข้อมูล Resident และ Intern 
          โดยมี 2 sheets แยกกัน (Residency และ Intern)
        </p>
      </div>

      {/* Sheet Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveSheet("residency")}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            activeSheet === "residency"
              ? "bg-sky-600 text-white shadow-md"
              : "bg-white text-gray-600 border border-gray-200 hover:bg-sky-50"
          }`}
        >
          Residency
        </button>
        <button
          onClick={() => setActiveSheet("intern")}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            activeSheet === "intern"
              ? "bg-sky-600 text-white shadow-md"
              : "bg-white text-gray-600 border border-gray-200 hover:bg-sky-50"
          }`}
        >
          Intern
        </button>
      </div>

      {/* Action Bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:border-sky-400 hover:bg-sky-50 text-gray-700 rounded-lg transition-all shadow-sm">
            <Upload size={18} className="text-sky-600" />
            นำเข้าข้อมูล
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:border-sky-400 hover:bg-sky-50 text-gray-700 rounded-lg transition-all shadow-sm">
            <Download size={18} className="text-sky-600" />
            ส่งออก
          </button>
        </div>
        <Link href="/data-management/academic/new" className="bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition-all text-sm font-medium">
          <Plus size={18} />
          เพิ่มข้อมูลใหม่
        </Link>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-100 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="ค้นหาชื่อ, สาขา, อาจารย์ที่ปรึกษา..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 hover:border-sky-400 hover:bg-sky-50 text-gray-700 rounded-lg text-sm font-medium transition-all shadow-sm">
            <RefreshCw size={18} className="text-sky-600" />
          </button>
        </div>

        {/* Empty State */}
        <div className="p-20 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-sky-50 mb-4 border-2 border-dashed border-sky-200">
            <Stethoscope size={32} className="text-sky-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-700 mb-2">
            ยังไม่มีข้อมูล {activeSheet === "residency" ? "Residency" : "Intern"}
          </h3>
          <p className="text-slate-400 text-sm max-w-xs mx-auto mb-4">
            นี่เป็นตัวอย่างการออกแบบ UI เท่านั้น ยังไม่มีการเชื่อมต่อกับฐานข้อมูล
          </p>
          <Link href="/data-management/academic/new" className="inline-flex items-center gap-2 text-sm text-sky-600 hover:text-sky-700 font-medium">
            <Plus size={16} />
            เพิ่มข้อมูลแรก
          </Link>
        </div>
      </div>
    </div>
  );
}
