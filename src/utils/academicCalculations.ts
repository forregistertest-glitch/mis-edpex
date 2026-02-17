import { GraduateStudent } from "@/types/student";
import { StudentPublication, StudentProgress } from "@/types/academic";

export interface AcademicStatusReport {
  studentId: string;
  fullName: string;
  degreeLevel: string;
  studyPlan: string;
  
  // Progress
  hasPassedEnglish: boolean;
  hasPassedProposal: boolean;
  hasPassedThesis: boolean;
  hasPassedQualifying?: boolean; // PhD only
  hasPassedComprehensive?: boolean; // PhD only
  
  // Publications
  publicationCount: number;
  journalCount: number;
  conferenceCount: number;
  
  // Overall
  status: string;
  alerts: string[];
}

export const analyzeStudentStatus = (
  student: GraduateStudent,
  publications: StudentPublication[],
  progressItems: StudentProgress[]
): AcademicStatusReport => {
  const report: AcademicStatusReport = {
    studentId: student.student_id,
    fullName: student.full_name_th,
    degreeLevel: student.degree_level,
    studyPlan: student.study_plan || "",
    hasPassedEnglish: (student.english_test_pass || "") === "ผ่าน", // Fallback to profile
    hasPassedProposal: !!student.proposal_exam_date, // Fallback to profile
    hasPassedThesis: !!student.actual_graduation_date, // Fallback to profile (Graduated implies thesis passed)
    publicationCount: 0,
    journalCount: 0,
    conferenceCount: 0,
    status: student.current_status || "Unknown",
    alerts: []
  };

  // 1. Analyze Progress from Raw Data (Overrides Profile if exists)
  progressItems.forEach(item => {
    // Normalize logic: Check for "Passed" (standard) or "ผ่าน" (legacy/raw)
    const status = item.status?.toLowerCase() || "";
    if (status === "passed" || status === "pass" || status === "ผ่าน") {
      const type = item.milestone_type.toLowerCase();
      if (type.includes("proposal") || type.includes("หัวข้อ")) report.hasPassedProposal = true;
      if (type.includes("english") || type.includes("ภาษาอังกฤษ")) report.hasPassedEnglish = true;
      if (type.includes("defense") || type.includes("protection") || type.includes("ป้องกัน")) report.hasPassedThesis = true;
      if (type.includes("qualifying") || type.includes("qe")) report.hasPassedQualifying = true;
      if (type.includes("comprehensive") || type.includes("comp")) report.hasPassedComprehensive = true;
    }
  });

  // 2. Analyze Publications
  report.publicationCount = publications.length;
  publications.forEach(pub => {
    const type = pub.publication_type?.toLowerCase() || "";
    if (type.includes("journal") || type.includes("วารสาร")) report.journalCount++;
    else report.conferenceCount++;
  });

  // 3. Determine Alerts & Status Recommendations
  // Example Rules (Simplified)
  
  // English Requirement
  if (!report.hasPassedEnglish) {
    report.alerts.push("ยังไม่ผ่านการสอบภาษาอังกฤษ");
  }

  // Publication Requirement (Heuristic)
  const isPhD = student.degree_level.includes("เอก") || student.degree_level.includes("Doctor");
  const isMaster = !isPhD;

  if (isMaster) {
      if (report.publicationCount < 1) report.alerts.push("ยังไม่มีผลงานตีพิมพ์ (ต้องการอย่างน้อย 1 เรื่อง)");
  } else if (isPhD) {
      if (report.journalCount < 1) report.alerts.push("ต้องมีวารสารอย่างน้อย 1 เรื่อง (PhD)");
      if (report.publicationCount < 2) report.alerts.push("ผลงานตีพิมพ์ยังไม่ครบ 2 เรื่อง (PhD)");
  }

  // Time Limits (Example: 2 years for Master, 3 for PhD - rough check)
  const admitYear = student.admit_year || 0;
  const currentYear = new Date().getFullYear() + 543; // Buddhist Year approx
  const yearsStudied = currentYear - admitYear;

  if (isMaster && yearsStudied > 4) report.alerts.push("ระยะเวลาศึกษาเกินเกณฑ์ (4 ปี)");
  if (isPhD && yearsStudied > 6) report.alerts.push("ระยะเวลาศึกษาเกินเกณฑ์ (6 ปี)");

  // Derive "Ready to Graduate"?
  if (report.hasPassedEnglish && report.hasPassedThesis && report.alerts.length === 0) {
     if (student.current_status !== "สำเร็จ" && student.current_status !== "Graduated") {
         report.status = "พร้อมจบการศึกษา (Verification Needed)";
     }
  }

  return report;
};
