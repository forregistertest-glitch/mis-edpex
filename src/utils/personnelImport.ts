import * as XLSX from 'xlsx';
import { Personnel } from '@/types/personnel';
import { PersonnelService } from '@/services/personnelService';
import { DateTime } from 'luxon';

// Expected headers Mapping (Thai Header -> Field Name)
const HEADER_MAP: Record<string, keyof Personnel> = {
  "ID": "personnel_id",
  "F": "title_th",
  "ชื่อ": "first_name_th",
  "สกุล": "last_name_th",
  "ตำแหน่ง": "position",
  "สังกัด": "affiliation",
  "แผนก": "department",
  "วิทยาเขต": "campus",
  "สถานภาพ": "employment_status",
  "เพศ": "gender",
  "การศึกษา": "education_level",
  "วุฒิการศึกษา": "degree_name",
  "วันเกิด": "birth_date",
  "วันบรรจุ": "start_date",
  "ปีที่จะ ครบเกษียณ": "retirement_year",
  "Gen": "generation"
};

export const parsePersonnelExcel = async (
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
        
        // 1. Collect ALL valid data from ALL sheets first
        let allPersonnel: Personnel[] = [];
        const errors: string[] = [];

        for (const name of workbook.SheetNames) {
          const sheet = workbook.Sheets[name];
          const json = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });
          
          if (json.length === 0) continue;

          // Find headers row
          let headerRowIndex = -1;
          for (let r = 0; r < Math.min(json.length, 5); r++) {
             const row = json[r] as string[];
             if (row && row.includes("ID") && row.includes("ชื่อ")) {
               headerRowIndex = r;
               break;
             }
          }

          if (headerRowIndex === -1) continue;

          const targetHeaders = json[headerRowIndex] as string[];
          const targetRows = json.slice(headerRowIndex + 1);

          targetRows.forEach((row, rowIndex) => {
             if (!row || row.length === 0) return;
             
             const personnelData: Partial<Personnel> = {};
             // Map columns
             targetHeaders.forEach((header, index) => {
                if (!header) return;
                const field = HEADER_MAP[header.trim()];
                if (field) {
                  let value = row[index];
                  if (value === undefined || value === null) return;

                  if (field === "birth_date" || field === "start_date") {
                     if (typeof value === 'number') {
                        const date = XLSX.SSF.parse_date_code(value);
                        const dt = DateTime.fromObject({ year: date.y, month: date.m, day: date.d });
                        if (dt.isValid) personnelData[field] = dt.toISODate();
                     } else if (typeof value === 'string') {
                        personnelData[field] = value;
                     }
                  } else {
                      if (typeof value === 'string') value = value.trim();
                      (personnelData as any)[field] = value;
                  }
                }
             });

             if (personnelData.personnel_id && personnelData.first_name_th) {
                allPersonnel.push(personnelData as Personnel);
             }
          });
        }

        if (allPersonnel.length === 0) {
           resolve({ success: 0, errors: ["No valid personnel data found in any sheet. Require 'ID' and 'ชื่อ' columns."] });
           return;
        }

        // 2. Process in Batches
        let successCount = 0;
        const totalRows = allPersonnel.length;
        const BATCH_SIZE = 500;

        for (let i = 0; i < totalRows; i += BATCH_SIZE) {
           const batch = allPersonnel.slice(i, i + BATCH_SIZE);
           try {
              await PersonnelService.addPersonnelBatch(batch, userEmail);
              successCount += batch.length;
           } catch (err: any) {
              errors.push(`Batch ${i/BATCH_SIZE + 1} error: ${err.message}`);
           }

           if (onProgress) {
              onProgress(Math.min(i + BATCH_SIZE, totalRows), totalRows);
              await new Promise(r => setTimeout(r, 0));
           }
        }
        
        resolve({ success: successCount, errors });
        
        resolve({ success: successCount, errors });

      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};
