import * as XLSX from 'xlsx';
import { GraduateStudent } from '@/types/student';
import { DateTime } from 'luxon';

import { StudentPublication, StudentProgress } from '@/types/academic';

export const exportStudentsToExcel = (
  studentList: GraduateStudent[],
  publications: StudentPublication[] = [],
  progress: StudentProgress[] = []
) => {
  // --- Sheet 1: Students ---
  const studentHeaders = [
    "รหัสนิสิต", "ชื่อ", "เพศ", "สัญชาติ", "ระดับปริญญา", "หลักสูตร", "รหัสสาขา", "สาขาวิชา",
    "อาจารย์ที่ปรึกษา วิทยานิพนธ์หลัก", "ภาควิชาที่ อาจารย์ที่ปรึกษาสังกัด", "ภาคการศึกษา ที่เข้าศึกษา", "ปีการศึกษา ที่เข้าศึกษา",
    "สถานะ ปัจจุบัน", "แผน การเรียน", "หัวข้อวิทยานิพนธ์", "วันที่อนุมัติโครงร่าง", "ผลสอบภาษาอังกฤษ",
    "ภาคจบการศึกษา", "ปีจบการศึกษา"
  ];

  const studentRows = studentList.map(s => [
    s.student_id, s.full_name_th, s.gender, s.nationality, s.degree_level, s.program_type, s.major_code, s.major_name,
    s.advisor_name, s.advisor_department, s.admit_semester, s.admit_year, s.current_status, s.study_plan,
    s.thesis_title_th || "", s.proposal_exam_date || "", s.english_test_pass, 
    s.graduated_semester || "", s.graduated_year || ""
  ]);

  const wb = XLSX.utils.book_new();
  const wsStudents = XLSX.utils.aoa_to_sheet([studentHeaders, ...studentRows]);
  XLSX.utils.book_append_sheet(wb, wsStudents, "Students");

  // --- Sheet 2: Publications ---
  if (publications.length > 0) {
    const pubHeaders = ["รหัสนิสิต", "ชื่อบทความ", "วารสาร", "ปี", "วันที่ตีพิมพ์", "Quartile", "น้ำหนัก"];
    const pubRows = publications.map(p => [
       p.student_id, p.publication_title, p.journal_name, p.year, p.publication_date, p.quartile, p.weight
    ]);
    const wsPubs = XLSX.utils.aoa_to_sheet([pubHeaders, ...pubRows]);
    XLSX.utils.book_append_sheet(wb, wsPubs, "Publications");
  }

  // --- Sheet 3: Progress ---
  if (progress.length > 0) {
    const progHeaders = ["รหัสนิสิต", "หัวข้อ", "สถานะ", "วันที่สอบ", "ภาคการศึกษา", "ปีการศึกษา"];
    const progRows = progress.map(p => [
       p.student_id, p.milestone_type, p.status, p.exam_date, p.semester, p.academic_year
    ]);
    const wsProg = XLSX.utils.aoa_to_sheet([progHeaders, ...progRows]);
    XLSX.utils.book_append_sheet(wb, wsProg, "Progress");
  }

  // Generate file download
  const dateStr = DateTime.now().toFormat('yyyy-MM-dd');
  XLSX.writeFile(wb, `ฐานข้อมูลนิสิต_${dateStr}.xlsx`);
};
