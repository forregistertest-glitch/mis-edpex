export interface Researcher {
    id?: string; // Firestore ID
    internal_id?: string; // Link to Personnel ID or Student ID
    user_type: 'personnel' | 'student';

    full_name_th: string;
    full_name_en: string;
    email?: string;

    // External IDs
    scopus_id?: string;
    orcid_id?: string;
    publons_id?: string;
    googlescholar_id?: string;

    // Stats (Cached)
    citation_count?: number;
    h_index?: number;
    publication_count?: number;

    // Metadata
    updated_at?: string;
    updated_by?: string;
}
