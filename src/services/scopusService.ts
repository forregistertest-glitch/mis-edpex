
export interface ScopusPublication {
  title: string;
  journal: string;
  coverDate: string;
  doi?: string;
  url: string;
  authorId?: string;
  eid: string;
  aggregationType?: string;
  subtypeDescription?: string;
  volume?: string;
  issue?: string;
  pageRange?: string;
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
  }
};
