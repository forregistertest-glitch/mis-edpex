
import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp, query, orderBy, limit, getDocs, where } from "firebase/firestore";

export interface NcbiSyncLog {
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

const COLLECTION_NAME = "ncbi_sync_logs";

export const NcbiSyncLogService = {
    logSync: async (entry: Omit<NcbiSyncLog, 'id'>) => {
        try {
            const docRef = await addDoc(collection(db, COLLECTION_NAME), {
                ...entry,
                created_at: Timestamp.now(),
            });
            return docRef.id;
        } catch (error) {
            console.error("Failed to write NCBI sync log:", error);
            throw error;
        }
    },

    getRecentLogs: async (limitCount: number = 20): Promise<NcbiSyncLog[]> => {
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
                } as NcbiSyncLog;
            });
        } catch (error) {
            console.error("Failed to get NCBI sync logs:", error);
            return [];
        }
    },

    getLogsByMonth: async (year: number, month: number): Promise<NcbiSyncLog[]> => {
        try {
            const startDate = new Date(year, month, 1, 0, 0, 0);
            const endDate = new Date(year, month + 1, 1, 0, 0, 0);

            const q = query(
                collection(db, COLLECTION_NAME),
                orderBy("created_at", "desc"),
                where("created_at", ">=", Timestamp.fromDate(startDate)),
                where("created_at", "<", Timestamp.fromDate(endDate))
            );

            const snap = await getDocs(q);
            return snap.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                } as NcbiSyncLog;
            });
        } catch (error) {
            console.error("Failed to get monthly NCBI sync logs:", error);
            return [];
        }
    }
};
