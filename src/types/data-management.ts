/**
 * TypeScript Types for Data Management Modules
 * Based on Excel file structures
 */

// ===== Postgraduate Data (ข้อมูลบัณฑิตศึกษา) =====
// Based on CSV with 58 fields
export interface PostgraduateData {
  id?: string;
  
  // Basic Info (1-11)
  number?: number;                    // 1. ลำดับ
  student_id: string;                 // 2. รหัสนิสิต (STUDENT_ID)
  sex: string;                        // 3. เพศ (SEX)
  prename_th: string;                 // 4. คำนำหน้า (ไทย) (PRENAME_TH)
  name_th: string;                    // 5. ชื่อ (ไทย) (NAME_TH)
  midname_th?: string;                // 6. ชื่อกลาง (ไทย) (MIDNAME_TH)
  surname_th: string;                 // 7. นามสกุล (ไทย) (SURNAME_TH)
  prename_en: string;                 // 8. คำนำหน้า (อังกฤษ) (PRENAME_EN)
  name_en: string;                    // 9. ชื่อ (อังกฤษ) (NAME_EN)
  midname_en?: string;                // 10. ชื่อกลาง (อังกฤษ) (MIDNAME_EN)
  surname_en: string;                 // 11. นามสกุล (อังกฤษ) (SURNAME_EN)
  
  // Status (12-13)
  current_status: string;             // 12. สถานะปัจจุบัน (Current_Status)
  registration_status: string;        // 13. สถานะการลงทะเบียน (Registration_status)
  
  // Program Info (14-15)
  project_type_th: string;            // 14. ประเภทโครงการ (ไทย) (PRJ_TH)
  project_type_en: string;            // 15. ประเภทโครงการ (อังกฤษ) (PRJ_EN)
  
  // Major/Degree (16-25)
  major_code: string;                 // 16. รหัสสาขาวิชา (MAJOR_C)
  major_th: string;                   // 17. ชื่อสาขาวิชา (ไทย) (MAJOR_TH)
  major_en: string;                   // 18. ชื่อสาขาวิชา (อังกฤษ) (MAJOR_EN)
  degree_th: string;                  // 19. ชื่อปริญญา (ไทย) (DEGREE_TH)
  degree_en: string;                  // 20. ชื่อปริญญา (อังกฤษ) (DEGREE_EN)
  degree_level: string;               // 21. ระดับปริญญา (DEGREE_LEVEL)
  faculty_th: string;                 // 22. ชื่อคณะ (ไทย) (FACULTY_TH)
  faculty_en: string;                 // 23. ชื่อคณะ (อังกฤษ) (FACULTY_EN)
  campus_th: string;                  // 24. ชื่อวิทยาเขต (ไทย) (CAMPUS_TH)
  campus_en: string;                  // 25. ชื่อวิทยาเขต (อังกฤษ) (CAMPUS_EN)
  line_th?: string;                   // 26. ชื่อกลุ่มสาขาวิชา (LINE_TH)
  
  // Admission (27-31)
  class_year: string;                 // 27. ปีที่เข้าศึกษา (CLASS_YR)
  semester: string;                   // 28. ภาคเรียนที่เข้าศึกษา (SEMESTER)
  nationality_code?: string;          // 29. รหัสสัญชาติ (NATIONALITY_C)
  nationality_th: string;             // 30. สัญชาติ (ไทย) (NATIONALITY_TH)
  nationality_en?: string;            // 31. สัญชาติ (อังกฤษ) (NATIONALITY_EN)
  
  // Graduation (32-34)
  graduation_year?: string;           // 32. ปีที่สำเร็จการศึกษา (CLASS_YR_G)
  graduation_semester?: string;       // 33. ภาคเรียนที่สำเร็จการศึกษา (SEMESTER2_G)
  approve_date?: string;              // 34. วันอนุมัติปริญญา (APPROVE_D)
  
  // Advisor (35-36)
  teacher_card?: string;              // 35. รหัสอาจารย์ที่ปรึกษาหลัก (TEACHER_CARD)
  advisor_name_th?: string;           // 36. ชื่ออาจารย์ที่ปรึกษาหลัก (ไทย) (ADVISOR_NAME_TH)
  
  // Committee (37-38)
  committee_set?: string;             // 37. การแต่งตั้งคณะกรรมการนิสิต (COMMITTEE_SET)
  committee_date?: string;            // 38. วันที่แต่งตั้งคณะกรรมการนิสิต (COMMIT_DATE)
  
  // Thesis (39-42)
  thesis_th?: string;                 // 39. ชื่อวิทยานิพนธ์ (ไทย) (THESIS_TH)
  thesis_en?: string;                 // 40. ชื่อวิทยานิพนธ์ (อังกฤษ) (THESIS_EN)
  proposal_submit?: string;           // 41. การเสนอโครงการวิทยานิพนธ์ (PROPOSAL_SUBMIT)
  proposal_date?: string;             // 42. วันที่อนุมัติโครงการวิทยานิพนธ์ (PROP_DATE)
  
  // English Exam (43-44)
  english_exam_status?: string;       // 43. การสอบภาษาอังกฤษ (ENGEXAM_STATUS)
  english_exam_date?: string;         // 44. วันที่ประกาศผลสอบภาษาอังกฤษ (ENGEXAM_DATE)
  
  // Study Plan (45-46)
  study_plan_submit?: string;         // 45. การเสนอแผนการเรียน (STUDYPLAN_SUBMIT)
  study_plan_date?: string;           // 46. วันที่อนุมัติแผนการเรียน (STUDYPLAN_DATE)
  
  // Comprehensive Exam (47-50)
  comprehensive_writing_status?: string;  // 47. การสอบประมวลความรู้ แบบข้อเขียน (COMPREHENSIVE_WRITING_STATUS)
  comprehensive_writing_date?: string;    // 48. วันที่ประกาศผลสอบประมวลความรู้ แบบข้อเขียน (COMPRE_WRITING_DATE)
  comprehensive_oral_status?: string;     // 49. การสอบประมวลความรู้ แบบสัมภาษณ์ (COMPREHENSIVE_ORAL_STATUS)
  comprehensive_oral_date?: string;       // 50. วันที่ประกาศผลสอบประมวลความรู้ แบบสัมภาษณ์ (COMPRE_ORAL_DATE)
  
  // Qualifying Exam (51-54)
  qualifying_writing_status?: string;     // 51. การสอบวัดคุณสมบัติ แบบข้อเขียน (QUALIFYEXAM_WRITING_STATUS)
  qualifying_writing_date?: string;       // 52. วันที่ประกาศผลสอบวัดคุณสมบัติ แบบข้อเขียน (QUALIFY_WRITING_DATE)
  qualifying_oral_status?: string;        // 53. การสอบวัดคุณสมบัติ แบบสัมภาษณ์ (QUALIFYEXAM_ORAL_STATUS)
  qualifying_oral_date?: string;          // 54. วันที่ประกาศผลสอบวัดคุณสมบัติ แบบสัมภาษณ์ (QUALIFY_ORAL_DATE)
  
  // Defense Exam (55-56)
  defense_exam_status?: string;       // 55. การสอบปากเปล่าขั้นสุดท้าย (DEFENDEXAM_STATUS)
  defense_exam_date?: string;         // 56. วันที่ประกาศผลสอบปากเปล่าขั้นสุดท้าย (DEFEND_DATE)
  
  // Manuscript (57-58)
  manuscript_status?: string;         // 57. การยื่นเอกสารขอจบการศึกษา (MANUSCRIPT_STATUS)
  manuscript_date?: string;           // 58. วันที่ยื่นเอกสารขอจบการศึกษา (MANUSCRIPT_DATE)
  
  // Metadata
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

// ===== Residency Data =====
export interface ResidencyData {
  prename: string;                    // คำนำหน้า
  full_name: string;                  // ชื่อ-นามสกุล
  sex: string;                        // เพศ
  advisor: string;                    // อาจารย์ที่ปรึกษา
  advisor_affiliation: string;        // สังกัดอาจารย์ที่ปรึกษา
  specialty: string;                  // สาขาวิชาที่ฝึกอบรม
  concurrent_study?: string;          // สัตวแพทย์ประจำบ้านฯ เรียนควบคู่กับ ป.โท, ป.บัณฑิตชั้นสูง
  admission_year: string;             // ปีที่เข้าฝึกอบรม
  comprehensive_exam_date?: string;   // วันที่สอบประมวลความรู้/วัดคุณสมบัติ
  comprehensive_exam_status?: string; // สถานะการสอบประมวลความรู้
  oral_exam_date?: string;            // วันที่สอบปากเปล่าขั้นสุดท้าย
  oral_exam_status?: string;          // สถานะสอบปากเปล่าขั้นสุดท้าย
  graduation_year?: string;           // ปีที่จบฝึกอบรม
  certificate_date?: string;          // วันที่ได้รับวุฒิบัตร
  research_title?: string;            // ชื่อผลงานวิจัยที่ตีพิมพ์
  journal?: string;                   // วารสารที่ตีพิมพ์
  publication_year?: string;          // ปีที่ตีพิมพ์
  undergraduate_institution?: string; // สถาบันที่จบ สพ.บ.
  personnel_status?: string;          // สถานะการเป็นบุคลากร
  training_status?: string;           // สถานะการฝึกอบรม
  teaching_participation?: string;    // การมีส่วนร่วมสอน/แนะนำ
  
  // Metadata
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

// ===== Intern Data =====
export interface InternData {
  prename: string;                    // คำนำหน้า
  full_name: string;                  // ชื่อ - นามสกุล
  sex: string;                        // เพศ
  undergraduate_university: string;   // มหาวิทยาลัยที่จบการศึกษา
  gpa: number;                        // เกรดเฉลี่ย
  license_number?: string;            // เลขที่ใบประกอบวิชาชีพ
  vet_generation?: string;            // สัตวแพทย์รุ่นที่
  admission_year: string;             // ปีที่เข้าศึกษา
  graduation_year: string;            // ปีที่จบการศึกษา
  workplace?: string;                 // สถานที่ทำงาน
  phone?: string;                     // เบอร์โทรศัพท์
  email?: string;                     // email
  address?: string;                   // ที่อยู่
  application_year?: string;          // ปีที่สมัคร Intern
  selected?: string;                  // ได้รับคัดเลือกเข้าฝึกอบรม
  
  // Metadata
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

// ===== HR Data (Simplified - will expand based on 17 sheets) =====
export interface HRData {
  // Basic Info
  personnel_id: string;               // รหัสบุคลากร
  prename_th: string;                 // คำนำหน้า (ไทย)
  first_name_th: string;              // ชื่อ (ไทย)
  last_name_th: string;               // นามสกุล (ไทย)
  prename_en?: string;                // คำนำหน้า (อังกฤษ)
  first_name_en?: string;             // ชื่อ (อังกฤษ)
  last_name_en?: string;              // นามสกุล (อังกฤษ)
  
  // Personal Details
  id_number?: string;                 // เลขบัตรประชาชน
  passport_number?: string;           // เลขหนังสือเดินทาง
  birth_date?: string;                // วันเกิด
  sex?: string;                       // เพศ
  blood_type?: string;                // หมู่เลือด
  marital_status?: string;            // สถานภาพสมรส
  nationality?: string;               // สัญชาติ
  
  // Contact
  phone?: string;                     // เบอร์โทรศัพท์
  email?: string;                     // อีเมล
  address?: string;                   // ที่อยู่
  
  // Employment
  position?: string;                  // ตำแหน่ง
  department?: string;                // แผนก/ภาควิชา
  employment_type?: string;           // ประเภทพนักงาน
  start_date?: string;                // วันที่เริ่มงาน
  
  // Education
  education_level?: string;           // ระดับการศึกษา
  degree?: string;                    // วุฒิการศึกษา
  
  // Metadata
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

// ===== Export Data Types =====
export type DataManagementType = 'postgraduate' | 'residency' | 'intern' | 'hr';

export interface ExportOptions {
  type: DataManagementType;
  data: PostgraduateData[] | ResidencyData[] | InternData[] | HRData[];
  filename: string;
  sheetName?: string;
}
