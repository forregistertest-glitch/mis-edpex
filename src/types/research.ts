export interface ResearchAuthor {
  type: 'personnel' | 'student' | 'external';
  id?: string; // e.g. personnel_id or student_id if applicable
  name: string;
}

export interface ResearchRecord {
  id?: string;
  year: string;
  title: string;
  doi?: string;
  journal?: string;
  scopus_id?: string;
  publish_class?: string;
  authors_raw?: string;
  authors_json?: ResearchAuthor[];
  status: 'active' | 'disabled';
  is_deleted: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}
