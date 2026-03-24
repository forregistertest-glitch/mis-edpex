"use client";

import { useState } from "react";
import { PostgraduateData } from "@/types/data-management";
import { Save, Loader2, User, BookOpen, GraduationCap, FileText, Target, Award } from "lucide-react";

interface PostgraduateFormProps {
  initialData?: Partial<PostgraduateData>;
  onSubmit: (data: Partial<PostgraduateData>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  isEdit?: boolean;
}

const TabButton = ({ id, activeTab, setActiveTab, label, icon: Icon, disabled = false }: {
  id: string, activeTab: string, setActiveTab: (id: string) => void, label: string, icon: any, disabled?: boolean
}) => (
  <button
    type="button"
    onClick={() => !disabled && setActiveTab(id)}
    disabled={disabled}
    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === id
        ? "border-purple-600 text-purple-600"
        : disabled
          ? "border-transparent text-gray-300 cursor-not-allowed"
          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200"
      }`}
  >
    <Icon size={16} />
    {label}
  </button>
);

const InputField = ({ label, name, value, onChange, required, type = "text", disabled, placeholder }: {
  label: string; name: string; value?: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void; required?: boolean; type?: string; disabled?: boolean; placeholder?: string;
}) => (
  <div>
    <label className="block text-sm font-medium text-slate-600 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      required={required}
      disabled={disabled}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none text-sm ${disabled ? 'bg-slate-50 text-slate-400' : ''}`}
    />
  </div>
);

const SelectField = ({ label, name, value, onChange, required, options, disabled }: {
  label: string; name: string; value?: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; required?: boolean; options: { value: string; label: string }[]; disabled?: boolean;
}) => (
  <div>
    <label className="block text-sm font-medium text-slate-600 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      name={name}
      value={value || ""}
      onChange={onChange}
      required={required}
      disabled={disabled}
      className={`w-full p-2.5 border border-slate-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none ${disabled ? 'bg-slate-50 text-slate-400' : ''}`}
    >
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  </div>
);

export default function PostgraduateForm({
  initialData = {},
  onSubmit,
  onCancel,
  loading = false,
  isEdit = false,
}: PostgraduateFormProps) {
  const [activeTab, setActiveTab] = useState("profile");
  const [formData, setFormData] = useState<Partial<PostgraduateData>>({
    student_id: "",
    sex: "ชาย",
    prename_th: "นาย",
    name_th: "",
    midname_th: "",
    surname_th: "",
    prename_en: "Mr.",
    name_en: "",
    midname_en: "",
    surname_en: "",
    current_status: "กำลังศึกษา",
    registration_status: "ลงทะเบียนปกติ",
    project_type_th: "ปกติ",
    project_type_en: "Regular",
    major_code: "",
    major_th: "",
    major_en: "",
    degree_th: "",
    degree_en: "",
    degree_level: "ปริญญาโท",
    faculty_th: "คณะสัตวแพทยศาสตร์",
    faculty_en: "Faculty of Veterinary Medicine",
    campus_th: "บางเขน",
    campus_en: "Bangkhen",
    line_th: "",
    class_year: "",
    semester: "ต้น",
    nationality_th: "ไทย",
    nationality_en: "Thai",
    ...initialData,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-gray-100 overflow-x-auto">
        <TabButton id="profile" activeTab={activeTab} setActiveTab={setActiveTab} label="ข้อมูลส่วนตัว" icon={User} />
        <TabButton id="academic" activeTab={activeTab} setActiveTab={setActiveTab} label="การศึกษา" icon={BookOpen} />
        <TabButton id="advisor" activeTab={activeTab} setActiveTab={setActiveTab} label="ที่ปรึกษา/วิทยานิพนธ์" icon={GraduationCap} />
        <TabButton id="exams" activeTab={activeTab} setActiveTab={setActiveTab} label="การสอบ" icon={Award} />
        <TabButton id="progress" activeTab={activeTab} setActiveTab={setActiveTab} label="ความก้าวหน้า" icon={Target} />
      </div>

      <div className="p-1">
        {/* Tab 1: ข้อมูลส่วนตัว */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="md:col-span-3">
              <InputField label="รหัสนิสิต" name="student_id" required value={formData.student_id} onChange={handleChange} disabled={isEdit} placeholder="เช่น 6210101234" />
            </div>

            <div className="md:col-span-3">
              <SelectField label="เพศ" name="sex" required value={formData.sex} onChange={handleChange} options={[
                { value: "ชาย", label: "ชาย" },
                { value: "หญิง", label: "หญิง" },
              ]} />
            </div>

            <div className="md:col-span-3">
              <SelectField label="คำนำหน้า (TH)" name="prename_th" required value={formData.prename_th} onChange={handleChange} options={[
                { value: "นาย", label: "นาย" },
                { value: "นาง", label: "นาง" },
                { value: "นางสาว", label: "นางสาว" },
              ]} />
            </div>

            <div className="md:col-span-3">
              <InputField label="ชื่อ (TH)" name="name_th" required value={formData.name_th} onChange={handleChange} placeholder="ชื่อภาษาไทย" />
            </div>

            <div className="md:col-span-3">
              <InputField label="ชื่อกลาง (TH)" name="midname_th" value={formData.midname_th} onChange={handleChange} placeholder="ถ้ามี" />
            </div>

            <div className="md:col-span-3">
              <InputField label="นามสกุล (TH)" name="surname_th" required value={formData.surname_th} onChange={handleChange} placeholder="นามสกุลภาษาไทย" />
            </div>

            <div className="md:col-span-3">
              <SelectField label="Title (EN)" name="prename_en" required value={formData.prename_en} onChange={handleChange} options={[
                { value: "Mr.", label: "Mr." },
                { value: "Mrs.", label: "Mrs." },
                { value: "Miss", label: "Miss" },
                { value: "Ms.", label: "Ms." },
              ]} />
            </div>

            <div className="md:col-span-3">
              <InputField label="First Name (EN)" name="name_en" required value={formData.name_en} onChange={handleChange} placeholder="English first name" />
            </div>

            <div className="md:col-span-3">
              <InputField label="Middle Name (EN)" name="midname_en" value={formData.midname_en} onChange={handleChange} placeholder="If any" />
            </div>

            <div className="md:col-span-3">
              <InputField label="Last Name (EN)" name="surname_en" required value={formData.surname_en} onChange={handleChange} placeholder="English last name" />
            </div>

            <div className="md:col-span-4">
              <InputField label="สัญชาติ (TH)" name="nationality_th" required value={formData.nationality_th} onChange={handleChange} placeholder="เช่น ไทย" />
            </div>

            <div className="md:col-span-4">
              <InputField label="Nationality (EN)" name="nationality_en" value={formData.nationality_en} onChange={handleChange} placeholder="e.g. Thai" />
            </div>

            <div className="md:col-span-4">
              <InputField label="รหัสสัญชาติ" name="nationality_code" value={formData.nationality_code} onChange={handleChange} placeholder="ถ้ามี" />
            </div>
          </div>
        )}

        {/* Tab 2: การศึกษา */}
        {activeTab === "academic" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div>
              <SelectField label="สถานะปัจจุบัน" name="current_status" required value={formData.current_status} onChange={handleChange} options={[
                { value: "กำลังศึกษา", label: "กำลังศึกษา" },
                { value: "จบการศึกษา", label: "จบการศึกษา" },
                { value: "ลาออก", label: "ลาออก" },
                { value: "พ้นสภาพ", label: "พ้นสภาพ" },
              ]} />
            </div>

            <div>
              <SelectField label="สถานะการลงทะเบียน" name="registration_status" required value={formData.registration_status} onChange={handleChange} options={[
                { value: "ลงทะเบียนปกติ", label: "ลงทะเบียนปกติ" },
                { value: "ลาพัก", label: "ลาพัก" },
                { value: "ไม่ลงทะเบียน", label: "ไม่ลงทะเบียน" },
              ]} />
            </div>

            <div>
              <SelectField label="ระดับปริญญา" name="degree_level" required value={formData.degree_level} onChange={handleChange} options={[
                { value: "ปริญญาโท", label: "ปริญญาโท" },
                { value: "ปริญญาเอก", label: "ปริญญาเอก" },
              ]} />
            </div>

            <div>
              <SelectField label="ประเภทโครงการ (TH)" name="project_type_th" required value={formData.project_type_th} onChange={handleChange} options={[
                { value: "ปกติ", label: "ปกติ" },
                { value: "พิเศษ", label: "พิเศษ" },
                { value: "นานาชาติ", label: "นานาชาติ" },
              ]} />
            </div>

            <div>
              <SelectField label="Project Type (EN)" name="project_type_en" required value={formData.project_type_en} onChange={handleChange} options={[
                { value: "Regular", label: "Regular" },
                { value: "Special", label: "Special" },
                { value: "International", label: "International" },
              ]} />
            </div>

            <div>
              <InputField label="รหัสสาขาวิชา" name="major_code" required value={formData.major_code} onChange={handleChange} placeholder="เช่น XI16" />
            </div>

            <div className="md:col-span-2">
              <InputField label="ชื่อสาขาวิชา (TH)" name="major_th" required value={formData.major_th} onChange={handleChange} placeholder="เช่น สัตวแพทยศาสตร์" />
            </div>

            <div>
              <InputField label="Major (EN)" name="major_en" required value={formData.major_en} onChange={handleChange} placeholder="e.g. Veterinary Medicine" />
            </div>

            <div className="md:col-span-2">
              <InputField label="ชื่อปริญญา (TH)" name="degree_th" required value={formData.degree_th} onChange={handleChange} placeholder="เช่น สัตวแพทยศาสตรมหาบัณฑิต" />
            </div>

            <div>
              <InputField label="Degree (EN)" name="degree_en" required value={formData.degree_en} onChange={handleChange} placeholder="e.g. Master of Veterinary Science" />
            </div>

            <div className="md:col-span-2">
              <InputField label="ชื่อคณะ (TH)" name="faculty_th" required value={formData.faculty_th} onChange={handleChange} />
            </div>

            <div>
              <InputField label="Faculty (EN)" name="faculty_en" required value={formData.faculty_en} onChange={handleChange} />
            </div>

            <div>
              <InputField label="ชื่อวิทยาเขต (TH)" name="campus_th" required value={formData.campus_th} onChange={handleChange} />
            </div>

            <div>
              <InputField label="Campus (EN)" name="campus_en" required value={formData.campus_en} onChange={handleChange} />
            </div>

            <div>
              <InputField label="กลุ่มสาขาวิชา" name="line_th" value={formData.line_th} onChange={handleChange} placeholder="ถ้ามี" />
            </div>

            <div>
              <InputField label="ปีที่เข้าศึกษา" name="class_year" required value={formData.class_year} onChange={handleChange} placeholder="เช่น 2565" />
            </div>

            <div>
              <SelectField label="ภาคเรียนที่เข้าศึกษา" name="semester" required value={formData.semester} onChange={handleChange} options={[
                { value: "ต้น", label: "ต้น" },
                { value: "ปลาย", label: "ปลาย" },
                { value: "ฤดูร้อน", label: "ฤดูร้อน" },
              ]} />
            </div>

            <div>
              <InputField label="ปีที่สำเร็จการศึกษา" name="graduation_year" value={formData.graduation_year} onChange={handleChange} placeholder="เช่น 2567" />
            </div>

            <div>
              <SelectField label="ภาคเรียนที่สำเร็จการศึกษา" name="graduation_semester" value={formData.graduation_semester} onChange={handleChange} options={[
                { value: "", label: "-- เลือก --" },
                { value: "ต้น", label: "ต้น" },
                { value: "ปลาย", label: "ปลาย" },
                { value: "ฤดูร้อน", label: "ฤดูร้อน" },
              ]} />
            </div>

            <div className="md:col-span-2">
              <InputField label="วันอนุมัติปริญญา" name="approve_date" type="date" value={formData.approve_date} onChange={handleChange} />
            </div>
          </div>
        )}

        {/* Tab 3: ที่ปรึกษา/วิทยานิพนธ์ */}
        {activeTab === "advisor" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div>
              <InputField label="รหัสอาจารย์ที่ปรึกษาหลัก" name="teacher_card" value={formData.teacher_card} onChange={handleChange} placeholder="รหัสอาจารย์" />
            </div>

            <div>
              <InputField label="ชื่ออาจารย์ที่ปรึกษาหลัก (TH)" name="advisor_name_th" value={formData.advisor_name_th} onChange={handleChange} placeholder="เช่น รศ.ดร.สมชาย ใจดี" />
            </div>

            <div>
              <InputField label="การแต่งตั้งคณะกรรมการนิสิต" name="committee_set" value={formData.committee_set} onChange={handleChange} placeholder="สถานะการแต่งตั้ง" />
            </div>

            <div>
              <InputField label="วันที่แต่งตั้งคณะกรรมการนิสิต" name="committee_date" type="date" value={formData.committee_date} onChange={handleChange} />
            </div>

            <div className="md:col-span-2">
              <InputField label="ชื่อวิทยานิพนธ์ (TH)" name="thesis_th" value={formData.thesis_th} onChange={handleChange} placeholder="หัวข้อวิทยานิพนธ์ภาษาไทย" />
            </div>

            <div className="md:col-span-2">
              <InputField label="Thesis Title (EN)" name="thesis_en" value={formData.thesis_en} onChange={handleChange} placeholder="Thesis title in English" />
            </div>

            <div>
              <InputField label="การเสนอโครงการวิทยานิพนธ์" name="proposal_submit" value={formData.proposal_submit} onChange={handleChange} placeholder="สถานะการเสนอ" />
            </div>

            <div>
              <InputField label="วันที่อนุมัติโครงการวิทยานิพนธ์" name="proposal_date" type="date" value={formData.proposal_date} onChange={handleChange} />
            </div>

            <div>
              <InputField label="การเสนอแผนการเรียน" name="study_plan_submit" value={formData.study_plan_submit} onChange={handleChange} placeholder="สถานะการเสนอ" />
            </div>

            <div>
              <InputField label="วันที่อนุมัติแผนการเรียน" name="study_plan_date" type="date" value={formData.study_plan_date} onChange={handleChange} />
            </div>
          </div>
        )}

        {/* Tab 4: การสอบ */}
        {activeTab === "exams" && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* English Exam */}
            <div className="border-b pb-4">
              <h3 className="text-md font-bold text-slate-700 mb-3">การสอบภาษาอังกฤษ</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <InputField label="สถานะการสอบภาษาอังกฤษ" name="english_exam_status" value={formData.english_exam_status} onChange={handleChange} placeholder="เช่น ผ่าน, ไม่ผ่าน" />
                </div>
                <div>
                  <InputField label="วันที่ประกาศผล" name="english_exam_date" type="date" value={formData.english_exam_date} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* Comprehensive Exam */}
            <div className="border-b pb-4">
              <h3 className="text-md font-bold text-slate-700 mb-3">การสอบประมวลความรู้</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <InputField label="สถานะ (ข้อเขียน)" name="comprehensive_writing_status" value={formData.comprehensive_writing_status} onChange={handleChange} placeholder="เช่น ผ่าน, ไม่ผ่าน" />
                </div>
                <div>
                  <InputField label="วันที่ประกาศผล (ข้อเขียน)" name="comprehensive_writing_date" type="date" value={formData.comprehensive_writing_date} onChange={handleChange} />
                </div>
                <div>
                  <InputField label="สถานะ (สัมภาษณ์)" name="comprehensive_oral_status" value={formData.comprehensive_oral_status} onChange={handleChange} placeholder="เช่น ผ่าน, ไม่ผ่าน" />
                </div>
                <div>
                  <InputField label="วันที่ประกาศผล (สัมภาษณ์)" name="comprehensive_oral_date" type="date" value={formData.comprehensive_oral_date} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* Qualifying Exam */}
            <div className="border-b pb-4">
              <h3 className="text-md font-bold text-slate-700 mb-3">การสอบวัดคุณสมบัติ</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <InputField label="สถานะ (ข้อเขียน)" name="qualifying_writing_status" value={formData.qualifying_writing_status} onChange={handleChange} placeholder="เช่น ผ่าน, ไม่ผ่าน" />
                </div>
                <div>
                  <InputField label="วันที่ประกาศผล (ข้อเขียน)" name="qualifying_writing_date" type="date" value={formData.qualifying_writing_date} onChange={handleChange} />
                </div>
                <div>
                  <InputField label="สถานะ (สัมภาษณ์)" name="qualifying_oral_status" value={formData.qualifying_oral_status} onChange={handleChange} placeholder="เช่น ผ่าน, ไม่ผ่าน" />
                </div>
                <div>
                  <InputField label="วันที่ประกาศผล (สัมภาษณ์)" name="qualifying_oral_date" type="date" value={formData.qualifying_oral_date} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* Defense Exam */}
            <div>
              <h3 className="text-md font-bold text-slate-700 mb-3">การสอบปากเปล่าขั้นสุดท้าย</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <InputField label="สถานะการสอบ" name="defense_exam_status" value={formData.defense_exam_status} onChange={handleChange} placeholder="เช่น ผ่าน, ไม่ผ่าน" />
                </div>
                <div>
                  <InputField label="วันที่ประกาศผล" name="defense_exam_date" type="date" value={formData.defense_exam_date} onChange={handleChange} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: ความก้าวหน้า */}
        {activeTab === "progress" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div>
              <InputField label="การยื่นเอกสารขอจบการศึกษา" name="manuscript_status" value={formData.manuscript_status} onChange={handleChange} placeholder="สถานะการยื่น" />
            </div>
            <div>
              <InputField label="วันที่ยื่นเอกสารขอจบการศึกษา" name="manuscript_date" type="date" value={formData.manuscript_date} onChange={handleChange} />
            </div>

            <div className="md:col-span-2 p-6 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-sm text-amber-800">
                <strong>หมายเหตุ:</strong> ข้อมูลในแท็บนี้จะแสดงสถานะความก้าวหน้าของนิสิตตลอดหลักสูตร 
                รวมถึงการสอบต่างๆ การเสนอวิทยานิพนธ์ และการจบการศึกษา
              </p>
            </div>
          </div>
        )}
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
          className="px-6 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 flex items-center gap-2 shadow-lg shadow-purple-200 transition-all font-medium text-sm disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          บันทึกข้อมูล
        </button>
      </div>
    </form>
  );
}
