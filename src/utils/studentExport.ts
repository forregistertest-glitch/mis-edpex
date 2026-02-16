import * as XLSX from 'xlsx';
import { GraduateStudent } from '@/types/student';
import { DateTime } from 'luxon';

export const exportStudentsToExcel = (studentList: GraduateStudent[]) => {
  // Define the headers based on the Master Template (Thai)
  const headers = [
    "รหัสนิสิต",
    "ชื่อ",
    "เพศ",
    "สัญชาติ",
    "ระดับปริญญา",
    "หลักสูตร",
    "รหัสสาขา",
    "สาขาวิชา",
    "อาจารย์ที่ปรึกษา วิทยานิพนธ์หลัก",
    "ภาควิชาที่ อาจารย์ที่ปรึกษาสังกัด",
    "ภาคการศึกษา ที่เข้าศึกษา",
    "ปีการศึกษา ที่เข้าศึกษา",
    "สถานะ ปัจจุบัน",
    "แผน การเรียน",
    "หัวข้อวิทยานิพนธ์",
    "วันที่อนุมัติโครงร่าง",
    "ผลสอบภาษาอังกฤษ",
    "ภาคจบการศึกษา",
    "ปีจบการศึกษา"
  ];

  // Map data to rows
  const rows = studentList.map(s => [
    s.student_id,
    s.full_name_th,
    s.gender,
    s.nationality,
    s.degree_level,
    s.program_type,
    s.major_code,
    s.major_name,
    s.advisor_name,
    s.advisor_department,
    s.admit_semester,
    s.admit_year,
    s.current_status,
    s.study_plan,
    s.thesis_title_th || "",
    s.proposal_exam_date || "",
    s.english_test_pass,
    s.graduated_semester || "",
    s.graduated_year || ""
  ]);

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  // Append sheet
  XLSX.utils.book_append_sheet(wb, ws, "Students");

  // Generate file download
  const dateStr = DateTime.now().toFormat('yyyy-MM-dd');
  XLSX.writeFile(wb, `ฐานข้อมูลนิสิต_${dateStr}.xlsx`);
};
