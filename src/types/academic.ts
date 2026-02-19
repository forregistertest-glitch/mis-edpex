export interface StudentPublication {
  id?: string;
  student_id: string; // FK to Student
  publication_title: string;
  journal_name: string;
  publication_date?: string; // ISO Date
  quartile?: string; // Q1, Q2...
  publication_type?: "Journal" | "Conference" | "Other";
  authors?: string[]; // List of authors
  year?: number;
  weight?: number; // % Contribution

  // NEW fields from CSV 1 (การตีพิมพ์ผลงาน)
  publish_period?: string; // เผยแพร่ระหว่างวันที่
  volume?: string; // ปีที่ (Volume) e.g. "82 (2020)"
  issue?: string; // ฉบับที่ (Issue)
  pages?: string; // เลขหน้า e.g. "553-558"
  acceptance_date?: string; // วันที่ตอบรับให้ตีพิมพ์
  publication_level?: string; // ระดับการเผยแพร่ (ชาติ/นานาชาติ)
  degree_approval_date?: string; // วันที่อนุมัติปริญญา
  database_source?: string; // ฐานข้อมูล (Pubmed, Scopus, TCI ฯลฯ)

  created_at?: any;
  created_by?: string;
  updated_at?: any;
  updated_by?: string;
}

export interface StudentProgress {
  id?: string;
  student_id: string; // FK to Student
  milestone_type: "QE" | "Proposal" | "Defense" | "English" | "Ethics" 
    | "ComprehensiveWriting" | "ComprehensiveOral"  // NEW
    | "QualifyWriting" | "QualifyOral"              // NEW
    | "StudyPlan" | "Manuscript"                    // NEW
    | "Other";
  status: "Passed" | "Failed" | "Pending" | "In Progress" 
    | "ผ่าน" | "ไม่ผ่าน" | "รอผล" | "ยังไม่ได้ยื่น"   // Thai equivalents
    | string;
  exam_date?: string; // ISO Date
  submit_date?: string; // วันที่ยื่น — NEW
  semester?: string;
  academic_year?: number;
  description?: string; // Optional details
  created_at?: any;
  created_by?: string;
  updated_at?: any;
  updated_by?: string;
}
