import * as XLSX from 'xlsx';
import { Personnel } from '@/types/personnel';
import { DateTime } from 'luxon';

export const exportPersonnelToExcel = (personnelList: Personnel[]) => {
  // Define the headers based on the Master Template (Thai)
  // Reference from implementation_plan.md
  const headers = [
    "ID",
    "F", // Title
    "ชื่อ", // First Name
    "สกุล", // Last Name
    "ตำแหน่ง", // Position
    "สังกัด", // Affiliation
    "แผนก", // Department
    "วิทยาเขต", // Campus
    "สถานภาพ", // Employment Status
    "เพศ", // Gender
    "การศึกษา", // Education Level
    "วุฒิการศึกษา", // Degree Name
    "วันเกิด", // Birth Date
    "วันบรรจุ", // Start Date
    "ปีที่จะ ครบเกษียณ", // Retirement Year
    "Gen", // Generation
    "Created Date",
    "Created By",
    "Updated Date",
    "Updated By"
  ];

  // Map data to rows
  const rows = personnelList.map(p => {
    // Helper to format timestamp
    const fmt = (ts: any) => {
       if (!ts) return "";
       if (typeof ts === 'string') return ts;
       if (ts.toDate) return ts.toDate().toISOString();
       return "";
    };

    return [
      p.personnel_id,
      p.title_th,
      p.first_name_th,
      p.last_name_th,
      p.position,
      p.affiliation,
      p.department,
      p.campus,
      p.employment_status,
      p.gender,
      p.education_level,
      p.degree_name,
      p.birth_date,
      p.start_date,
      p.retirement_year,
      p.generation,
      fmt(p.created_at),
      p.created_by,
      fmt(p.updated_at),
      p.updated_by
    ];
  });

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  // Append sheet
  XLSX.utils.book_append_sheet(wb, ws, "Personnel");

  // Generate file download
  const dateStr = DateTime.now().toFormat('yyyy-MM-dd_HHmm');
  XLSX.writeFile(wb, `รายชื่อบุคลากร_${dateStr}.xlsx`);
};
