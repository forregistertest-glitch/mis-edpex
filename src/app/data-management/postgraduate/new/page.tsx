"use client";

import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

export default function NewPostgraduatePage() {
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
              <Link href="/data-management/postgraduate" className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-600">
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-800">เพิ่มข้อมูลนิสิตบัณฑิตศึกษา</h1>
                <p className="text-slate-500 text-xs md:text-sm">Add New Postgraduate Student (UI Sample)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 md:p-8">
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl mb-6">
          <p className="text-amber-800 text-sm">
            <strong>ตัวอย่าง UI:</strong> Form นี้จะมีโครงสร้างคล้าย StudentForm.tsx 
            พร้อม tabs สำหรับข้อมูลส่วนตัว, การศึกษา, อาจารย์ที่ปรึกษา, ผลงานตีพิมพ์, ความก้าวหน้า
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800 border-b pb-2">ข้อมูลตัวอย่าง (Sample Form)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">รหัสนิสิต</label>
                  <input type="text" className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-100 outline-none" placeholder="เช่น 6210101234" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล</label>
                  <input type="text" className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-100 outline-none" placeholder="เช่น นายสมชาย ใจดี" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">สาขาวิชา</label>
                  <input type="text" className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-100 outline-none" placeholder="เช่น สัตวแพทยศาสตร์" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">อาจารย์ที่ปรึกษา</label>
                  <input type="text" className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-100 outline-none" placeholder="เช่น รศ.ดร.สมหญิง ใจดี" />
                </div>
              </div>
            </div>

            <div className="pt-6 flex justify-end gap-3 border-t border-slate-100">
              <Link href="/data-management/postgraduate" className="px-6 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all font-medium text-sm">
                ยกเลิก
              </Link>
              <button type="submit" className="px-6 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 flex items-center gap-2 shadow-lg shadow-purple-200 transition-all font-medium text-sm">
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
