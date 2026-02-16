"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PersonnelService } from "@/services/personnelService";
import { Personnel } from "@/types/personnel";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { DateTime } from "luxon";
import { useAuth } from "@/contexts/AuthContext";

export default function NewPersonnelPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
  });

  // Auto-calculate Generation and Retirement
  useEffect(() => {
    if (formData.birth_date) {
      const birthYear = DateTime.fromISO(formData.birth_date).year;
      const currentYear = DateTime.now().year;
      
      // Calculate Retirement (Assuming 60 years old)
      // If born in 1990, retires in 1990 + 60 = 2050
      const retirementYear = birthYear + 60;
      
      // Calculate Generation
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
  }, [formData.birth_date]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) {
      alert("Please login first.");
      return;
    }

    if (!formData.personnel_id || !formData.first_name_th) {
      alert("Please fill in required fields.");
      return;
    }

    setLoading(true);
    try {
      await PersonnelService.addPersonnel(formData as Personnel, user.email);
      router.push("/personnel");
    } catch (error) {
      console.error("Error saving personnel:", error);
      alert("Error saving data. ID might already exist.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 font-sarabun max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/personnel"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
          >
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">เพิ่มบุคลากรใหม่</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-6">
        {/* Section 1: Identity */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">ข้อมูลส่วนตัว</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">คำนำหน้า</label>
              <select
                name="title_th"
                value={formData.title_th}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">เลือก...</option>
                <option value="นาย">นาย</option>
                <option value="นาง">นาง</option>
                <option value="น.ส.">น.ส.</option>
                <option value="ดร.">ดร.</option>
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
                value={formData.personnel_id || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500"
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
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">นามสกุล</label>
              <input
                type="text"
                name="last_name_th"
                value={formData.last_name_th || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500"
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
                className="w-full p-2 border rounded-lg"
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
                className="w-full p-2 border rounded-lg"
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Generation (Auto)</label>
              <input
                type="text"
                disabled
                value={formData.generation || ""}
                className="w-full p-2 border rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Work info */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">ข้อมูลการทำงาน</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ตำแหน่ง</label>
               <input
                type="text"
                name="position"
                value={formData.position || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
                list="positions"
              />
              <datalist id="positions">
                  <option value="อาจารย์" />
                  <option value="เจ้าหน้าที่บริหารงานทั่วไป" />
                  <option value="นักวิทยาศาสตร์" />
                  <option value="นายสัตวแพทย์" />
              </datalist>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">สังกัด</label>
               <input
                type="text"
                name="affiliation"
                value={formData.affiliation || ""}
                onChange={handleChange}
                 className="w-full p-2 border rounded-lg"
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">แผนก</label>
               <input
                type="text"
                name="department"
                value={formData.department || ""}
                onChange={handleChange}
                 className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">วิทยาเขต</label>
              <select
                name="campus"
                value={formData.campus}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
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
                className="w-full p-2 border rounded-lg"
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
                className="w-full p-2 border rounded-lg"
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ปีที่จะเกษียณ (Auto)</label>
              <input
                type="number"
                disabled
                value={formData.retirement_year || ""}
                className="w-full p-2 border rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Education */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">วุฒิการศึกษา</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ระดับการศึกษา</label>
               <select
                name="education_level"
                value={formData.education_level}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
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
                 className="w-full p-2 border rounded-lg"
                 placeholder="เช่น ปร.ด. (สัตวแพทย์สาธารณสุข)"
              />
            </div>
           </div>
        </div>

        <div className="pt-6 flex justify-end gap-3 border-t">
          <button
            type="button"
            onClick={() => router.back()}
             className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={loading}
             className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 shadow-lg shadow-green-200"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            บันทึกข้อมูล
          </button>
        </div>
      </form>
    </div>
  );
}
