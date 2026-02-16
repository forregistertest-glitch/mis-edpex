"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, GraduationCap } from "lucide-react";
import { StudentService } from "@/services/studentService";
import { GraduateStudent } from "@/types/student";
import { useAuth } from "@/contexts/AuthContext";

export default function NewStudentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Partial<GraduateStudent>>({
    student_id: "",
    full_name_th: "",
    gender: "ชาย",
    nationality: "ไทย",
    degree_level: "ปริญญาโท",
    program_type: "ปกติ",
    current_status: "กำลังศึกษา",
    english_test_pass: "ไม่ผ่าน",
    admit_semester: "ต้น",
    admit_year: 2568,
    major_code: "",
    major_name: "",
    advisor_name: "",
    advisor_department: "",
    study_plan: "ก 2"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) { alert("กรุณาเข้าสู่ระบบ"); return; }
    if (!form.student_id || !form.full_name_th) { alert("กรุณากรอกรหัสนิสิตและชื่อ-นามสกุล"); return; }

    setLoading(true);
    try {
      await StudentService.addStudent(form as GraduateStudent, user.email);
      alert("เพิ่มข้อมูลนิสิตเรียบร้อยแล้ว");
      router.push("/student");
    } catch (error: any) {
      console.error("Save failed:", error);
      alert(error.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 font-sarabun max-w-4xl bg-[#F8FAFC] min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-white rounded-xl shadow-sm transition-all text-[#236c96]">
             <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">เพิ่มนิสิตใหม่</h1>
            <p className="text-xs text-slate-500 font-medium">กรอกข้อมูลนิสิตระดับบัณฑิตศึกษา</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-4">
             <div className="bg-[#E0F2FE] p-2 rounded-lg">
                <GraduationCap className="text-[#236c96]" size={20} />
             </div>
             <h2 className="font-bold text-slate-700">ข้อมูลพื้นฐาน</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">รหัสนิสิต *</label>
              <input 
                required
                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-[#71C5E8] transition-all"
                placeholder="เช่น 60XXXXXXX"
                value={form.student_id}
                onChange={e => setForm({...form, student_id: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">ชื่อ-นามสกุล *</label>
              <input 
                required
                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-[#71C5E8] transition-all"
                placeholder="คำนำหน้า + ชื่อ + สกุล"
                value={form.full_name_th}
                onChange={e => setForm({...form, full_name_th: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">เพศ</label>
              <div className="flex gap-4 p-1 bg-slate-50 rounded-2xl">
                 {["ชาย", "หญิง"].map(g => (
                   <button
                     key={g}
                     type="button"
                     className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${form.gender === g ? 'bg-white text-[#236c96] shadow-sm' : 'text-slate-400'}`}
                     onClick={() => setForm({...form, gender: g})}
                   >
                     {g}
                   </button>
                 ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">สัญชาติ</label>
              <select 
                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-[#71C5E8] transition-all"
                value={form.nationality}
                onChange={e => setForm({...form, nationality: e.target.value})}
              >
                <option value="ไทย">ไทย</option>
                <option value="อื่นๆ">อื่นๆ</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
           <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-4">
             <div className="bg-[#FEF3C7] p-2 rounded-lg">
                <GraduationCap className="text-amber-600" size={20} />
             </div>
             <h2 className="font-bold text-slate-700">หลักสูตรและสถานะ</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">ระดับปริญญา</label>
              <select className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold" value={form.degree_level} onChange={e => setForm({...form, degree_level: e.target.value})}>
                <option value="ปริญญาโท">ปริญญาโท</option>
                <option value="ปริญญาเอก">ปริญญาเอก</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">หลักสูตร</label>
              <select className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold" value={form.program_type} onChange={e => setForm({...form, program_type: e.target.value})}>
                <option value="ปกติ">ปกติ</option>
                <option value="พิเศษ">พิเศษ</option>
                <option value="นานาชาติ">นานาชาติ</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">ปีการศึกษาที่เข้า (พ.ศ.)</label>
              <input type="number" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold" value={form.admit_year} onChange={e => setForm({...form, admit_year: parseInt(e.target.value)})}/>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">สถานะปัจจุบัน</label>
              <select className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold text-blue-600" value={form.current_status} onChange={e => setForm({...form, current_status: e.target.value})}>
                <option value="กำลังศึกษา">กำลังศึกษา</option>
                <option value="สำเร็จ">สำเร็จ</option>
                <option value="พ้นสภาพ">พ้นสภาพ</option>
                <option value="ลาออก">ลาออก</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">รหัสสาขา</label>
              <input className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold" placeholder="เช่น XI16" value={form.major_code} onChange={e => setForm({...form, major_code: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">สาขาวิชา</label>
              <input className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold" placeholder="ชื่อสาขาวิชา" value={form.major_name} onChange={e => setForm({...form, major_name: e.target.value})} />
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
           <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-4">
             <div className="bg-[#F1F5F9] p-2 rounded-lg">
                <GraduationCap className="text-slate-600" size={20} />
             </div>
             <h2 className="font-bold text-slate-700">ข้อมูลวิชาการ</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 col-span-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">อาจารย์ที่ปรึกษา</label>
              <input className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold" value={form.advisor_name} onChange={e => setForm({...form, advisor_name: e.target.value})} />
            </div>
            <div className="space-y-2">
               <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">ผลสอบภาษาอังกฤษ</label>
               <select className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold" value={form.english_test_pass} onChange={e => setForm({...form, english_test_pass: e.target.value})}>
                  <option value="ผ่าน">ผ่าน</option>
                  <option value="ไม่ผ่าน">ไม่ผ่าน</option>
               </select>
            </div>
            <div className="space-y-2">
               <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">แผนการเรียน</label>
               <input className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold" placeholder="เช่น ก 1, ก 2" value={form.study_plan} onChange={e => setForm({...form, study_plan: e.target.value})} />
            </div>
          </div>
        </div>

        <div className="flex gap-4 pb-12">
            <button 
              type="button" 
              onClick={() => router.back()}
              className="flex-1 bg-white hover:bg-slate-50 text-slate-500 font-bold py-4 rounded-3xl border border-slate-200 transition-all"
            >
              ยกเลิก
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-2 bg-[#236c96] hover:bg-[#1a5578] text-white font-bold py-4 px-12 rounded-3xl shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Save size={20} />
              {loading ? "กำลังบันทึก..." : "บันทึกข้อมูลนิสิต"}
            </button>
        </div>
      </form>
    </div>
  );
}
