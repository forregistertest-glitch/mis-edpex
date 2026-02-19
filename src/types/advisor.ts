export interface Advisor {
  id?: string;
  advisor_id?: string; // รหัสอาจารย์ (e.g. I1006)
  prefix?: string; // คำนำหน้าทางวิชาการ (รศ.น.สพ.ดร.)
  full_name: string; // ชื่อ-นามสกุล
  first_name?: string;
  last_name?: string;
  department?: string; // ภาควิชา/สังกัด
  faculty?: string; // คณะ
  email?: string;
  phone?: string;
  scopus_id?: string; // รหัส Scopus ID

  // Cached counts (computed)
  student_count?: number; // จำนวนนิสิตในที่ปรึกษา

  // Meta
  updated_at?: any;
  updated_by?: string;
  created_at?: any;
  created_by?: string;
  is_deleted?: boolean;
}
