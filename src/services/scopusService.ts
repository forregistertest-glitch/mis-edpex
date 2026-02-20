
export interface ScopusPublication {
  title: string;
  journal: string;
  coverDate: string;
  doi?: string;
  url: string;
  authorId?: string;
  abstract?: string;
  keywords?: string;
  citationCount?: number;
  openAccess?: boolean;
  affiliations?: string;
  eid: string;
  aggregationType?: string;
  subtypeDescription?: string;
  volume?: string;
  issue?: string;
  pageRange?: string;
  raw?: any;
}

export interface ScopusSearchResponse {
  results: ScopusPublication[];
  totalResults: number;
}

export const ScopusService = {
  searchByAuthorId: async (authorId: string): Promise<ScopusPublication[]> => {
    const res = await fetch(`/api/scopus?authorId=${authorId}`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to fetch from Scopus');
    }

    const data = await res.json();
    const entries = data['search-results']?.entry || [];

    return entries.map((item: any) => ({
      title: item['dc:title'],
      journal: item['prism:publicationName'],
      coverDate: item['prism:coverDate'],
      doi: item['prism:doi'],
      url: item['link']?.find((l: any) => l['@ref'] === 'scopus')?.['@href'] || '',
      authorId: authorId,
      eid: item['eid'],
      aggregationType: item['prism:aggregationType'],
      subtypeDescription: item['subtypeDescription'],
      volume: item['prism:volume'],
      issue: item['prism:issueIdentifier'],
      pageRange: item['prism:pageRange']
    }));
  },

  searchByQuery: async (query: string): Promise<ScopusPublication[]> => {
    const res = await fetch(`/api/scopus?query=${encodeURIComponent(query)}`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to fetch from Scopus');
    }

    const data = await res.json();
    const entries = data['search-results']?.entry || [];

    return entries.map((item: any) => ({
      title: item['dc:title'],
      journal: item['prism:publicationName'],
      coverDate: item['prism:coverDate'],
      doi: item['prism:doi'],
      url: item['link']?.find((l: any) => l['@ref'] === 'scopus')?.['@href'] || '',
      eid: item['eid'],
      aggregationType: item['prism:aggregationType'],
      subtypeDescription: item['subtypeDescription'],
      volume: item['prism:volume'],
      issue: item['prism:issueIdentifier'],
      pageRange: item['prism:pageRange']
    }));
  },

  searchWithAffiliation: async (query: string, affiliation: string, year?: string, start: number = 0): Promise<ScopusSearchResponse> => {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (affiliation) params.append('affiliation', affiliation);
    if (year && year !== 'all') params.append('year', year);
    if (start > 0) params.append('start', start.toString());

    const res = await fetch(`/api/scopus?${params.toString()}`);
    if (!res.ok) {
      let errorText = 'Failed to fetch from Scopus';
      try {
        const err = await res.json();
        errorText = err.error || errorText;
      } catch (e) { }
      throw new Error(errorText);
    }

    const data = await res.json();
    const searchResults = data['search-results'];
    const entries = searchResults?.entry || [];
    const totalResults = parseInt(searchResults?.['opensearch:totalResults'] || '0');

    const results = entries.map((item: any) => {
      let authorListStr = item['dc:creator'] || 'Unknown';
      if (item['author'] && Array.isArray(item['author'])) {
        authorListStr = item['author'].map((a: any) => {
          const name = a.authname || (a['given-name'] && a.surname ? `${a['given-name']} ${a.surname}` : 'Unknown');
          const id = a.authid ? ` (ID: ${a.authid})` : '';
          return `${name}${id}`;
        }).join(', ');
      }

      let affiliationsStr = '';
      if (item.affiliation && Array.isArray(item.affiliation)) {
        affiliationsStr = item.affiliation.map((af: any) => af.affilname || af.name).filter(Boolean).join('; ');
      }

      return {
        title: item['dc:title'],
        journal: item['prism:publicationName'],
        coverDate: item['prism:coverDate'],
        doi: item['prism:doi'],
        url: item['link']?.find((l: any) => l['@ref'] === 'scopus')?.['@href'] || '',
        abstract: item['dc:description'] || '',
        keywords: item['authkeywords'] || '',
        citationCount: parseInt(item['citedby-count'] || '0'),
        openAccess: item['openaccessFlag'] === true || item['openaccessFlag'] === 'true',
        affiliations: affiliationsStr,
        eid: item['eid'],
        authorId: authorListStr,
        aggregationType: item['prism:aggregationType'],
        subtypeDescription: item['subtypeDescription'],
        volume: item['prism:volume'],
        issue: item['prism:issueIdentifier'],
        pageRange: item['prism:pageRange'],
        raw: item
      };
    });

    return { results, totalResults };
  }
};
