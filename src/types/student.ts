export interface GraduateStudent {
    id?: string;
    student_id: string; // รหัสนิสิต (Primary Key)
    full_name_th: string; // ชื่อ (คำนำหน้า + ชื่อ + นามสกุล)
    gender: "ชาย" | "หญิง" | string; // เพศ
    nationality: "ไทย" | "อื่นๆ" | string; // สัญชาติ
    degree_level: "ปริญญาโท" | "ปริญญาเอก" | string; // ระดับปริญญา
    program_type: "ปกติ" | "พิเศษ" | "นานาชาติ" | string; // หลักสูตร
    major_code: string; // รหัสสาขา (เช่น XI16)
    major_name: string; // สาขาวิชา
    advisor_name: string; // อาจารย์ที่ปรึกษา วิทยานิพนธ์หลัก
    advisor_department: string; // ภาควิชาที่ อาจารย์ที่ปรึกษาสังกัด
    admit_semester: string; // ภาคการศึกษา ที่เข้าศึกษา
    admit_year: number; // ปีการศึกษา ที่เข้าศึกษา (พ.ศ. 2560)
    current_status: string; // สถานะ ปัจจุบัน (กำลังศึกษา/สำเร็จ/พ้นสภาพ/ลาออก)
    study_plan: string; // แผน การเรียน (ก 1, ก 2, แบบ 1.1)
    thesis_title_th?: string; // หัวข้อวิทยานิพนธ์
    proposal_exam_date?: string; // วันที่อนุมัติโครงร่าง (ISO string หรือ Thai Date String)
    english_test_pass: "ผ่าน" | "ไม่ผ่าน" | string; // ผลสอบภาษาอังกฤษ
    graduated_semester?: string; // ภาคจบการศึกษา
    graduated_year?: number; // ปีจบการศึกษา
    updated_at?: any; // Timestamp
}
