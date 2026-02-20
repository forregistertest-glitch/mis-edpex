import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp, query, orderBy, limit, getDocs } from "firebase/firestore";

export interface ScopusSyncLog {
  id?: string;
  timestamp: string;
  user: string;
  scope: string;
  year: string;
  query: string;
  total_fetched: number;
  new_count: number;
  update_count: number;
  logs: string[];
}

const COLLECTION_NAME = "scopus_sync_logs";

export const ScopusSyncLogService = {
  logSync: async (entry: Omit<ScopusSyncLog, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...entry,
        created_at: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Failed to write sync log:", error);
      throw error;
    }
  },

  getRecentLogs: async (limitCount: number = 20): Promise<ScopusSyncLog[]> => {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy("created_at", "desc"),
        limit(limitCount)
      );
      const snap = await getDocs(q);
      return snap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
        } as ScopusSyncLog;
      });
    } catch (error) {
      console.error("Failed to get sync logs:", error);
      return [];
    }
  }
};
