import { ResearchRecord } from "@/types/research";

export interface OrcidSearchResponse {
  "orcid-search-results": {
    "result": Array<{
      "orcid-identifier": {
        "path": string;
        "uri": string;
      }
    }>;
    "num-found": number;
  }
}

export const OrcidService = {
  /**
   * ค้นหา ORCID ID จากชื่อ-นามสกุล หรือ Query
   */
  searchPerson: async (query: string, scope?: string, start: number = 0, rows: number = 25): Promise<{ results: any[], numFound: number }> => {
    try {
      const res = await fetch(`/api/orcid?action=search&q=${encodeURIComponent(query)}&scope=${scope || ''}&start=${start}&rows=${rows}`);
      if (!res.ok) throw new Error("Failed to search ORCiD");
      const data = await res.json();
      return {
        results: data.result || [],
        numFound: data.numFound || 0
      };
    } catch (error) {
      console.error("ORCiD search error:", error);
      return { results: [], numFound: 0 };
    }
  },

  /**
   * ดึงผลงานตีพิมพ์จาก ORCID ID
   */
  getWorks: async (orcidId: string): Promise<ResearchRecord[]> => {
    try {
      const res = await fetch(`/api/orcid?action=works&orcidId=${orcidId}`);
      if (!res.ok) throw new Error("Failed to fetch ORCiD works");
      const data = await res.json();
      return data.works || [];
    } catch (error) {
      console.error("ORCiD works error:", error);
      return [];
    }
  }
};
