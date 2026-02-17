"use client";

import { useState } from "react";
import { GraduateStudent } from "@/types/student";
import { Save, Loader2, User, BookOpen, GraduationCap, Phone, FileText, Target } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import StudentPublications from "./StudentPublications";
import StudentProgressTracker from "./StudentProgress";
import { useAutocomplete } from "@/hooks/useAutocomplete";
import { AutocompleteInput } from "@/components/ui/AutocompleteInput";

interface StudentFormProps {
  initialData?: Partial<GraduateStudent>;
  onSubmit: (data: Partial<GraduateStudent>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  isEdit?: boolean;
}

export default function StudentForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  loading, 
  isEdit 
}: StudentFormProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [formData, setFormData] = useState<Partial<GraduateStudent>>({
    student_id: "",
    title_th: "นาย",
    first_name_th: "",
    last_name_th: "",
    title_en: "Mr.",
    first_name_en: "",
    last_name_en: "",
    full_name_th: "",
    full_name_en: "",
    gender: "ชาย",
    nationality: "ไทย",
    email: "",
    phone: "",
    line_id: "",
    degree_level: "ปริญญาโท",
    program_type: "ปกติ",
    current_status: "กำลังศึกษา",
    english_test_pass: "ไม่ผ่าน",
    admit_semester: "ต้น",
    admit_year: new Date().getFullYear() + 543,
    major_code: "",
    major_name: "",
    advisor_name: "",
    advisor_department: "",
    study_plan: "ก 2",
    thesis_title_th: "",
    thesis_title_en: "",
    committee_set: "",
    committee_date: "",
    teacher_card: "",
    expected_grad_semester: "",
    expected_grad_year: undefined,
    graduated_semester: "",
    graduated_year: undefined,
    on_plan: undefined,
    ...initialData
  });

  // Autocomplete hooks
  const advisorAC = useAutocomplete({
    collectionName: "graduate_students",
    fieldName: "advisor_name",
    minLength: 2,
  });

  const majorAC = useAutocomplete({
    collectionName: "graduate_students",
    fieldName: "major_name",
    minLength: 2,
  });

  const departmentAC = useAutocomplete({
    collectionName: "graduate_students",
    fieldName: "advisor_department",
    minLength: 2,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      // Auto-update full name if parts change
      if (['title_th', 'first_name_th', 'last_name_th'].includes(name)) {
        newData.full_name_th = `${newData.title_th}${newData.first_name_th} ${newData.last_name_th}`;
      }
      if (['title_en', 'first_name_en', 'last_name_en'].includes(name)) {
        newData.full_name_en = `${newData.title_en || ''} ${newData.first_name_en || ''} ${newData.last_name_en || ''}`.trim();
      }
      return newData;
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const TabButton = ({ id, label, icon: Icon, disabled = false }: { id: string, label: string, icon: any, disabled?: boolean }) => (
    <button
      type="button"
      onClick={() => !disabled && setActiveTab(id)}
      disabled={disabled}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
        activeTab === id 
          ? "border-emerald-600 text-emerald-600" 
          : disabled
            ? "border-transparent text-gray-300 cursor-not-allowed"
            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200"
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );

  const InputField = ({ label, name, value, required, type = "text", span, disabled, placeholder }: {
    label: string; name: string; value?: string | number; required?: boolean; type?: string; span?: number; disabled?: boolean; placeholder?: string;
  }) => (
    <div className={span ? `md:col-span-${span}` : ""}>
      <label className="block text-sm font-medium text-slate-600 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        disabled={disabled}
        value={value || ""}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-sm ${
          disabled ? 'bg-slate-50 text-slate-400' : ''
        }`}
      />
    </div>
  );

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      <div className="flex border-b border-gray-100 overflow-x-auto">
        <TabButton id="profile" label="ข้อมูลส่วนตัว" icon={User} />
        <TabButton id="start_academic" label="การศึกษา" icon={BookOpen} />
        <TabButton id="advisor" label="ที่ปรึกษา/วิทยานิพนธ์" icon={GraduationCap} />
        <TabButton id="contact" label="การติดต่อ" icon={Phone} />
        <TabButton id="publications" label="ผลงานตีพิมพ์" icon={FileText} disabled={!isEdit} />
        <TabButton id="progress" label="ความก้าวหน้า" icon={Target} disabled={!isEdit} />
      </div>

      <div className="p-1">
        {/* Tab: Profile */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="md:col-span-3">
              <InputField label="รหัสนิสิต" name="student_id" required value={formData.student_id} disabled={isEdit} />
            </div>
            
            <div className="md:col-span-3">
              <InputField label="คำนำหน้า (TH)" name="title_th" value={formData.title_th} />
            </div>
            <div className="md:col-span-3">
              <InputField label="ชื่อ (TH)" name="first_name_th" required value={formData.first_name_th} />
            </div>
            <div className="md:col-span-3">
              <InputField label="นามสกุล (TH)" name="last_name_th" required value={formData.last_name_th} />
            </div>

            <div className="md:col-span-3">
              <InputField label="Title (EN)" name="title_en" value={formData.title_en} />
            </div>
            <div className="md:col-span-3">
              <InputField label="First Name (EN)" name="first_name_en" value={formData.first_name_en} />
            </div>
            <div className="md:col-span-3">
              <InputField label="Last Name (EN)" name="last_name_en" value={formData.last_name_en} />
            </div>
            
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-slate-600 mb-1">เพศ</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-2.5 border border-slate-200 rounded-lg bg-white text-sm">
                <option value="ชาย">ชาย</option>
                <option value="หญิง">หญิง</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <InputField label="สัญชาติ" name="nationality" value={formData.nationality} />
            </div>
          </div>
        )}

        {/* Tab: Academic */}
        {activeTab === "start_academic" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-200">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">ระดับปริญญา</label>
              <select name="degree_level" value={formData.degree_level} onChange={handleChange} className="w-full p-2.5 border border-slate-200 rounded-lg bg-white text-sm">
                <option value="ปริญญาโท">ปริญญาโท</option>
                <option value="ปริญญาเอก">ปริญญาเอก</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">หลักสูตร</label>
              <select name="program_type" value={formData.program_type} onChange={handleChange} className="w-full p-2.5 border border-slate-200 rounded-lg bg-white text-sm">
                <option value="ปกติ">ปกติ (Regular)</option>
                <option value="พิเศษ">พิเศษ (Special)</option>
                <option value="นานาชาติ">นานาชาติ (International)</option>
              </select>
            </div>
            <div>
              <InputField label="แผนการเรียน" name="study_plan" value={formData.study_plan} placeholder="เช่น แบบ 1.1, ก 2" />
            </div>
            
            {/* Major with autocomplete */}
            <div className="md:col-span-2">
              <AutocompleteInput
                label="สาขาวิชา"
                value={formData.major_name || ""}
                onChange={(v) => {
                  setFormData(prev => ({ ...prev, major_name: v }));
                  majorAC.setQuery(v);
                }}
                suggestions={majorAC.suggestions}
                isOpen={majorAC.isOpen}
                onSelect={(v) => {
                  setFormData(prev => ({ ...prev, major_name: v }));
                  majorAC.selectSuggestion(v);
                }}
                onClose={majorAC.close}
                placeholder="พิมพ์เพื่อค้นหาสาขาวิชา..."
              />
            </div>
            <div>
              <InputField label="รหัสสาขา" name="major_code" value={formData.major_code} placeholder="เช่น XI16" />
            </div>

            <div>
              <InputField label="ปีที่เข้า (พ.ศ.)" name="admit_year" type="number" value={formData.admit_year} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">ภาคการศึกษาที่เข้า</label>
              <select name="admit_semester" value={formData.admit_semester} onChange={handleChange} className="w-full p-2.5 border border-slate-200 rounded-lg bg-white text-sm">
                <option value="ต้น">ต้น</option>
                <option value="ปลาย">ปลาย</option>
                <option value="ฤดูร้อน">ฤดูร้อน</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">สถานะปัจจุบัน</label>
              <select name="current_status" value={formData.current_status} onChange={handleChange} className="w-full p-2.5 border border-slate-200 rounded-lg bg-white text-sm">
                <option value="กำลังศึกษา">กำลังศึกษา</option>
                <option value="สำเร็จการศึกษา">สำเร็จการศึกษา</option>
                <option value="ลาออก">ลาออก</option>
                <option value="พ้นสภาพ">พ้นสภาพ</option>
                <option value="ไม่มารายงานตัว">ไม่มารายงานตัว</option>
                <option value="สละสิทธิ์">สละสิทธิ์</option>
              </select>
            </div>

            {/* Graduation Plan (NEW) */}
            <div className="md:col-span-3 border-t pt-4 mt-2">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">ข้อมูลสำเร็จการศึกษา</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <InputField label="ปีที่ต้องจบ (แผน)" name="expected_grad_year" type="number" value={formData.expected_grad_year} />
                </div>
                <div>
                  <InputField label="ภาคที่ต้องจบ (แผน)" name="expected_grad_semester" value={formData.expected_grad_semester} />
                </div>
                <div>
                  <InputField label="ปีที่จบ (จริง)" name="graduated_year" type="number" value={formData.graduated_year} />
                </div>
                <div>
                  <InputField label="ภาคที่จบ (จริง)" name="graduated_semester" value={formData.graduated_semester} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Advisor & Thesis */}
        {activeTab === "advisor" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Advisor with autocomplete */}
            <AutocompleteInput
              label="อาจารย์ที่ปรึกษาวิทยานิพนธ์หลัก"
              value={formData.advisor_name || ""}
              onChange={(v) => {
                setFormData(prev => ({ ...prev, advisor_name: v }));
                advisorAC.setQuery(v);
              }}
              suggestions={advisorAC.suggestions}
              isOpen={advisorAC.isOpen}
              onSelect={(v) => {
                setFormData(prev => ({ ...prev, advisor_name: v }));
                advisorAC.selectSuggestion(v);
              }}
              onClose={advisorAC.close}
              placeholder="พิมพ์เพื่อค้นหาอาจารย์..."
            />
            
            {/* Department with autocomplete */}
            <AutocompleteInput
              label="ภาควิชาที่อาจารย์สังกัด"
              value={formData.advisor_department || ""}
              onChange={(v) => {
                setFormData(prev => ({ ...prev, advisor_department: v }));
                departmentAC.setQuery(v);
              }}
              suggestions={departmentAC.suggestions}
              isOpen={departmentAC.isOpen}
              onSelect={(v) => {
                setFormData(prev => ({ ...prev, advisor_department: v }));
                departmentAC.selectSuggestion(v);
              }}
              onClose={departmentAC.close}
              placeholder="พิมพ์เพื่อค้นหาภาควิชา..."
            />

            <div>
              <InputField label="รหัสอาจารย์ (Teacher Card)" name="teacher_card" value={formData.teacher_card} placeholder="เช่น I1006" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">กรรมการวิทยานิพนธ์</label>
              <select name="committee_set" value={formData.committee_set || ""} onChange={handleChange} className="w-full p-2.5 border border-slate-200 rounded-lg bg-white text-sm">
                <option value="">-- ยังไม่ได้แต่งตั้ง --</option>
                <option value="แต่งตั้งแล้ว">แต่งตั้งแล้ว</option>
                <option value="ยังไม่แต่งตั้ง">ยังไม่แต่งตั้ง</option>
              </select>
            </div>

            {formData.committee_set === "แต่งตั้งแล้ว" && (
              <div>
                <InputField label="วันที่แต่งตั้งกรรมการ" name="committee_date" value={formData.committee_date} type="date" />
              </div>
            )}

            <div className="md:col-span-2">
              <InputField label="หัวข้อวิทยานิพนธ์ (ภาษาไทย)" name="thesis_title_th" value={formData.thesis_title_th} />
            </div>
            <div className="md:col-span-2">
              <InputField label="หัวข้อวิทยานิพนธ์ (English)" name="thesis_title_en" value={formData.thesis_title_en} />
            </div>
          </div>
        )}

        {/* Tab: Contact */}
        {activeTab === "contact" && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in zoom-in-95 duration-200">
             <div>
               <InputField label="Email" name="email" type="email" value={formData.email} />
             </div>
             <div>
               <InputField label="เบอร์โทรศัพท์" name="phone" type="tel" value={formData.phone} />
             </div>
             <div>
               <InputField label="Line ID" name="line_id" value={formData.line_id} />
             </div>
           </div>
        )}

        {/* Tab: Publications */}
        {activeTab === "publications" && user && formData.student_id && (
          <div className="animate-in fade-in zoom-in-95 duration-200">
            <StudentPublications studentId={formData.student_id} userEmail={user.email || ""} />
          </div>
        )}

        {/* Tab: Progress */}
        {activeTab === "progress" && user && formData.student_id && (
          <div className="animate-in fade-in zoom-in-95 duration-200">
            <StudentProgressTracker studentId={formData.student_id} userEmail={user.email || ""} />
          </div>
        )}
      </div>

      <div className="pt-6 flex justify-end gap-3 border-t border-slate-100 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all text-sm font-medium"
        >
          {isEdit ? "ปิด" : "ยกเลิก"}
        </button>
        {activeTab !== "publications" && activeTab !== "progress" && (
          <button
            type="submit"
            disabled={loading}
            className="px-10 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 flex items-center gap-2 shadow-sm transition-all disabled:opacity-50 text-sm font-medium"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {isEdit ? "บันทึกการแก้ไข" : "บันทึกข้อมูล"}
          </button>
        )}
      </div>
    </form>
  );
}
