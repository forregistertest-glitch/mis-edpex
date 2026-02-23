
export interface NcbiPublication {
    id: string; // PMID
    title: string;
    journal: string;
    coverDate: string;
    doi: string;
    authors: string;
    volume: string;
    issue: string;
    pages: string;
    raw: any;
}

export interface NcbiSearchResponse {
    results: NcbiPublication[];
    totalResults: number;
}

export const NcbiService = {
    searchWithAffiliation: async (
        query: string,
        affiliation: string,
        year?: string,
        start: number = 0
    ): Promise<NcbiSearchResponse> => {
        const params = new URLSearchParams();
        if (query) params.append('query', query);
        if (affiliation) params.append('affiliation', affiliation);
        if (year && year !== 'all') params.append('year', year);
        if (start > 0) params.append('start', start.toString());

        const res = await fetch(`/api/ncbi?${params.toString()}`);
        if (!res.ok) {
            let errorText = 'Failed to fetch from NCBI';
            try {
                const err = await res.json();
                errorText = err.error || errorText;
            } catch (e) { }
            throw new Error(errorText);
        }

        return await res.json();
    }
};
