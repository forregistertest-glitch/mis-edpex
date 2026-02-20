import { ResearchRecord } from "@/types/research";
import { AuditLogService } from "./auditLogService";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  setDoc,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  writeBatch,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData
} from "firebase/firestore";

const COLLECTION_NAME = "research_records";

// Helper เพื่อกำจัด undefined ก่อนยิงเข้า Firebase (ป้องกัน Error)
const removeUndefined = (obj: any): any => {
  if (Array.isArray(obj)) return obj.map(removeUndefined);
  if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, removeUndefined(v)])
    );
  }
  return obj;
};

export const ResearchService = {
  // Read All (Filtered by is_deleted)
  getAllResearch: async (): Promise<ResearchRecord[]> => {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("is_deleted", "==", false)
      );
      const snap = await getDocs(q);

      return snap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => {
        const data = d.data();
        if (data.created_at && typeof data.created_at.toDate === "function") {
          data.created_at = data.created_at.toDate().toISOString();
        }
        if (data.updated_at && typeof data.updated_at.toDate === "function") {
          data.updated_at = data.updated_at.toDate().toISOString();
        }
        return { id: d.id, ...data } as ResearchRecord;
      }).sort((a, b) => {
        // Sort by year desc, then updated_at desc
        if (a.year !== b.year) return parseInt(b.year) - parseInt(a.year);
        const timeA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
        const timeB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
        return timeB - timeA;
      });
    } catch (error) {
      console.error("Error getting all research records:", error);
      throw error;
    }
  },

  // Create
  addResearch: async (data: Omit<ResearchRecord, "id">, userEmail: string): Promise<string> => {
    try {
      const timestamp = new Date().toISOString();
      const safeData = removeUndefined(data);
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...safeData,
        is_deleted: false,
        created_at: timestamp,
        updated_at: timestamp,
        created_by: userEmail,
        updated_by: userEmail
      });

      await AuditLogService.log({
        action: 'CREATE',
        collection: COLLECTION_NAME,
        doc_id: docRef.id,
        user: userEmail,
        status: 'SUCCESS',
        details: { title: data.title, scopus_id: data.scopus_eid || "-" }
      });

      return docRef.id;
    } catch (error: any) {
      console.error("Error adding research record:", error);
      await AuditLogService.log({
        action: 'CREATE',
        collection: COLLECTION_NAME,
        user: userEmail,
        status: 'FAILURE',
        error_message: error.message,
        details: { data: removeUndefined(data) }
      });
      throw error;
    }
  },

  // Update
  updateResearch: async (id: string, data: Partial<ResearchRecord>, userEmail: string): Promise<void> => {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const safeData = removeUndefined(data);
      await setDoc(docRef, {
        ...safeData,
        updated_at: new Date().toISOString(),
        updated_by: userEmail
      }, { merge: true });

      await AuditLogService.log({
        action: 'UPDATE',
        collection: COLLECTION_NAME,
        doc_id: id,
        user: userEmail,
        status: 'SUCCESS',
        details: { changes: safeData }
      });
    } catch (error: any) {
      console.error("Error updating research record:", error);
      await AuditLogService.log({
        action: 'UPDATE',
        collection: COLLECTION_NAME,
        doc_id: id,
        user: userEmail,
        status: 'FAILURE',
        error_message: error.message,
        details: { requested_changes: removeUndefined(data) }
      });
      throw error;
    }
  },

  // Soft Delete
  deleteResearch: async (id: string, userEmail: string): Promise<void> => {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await setDoc(docRef, {
        is_deleted: true,
        status: 'disabled',
        updated_at: new Date().toISOString(),
        updated_by: userEmail
      }, { merge: true });

      await AuditLogService.log({
        action: 'DELETE',
        collection: COLLECTION_NAME,
        doc_id: id,
        user: userEmail,
        status: 'SUCCESS',
        details: { type: 'soft-delete' }
      });
    } catch (error: any) {
      console.error("Error deleting research record:", error);
      await AuditLogService.log({
        action: 'DELETE',
        collection: COLLECTION_NAME,
        doc_id: id,
        user: userEmail,
        status: 'FAILURE',
        error_message: error.message
      });
      throw error;
    }
  },

  // Batch Import / Upsert (For Scopus API / Excel Imports)
  upsertResearchBatch: async (records: (ResearchRecord & { id?: string })[], userEmail: string): Promise<void> => {
    try {
      const batch = writeBatch(db);
      const collectionRef = collection(db, COLLECTION_NAME);

      const timestamp = new Date().toISOString();

      for (const data of records) {
        const safeData = removeUndefined(data);
        if (safeData.id) {
          // Update existing
          const docRef = doc(collectionRef, safeData.id);
          const updateData = { ...safeData };
          delete updateData.id; // remove id from fields

          batch.set(docRef, {
            ...updateData,
            updated_at: timestamp,
            updated_by: userEmail
          }, { merge: true });
        } else {
          // Create new
          const docRef = doc(collectionRef);
          const newData = { ...safeData };
          delete newData.id;

          batch.set(docRef, {
            ...newData,
            is_deleted: false,
            created_at: timestamp,
            updated_at: timestamp,
            created_by: userEmail,
            updated_by: userEmail
          });
        }
      }

      await batch.commit();

      await AuditLogService.log({
        action: 'IMPORT',
        collection: COLLECTION_NAME,
        user: userEmail,
        status: 'SUCCESS',
        details: { count: records.length, note: "Batch upsert via Scopus/Excel" }
      });
    } catch (error: any) {
      console.error("Error upserting research batch:", error);
      await AuditLogService.log({
        action: 'IMPORT',
        collection: COLLECTION_NAME,
        user: userEmail,
        status: 'FAILURE',
        error_message: error.message
      });
      throw error;
    }
  }
};
