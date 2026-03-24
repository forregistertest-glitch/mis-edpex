"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Search, Download, Upload, RefreshCw, GraduationCap } from "lucide-react";

export default function PostgraduatePage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="container mx-auto p-6 font-sarabun">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/data-management" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-3 text-slate-800">
            <div className="bg-purple-600 p-2 rounded-xl shadow-md">
              <GraduationCap size={24} className="text-white" />
            </div>
            ข้อมูลบัณฑิตศึกษา
          </h1>
        </div>
      </div>

      {/* Description */}
      <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6 mb-6">
        <p className="text-purple-800 text-sm">
          <strong>ตัวอย่างการออกแบบ:</strong> หน้านี้จะแสดงข้อมูลนิสิตระดับบัณฑิตศึกษา 
          พร้อมผลงานตีพิมพ์และความก้าวหน้าในการศึกษา
        </p>
      </div>

      {/* Action Bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:border-purple-400 hover:bg-purple-50 text-gray-700 rounded-lg transition-all shadow-sm">
            <Upload size={18} className="text-purple-600" />
            นำเข้าข้อมูล
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:border-purple-400 hover:bg-purple-50 text-gray-700 rounded-lg transition-all shadow-sm">
            <Download size={18} className="text-purple-600" />
            ส่งออก
          </button>
        </div>
        <Link href="/data-management/postgraduate/new" className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition-all text-sm font-medium">
          <Plus size={18} />
          เพิ่มนิสิต
        </Link>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-100 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="ค้นหารหัสนิสิต, ชื่อ, สาขา, อาจารย์ที่ปรึกษา..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 hover:border-purple-400 hover:bg-purple-50 text-gray-700 rounded-lg text-sm font-medium transition-all shadow-sm">
            <RefreshCw size={18} className="text-purple-600" />
          </button>
        </div>

        {/* Empty State */}
        <div className="p-20 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-50 mb-4 border-2 border-dashed border-purple-200">
            <GraduationCap size={32} className="text-purple-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-700 mb-2">ยังไม่มีข้อมูล</h3>
          <p className="text-slate-400 text-sm max-w-xs mx-auto mb-4">
            นี่เป็นตัวอย่างการออกแบบ UI เท่านั้น ยังไม่มีการเชื่อมต่อกับฐานข้อมูล
          </p>
          <Link href="/data-management/postgraduate/new" className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium">
            <Plus size={16} />
            เพิ่มนิสิตคนแรก
          </Link>
        </div>
      </div>
    </div>
  );
}
