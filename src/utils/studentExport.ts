import * as XLSX from 'xlsx';
import { GraduateStudent } from '@/types/student';
import { DateTime } from 'luxon';
import { StudentPublication, StudentProgress } from '@/types/academic';
import { Advisor } from '@/types/advisor';

// ===================================================================
// HELPER: Group by key
// ===================================================================
function groupBy<T>(arr: T[], keyFn: (item: T) => string): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

// ===================================================================
// 1. BASIC EXPORT — 3 Sheets (Students, Publications, Progress)
// ===================================================================
export const exportStudentsToExcel = (
  studentList: GraduateStudent[],
  publications: StudentPublication[] = [],
  progress: StudentProgress[] = [],
  advisors: Advisor[] = []
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

  // --- Sheet 4: Advisors ---
  if (advisors.length > 0) {
    const advHeaders = ["รหัสอาจารย์", "คำนำหน้า", "ชื่อ-นามสกุล", "ชื่อ", "นามสกุล", "ภาควิชา", "คณะ", "อีเมล", "โทรศัพท์"];
    const advRows = advisors.map(a => [
       a.advisor_id || '', a.prefix || '', a.full_name, a.first_name || '', a.last_name || '', a.department || '', a.faculty || '', a.email || '', a.phone || ''
    ]);
    const wsAdv = XLSX.utils.aoa_to_sheet([advHeaders, ...advRows]);
    XLSX.utils.book_append_sheet(wb, wsAdv, "Advisors");
  }

  // Generate file download
  const dateStr = DateTime.now().toFormat('yyyy-MM-dd');
  XLSX.writeFile(wb, `ฐานข้อมูลนิสิต_${dateStr}.xlsx`);
};

// ===================================================================
// 2. FULL EXPORT — 6 Sheets ตรงตาม CSV ต้นฉบับ
// ===================================================================

// Milestone type → CSV column names mapping
const MILESTONE_COLS: Record<string, [string, string]> = {
  'Proposal':             ['สถานะโครงร่าง', 'วันที่ยื่นโครงร่าง'],
  'English':              ['ผลสอบภาษาอังกฤษ', 'วันที่สอบภาษาอังกฤษ'],
  'StudyPlan':            ['สถานะแผนการเรียน', 'วันที่อนุมัติแผนการเรียน'],
  'ComprehensiveWriting': ['สอบประมวลข้อเขียน', 'วันที่สอบประมวลข้อเขียน'],
  'ComprehensiveOral':    ['สอบประมวลสัมภาษณ์', 'วันที่สอบประมวลสัมภาษณ์'],
  'QualifyWriting':       ['สอบวัดคุณสมบัติข้อเขียน', 'วันที่สอบวัดคุณสมบัติข้อเขียน'],
  'QualifyOral':          ['สอบวัดคุณสมบัติสัมภาษณ์', 'วันที่สอบวัดคุณสมบัติสัมภาษณ์'],
  'Defense':              ['สอบปากเปล่าขั้นสุดท้าย', 'วันที่สอบปากเปล่าขั้นสุดท้าย'],
  'Manuscript':           ['สถานะเอกสารจบ', 'วันที่ยื่นเอกสารจบ'],
};

export const exportFullReport = (
  students: GraduateStudent[],
  publications: StudentPublication[] = [],
  progress: StudentProgress[] = [],
  advisors: Advisor[] = []
) => {
  const wb = XLSX.utils.book_new();

  // Build lookup maps
  const studentsMap = new Map<string, GraduateStudent>();
  students.forEach(s => studentsMap.set(s.student_id, s));

  const progressMap = groupBy(progress, p => p.student_id);

  // ============ Sheet 1: การตีพิมพ์ผลงาน (CSV 1) ============
  {
    const headers = [
      "ลำดับ", "รหัสนิสิต", "ชื่อ - นามสกุล", "ระดับ", "สาขาวิชา",
      "ชื่ออาจารย์ที่ปรึกษาหลัก", "ชื่อบทความ", "ชื่อวารสาร",
      "เผยแพร่ระหว่างวันที่", "ปีที่ (Volume)", "ฉบับที่", "เลขหน้า",
      "วันที่ตอบรับให้ตีพิมพ์", "ปีที่ตีพิมพ์", "ระดับการเผยแพร่",
      "วันที่อนุมัติปริญญา", "ฐานข้อมูล", "แผนการเรียน"
    ];

    const rows = publications.map((pub, idx) => {
      const s = studentsMap.get(pub.student_id);
      return [
        idx + 1,
        pub.student_id,
        s?.full_name_th || "",
        s?.degree_level || "",
        s?.major_name || "",
        s?.advisor_name || "",
        pub.publication_title,
        pub.journal_name,
        pub.publish_period || pub.publication_date || "",
        pub.volume || "",
        pub.issue || "",
        pub.pages || "",
        pub.acceptance_date || "",
        pub.year || "",
        pub.publication_level || "",
        pub.degree_approval_date || "",
        pub.database_source || "",
        s?.study_plan || "",
      ];
    });

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    XLSX.utils.book_append_sheet(wb, ws, "การตีพิมพ์ผลงาน");
  }

  // ============ Sheet 2: นิสิตคงอยู่ สำเร็จ (CSV 2) ============
  {
    const activeGrad = students.filter(s =>
      !['สละสิทธิ์', 'ไม่มารายงานตัว', 'ลาออก', 'พ้นสภาพ'].includes(s.current_status)
    );

    const headers = [
      "ลำดับ", "รหัสนิสิต", "ชื่อ", "เพศ", "สัญชาติ", "ระดับปริญญา",
      "หลักสูตร", "รหัสสาขา", "สาขาวิชา",
      "อาจารย์ที่ปรึกษา วิทยานิพนธ์หลัก", "ภาควิชาที่ อาจารย์ที่ปรึกษาสังกัด",
      "ภาคการศึกษา ที่เข้าศึกษา", "ปีการศึกษา ที่เข้าศึกษา",
      "ภาคที่ต้องจบตามแผน", "ปีที่ต้องจบตามแผน",
      "สถานะ ปัจจุบัน", "แผน การเรียน", "หัวข้อวิทยานิพนธ์",
      "วันที่อนุมัติโครงร่าง", "ผลสอบภาษาอังกฤษ",
      "สอบประมวลความรู้/สอบวัดคุณสมบัติ", "ผลสอบปากเปล่า",
      "อนุมัติปริญญา", "ภาคจบการศึกษา", "ปีจบการศึกษา", "จบตามแผน"
    ];

    const rows = activeGrad.map((s, idx) => {
      const progs = progressMap[s.student_id] || [];
      const qe = progs.find(p =>
        ['QE', 'QualifyOral', 'QualifyWriting', 'ComprehensiveOral', 'ComprehensiveWriting'].includes(p.milestone_type)
      );
      const defense = progs.find(p => p.milestone_type === 'Defense');

      const onPlan = s.graduated_year && s.expected_grad_year
        ? (s.graduated_year <= s.expected_grad_year ? 'จบตามแผน' : 'จบไม่ตามแผน')
        : '';

      return [
        idx + 1,
        s.student_id, s.full_name_th, s.gender, s.nationality, s.degree_level,
        s.program_type, s.major_code, s.major_name,
        s.advisor_name, s.advisor_department,
        s.admit_semester, s.admit_year,
        s.expected_grad_semester || "", s.expected_grad_year || "",
        s.current_status, s.study_plan, s.thesis_title_th || "",
        s.proposal_exam_date || "", s.english_test_pass || "",
        qe ? `${qe.status || ""} ${qe.exam_date || ""}`.trim() : "",
        defense ? `${defense.status || ""} ${defense.exam_date || ""}`.trim() : "",
        s.actual_graduation_date || "", s.graduated_semester || "", s.graduated_year || "",
        onPlan
      ];
    });

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    XLSX.utils.book_append_sheet(wb, ws, "นิสิตคงอยู่ สำเร็จ");
  }

  // ============ Sheet 3: นิสิตสละสิทธิ์ (CSV 3) ============
  {
    const withdrawn = students.filter(s =>
      ['สละสิทธิ์', 'ไม่มารายงานตัว', 'ลาออก', 'พ้นสภาพ'].includes(s.current_status)
    );

    const headers = [
      "ลำดับ", "รหัสนิสิต", "ชื่อ", "เพศ", "สัญชาติ", "ระดับปริญญา",
      "หลักสูตร", "รหัสสาขา", "สาขาวิชา",
      "อาจารย์ที่ปรึกษา วิทยานิพนธ์หลัก", "ภาควิชาที่ อาจารย์ที่ปรึกษาสังกัด",
      "ภาคการศึกษา ที่เข้าศึกษา", "ปีการศึกษา ที่เข้าศึกษา",
      "ภาคที่ต้องจบตามแผน", "ปีที่ต้องจบตามแผน",
      "สถานะ ปัจจุบัน"
    ];

    const rows = withdrawn.map((s, idx) => [
      idx + 1,
      s.student_id, s.full_name_th, s.gender, s.nationality, s.degree_level,
      s.program_type, s.major_code, s.major_name,
      s.advisor_name || "", s.advisor_department || "",
      s.admit_semester, s.admit_year,
      s.expected_grad_semester || "", s.expected_grad_year || "",
      s.current_status
    ]);

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    XLSX.utils.book_append_sheet(wb, ws, "นิสิตสละสิทธิ์");
  }

  // ============ Sheet 4: รายงานความก้าวหน้า — Pivot (CSV 4) ============
  {
    // Build dynamic milestone headers
    const milestoneHeaders: string[] = [];
    Object.values(MILESTONE_COLS).forEach(([statusCol, dateCol]) => {
      milestoneHeaders.push(statusCol, dateCol);
    });

    const headers = [
      "รหัสนิสิต", "เพศ", "คำนำหน้า", "ชื่อ", "นามสกุล",
      "แผนการเรียน", "หลักสูตร", "รหัสสาขา", "สาขาวิชา",
      "ระดับปริญญา", "คณะ", "วิทยาเขต",
      "ปีเข้าศึกษา", "ภาคเข้าศึกษา", "สัญชาติ",
      "ปีจบ", "ภาคจบ", "วันอนุมัติปริญญา",
      "รหัสอาจารย์", "อาจารย์ที่ปรึกษา", "สถานะกรรมการ", "วันที่แต่งตั้ง",
      "หัวข้อวิทยานิพนธ์ (TH)", "หัวข้อวิทยานิพนธ์ (EN)",
      ...milestoneHeaders
    ];

    const rows = students.map(s => {
      const progs = progressMap[s.student_id] || [];

      // Pivot milestones
      const milestoneData: string[] = [];
      Object.entries(MILESTONE_COLS).forEach(([type]) => {
        const rec = progs.find(p => p.milestone_type === type);
        milestoneData.push(rec?.status || "", rec?.exam_date || "");
      });

      return [
        s.student_id,
        s.gender || "",
        s.title_th || "",
        s.first_name_th || "",
        s.last_name_th || "",
        s.study_plan || "",
        s.program_type || "",
        s.major_code || "",
        s.major_name || "",
        s.degree_level || "",
        s.faculty || "สัตวแพทยศาสตร์",
        s.campus || "บางเขน",
        s.admit_year || "",
        s.admit_semester || "",
        s.nationality || "",
        s.graduated_year || "",
        s.graduated_semester || "",
        s.actual_graduation_date || "",
        s.teacher_card || "",
        s.advisor_name || "",
        s.committee_set || "",
        s.committee_date || "",
        s.thesis_title_th || "",
        s.thesis_title_en || "",
        ...milestoneData
      ];
    });

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    XLSX.utils.book_append_sheet(wb, ws, "รายงานความก้าวหน้า");
  }

  // ============ Sheet 5: สรุปนิสิตจบแยกตามปีเข้า — Cross-tab (CSV 5) ============
  {
    // Determine year range
    const allYears = students.map(s => s.admit_year).filter(Boolean);
    const minYear = Math.min(...allYears) || 2560;
    const maxYear = Math.max(...allYears) || 2568;
    const gradYearRange: number[] = [];
    for (let y = minYear; y <= Math.max(maxYear + 3, 2568); y++) {
      gradYearRange.push(y);
    }

    // Dynamic headers
    const yearHeaders: string[] = [];
    gradYearRange.forEach(y => {
      yearHeaders.push(`${y} จบ`, `${y} คงอยู่`);
    });

    const headers = [
      "ปีที่เข้าศึกษา", "ภาคการศึกษา", "รับเข้า", "ลาออก/หมดสถานภาพ", "คงเหลือ",
      ...yearHeaders,
      "จบตามแผน", "จบไม่ตามแผน", "รวมนิสิตจบ", "คงเหลือนิสิตปัจจุบัน"
    ];

    // Group students by (admit_year, admit_semester)
    const grouped = groupBy(students, s => `${s.admit_year || 'N/A'}_${s.admit_semester || 'N/A'}`);

    const rows = Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, group]) => {
        const [yearStr, semester] = key.split('_');
        const admitted = group.length;
        const resigned = group.filter(s =>
          ['สละสิทธิ์', 'ลาออก', 'พ้นสภาพ', 'ไม่มารายงานตัว'].includes(s.current_status)
        ).length;
        const remaining = admitted - resigned;

        // Year cross-tab
        const yearData: (number | string)[] = [];
        gradYearRange.forEach(y => {
          const gradInYear = group.filter(s => s.graduated_year === y).length;
          const activeStudents = group.filter(s =>
            s.current_status === 'กำลังศึกษา' ||
            (s.graduated_year !== undefined && s.graduated_year > y)
          ).length;
          yearData.push(gradInYear || "", activeStudents || "");
        });

        const totalGrad = group.filter(s => s.current_status === 'จบการศึกษา').length;
        const onPlanCount = group.filter(s =>
          s.current_status === 'จบการศึกษา' &&
          s.graduated_year !== undefined &&
          s.expected_grad_year !== undefined &&
          s.graduated_year <= s.expected_grad_year
        ).length;
        const currentlyActive = group.filter(s => s.current_status === 'กำลังศึกษา').length;

        return [
          yearStr, semester, admitted, resigned, remaining,
          ...yearData,
          onPlanCount || "", (totalGrad - onPlanCount) || "", totalGrad || "", currentlyActive || ""
        ];
      });

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    XLSX.utils.book_append_sheet(wb, ws, "สรุปนิสิตจบแยกตามปีเข้า");
  }

  // ============ Sheet 6: สรุปอาจารย์ที่ปรึกษา (CSV 6) ============
  {
    const withAdvisor = students.filter(s => s.advisor_name);
    const grouped = groupBy(withAdvisor, s => s.advisor_name);

    const headers = [
      "อาจารย์ที่ปรึกษา วิทยานิพนธ์หลัก", "ภาควิชาที่ อาจารย์ที่ปรึกษาสังกัด",
      "รหัสนิสิต", "ชื่อ", "ระดับปริญญา", "หลักสูตร", "สาขาวิชา",
      "ภาคการศึกษา ที่เข้าศึกษา", "ปีการศึกษา ที่เข้าศึกษา",
      "ภาคที่ต้องจบตามแผน", "ปีที่ต้องจบตามแผน",
      "สถานะ ปัจจุบัน"
    ];

    const rows: (string | number)[][] = [];
    Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b, 'th'))
      .forEach(([, advisorStudents]) => {
        advisorStudents.forEach(s => {
          rows.push([
            s.advisor_name,
            s.advisor_department || "",
            s.student_id,
            s.full_name_th,
            s.degree_level,
            s.program_type || "",
            s.major_name,
            s.admit_semester || "",
            s.admit_year || "",
            s.expected_grad_semester || "",
            s.expected_grad_year || "",
            s.current_status
          ]);
        });
      });

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    XLSX.utils.book_append_sheet(wb, ws, "สรุปอาจารย์ที่ปรึกษา");
  }

  // --- Sheet 7: Advisors ---
  if (advisors.length > 0) {
    const advHeaders = ["รหัสอาจารย์", "คำนำหน้า", "ชื่อ-นามสกุล", "ชื่อ", "นามสกุล", "ภาควิชา", "คณะ", "อีเมล", "โทรศัพท์", "จำนวนนิสิต"];
    const advRows = advisors.map(a => {
      const count = students.filter(s => s.advisor_name === a.full_name && !s.is_deleted).length;
      return [a.advisor_id || '', a.prefix || '', a.full_name, a.first_name || '', a.last_name || '', a.department || '', a.faculty || '', a.email || '', a.phone || '', count];
    });
    const ws = XLSX.utils.aoa_to_sheet([advHeaders, ...advRows]);
    XLSX.utils.book_append_sheet(wb, ws, "อาจารย์ที่ปรึกษา");
  }

  // Generate file download
  const dateStr = DateTime.now().toFormat('yyyy-MM-dd');
  XLSX.writeFile(wb, `ฐานข้อมูลนิสิต_ฉบับสมบูรณ์_${dateStr}.xlsx`);
};
