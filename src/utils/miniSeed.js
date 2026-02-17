/**
 * Mini Seed Data Script
 * สร้างข้อมูลจำลอง 4 รายการจาก CSV จริง เพื่อทดสอบ UI
 * 
 * วิธีใช้: node src/utils/miniSeed.js
 * 
 * ต้องตั้งค่า Firebase ก่อนใช้งาน (ใช้ Firebase Admin SDK)
 */

// ข้อมูลนิสิตจำลอง 4 คน (จาก CSV ฐานข้อมูลนิสิต)
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
    thesis_title_th: "การศึกษาเปรียบเทียบการทำงานของเอนไซม์ไซโตโครมพี 450 และเอนไซม์กลูตาไธโอนเอสทรานสเฟอเรสในตับจระเข้และสัตว์ปศุสัตว์",
    thesis_title_en: "Comparative Metabolism of Cytochrome P450 and Glutathione-S-transferase Activity in Liver of Crocodile and Livestock",
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
    thesis_title_th: "Effects of Probiotic on Tilapia Lake Virus Infection in Nile Tilapia and Red Hybrid Tilapia",
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

// ข้อมูลอาจารย์จำลอง
const sampleAdvisors = [
  {
    full_name: "รศ.น.สพ.ดร.พิษณุ ตุลยกุล",
    department: "สัตวแพทยสาธารณสุขศาสตร์",
  },
  {
    full_name: "ศ.น.สพ.ดร.จตุพร รัตนศรีสมพร",
    department: "เวชศาสตร์คลินิกสัตว์เลี้ยง",
  },
  {
    full_name: "ศ.ดร.วิน สุรเชษฐพงษ์",
    department: "จุลชีววิทยาและวิทยาภูมิคุ้มกัน",
  },
  {
    full_name: "รศ.น.สพ.อดิศร ยะวงศา",
    department: "เวชศาสตร์คลินิกสัตว์ใหญ่และสัตวป่า",
  },
];

// ===== Export for use in the app =====
// สามารถ import ไปใช้ใน page หรือ component ได้โดยตรง

// Method 1: Copy-Paste ใน Browser Console (ใช้กับ Firebase Client SDK)
const generateFirebaseCommands = () => {
  console.log("=== คำสั่งสำหรับ Seed ข้อมูลผ่าน Browser Console ===\n");
  console.log("// วาง Code นี้ใน Browser Console ที่เปิดเว็บแอป:\n");
  
  console.log(`
// Step 1: Import Firebase functions (ถ้ายังไม่ได้ import)
// ใช้กับ window.__firebase ถ้ามี หรือใช้ API route

// Step 2: Seed Students
const students = ${JSON.stringify(sampleStudents, null, 2)};

// Step 3: Seed Advisors  
const advisors = ${JSON.stringify(sampleAdvisors, null, 2)};
  `);
};

// Method 2: Export as JSON (สำหรับ import ผ่านหน้าเว็บ)
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Save students.json
fs.writeFileSync(
  path.join(dataDir, 'seed_students.json'),
  JSON.stringify(sampleStudents, null, 2),
  'utf-8'
);

// Save advisors.json
fs.writeFileSync(
  path.join(dataDir, 'seed_advisors.json'),
  JSON.stringify(sampleAdvisors, null, 2),
  'utf-8'
);

console.log('✅ สร้างไฟล์ seed data เรียบร้อย:');
console.log(`   📁 ${path.join(dataDir, 'seed_students.json')} (${sampleStudents.length} รายการ)`);
console.log(`   📁 ${path.join(dataDir, 'seed_advisors.json')} (${sampleAdvisors.length} รายการ)`);
console.log('\n💡 วิธีใช้: นำเข้าผ่านหน้าเว็บ หรือเรียกใช้ผ่าน API');
