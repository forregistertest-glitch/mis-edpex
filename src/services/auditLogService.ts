import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp, query, orderBy, limit, getDocs } from "firebase/firestore";

export interface AuditLog {
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'IMPORT' | 'EXPORT' | 'DELETE_ALL';
  collection: string;
  doc_id?: string;
  user: string; // Email or User ID
  details?: any; // Old/New values or description
  timestamp: Timestamp;
  status: 'SUCCESS' | 'FAILURE';
  error_message?: string;
}

const COLLECTION_NAME = "audit_logs";

export const AuditLogService = {
  log: async (entry: Omit<AuditLog, 'timestamp'>) => {
    try {
      await addDoc(collection(db, COLLECTION_NAME), {
        ...entry,
        timestamp: Timestamp.now(),
      });
      console.log(`[Audit] ${entry.action} on ${entry.collection}/${entry.doc_id}`);
    } catch (error) {
      console.error("Failed to write audit log:", error);
    }
  },

  getLogs: async (limitCount: number = 100): Promise<AuditLog[]> => {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy("timestamp", "desc"),
        limit(limitCount)
      );
      const snap = await getDocs(q);
      return snap.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          timestamp: data.timestamp // Keep as Timestamp for now, convert in UI if needed
        } as AuditLog;
      });
    } catch (error) {
      console.error("Failed to get audit logs:", error);
      return [];
    }
  }
};
