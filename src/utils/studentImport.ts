import * as XLSX from 'xlsx';
import { GraduateStudent } from '@/types/student';
import { StudentPublication, StudentProgress } from '@/types/academic';
import { Advisor } from '@/types/advisor';
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
  "ชื่อวารสาร": "journal_name",
  "วารสาร": "journal_name",
  "Journal": "journal_name",
  "เผยแพร่ระหว่างวันที่": "publish_period",
  "ปีที่ (Volume)": "volume",
  "Volume": "volume",
  "ฉบับที่ (Issue)": "issue",
  "ฉบับที่": "issue",
  "Issue": "issue",
  "เลขหน้า": "pages",
  "Pages": "pages",
  "วันที่ตอบรับให้ตีพิมพ์": "acceptance_date",
  "วันที่ตีพิมพ์": "publication_date",
  "Date": "publication_date",
  "ปีที่ตีพิมพ์": "year",
  "ปี": "year",
  "Year": "year",
  "ระดับการเผยแพร่": "publication_level",
  "วันที่อนุมัติปริญญา": "degree_approval_date",
  "ฐานข้อมูล": "database_source",
  "Quartile": "quartile",
  "Q": "quartile",
  "น้ำหนัก (%)": "weight",
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
  advisors?: Advisor[];
  errors: string[] 
}> => {
  const errors: string[] = [];
  const result = {
    success: false,
    students: [] as GraduateStudent[],
    publications: [] as StudentPublication[],
    progress: [] as StudentProgress[],
    advisors: [] as Advisor[],
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

    // 4. Process Advisors
    const advisorSheet = sheetNames.find(s => s.toLowerCase().includes("advisor") || s.includes("อาจารย์"));
    if (advisorSheet) {
       const ws = workbook.Sheets[advisorSheet];
       const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
       if (data.length > 1) {
          const headers = (data[0] as string[]).map(h => String(h || "").trim());
          const rows = data.slice(1);
          
          rows.forEach((row: any) => {
             if (!row || row.length === 0) return;
             const advisor: Partial<Advisor> = {
                is_deleted: false,
                created_at: new Date().toISOString(),
                created_by: userEmail
             };

             headers.forEach((header, index) => {
                if (!header) return;
                const field = ADVISOR_HEADER_MAP[header];
                if (field) {
                   let value = row[index];
                   if (value === undefined || value === null) return;
                   if (typeof value === 'string') value = value.trim();
                   if (value === "-" || value === "") return;
                   (advisor as any)[field] = value;
                }
             });

             if (advisor.full_name) {
                result.advisors?.push(advisor as Advisor);
             }
          });
       }
    }

    if (result.students?.length || result.publications?.length || result.progress?.length || result.advisors?.length) {
       result.success = true;
    } else {
       errors.push("ไม่พบข้อมูลใน Sheet ที่กำหนด (Students, Publications, Progress, Advisors) - กรุณาตรวจสอบชื่อ Sheet");
    }

  } catch (error) {
     errors.push("เกิดข้อผิดพลาดในการอ่านไฟล์: " + String(error));
  }

  return result;
};

// =====================================================================
// ADVISOR IMPORT
// =====================================================================

const ADVISOR_HEADER_MAP: Record<string, keyof Advisor> = {
  "รหัสอาจารย์": "advisor_id",
  "Advisor ID": "advisor_id",
  "ID": "advisor_id",
  "คำนำหน้า": "prefix",
  "Prefix": "prefix",
  "ตำแหน่งทางวิชาการ": "prefix",
  "ชื่อ-นามสกุล": "full_name",
  "Full Name": "full_name",
  "ชื่อ-สกุล": "full_name",
  "ชื่อ": "first_name",
  "First Name": "first_name",
  "นามสกุล": "last_name",
  "Last Name": "last_name",
  "ภาควิชา": "department",
  "Department": "department",
  "คณะ": "faculty",
  "Faculty": "faculty",
  "อีเมล": "email",
  "Email": "email",
  "โทรศัพท์": "phone",
  "Phone": "phone",
};

export const parseAdvisorsExcel = async (
  file: File,
  userEmail: string
): Promise<{ success: boolean; data: Advisor[]; errors: string[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const allAdvisors: Advisor[] = [];
        const errors: string[] = [];

        for (const name of workbook.SheetNames) {
          const sheet = workbook.Sheets[name];
          const json = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });
          if (json.length === 0) continue;

          let headerRowIndex = -1;
          for (let r = 0; r < Math.min(json.length, 10); r++) {
            const row = json[r] as string[];
            if (row && row.some(cell => {
              const s = String(cell).trim();
              return s.includes("ชื่อ") || s.includes("Full Name") || s.includes("Advisor");
            })) {
              headerRowIndex = r;
              break;
            }
          }
          if (headerRowIndex === -1) continue;

          const targetHeaders = (json[headerRowIndex] as any[]).map(h => String(h || "").trim());
          const targetRows = json.slice(headerRowIndex + 1);

          targetRows.forEach((row) => {
            if (!row || row.length === 0) return;
            const advisor: Partial<Advisor> = {
              is_deleted: false,
              created_at: new Date().toISOString(),
              created_by: userEmail
            };

            targetHeaders.forEach((header, index) => {
              if (!header) return;
              const field = ADVISOR_HEADER_MAP[header];
              if (field) {
                let value = (row as any)[index];
                if (value === undefined || value === null) return;
                if (typeof value === 'string') value = value.trim();
                if (value === "-" || value === "") return;
                (advisor as any)[field] = value;
              }
            });

            // Build full_name from parts if not present
            if (!advisor.full_name && advisor.first_name && advisor.last_name) {
              advisor.full_name = `${advisor.prefix || ''} ${advisor.first_name} ${advisor.last_name}`.trim();
            }

            if (advisor.full_name) {
              allAdvisors.push(advisor as Advisor);
            }
          });
        }

        resolve({ success: true, data: allAdvisors, errors });
      } catch (error: any) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

// =====================================================================
// DEDUPLICATION ENGINE
// =====================================================================

export interface DeduplicateResult<T> {
  inserts: T[];
  updates: { existing: T; incoming: T; merged: T }[];
  skipped: { incoming: T; reason: string }[];
  summary: { newCount: number; updateCount: number; skipCount: number };
}

/**
 * Deduplicate students by student_id. Upsert strategy.
 */
export function deduplicateStudents(
  incoming: GraduateStudent[],
  existing: GraduateStudent[]
): DeduplicateResult<GraduateStudent> {
  const existingMap = new Map<string, GraduateStudent>();
  existing.forEach(s => { if (s.student_id) existingMap.set(s.student_id, s); });

  const inserts: GraduateStudent[] = [];
  const updates: { existing: GraduateStudent; incoming: GraduateStudent; merged: GraduateStudent }[] = [];

  incoming.forEach(s => {
    if (!s.student_id) return;
    const match = existingMap.get(s.student_id);
    if (match) {
      // Merge: incoming overwrites non-empty fields
      const merged = { ...match };
      Object.entries(s).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '' && value !== '-' && key !== 'id') {
          (merged as any)[key] = value;
        }
      });
      merged.updated_at = new Date().toISOString();
      updates.push({ existing: match, incoming: s, merged });
    } else {
      inserts.push(s);
    }
  });

  return {
    inserts, updates, skipped: [],
    summary: { newCount: inserts.length, updateCount: updates.length, skipCount: 0 }
  };
}

/**
 * Deduplicate publications by student_id + publication_title. Skip strategy.
 */
export function deduplicatePublications(
  incoming: StudentPublication[],
  existing: StudentPublication[]
): DeduplicateResult<StudentPublication> {
  const existingKeys = new Set<string>();
  existing.forEach(p => {
    const key = `${p.student_id}|||${(p.publication_title || '').toLowerCase().trim()}`;
    existingKeys.add(key);
  });

  const inserts: StudentPublication[] = [];
  const skipped: { incoming: StudentPublication; reason: string }[] = [];

  incoming.forEach(p => {
    const key = `${p.student_id}|||${(p.publication_title || '').toLowerCase().trim()}`;
    if (existingKeys.has(key)) {
      skipped.push({ incoming: p, reason: `ซ้ำ: ${p.student_id} - ${p.publication_title}` });
    } else {
      inserts.push(p);
      existingKeys.add(key); // Prevent intra-batch duplicates
    }
  });

  return {
    inserts, updates: [], skipped,
    summary: { newCount: inserts.length, updateCount: 0, skipCount: skipped.length }
  };
}

/**
 * Deduplicate progress by student_id + milestone_type. Upsert strategy.
 */
export function deduplicateProgress(
  incoming: StudentProgress[],
  existing: StudentProgress[]
): DeduplicateResult<StudentProgress> {
  const existingMap = new Map<string, StudentProgress>();
  existing.forEach(p => {
    const key = `${p.student_id}|||${p.milestone_type}`;
    existingMap.set(key, p);
  });

  const inserts: StudentProgress[] = [];
  const updates: { existing: StudentProgress; incoming: StudentProgress; merged: StudentProgress }[] = [];

  incoming.forEach(p => {
    const key = `${p.student_id}|||${p.milestone_type}`;
    const match = existingMap.get(key);
    if (match) {
      const merged = { ...match };
      Object.entries(p).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '' && k !== 'id') {
          (merged as any)[k] = v;
        }
      });
      updates.push({ existing: match, incoming: p, merged });
    } else {
      inserts.push(p);
    }
  });

  return {
    inserts, updates, skipped: [],
    summary: { newCount: inserts.length, updateCount: updates.length, skipCount: 0 }
  };
}

/**
 * Deduplicate advisors by advisor_id or full_name. Upsert strategy.
 */
export function deduplicateAdvisors(
  incoming: Advisor[],
  existing: Advisor[]
): DeduplicateResult<Advisor> {
  const existingByID = new Map<string, Advisor>();
  const existingByName = new Map<string, Advisor>();
  existing.forEach(a => {
    if (a.advisor_id) existingByID.set(a.advisor_id, a);
    if (a.full_name) existingByName.set(a.full_name.trim().toLowerCase(), a);
  });

  const inserts: Advisor[] = [];
  const updates: { existing: Advisor; incoming: Advisor; merged: Advisor }[] = [];

  incoming.forEach(a => {
    const match = (a.advisor_id && existingByID.get(a.advisor_id))
                || (a.full_name && existingByName.get(a.full_name.trim().toLowerCase()))
                || null;
    if (match) {
      const merged = { ...match };
      Object.entries(a).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '' && k !== 'id') {
          (merged as any)[k] = v;
        }
      });
      updates.push({ existing: match, incoming: a, merged });
    } else {
      inserts.push(a);
    }
  });

  return {
    inserts, updates, skipped: [],
    summary: { newCount: inserts.length, updateCount: updates.length, skipCount: 0 }
  };
}
