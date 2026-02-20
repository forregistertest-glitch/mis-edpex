export interface ResearchAuthor {
  scopus_author_id?: string;
  author_name: string;
  ku_linked_type?: 'personnel' | 'student' | 'none';
  ku_linked_id?: string;
  is_corresponding?: boolean;
}

export interface ResearchRecord {
  id?: string;
  scopus_eid?: string; // ป้องกันการ import วนซ้ำ
  doi?: string;
  title: string;
  year: string;
  cover_date?: string; // วันที่ตีพิมพ์เต็ม
  journal?: string;
  publish_class?: string;
  volume?: string;
  issue?: string;
  page_range?: string;
  authors?: string; // เก็บเป็น string ของรายชื่อผู้แต่ง
  authors_raw?: string; // ชื่อเรียงต่อกัน
  authors_list?: ResearchAuthor[]; // ข้อมูลผู้จัดทำที่รองรับระบบ Link
  status: 'active' | 'disabled';
  is_deleted: boolean;
  imported_from?: 'scopus_api' | 'excel' | 'manual';

  // -- New Fields from Scopus COMPLETE View --
  abstract?: string; // บทคัดย่อ
  keywords?: string; // คำสำคัญ
  citation_count?: number; // จำนวนอ้างอิง
  is_open_access?: boolean; // เข้าถึงฟรี
  funding_sponsor?: string; // ผู้ให้ทุน
  funding_no?: string; // เลขที่รับทุน
  affiliations?: string; // สถานศึกษา/สถาบัน

  raw_data?: any; // เก็บ JSON ของ Scopus กลับมา เผื่อใช้อนาคต
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}
