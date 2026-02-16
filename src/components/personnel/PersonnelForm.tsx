"use client";

import { useState, useEffect } from "react";
import { Personnel } from "@/types/personnel";
import { Save, Loader2, Hash } from "lucide-react";
import { DateTime } from "luxon";

interface PersonnelFormProps {
  initialData?: Partial<Personnel>;
  onSubmit: (data: Partial<Personnel>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  isEdit?: boolean;
}

export default function PersonnelForm({ 
  initialData = {}, 
  onSubmit, 
  onCancel, 
  loading = false,
  isEdit = false 
}: PersonnelFormProps) {
  const [formData, setFormData] = useState<Partial<Personnel>>({
    title_th: "",
    first_name_th: "",
    last_name_th: "",
    position: "",
    affiliation: "",
    department: "",
    campus: "บางเขน",
    employment_status: "พนักงานมหาวิทยาลัย",
    gender: "",
    education_level: "",
    degree_name: "",
    birth_date: "",
    start_date: "",
    ...initialData
  });

  // Auto-calculate Generation and Retirement
  useEffect(() => {
    if (formData.birth_date) {
      const birthYear = DateTime.fromISO(formData.birth_date).year;
      if (!isNaN(birthYear)) {
        const retirementYear = birthYear + 60;
        let gen = "";
        if (birthYear >= 1997) gen = "Gen Z";
        else if (birthYear >= 1981) gen = "Gen Y";
        else if (birthYear >= 1965) gen = "Gen X";
        else gen = "Baby Boomer";

        setFormData(prev => ({
          ...prev,
          retirement_year: retirementYear,
          generation: gen
        }));
      }
    }
  }, [formData.birth_date]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      {/* Read-only ID Alert for Edit Mode */}
      {isEdit && (
        <div className="bg-blue-50 text-blue-800 p-3 rounded-xl text-sm border border-blue-200 flex gap-2 items-center">
           <Hash size={16} />
           <span>Personnel ID cannot be changed once created.</span>
        </div>
      )}

      {/* Section 1: Identity */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">ข้อมูลส่วนตัว (Personal Info)</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">คำนำหน้า</label>
            <select
              name="title_th"
              value={formData.title_th}
              onChange={handleChange}
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none"
            >
              <option value="">เลือก...</option>
              <option value="นาย">นาย</option>
              <option value="นาง">นาง</option>
              <option value="น.ส.">น.ส.</option>
              <option value="ดร.">ดร.</option>
              <option value="รศ.ดร.">รศ.ดร.</option>
              <option value="ผศ.ดร.">ผศ.ดร.</option>
              <option value="ผศ.">ผศ.</option>
              <option value="รศ.">รศ.</option>
              <option value="ศ.">ศ.</option>
            </select>
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">รหัสบุคลากร *</label>
            <input
              type="text"
              name="personnel_id"
              required
              disabled={isEdit}
              value={formData.personnel_id || ""}
              onChange={handleChange}
              className={`w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none ${isEdit ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`}
            />
          </div>
           <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ *</label>
            <input
              type="text"
              name="first_name_th"
              required
              value={formData.first_name_th || ""}
              onChange={handleChange}
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">นามสกุล</label>
            <input
              type="text"
              name="last_name_th"
              value={formData.last_name_th || ""}
              onChange={handleChange}
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">เพศ</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
               className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none"
            >
               <option value="">เลือก...</option>
              <option value="ชาย">ชาย</option>
              <option value="หญิง">หญิง</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">วันเกิด</label>
            <input
              type="date"
              name="birth_date"
              value={formData.birth_date || ""}
              onChange={handleChange}
               className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Generation (Auto)</label>
            <input
              type="text"
              name="generation"
              disabled
              value={formData.generation || ""}
               className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-500"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Work info */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">ข้อมูลการทำงาน (Employment)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ตำแหน่ง</label>
             <input
              type="text"
              name="position"
              value={formData.position || ""}
              onChange={handleChange}
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none"
              list="form-positions"
            />
            <datalist id="form-positions">
                <option value="อาจารย์" />
                <option value="เจ้าหน้าที่บริหารงานทั่วไป" />
                <option value="นักวิทยาศาสตร์" />
                <option value="นายสัตวแพทย์" />
            </datalist>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">สังกัด (Faculty/Office)</label>
             <input
              type="text"
              name="affiliation"
              value={formData.affiliation || ""}
              onChange={handleChange}
               className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">แผนก (Department/Unit)</label>
             <input
              type="text"
              name="department"
              value={formData.department || ""}
              onChange={handleChange}
               className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">วิทยาเขต</label>
            <select
              name="campus"
              value={formData.campus}
              onChange={handleChange}
               className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none"
            >
              <option value="บางเขน">บางเขน</option>
              <option value="กำแพงแสน">กำแพงแสน</option>
            </select>
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">สถานภาพ</label>
             <select
              name="employment_status"
              value={formData.employment_status}
              onChange={handleChange}
               className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none"
            >
               <option value="ข้าราชการ">ข้าราชการ</option>
              <option value="พนักงานมหาวิทยาลัย">พนักงานมหาวิทยาลัย</option>
              <option value="พนักงานเงินรายได้">พนักงานเงินรายได้</option>
              <option value="ลูกจ้างประจำ">ลูกจ้างประจำ</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">วันบรรจุ</label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date || ""}
              onChange={handleChange}
               className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ปีที่จะเกษียณ (Auto)</label>
            <input
              type="number"
              disabled
              value={formData.retirement_year || ""}
               className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-500"
            />
          </div>
        </div>
      </div>

      {/* Section 3: Education */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">วุฒิการศึกษา (Education)</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ระดับการศึกษา</label>
             <select
              name="education_level"
              value={formData.education_level}
              onChange={handleChange}
               className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none"
            >
               <option value="">เลือก...</option>
              <option value="ปริญญาเอก">ปริญญาเอก</option>
              <option value="ปริญญาโท">ปริญญาโท</option>
              <option value="ปริญญาตรี">ปริญญาตรี</option>
              <option value="ต่ำกว่าปริญญาตรี">ต่ำกว่าปริญญาตรี</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">วุฒิการศึกษา (ชื่อเต็ม)</label>
             <input
              type="text"
              name="degree_name"
              value={formData.degree_name || ""}
              onChange={handleChange}
               className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none"
               placeholder="เช่น ปร.ด. (สัตวแพทย์สาธารณสุข)"
            />
          </div>
         </div>
      </div>

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
           className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-200 transition-all disabled:opacity-50 font-medium text-sm"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          {isEdit ? "บันทึกการแก้ไข" : "บันทึกข้อมูล"}
        </button>
      </div>
    </form>
  );
}
