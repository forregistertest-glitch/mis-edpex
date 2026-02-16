import * as XLSX from 'xlsx';
import { GraduateStudent } from '@/types/student';
import { StudentService } from '@/services/studentService';
import { DateTime } from 'luxon';

// Expected headers Mapping (Thai Header -> Field Name)
const HEADER_MAP: Record<string, keyof GraduateStudent> = {
  "รหัสนิสิต": "student_id",
  "ชื่อ": "full_name_th",
  "เพศ": "gender",
  "สัญชาติ": "nationality",
  "ระดับปริญญา": "degree_level",
  "หลักสูตร": "program_type",
  "รหัสสาขา": "major_code",
  "สาขาวิชา": "major_name",
  "อาจารย์ที่ปรึกษา วิทยานิพนธ์หลัก": "advisor_name",
  "ภาควิชาที่ อาจารย์ที่ปรึกษาสังกัด": "advisor_department",
  "ภาคการศึกษา ที่เข้าศึกษา": "admit_semester",
  "ปีการศึกษา ที่เข้าศึกษา": "admit_year",
  "สถานะ ปัจจุบัน": "current_status",
  "แผน การเรียน": "study_plan",
  "หัวข้อวิทยานิพนธ์": "thesis_title_th",
  "วันที่อนุมัติโครงร่าง": "proposal_exam_date",
  "ผลสอบภาษาอังกฤษ": "english_test_pass",
  "ภาคจบการศึกษา": "graduated_semester",
  "ปีจบการศึกษา": "graduated_year"
};

export const parseStudentExcel = async (
  file: File, 
  userEmail: string,
  onProgress?: (processed: number, total: number) => void
): Promise<{ success: number; errors: string[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        
        const allStudents: GraduateStudent[] = [];
        const errors: string[] = [];

        for (const name of workbook.SheetNames) {
          const sheet = workbook.Sheets[name];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const json = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });
          
          if (json.length === 0) continue;

          // Find headers row - Look for "รหัสนิสิต" or "ชื่อ"
          let headerRowIndex = -1;
          for (let r = 0; r < Math.min(json.length, 10); r++) {
             const row = json[r] as string[];
             if (row && (row.includes("รหัสนิสิต") || (row.includes("ชื่อ") && row.includes("เพศ")))) {
               headerRowIndex = r;
               break;
             }
          }

          if (headerRowIndex === -1) continue;

          const targetHeaders = json[headerRowIndex] as string[];
          const targetRows = json.slice(headerRowIndex + 1);

          targetRows.forEach((row) => {
             if (!row || row.length === 0) return;
             
             const studentData: Partial<GraduateStudent> = {};
             targetHeaders.forEach((header, index) => {
                if (!header) return;
                const field = HEADER_MAP[header.trim()];
                if (field) {
                  let value = row[index];
                  if (value === undefined || value === null) return;

                  if (field === "proposal_exam_date") {
                     if (typeof value === 'number') {
                        const date = XLSX.SSF.parse_date_code(value);
                        const dt = DateTime.fromObject({ year: date.y, month: date.m, day: date.d });
                        if (dt.isValid) studentData[field] = dt.toISODate() || "";
                     } else if (typeof value === 'string') {
                        studentData[field] = value.trim();
                     }
                  } else if (field === "admit_year" || field === "graduated_year") {
                      if (typeof value === 'number') {
                        studentData[field] = value;
                      } else if (typeof value === 'string') {
                        const num = parseInt(value.replace(/[^0-9]/g, ''));
                        if (!isNaN(num)) studentData[field] = num;
                      }
                  } else {
                      if (typeof value === 'string') value = value.trim();
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      (studentData as any)[field] = value;
                  }
                }
             });

             if (studentData.student_id && studentData.full_name_th) {
                allStudents.push(studentData as GraduateStudent);
             }
          });
        }

        if (allStudents.length === 0) {
           resolve({ success: 0, errors: ["ไม่พบข้อมูลนิสิตที่ถูกต้องในทุก Sheet (ต้องการคอลัมน์ 'รหัสนิสิต' หรือ 'ชื่อ' และ 'เพศ')"] });
           return;
        }

        // Process in Batches
        let successCount = 0;
        const totalRows = allStudents.length;
        const BATCH_SIZE = 500;

        for (let i = 0; i < totalRows; i += BATCH_SIZE) {
           const batchSize = Math.min(BATCH_SIZE, totalRows - i);
           const batch = allStudents.slice(i, i + batchSize);
           try {
              await StudentService.addStudentBatch(batch, userEmail);
              successCount += batch.length;
           } catch (err: any) {
              errors.push(`Batch ${(i/BATCH_SIZE) + 1} error: ${err.message}`);
           }

           if (onProgress) {
              onProgress(Math.min(i + BATCH_SIZE, totalRows), totalRows);
              await new Promise(r => setTimeout(r, 0));
           }
        }
        
        resolve({ success: successCount, errors });

      } catch (error: any) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};
