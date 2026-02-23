export interface Journal {
    id?: string; // Firestore ID (e.g., ISSN or slug)
    title: string;
    issn?: string;
    eissn?: string;
    publisher?: string;
    subject_areas?: string[];

    // Scopus/SJR specific
    sjr_percentile?: number;
    sjr_quartile?: 'Q1' | 'Q2' | 'Q3' | 'Q4' | string;
    cite_score?: number;
    snip?: number;

    // Metadata
    updated_at?: string;
    updated_by?: string;
}
