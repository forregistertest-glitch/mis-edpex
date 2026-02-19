import * as XLSX from 'xlsx';

const TEMPLATE_VERSION = 'v1.1b';

/**
 * ดาวน์โหลด Import Template — Excel ว่างมี Header + ตัวอย่าง
 * 4 Sheets: Students (27 cols), Publications (14 cols), Progress (6 cols), Advisors (9 cols)
 */
export function downloadImportTemplate() {
  const wb = XLSX.utils.book_new();

  // ===== Sheet 1: Students =====
  const studentData = [
    [
      "รหัสนิสิต", "ชื่อ", "เพศ", "สัญชาติ", "ระดับปริญญา",
      "หลักสูตร (ภาคปกติ/ภาคพิเศษ)", "รหัสสาขา", "สาขาวิชา",
      "อาจารย์ที่ปรึกษา วิทยานิพนธ์หลัก", "ภาควิชาที่ อาจารย์ที่ปรึกษาสังกัด",
      "ภาคการศึกษา ที่เข้าศึกษา", "ปีการศึกษา ที่เข้าศึกษา",
      "ภาคการศึกษาที่ต้องจบตามแผน", "ปีการศึกษาที่ต้องจบตามแผน",
      "สถานะ ปัจจุบัน", "แผน การเรียน",
      "หัวข้อวิทยานิพนธ์", "หัวข้อวิทยานิพนธ์ (EN)",
      "วันที่อนุมัติโครงร่าง", "ผลสอบภาษาอังกฤษ",
      "สถานะกรรมการ", "วันที่แต่งตั้งกรรมการ",
      "รหัสอาจารย์ (TEACHER_CARD)",
      "ภาคจบการศึกษา", "ปีจบการศึกษา",
      "วันที่สำเร็จการศึกษา", "จบตามแผน",
    ],
    [
      "6014900080", "นางสาวพิริยาภรณ์ เฑียรเดชสกุล", "หญิง", "ไทย", "ปริญญาโท",
      "ปกติ", "XI16", "วิทยาศาสตร์สุขภาพสัตว์และชีวเวชศาสตร์",
      "รศ.น.สพ.ดร.พิษณุ ตุลยกุล", "สัตวแพทยสาธารณสุขศาสตร์",
      "ภาคต้น", 2560,
      "ภาคปลาย", 2561,
      "จบการศึกษา", "ก แบบ ก 1",
      "การศึกษาเปรียบเทียบ...", "A Comparative Study of...",
      "17 พ.ค. 2562", "ผ่าน",
      "แต่งตั้งแล้ว", "",
      "I1006",
      "ภาคปลาย", 2564,
      "17 ก.พ. 2565", "จบไม่ตามแผน",
    ],
  ];

  // ===== Sheet 2: Publications =====
  const pubData = [
    [
      "รหัสนิสิต", "ชื่อบทความ", "ชื่อวารสาร",
      "เผยแพร่ระหว่างวันที่", "ปีที่ (Volume)", "ฉบับที่ (Issue)", "เลขหน้า",
      "วันที่ตอบรับให้ตีพิมพ์", "ปีที่ตีพิมพ์", "ระดับการเผยแพร่",
      "วันที่อนุมัติปริญญา", "ฐานข้อมูล", "Quartile", "น้ำหนัก (%)",
    ],
    [
      "5727900026", "Localization of cerebral hypoperfusion...",
      "The Journal of Veterinary Medical Science",
      "15/05/2563 - 15/05/2563", "82 (2020)", "5", "553-558",
      "29/5/2563", 2563, "นานาชาติ",
      "29/5/2563", "Pubmed", "Q1", 100,
    ],
  ];

  // ===== Sheet 3: Progress =====
  const progressData = [
    [
      "รหัสนิสิต", "หัวข้อ (Milestone)", "สถานะ",
      "วันที่สอบ", "ภาคการศึกษา", "ปีการศึกษา",
    ],
    ["6214900083", "Proposal", "ยื่นโครงการวิทยานิพนธ์แล้ว", "15/05/2564", "ต้น", 2564],
    ["6214900083", "English", "สอบภาษาอังกฤษผ่านแล้ว", "10/01/2567", "ต้น", 2567],
    ["6214900083", "Defense", "ยังไม่ได้ยื่นสอบปากเปล่าขั้นสุดท้าย", "", "", ""],
  ];

  // ===== Sheet 4: Advisors =====
  const advisorData = [
    [
      "รหัสอาจารย์", "คำนำหน้า", "ชื่อ-นามสกุล",
      "ชื่อ", "นามสกุล", "ภาควิชา", "คณะ",
      "อีเมล", "โทรศัพท์",
    ],
    [
      "I1006", "รศ.น.สพ.ดร.", "รศ.น.สพ.ดร.พิษณุ ตุลยกุล",
      "พิษณุ", "ตุลยกุล", "สัตวแพทยสาธารณสุขศาสตร์", "คณะสัตวแพทยศาสตร์",
      "pisanu.t@ku.th", "02-797-1234",
    ],
  ];

  const wsStudents = XLSX.utils.aoa_to_sheet(studentData);
  const wsPubs = XLSX.utils.aoa_to_sheet(pubData);
  const wsProgress = XLSX.utils.aoa_to_sheet(progressData);
  const wsAdvisors = XLSX.utils.aoa_to_sheet(advisorData);

  // Auto-adjust column widths
  [wsStudents, wsPubs, wsProgress, wsAdvisors].forEach(ws => {
    const ref = ws['!ref'];
    if (!ref) return;
    const range = XLSX.utils.decode_range(ref);
    const colWidths: { wch: number }[] = [];
    for (let c = range.s.c; c <= range.e.c; c++) {
      let maxLen = 10;
      for (let r = range.s.r; r <= range.e.r; r++) {
        const cell = ws[XLSX.utils.encode_cell({ r, c })];
        if (cell?.v) maxLen = Math.max(maxLen, String(cell.v).length + 2);
      }
      colWidths.push({ wch: Math.min(maxLen, 40) });
    }
    ws['!cols'] = colWidths;
  });

  XLSX.utils.book_append_sheet(wb, wsStudents, `Students`);
  XLSX.utils.book_append_sheet(wb, wsPubs, `Publications`);
  XLSX.utils.book_append_sheet(wb, wsProgress, `Progress`);
  XLSX.utils.book_append_sheet(wb, wsAdvisors, `Advisors`);

  XLSX.writeFile(wb, `import_template_นิสิต_${TEMPLATE_VERSION}.xlsx`);
}
