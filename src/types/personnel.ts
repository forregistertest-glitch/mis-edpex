export interface Personnel {
  id?: string; // Firestore Document ID
  personnel_id: string; // User-input ID (e.g. Employee ID)
  title_th: string;
  first_name_th: string;
  last_name_th: string;
  position: string;
  affiliation: string;
  department: string;
  campus: string;
  employment_status: string;
  gender: string;
  education_level: string;
  degree_name: string;
  birth_date: string; // ISO Date String
  start_date: string; // ISO Date String
  retirement_year?: number;
  generation: string;
  updated_at?: any; // Firestore Timestamp
}
