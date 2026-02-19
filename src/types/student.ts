export interface GraduateStudent {
  id?: string;
  student_id: string; // รหัสนิสิต (Primary Key)
  
  // Personal Info
  title_th?: string;
  first_name_th: string;
  last_name_th: string;
  title_en?: string;
  first_name_en?: string;
  last_name_en?: string;
  
  full_name_th: string; // Computed or Legacy
  full_name_en?: string; // ชื่อเต็มอังกฤษ
  
  gender?: "ชาย" | "หญิง" | string;
  nationality?: "ไทย" | "อื่นๆ" | string;
  
  // Contact Info
  email?: string;
  phone?: string;
  line_id?: string;
  scopus_id?: string; // รหัสอ้างอิงฐานข้อมูล Scopus

  // Academic Info
  degree_level: "ปริญญาโท" | "ปริญญาเอก" | string;
  program_type?: "ปกติ" | "พิเศษ" | "นานาชาติ" | string;
  major_code: string; // รหัสสาขา (เช่น XI16)
  major_name: string; // สาขาวิชา
  faculty?: string; // คณะ
  campus?: string; // วิทยาเขต
  line_th?: string; // กลุ่มสาขาวิชา
  
  // Advisor Info
  advisor_id?: string; // Link to Advisor collection
  advisor_name: string; // Cached Name
  advisor_department?: string;

  // Enrollment Info
  admit_semester?: string;
  admit_year: number; // ปีการศึกษา (พ.ศ.)
  
  // Status & Progress
  current_status: string; // สถานะปัจจุบัน (กำลังศึกษา, จบการศึกษา, ลาออก, พ้นสภาพ, ไม่มารายงานตัว)
  study_plan?: string; // แผนการเรียน (ก แบบ ก 1, แบบ 1.1 ฯลฯ)
  
  // Thesis Info
  thesis_title_th?: string; // หัวข้อวิทยานิพนธ์ (ไทย)
  thesis_title_en?: string; // หัวข้อวิทยานิพนธ์ (อังกฤษ) — NEW
  
  // Committee Info — NEW
  committee_set?: string; // สถานะการแต่งตั้งกรรมการ (แต่งตั้งแล้ว / ยังไม่แต่งตั้ง)
  committee_date?: string; // วันที่แต่งตั้งกรรมการ
  teacher_card?: string; // รหัสอาจารย์ (TEACHER_CARD)
  
  // Graduation Info
  expected_grad_semester?: string; // ภาคการศึกษาที่ต้องจบ (แผน) — NEW
  expected_grad_year?: number; // ปีการศึกษาที่ต้องจบ (แผน) — NEW
  actual_graduation_date?: string; // วันที่สำเร็จการศึกษา (ISO Date)
  graduated_semester?: string; // ภาคจบการศึกษา (จริง)
  graduated_year?: number; // ปีจบการศึกษา (จริง)
  on_plan?: boolean; // จบตามแผน — NEW

  // Legacy/Computed Fields (Keep for compatibility)
  english_test_pass?: "ผ่าน" | "ไม่ผ่าน" | string;
  proposal_exam_date?: string; // Legacy: One-to-one mapping for simple CSV import
  publication_count?: number; // Cached count
  expected_graduation_date?: string; // Legacy alias

  // Meta
  updated_at?: any;
  updated_by?: string;
  created_at?: any;
  created_by?: string;
  is_deleted?: boolean;
}
