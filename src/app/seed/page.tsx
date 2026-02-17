"use client";

import { useState } from "react";
import { Database, Loader2, CheckCircle, AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, setDoc, collection, serverTimestamp } from "firebase/firestore";

// ข้อมูลจำลอง 4 นิสิต (จาก CSV จริง)
const sampleStudents = [
  {
    student_id: "6014900080",
    title_th: "นางสาว",
    first_name_th: "พิริยาภรณ์",
    last_name_th: "เฑียรเดชสกุล",
    full_name_th: "นางสาวพิริยาภรณ์ เฑียรเดชสกุล",
    gender: "หญิง",
    nationality: "ไทย",
    degree_level: "ปริญญาโท",
    program_type: "ปกติ",
    major_code: "XI16",
    major_name: "วิทยาศาสตร์สุขภาพสัตว์และชีวเวชศาสตร์",
    advisor_name: "รศ.น.สพ.ดร.พิษณุ ตุลยกุล",
    advisor_department: "สัตวแพทยสาธารณสุขศาสตร์",
    admit_semester: "ภาคต้น",
    admit_year: 2560,
    expected_grad_semester: "ภาคปลาย",
    expected_grad_year: 2561,
    current_status: "จบการศึกษา",
    study_plan: "ก แบบ ก 1",
    thesis_title_th: "การศึกษาเปรียบเทียบการทำงานของเอนไซม์ไซโตโครมพี 450 ฯ",
    thesis_title_en: "Comparative Metabolism of Cytochrome P450 and GST Activity in Liver of Crocodile and Livestock",
    english_test_pass: "ผ่าน",
    graduated_semester: "ภาคปลาย",
    graduated_year: 2564,
    on_plan: false,
  },
  {
    student_id: "6014900144",
    title_th: "นางสาว",
    first_name_th: "จุฬารัตน์",
    last_name_th: "เหลาเพิ่ม",
    full_name_th: "นางสาวจุฬารัตน์ เหลาเพิ่ม",
    gender: "หญิง",
    nationality: "ไทย",
    degree_level: "ปริญญาโท",
    program_type: "ปกติ",
    major_code: "XI16",
    major_name: "วิทยาศาสตร์สุขภาพสัตว์และชีวเวชศาสตร์",
    advisor_name: "ศ.น.สพ.ดร.จตุพร รัตนศรีสมพร",
    advisor_department: "เวชศาสตร์คลินิกสัตว์เลี้ยง",
    admit_semester: "ภาคปลาย",
    admit_year: 2560,
    expected_grad_semester: "ภาคต้น",
    expected_grad_year: 2562,
    current_status: "จบการศึกษา",
    study_plan: "ก แบบ ก 1",
    thesis_title_th: "การพัฒนาชุดตรวจเชื้อ เฮลิโคแบคเตอร์ ด้วยการทดสอบการผลิตเอนไซม์ยูรีเอสในเยื่อบุกระเพาะอาหารสุนัข",
    thesis_title_en: "Development of a Urease Kit to Detect for Helicobacter spp. in Dogs Gastric Mucosa",
    english_test_pass: "ผ่าน",
    graduated_year: 2563,
    on_plan: false,
  },
  {
    student_id: "6014900152",
    title_th: "นางสาว",
    first_name_th: "พิชชาพร",
    last_name_th: "ไวยมิตรา",
    full_name_th: "นางสาวพิชชาพร ไวยมิตรา",
    gender: "หญิง",
    nationality: "ไทย",
    degree_level: "ปริญญาโท",
    program_type: "ปกติ",
    major_code: "XI16",
    major_name: "วิทยาศาสตร์สุขภาพสัตว์และชีวเวชศาสตร์",
    advisor_name: "ศ.ดร.วิน สุรเชษฐพงษ์",
    advisor_department: "จุลชีววิทยาและวิทยาภูมิคุ้มกัน",
    admit_semester: "ภาคปลาย",
    admit_year: 2560,
    expected_grad_semester: "ภาคต้น",
    expected_grad_year: 2562,
    current_status: "จบการศึกษา",
    study_plan: "ก แบบ ก 1",
    thesis_title_en: "Effects of Probiotic on Tilapia Lake Virus Infection in Nile Tilapia and Red Hybrid Tilapia",
    english_test_pass: "ผ่าน",
    graduated_semester: "ภาคต้น",
    graduated_year: 2563,
    on_plan: false,
  },
  {
    student_id: "6514900999",
    title_th: "นาย",
    first_name_th: "ทดสอบ",
    last_name_th: "กำลังศึกษา",
    full_name_th: "นายทดสอบ กำลังศึกษา",
    title_en: "Mr.",
    first_name_en: "Test",
    last_name_en: "InProgress",
    full_name_en: "Mr. Test InProgress",
    gender: "ชาย",
    nationality: "ไทย",
    degree_level: "ปริญญาเอก",
    program_type: "ปกติ",
    major_code: "XI16",
    major_name: "วิทยาศาสตร์สุขภาพสัตว์และชีวเวชศาสตร์",
    advisor_name: "รศ.น.สพ.ดร.พิษณุ ตุลยกุล",
    advisor_department: "สัตวแพทยสาธารณสุขศาสตร์",
    admit_semester: "ภาคต้น",
    admit_year: 2565,
    expected_grad_semester: "ภาคปลาย",
    expected_grad_year: 2568,
    current_status: "กำลังศึกษา",
    study_plan: "แบบ 1.1",
    english_test_pass: "ไม่ผ่าน",
  },
];

const sampleAdvisors = [
  { full_name: "รศ.น.สพ.ดร.พิษณุ ตุลยกุล", department: "สัตวแพทยสาธารณสุขศาสตร์" },
  { full_name: "ศ.น.สพ.ดร.จตุพร รัตนศรีสมพร", department: "เวชศาสตร์คลินิกสัตว์เลี้ยง" },
  { full_name: "ศ.ดร.วิน สุรเชษฐพงษ์", department: "จุลชีววิทยาและวิทยาภูมิคุ้มกัน" },
  { full_name: "รศ.น.สพ.อดิศร ยะวงศา", department: "เวชศาสตร์คลินิกสัตว์ใหญ่และสัตวป่า" },
];

export default function SeedPage() {
  const [status, setStatus] = useState<"idle" | "seeding" | "done" | "error">("idle");
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleSeed = async () => {
    if (!confirm("ต้องการเพิ่มข้อมูลจำลอง 4 นิสิต + 4 อาจารย์ เข้า Firebase?")) return;
    
    setStatus("seeding");
    setLog([]);
    addLog("เริ่มต้น Seed Data...");

    try {
      // Seed Students
      for (const student of sampleStudents) {
        const docRef = doc(db, "graduate_students", student.student_id);
        await setDoc(docRef, {
          ...student,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
          created_by: "seed-script",
          is_deleted: false,
        }, { merge: true });
        addLog(`✅ นิสิต: ${student.full_name_th} (${student.student_id})`);
      }

      // Seed Advisors
      for (const advisor of sampleAdvisors) {
        const docRef = doc(collection(db, "advisors"));
        await setDoc(docRef, {
          ...advisor,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
          created_by: "seed-script",
          is_deleted: false,
        });
        addLog(`✅ อาจารย์: ${advisor.full_name}`);
      }

      addLog("🎉 Seed Data สำเร็จทั้งหมด!");
      setStatus("done");
    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <Link href="/student" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm">
          <ArrowLeft size={16} /> กลับไปหน้ารายชื่อ
        </Link>
        
        <div className="bg-white rounded-2xl shadow-sm border p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-600 p-2.5 rounded-xl">
              <Database className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Seed Data (ข้อมูลจำลอง)</h1>
              <p className="text-sm text-gray-500">เพิ่มข้อมูลตัวอย่างสำหรับทดสอบระบบ</p>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
            <p className="font-semibold mb-2">จะเพิ่มข้อมูลต่อไปนี้:</p>
            <ul className="space-y-1 ml-4 list-disc">
              <li><strong>นิสิต 4 คน</strong> — 3 คนจบแล้ว, 1 คนกำลังศึกษา (จาก CSV จริง)</li>
              <li><strong>อาจารย์ 4 คน</strong> — จากข้อมูลที่ปรึกษาใน CSV</li>
            </ul>
          </div>

          <button
            onClick={handleSeed}
            disabled={status === "seeding"}
            className={`mt-6 w-full py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2 transition-colors ${
              status === "seeding" 
                ? "bg-gray-400 cursor-not-allowed" 
                : status === "done"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {status === "seeding" && <Loader2 className="animate-spin" size={20} />}
            {status === "done" && <CheckCircle size={20} />}
            {status === "error" && <AlertTriangle size={20} />}
            {status === "idle" && "🚀 เริ่ม Seed Data"}
            {status === "seeding" && "กำลังเพิ่มข้อมูล..."}
            {status === "done" && "สำเร็จ! กลับไปหน้ารายชื่อได้เลย"}
            {status === "error" && "เกิดข้อผิดพลาด"}
          </button>

          {log.length > 0 && (
            <div className="mt-4 bg-gray-900 text-green-400 rounded-xl p-4 text-xs font-mono max-h-60 overflow-y-auto">
              {log.map((l, i) => (
                <div key={i} className="py-0.5">{l}</div>
              ))}
            </div>
          )}

          {status === "done" && (
            <div className="mt-4 flex gap-3">
              <Link href="/student" className="flex-1 text-center py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700">
                📋 ดูรายชื่อนิสิต
              </Link>
              <Link href="/advisor" className="flex-1 text-center py-2.5 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700">
                👩‍🏫 ดูอาจารย์
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
