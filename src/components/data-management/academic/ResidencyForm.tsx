"use client";

import { useState } from "react";
import { ResidencyData } from "@/types/data-management";
import { Save, Loader2 } from "lucide-react";

interface ResidencyFormProps {
  initialData?: Partial<ResidencyData>;
  onSubmit: (data: ResidencyData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function ResidencyForm({
  initialData = {},
  onSubmit,
  onCancel,
  loading = false,
}: ResidencyFormProps) {
  const [formData, setFormData] = useState<Partial<ResidencyData>>({
    prename: "",
    full_name: "",
    sex: "ชาย",
    advisor_name: "",
    advisor_affiliation: "",
    training_specialty: "",
    concurrent_study: "",
    training_start_year: "",
    comprehensive_exam_date: "",
    comprehensive_exam_status: "",
    final_oral_exam_date: "",
    final_oral_exam_status: "",
    training_end_year: "",
    certificate_date: "",
    research_title: "",
    journal_name: "",
    publication_year: "",
    undergraduate_university: "",
    personnel_status: "",
    training_status: "",
    teaching_participation: "",
    ...initialData,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData as ResidencyData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Section 1: ข้อมูลพื้นฐาน */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 border-b pb-2">ข้อมูลพื้นฐาน</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              คำนำหน้า <span className="text-red-500">*</span>
            </label>
            <select
              name="prename"
              value={formData.prename}
              onChange={handleChange}
              required
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-100 outline-none"
            >
              <option value="">-- เลือก --</option>
              <option value="น.สพ.">น.สพ.</option>
              <option value="สพ.ญ.">สพ.ญ.</option>
              <option value="นาย">นาย</option>
              <option value="นาง">นาง</option>
              <option value="นางสาว">นางสาว</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ชื่อ - นามสกุล <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
              placeholder="เช่น สมชาย ใจดี"
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              เพศ <span className="text-red-500">*</span>
            </label>
            <select
              name="sex"
              value={formData.sex}
              onChange={handleChange}
              required
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-100 outline-none"
            >
              <option value="ชาย">ชาย</option>
              <option value="หญิง">หญิง</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              มหาวิทยาลัยที่จบ สพ.บ. <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="undergraduate_university"
              value={formData.undergraduate_university}
              onChange={handleChange}
              required
              placeholder="เช่น มหาวิทยาลัยเกษตรศาสตร์"
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-100 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Section 2: อาจารย์ที่ปรึกษาและสาขาวิชา */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 border-b pb-2">อาจารย์ที่ปรึกษาและสาขาวิชา</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              อาจารย์ที่ปรึกษา <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="advisor_name"
              value={formData.advisor_name}
              onChange={handleChange}
              required
              placeholder="เช่น รศ.ดร.สมชาย ใจดี"
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">สังกัดอาจารย์ที่ปรึกษา</label>
            <input
              type="text"
              name="advisor_affiliation"
              value={formData.advisor_affiliation}
              onChange={handleChange}
              placeholder="เช่น ภาควิชาสรีรวิทยา"
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-100 outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              สาขาวิชาที่ฝึกอบรม <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="training_specialty"
              value={formData.training_specialty}
              onChange={handleChange}
              required
              placeholder="เช่น สาขาวิชาเวชศาสตร์สัตว์ปีก"
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-100 outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              สัตวแพทย์ประจำบ้านฯ เรียนควบคู่กับ ป.โท, ป.บัณฑิตชั้นสูง
            </label>
            <input
              type="text"
              name="concurrent_study"
              value={formData.concurrent_study}
              onChange={handleChange}
              placeholder="เช่น ป.โท สาขาวิชา..."
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-100 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Section 3: ข้อมูลการฝึกอบรม */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 border-b pb-2">ข้อมูลการฝึกอบรม</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ปีที่เข้าฝึกอบรม <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="training_start_year"
              value={formData.training_start_year}
              onChange={handleChange}
              required
              placeholder="เช่น 2565"
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ปีที่จบฝึกอบรม</label>
            <input
              type="text"
              name="training_end_year"
              value={formData.training_end_year}
              onChange={handleChange}
              placeholder="เช่น 2568"
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">สถานะการฝึกอบรม</label>
            <select
              name="training_status"
              value={formData.training_status}
              onChange={handleChange}
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-100 outline-none"
            >
              <option value="">-- เลือก --</option>
              <option value="กำลังฝึกอบรม">กำลังฝึกอบรม</option>
              <option value="จบการฝึกอบรม">จบการฝึกอบรม</option>
              <option value="พ้นสภาพ">พ้นสภาพ</option>
              <option value="ลาออก">ลาออก</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">วันที่ได้รับวุฒิบัตร</label>
            <input
              type="date"
              name="certificate_date"
              value={formData.certificate_date}
              onChange={handleChange}
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-100 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Section 4: การสอบ */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 border-b pb-2">การสอบ</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              วันที่สอบประมวลความรู้/วัดคุณสมบัติ
            </label>
            <input
              type="date"
              name="comprehensive_exam_date"
              value={formData.comprehensive_exam_date}
              onChange={handleChange}
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              สถานะการสอบประมวลความรู้/วัดคุณสมบัติ
            </label>
            <select
              name="comprehensive_exam_status"
              value={formData.comprehensive_exam_status}
              onChange={handleChange}
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-100 outline-none"
            >
              <option value="">-- เลือก --</option>
              <option value="ผ่าน">ผ่าน</option>
              <option value="ไม่ผ่าน">ไม่ผ่าน</option>
              <option value="รอสอบ">รอสอบ</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              วันที่สอบปากเปล่าขั้นสุดท้าย
            </label>
            <input
              type="date"
              name="final_oral_exam_date"
              value={formData.final_oral_exam_date}
              onChange={handleChange}
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              สถานะสอบปากเปล่าขั้นสุดท้าย
            </label>
            <select
              name="final_oral_exam_status"
              value={formData.final_oral_exam_status}
              onChange={handleChange}
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-100 outline-none"
            >
              <option value="">-- เลือก --</option>
              <option value="ผ่าน">ผ่าน</option>
              <option value="ไม่ผ่าน">ไม่ผ่าน</option>
              <option value="รอสอบ">รอสอบ</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section 5: ผลงานวิจัย */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 border-b pb-2">ผลงานวิจัย</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ชื่อผลงานวิจัยที่ตีพิมพ์
            </label>
            <textarea
              name="research_title"
              value={formData.research_title}
              onChange={handleChange}
              rows={2}
              placeholder="ชื่อผลงานวิจัย..."
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">วารสารที่ตีพิมพ์</label>
            <input
              type="text"
              name="journal_name"
              value={formData.journal_name}
              onChange={handleChange}
              placeholder="เช่น Thai Journal of Veterinary Medicine"
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ปีที่ตีพิมพ์</label>
            <input
              type="text"
              name="publication_year"
              value={formData.publication_year}
              onChange={handleChange}
              placeholder="เช่น 2567"
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-100 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Section 6: สถานะและการมีส่วนร่วม */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 border-b pb-2">สถานะและการมีส่วนร่วม</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">สถานะการเป็นบุคลากร</label>
            <select
              name="personnel_status"
              value={formData.personnel_status}
              onChange={handleChange}
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-100 outline-none"
            >
              <option value="">-- เลือก --</option>
              <option value="เป็นบุคลากร">เป็นบุคลากร</option>
              <option value="ไม่เป็นบุคลากร">ไม่เป็นบุคลากร</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">การมีส่วนร่วมสอน/แนะนำ</label>
            <input
              type="text"
              name="teaching_participation"
              value={formData.teaching_participation}
              onChange={handleChange}
              placeholder="เช่น สอนนิสิตปริญญาตรี"
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-100 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-6 flex justify-end gap-3 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all font-medium text-sm"
        >
          ยกเลิก
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 flex items-center gap-2 shadow-lg shadow-emerald-200 transition-all font-medium text-sm disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          บันทึกข้อมูล
        </button>
      </div>
    </form>
  );
}
