import * as XLSX from 'xlsx';
import { GraduateStudent } from '@/types/student';
import { StudentPublication, StudentProgress } from '@/types/academic';
import { parseThaiDate, parseThaiName } from '@/utils/formatters';

const HEADER_MAP: { [key: string]: keyof GraduateStudent } = {
  // Existing map
  "รหัสนิสิต": "student_id",
  "คำนำหน้าไทย": "title_th",
  "ชื่อไทย": "first_name_th",
  "นามสกุลไทย": "last_name_th",
  "คำนำหน้าอังกฤษ": "title_en",
  "Title": "title_en", 
  "First Name": "first_name_en",
  "Last Name": "last_name_en",
  "ชื่อ": "full_name_th", 
  "Name": "full_name_th",
  "เพศ": "gender",
  "สัญชาติ": "nationality", 
  "ระดับการศึกษา": "degree_level",
  "ระดับปริญญา": "degree_level",
  "ประเภทหลักสูตร": "program_type",
  "หลักสูตร": "program_type",
  "รหัสสาขาวิชา": "major_code",
  "รหัสสาขา": "major_code",
  "สาขาวิชา": "major_name", 
  "อาจารย์ที่ปรึกษา": "advisor_name",
  "อาจารย์ที่ปรึกษา วิทยานิพนธ์หลัก": "advisor_name",
  "ภาควิชา": "advisor_department", 
  "ภาควิชาที่ อาจารย์ที่ปรึกษาสังกัด": "advisor_department",
  "ปีการศึกษาที่เข้า": "admit_year", 
  "ปีการศึกษา ที่เข้าศึกษา": "admit_year",
  "ภาคการศึกษาที่เข้า": "admit_semester", 
  "ภาคการศึกษา ที่เข้าศึกษา": "admit_semester",
  "สถานะภาพ": "current_status",
  "สถานะ ปัจจุบัน": "current_status",
  "แผนการศึกษา": "study_plan",
  "แผน การเรียน": "study_plan",
  "หัวข้อวิทยานิพนธ์": "thesis_title_th",
  "วันที่สอบหัวข้อ": "proposal_exam_date",
  "วันที่อนุมัติโครงร่าง": "proposal_exam_date", 
  "วันจบการศึกษา": "actual_graduation_date", 
  "ผลสอบภาษาอังกฤษ": "english_test_pass",
  "ภาคจบการศึกษา": "graduated_semester",
  "ปีจบการศึกษา": "graduated_year",
  "วันที่สำเร็จการศึกษา": "actual_graduation_date"
};

export const parseStudentExcel = async (
  file: File, 
  userEmail: string,
  onProgress?: (processed: number, total: number) => void
): Promise<{ success: boolean; data?: GraduateStudent[]; errors?: string[] }> => {
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

          // Find headers row - Look for "รหัสนิสิต"
          let headerRowIndex = -1;
          for (let r = 0; r < Math.min(json.length, 10); r++) {
             const row = json[r] as string[];
             if (row && row.some(cell => String(cell).includes("รหัสนิสิต"))) {
               headerRowIndex = r;
               break;
             }
          }

          if (headerRowIndex === -1) continue;

           const targetHeaders = (json[headerRowIndex] as any[]).map(h => String(h || "").trim());
           const targetRows = json.slice(headerRowIndex + 1);

           targetRows.forEach((row, rowIndex) => {
              if (!row || row.length === 0) return;
              
              const studentData: Partial<GraduateStudent> = {
                 is_deleted: false,
                 created_at: new Date().toISOString(),
                 created_by: userEmail
              };

              // Extract data based on headers
              targetHeaders.forEach((header, index) => {
                 if (!header) return;
                 const field = HEADER_MAP[header];
                 if (field) {
                   let value = row[index];
                   if (value === undefined || value === null) return;
                   
                   // Clean string values
                   if (typeof value === 'string') {
                     value = value.trim();
                     if (value === "-" || value === "") return;
                   }

                   // Special handlers
                   if (field === 'student_id') {
                      studentData[field] = String(value).replace(/[^0-9-]/g, '');
                   } 
                   else if (field === 'admit_year' || field === 'graduated_year') {
                      const num = parseInt(String(value));
                      if (!isNaN(num)) studentData[field] = num;
                   }
                   else if (field === 'proposal_exam_date' || field === 'actual_graduation_date') {
                      const dateStr = String(value);
                      const isoDate = parseThaiDate(dateStr);
                      if (isoDate) studentData[field] = isoDate;
                   }
                   else {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      (studentData as any)[field] = value;
                   }
                 }
              });

              // Post-processing: Name Parsing
              if (studentData.full_name_th) {
                const nameParts = parseThaiName(studentData.full_name_th);
                studentData.title_th = nameParts.title;
                studentData.first_name_th = nameParts.firstName;
                studentData.last_name_th = nameParts.lastName;
              }

              // Validation: Must have Student ID and First Name
              if (studentData.student_id && studentData.first_name_th) {
                 allStudents.push(studentData as GraduateStudent);
              } else {
                 // errors.push(`Row ${rowIndex + headerRowIndex + 2}: Missing ID or Name`);
              }
           });
        }

        resolve({ success: true, data: allStudents, errors });

      } catch (error: any) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

// --- Publications Import ---

const PUB_HEADER_MAP: Record<string, string> = {
  "รหัสนิสิต": "student_id",
  "Student ID": "student_id",
  "ชื่อบทความ": "publication_title",
  "Title": "publication_title",
  "วารสาร": "journal_name",
  "Journal": "journal_name",
  "วันที่ตีพิมพ์": "publication_date",
  "Date": "publication_date",
  "ปี": "year",
  "Year": "year",
  "Quartile": "quartile",
  "Q": "quartile",
  "น้ำหนัก": "weight",
  "Weight": "weight"
};

export const parsePublicationsExcel = async (
  file: File,
  userEmail: string,
  onProgress?: (processed: number, total: number) => void
): Promise<{ success: boolean; count: number; errors: string[], data: StudentPublication[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        if (jsonData.length === 0) {
          resolve({ success: false, count: 0, errors: ["Empty file"], data: [] });
          return;
        }

        const headers = (jsonData[0] as string[]).map(h => String(h).trim());
        const rows = jsonData.slice(1);
        const results: StudentPublication[] = [];
        const errors: string[] = [];

        // Find header indices
        const headerIndices: Record<string, number> = {};
        Object.entries(PUB_HEADER_MAP).forEach(([th, key]) => {
          const index = headers.findIndex(h => h === th);
          if (index !== -1) headerIndices[key] = index;
        });

        if (onProgress) onProgress(0, rows.length);

        rows.forEach((row: any, index) => {
           if (!row || row.length === 0) return;
           
           const pubData: Partial<StudentPublication> = {
             publication_type: "Journal", // Default
             authors: [],
             weight: 100
           };

           Object.entries(headerIndices).forEach(([key, colIndex]) => {
              const value = row[colIndex];
              if (value !== undefined && value !== null && value !== "") {
                 if (key === 'student_id') {
                    pubData[key as keyof StudentPublication] = String(value).replace(/[^0-9-]/g, '');
                 } else if (key === 'year' || key === 'weight') {
                    const num = parseInt(String(value));
                    if (!isNaN(num)) (pubData as any)[key] = num;
                 } else if (key === 'publication_date') {
                     // Try parsing date
                     const dateStr = String(value);
                     const thaiDate = parseThaiDate(dateStr);
                     pubData.publication_date = thaiDate || dateStr; 
                 } else {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (pubData as any)[key] = value;
                 }
              }
           });

           if (pubData.student_id && pubData.publication_title) {
              results.push(pubData as StudentPublication);
           } else {
              // errors.push(`Row ${index + 2}: Missing Student ID or Title`);
           }
           
           if (onProgress && index % 10 === 0) onProgress(index + 1, rows.length);
        });

        resolve({ success: true, count: results.length, errors, data: results });
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};

// --- Progress Import ---

const PROGRESS_HEADER_MAP: Record<string, string> = {
  "รหัสนิสิต": "student_id",
  "Student ID": "student_id",
  "หัวข้อ": "milestone_type",
  "Milestone": "milestone_type",
  "สถานะ": "status",
  "Status": "status",
  "วันที่สอบ": "exam_date",
  "Exam Date": "exam_date",
  "Date": "exam_date",
  "ภาคการศึกษา": "semester",
  "Semester": "semester",
  "ปีการศึกษา": "academic_year",
  "Year": "academic_year"
};

export const parseProgressExcel = async (
  file: File,
  userEmail: string,
  onProgress?: (processed: number, total: number) => void
): Promise<{ success: boolean; count: number; errors: string[], data: StudentProgress[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        if (jsonData.length === 0) {
          resolve({ success: false, count: 0, errors: ["Empty file"], data: [] });
          return;
        }

        const headers = (jsonData[0] as string[]).map(h => String(h).trim());
        const rows = jsonData.slice(1);
        const results: StudentProgress[] = [];
        const errors: string[] = [];

        // Find header indices
        const headerIndices: Record<string, number> = {};
        Object.entries(PROGRESS_HEADER_MAP).forEach(([th, key]) => {
          const index = headers.findIndex(h => h === th);
          if (index !== -1) headerIndices[key] = index;
        });

        if (onProgress) onProgress(0, rows.length);

        rows.forEach((row: any, index) => {
           if (!row || row.length === 0) return;
           
           const progData: Partial<StudentProgress> = {};

           Object.entries(headerIndices).forEach(([key, colIndex]) => {
              const value = row[colIndex];
              if (value !== undefined && value !== null && value !== "") {
                 if (key === 'student_id') {
                    progData[key as keyof StudentProgress] = String(value).replace(/[^0-9-]/g, '');
                 } else if (key === 'academic_year') {
                    const num = parseInt(String(value));
                    if (!isNaN(num)) (progData as any)[key] = num;
                 } else if (key === 'exam_date') {
                     const dateStr = String(value);
                     const thaiDate = parseThaiDate(dateStr);
                     progData.exam_date = thaiDate || dateStr;
                 } else {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (progData as any)[key] = value;
                 }
              }
           });

           if (progData.student_id && progData.milestone_type) {
              results.push(progData as StudentProgress);
           }
           
           if (onProgress && index % 10 === 0) onProgress(index + 1, rows.length);
        });

        resolve({ success: true, count: results.length, errors, data: results });
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};

// --- Smart Multi-Sheet Import ---

export const parseMultiSheetExcel = async (
  file: File,
  userEmail: string
): Promise<{ 
  success: boolean; 
  students?: GraduateStudent[]; 
  publications?: StudentPublication[]; 
  progress?: StudentProgress[];
  errors: string[] 
}> => {
  const errors: string[] = [];
  const result = {
    success: false,
    students: [] as GraduateStudent[],
    publications: [] as StudentPublication[],
    progress: [] as StudentProgress[],
    errors
  };

  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetNames = workbook.SheetNames;

    // 1. Process Students
    const studentSheet = sheetNames.find(s => s.toLowerCase().includes("student") || s.includes("นิสิต"));
    if (studentSheet) {
       const ws = workbook.Sheets[studentSheet];
       const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
       if (data.length > 1) {
          // Reuse header mapping logic (Simplified duplication for now)
          const headers = (data[0] as string[]).map(h => String(h || "").trim());
          const rows = data.slice(1);
          
          rows.forEach((row: any) => {
             if (!row || row.length === 0) return;
             const studentData: Partial<GraduateStudent> = { 
                 is_deleted: false, 
                 created_at: new Date().toISOString(),
                 created_by: userEmail
             };

             headers.forEach((header, index) => {
                if (!header) return;
                const field = HEADER_MAP[header];
                if (field) {
                   let value = row[index];
                   if (value === undefined || value === null) return;
                   if (typeof value === 'string') value = value.trim();
                   if (value === "-" || value === "") return;

                   if (field === 'student_id') {
                      studentData[field] = String(value).replace(/[^0-9-]/g, '');
                   }
                   else if (field === 'admit_year' || field === 'graduated_year') {
                       const num = parseInt(String(value));
                       if (!isNaN(num)) studentData[field] = num;
                   }
                   else if (field === 'proposal_exam_date' || field === 'actual_graduation_date') {
                       const isoDate = parseThaiDate(String(value));
                       if (isoDate) studentData[field] = isoDate;
                   }
                   else {
                       (studentData as any)[field] = value;
                   }
                }
             });

             if (studentData.full_name_th) {
                const parts = parseThaiName(studentData.full_name_th);
                studentData.title_th = parts.title;
                studentData.first_name_th = parts.firstName;
                studentData.last_name_th = parts.lastName;
             }

             if (studentData.student_id && studentData.first_name_th) {
                result.students?.push(studentData as GraduateStudent);
             }
          });
       }
    }

    // 2. Process Publications
    const pubSheet = sheetNames.find(s => s.toLowerCase().includes("publication") || s.includes("ผลงาน"));
    if (pubSheet) {
       const ws = workbook.Sheets[pubSheet];
       const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
       if (data.length > 1) {
          const headers = (data[0] as string[]).map(h => String(h).trim());
          const rows = data.slice(1);
          
          rows.forEach((row: any) => {
             if (!row || row.length === 0) return;
             const pub: any = { 
                 id: crypto.randomUUID(), 
                 publication_type: "Journal", 
                 authors: [], 
                 weight: 100,
                 created_at: new Date().toISOString(),
                 created_by: userEmail
             };
             
             // Manual Map relying on keywords
             const idxID = headers.findIndex(h => h.includes("รหัสนิสิต") || h.includes("Student ID"));
             const idxTitle = headers.findIndex(h => h.includes("ชื่อบทความ") || h.includes("Title") || h.includes("publication_title"));
             const idxJournal = headers.findIndex(h => h.includes("วารสาร") || h.includes("Journal"));
             const idxYear = headers.findIndex(h => h === "ปี" || h === "Year" || h === "year");
             const idxDate = headers.findIndex(h => h.includes("วันที่") || h.includes("Date"));
             const idxQ = headers.findIndex(h => h.includes("Quartile") || h.includes("Q"));

             if (idxID > -1) pub.student_id = String(row[idxID]).replace(/[^0-9-]/g, '');
             if (idxTitle > -1) pub.publication_title = row[idxTitle];
             if (idxJournal > -1) pub.journal_name = row[idxJournal];
             if (idxYear > -1) pub.year = parseInt(row[idxYear]) || new Date().getFullYear();
             if (idxDate > -1) pub.publication_date = parseThaiDate(String(row[idxDate])) || row[idxDate];
             if (idxQ > -1) pub.quartile = row[idxQ];

             if (pub.student_id && pub.publication_title) {
                 result.publications?.push(pub as StudentPublication);
             }
          });
       }
    }

    // 3. Process Progress
    const progSheet = sheetNames.find(s => s.toLowerCase().includes("progress") || s.includes("ความก้าวหน้า"));
    if (progSheet) {
       const ws = workbook.Sheets[progSheet];
       const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
       if (data.length > 1) {
          const headers = (data[0] as string[]).map(h => String(h).trim());
          const rows = data.slice(1);
          
          rows.forEach((row: any) => {
             if (!row || row.length === 0) return;
             const prog: any = { 
                 id: crypto.randomUUID(),
                 created_at: new Date().toISOString(),
                 created_by: userEmail
             };
             
             const idxID = headers.findIndex(h => h.includes("รหัสนิสิต") || h.includes("Student ID"));
             const idxMilestone = headers.findIndex(h => h.includes("หัวข้อ") || h.includes("Milestone"));
             const idxStatus = headers.findIndex(h => h.includes("สถานะ") || h.includes("Status"));
             const idxDate = headers.findIndex(h => h.includes("วันที่สอบ") || h.includes("Exam Date"));
             const idxTerm = headers.findIndex(h => h.includes("ภาค") || h.includes("Semester"));
             const idxYear = headers.findIndex(h => h.includes("ปี") || h.includes("Year"));

             if (idxID > -1) prog.student_id = String(row[idxID]).replace(/[^0-9-]/g, '');
             if (idxMilestone > -1) prog.milestone_type = row[idxMilestone];
             if (idxStatus > -1) prog.status = row[idxStatus];
             if (idxDate > -1) prog.exam_date = parseThaiDate(String(row[idxDate])) || row[idxDate];
             if (idxTerm > -1) prog.semester = row[idxTerm];
             if (idxYear > -1) prog.academic_year = parseInt(row[idxYear]) || new Date().getFullYear();

             if (prog.student_id && prog.milestone_type) {
                result.progress?.push(prog as StudentProgress);
             }
          });
       }
    } 

    if (result.students?.length || result.publications?.length || result.progress?.length) {
       result.success = true;
    } else {
       errors.push("ไม่พบข้อมูลใน Sheet ที่กำหนด (Students, Publications, Progress) - กรุณาตรวจสอบชื่อ Sheet");
    }

  } catch (error) {
     errors.push("เกิดข้อผิดพลาดในการอ่านไฟล์: " + String(error));
  }

  return result;
};
