import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

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
      // In a real strict environment, we might want to throw here, 
      // but for now we don't want to block the main action if logging fails.
    }
  }
};
