"use client";

import { useState } from "react";
import { InternProfile } from "@/types/data-management";
import { Save, Loader2 } from "lucide-react";

interface InternProfileFormProps {
  initialData?: Partial<InternProfile>;
  onSubmit: (data: InternProfile) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function InternProfileForm({
  initialData = {},
  onSubmit,
  onCancel,
  loading = false,
}: InternProfileFormProps) {
  const [formData, setFormData] = useState<Partial<InternProfile>>({
    prename: "",
    full_name: "",
    sex: "ชาย",
    undergraduate_university: "",
    gpa: 0,
    admission_year: "",
    graduation_year: "",
    license_number: "",
    vet_generation: "",
    current_workplace: "",
    current_phone: "",
    current_email: "",
    current_address: "",
    ...initialData,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData as InternProfile);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Section 1: ข้อมูลพื้นฐาน */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 border-b pb-2">ข้อมูลพื้นฐาน (Profile)</h2>
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
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-100 outline-none"
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
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-100 outline-none"
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
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-100 outline-none"
            >
              <option value="ชาย">ชาย</option>
              <option value="หญิง">หญิง</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section 2: การศึกษา */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 border-b pb-2">ข้อมูลการศึกษา</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              มหาวิทยาลัยที่จบการศึกษา <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="undergraduate_university"
              value={formData.undergraduate_university}
              onChange={handleChange}
              required
              placeholder="เช่น มหาวิทยาลัยเกษตรศาสตร์"
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              เกรดเฉลี่ย <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="4"
              name="gpa"
              value={formData.gpa}
              onChange={handleChange}
              required
              placeholder="เช่น 3.50"
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">เลขที่ใบประกอบวิชาชีพ</label>
            <input
              type="text"
              name="license_number"
              value={formData.license_number}
              onChange={handleChange}
              placeholder="เช่น 12345"
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">สัตวแพทย์รุ่นที่</label>
            <input
              type="text"
              name="vet_generation"
              value={formData.vet_generation}
              onChange={handleChange}
              placeholder="เช่น รุ่นที่ 50"
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ปีที่เข้าศึกษา <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="admission_year"
              value={formData.admission_year}
              onChange={handleChange}
              required
              placeholder="เช่น 2565"
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ปีที่จบการศึกษา <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="graduation_year"
              value={formData.graduation_year}
              onChange={handleChange}
              required
              placeholder="เช่น 2566"
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-100 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Section 3: ข้อมูลติดต่อปัจจุบัน */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 border-b pb-2">ข้อมูลติดต่อปัจจุบัน (Current Contact)</h2>
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg mb-4">
          <p className="text-amber-800 text-sm">
            <strong>หมายเหตุ:</strong> ข้อมูลติดต่อเหล่านี้จะถูกอัพเดทเมื่อมีการเปลี่ยนแปลง 
            ระบบจะเก็บประวัติการทำงานไว้ใน Work History
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">สถานที่ทำงานปัจจุบัน</label>
            <input
              type="text"
              name="current_workplace"
              value={formData.current_workplace}
              onChange={handleChange}
              placeholder="เช่น โรงพยาบาลสัตว์..."
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์ปัจจุบัน</label>
            <input
              type="tel"
              name="current_phone"
              value={formData.current_phone}
              onChange={handleChange}
              placeholder="เช่น 081-234-5678"
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email ปัจจุบัน</label>
            <input
              type="email"
              name="current_email"
              value={formData.current_email}
              onChange={handleChange}
              placeholder="เช่น example@email.com"
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-100 outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">ที่อยู่ปัจจุบัน</label>
            <textarea
              name="current_address"
              value={formData.current_address}
              onChange={handleChange}
              rows={3}
              placeholder="ที่อยู่เต็ม..."
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-100 outline-none"
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
          className="px-6 py-2.5 bg-sky-600 text-white rounded-xl hover:bg-sky-700 flex items-center gap-2 shadow-lg shadow-sky-200 transition-all font-medium text-sm disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          บันทึกข้อมูล Profile
        </button>
      </div>
    </form>
  );
}
