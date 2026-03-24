"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

export default function NewAcademicPage() {
  const [dataType, setDataType] = useState<"residency" | "intern">("residency");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("นี่เป็นตัวอย่าง UI เท่านั้น - ยังไม่มีการบันทึกข้อมูลจริง");
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sarabun">
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/data-management/academic" className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-600">
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-800">เพิ่มข้อมูลการศึกษา</h1>
                <p className="text-slate-500 text-xs md:text-sm">Add New Academic Data (UI Sample)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 md:p-8">
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl mb-6">
          <p className="text-amber-800 text-sm">
            <strong>ตัวอย่าง UI:</strong> Form นี้จะมี 2 ประเภท (Residency และ Intern) 
            ตามโครงสร้างใน Excel ที่มี 2 sheets
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Type Selector */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800 border-b pb-2">เลือกประเภทข้อมูล</h2>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setDataType("residency")}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                    dataType === "residency"
                      ? "border-sky-600 bg-sky-50 text-sky-700"
                      : "border-gray-200 hover:border-sky-300"
                  }`}
                >
                  <div className="font-bold">Residency</div>
                  <div className="text-xs text-gray-500">สัตวแพทย์ประจำบ้าน</div>
                </button>
                <button
                  type="button"
                  onClick={() => setDataType("intern")}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                    dataType === "intern"
                      ? "border-sky-600 bg-sky-50 text-sky-700"
                      : "border-gray-200 hover:border-sky-300"
                  }`}
                >
                  <div className="font-bold">Intern</div>
                  <div className="text-xs text-gray-500">นักศึกษาฝึกงาน</div>
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800 border-b pb-2">
                ข้อมูล {dataType === "residency" ? "Residency" : "Intern"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล</label>
                  <input type="text" className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-100 outline-none" placeholder="เช่น น.สพ.สมชาย ใจดี" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">เพศ</label>
                  <select className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-100 outline-none">
                    <option>ชาย</option>
                    <option>หญิง</option>
                  </select>
                </div>
                {dataType === "residency" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">สาขาวิชาที่ฝึกอบรม</label>
                      <input type="text" className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-100 outline-none" placeholder="เช่น สัตวแพทย์ศาสตร์คลินิก" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">อาจารย์ที่ปรึกษา</label>
                      <input type="text" className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-100 outline-none" placeholder="เช่น รศ.ดร.สมหญิง ใจดี" />
                    </div>
                  </>
                )}
                {dataType === "intern" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">มหาวิทยาลัยที่จบ</label>
                      <input type="text" className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-100 outline-none" placeholder="เช่น มหาวิทยาลัยเกษตรศาสตร์" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">เกรดเฉลี่ย</label>
                      <input type="number" step="0.01" className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-100 outline-none" placeholder="เช่น 3.50" />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="pt-6 flex justify-end gap-3 border-t border-slate-100">
              <Link href="/data-management/academic" className="px-6 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all font-medium text-sm">
                ยกเลิก
              </Link>
              <button type="submit" className="px-6 py-2.5 bg-sky-600 text-white rounded-xl hover:bg-sky-700 flex items-center gap-2 shadow-lg shadow-sky-200 transition-all font-medium text-sm">
                <Save size={18} />
                บันทึกข้อมูล
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
