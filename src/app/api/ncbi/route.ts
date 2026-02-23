
import { NextResponse } from 'next/server';

const NCBI_BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

/**
 * API Route for NCBI (PubMed) E-utilities
 * Supports:
 * - affiliation filtering (Vet Faculty vs All KU)
 * - query search
 * - pagination (start/retmax)
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const affiliation = searchParams.get('affiliation');
    const year = searchParams.get('year');
    const start = searchParams.get('start') || '0';
    const retmax = searchParams.get('retmax') || '25';

    try {
        let ncbiQuery = '';

        // 1. Build Affiliation Part
        if (affiliation === 'vet') {
            ncbiQuery = '("Faculty of Veterinary Medicine"[ad] AND "Kasetsart University"[ad])';
        } else {
            ncbiQuery = '"Kasetsart University"[ad]';
        }

        // 2. Build Query Part
        if (query) {
            ncbiQuery = `(${ncbiQuery}) AND (${query})`;
        }

        // 3. Build Year Part
        if (year && year !== 'all') {
            ncbiQuery = `(${ncbiQuery}) AND ${year}[dp]`;
        }

        // Step A: esearch to get PMIDs
        const searchUrl = `${NCBI_BASE_URL}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(ncbiQuery)}&retstart=${start}&retmax=${retmax}&retmode=json`;
        console.log("NCBI Search URL:", searchUrl);

        const searchRes = await fetch(searchUrl);
        if (!searchRes.ok) throw new Error(`NCBI Search Error: ${searchRes.statusText}`);

        const searchData = await searchRes.json();
        const idList = searchData.esearchresult?.idlist || [];
        const count = parseInt(searchData.esearchresult?.count || '0');

        if (idList.length === 0) {
            return NextResponse.json({ results: [], totalResults: count });
        }

        // Step B: esummary to get meta info for the found PMIDs
        const ids = idList.join(',');
        const summaryUrl = `${NCBI_BASE_URL}/esummary.fcgi?db=pubmed&id=${ids}&retmode=json`;

        const summaryRes = await fetch(summaryUrl);
        if (!summaryRes.ok) throw new Error(`NCBI Summary Error: ${summaryRes.statusText}`);

        const summaryData = await summaryRes.json();
        const results = idList.map((id: string) => {
            const summary = summaryData.result?.[id];
            return {
                id: id,
                title: summary?.title || "No Title",
                journal: summary?.fulljournalname || summary?.source || "-",
                coverDate: summary?.pubdate || "-",
                doi: summary?.articleids?.find((ai: any) => ai.idtype === 'doi')?.value || "",
                authors: summary?.authors?.map((a: any) => a.name).join(', ') || "Unknown",
                volume: summary?.volume || "",
                issue: summary?.issue || "",
                pages: summary?.pages || "",
                raw: summary
            };
        });

        return NextResponse.json({
            results,
            totalResults: count
        });

    } catch (error: any) {
        console.error("NCBI Service Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
