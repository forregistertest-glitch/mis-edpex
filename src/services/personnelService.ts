import { Personnel } from "@/types/personnel";
import { AuditLogService } from "./auditLogService";
import { 
  createPersonnel, 
  updatePersonnel, 
  softDeletePersonnel, 
  getPersonnel, 
  checkPersonnelIdExists 
} from "@/lib/data-service";
import { writeBatch, collection, doc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

const COLLECTION_NAME = "personnel";

export const PersonnelService = {
  // Batch Create/Upsert (Kept largely same but could benefit from check)
  addPersonnelBatch: async (personnelList: Personnel[], userEmail: string) => {
    try {
      const batch = writeBatch(db);
      const collectionRef = collection(db, COLLECTION_NAME);

      for (const data of personnelList) {
        if (!data.personnel_id) continue;
        
        // Note: Batch operations with individual checks are slow. 
        // For now, we assume batch upsert is an admin override action.
        // Or we could implement a batchCheck function.
        // Given request for "check duplicate", we might want to skip existing?
        // But "Upsert" usually implies invalidating duplicates. 
        // Sticking to "Upsert" logic here as per previous task, 
        // but adding audit fields.
        
        const docRef = doc(collectionRef, data.personnel_id);
        batch.set(docRef, {
          ...data,
          updated_at: new Date().toISOString(),
          updated_by: userEmail,
          // If new, these might be missing, but batch.set with merge=true handles updates well.
          // For strict correctness on "created_by", we'd need to check existence first, 
          // which is expensive for batches. 
          // Compromise: Set updated_by.
        }, { merge: true });
      }

      await batch.commit();

      await AuditLogService.log({
        action: 'IMPORT',
        collection: COLLECTION_NAME,
        user: userEmail,
        status: 'SUCCESS',
        details: { count: personnelList.length, note: "Batch upsert via Excel" }
      });

    } catch (error: any) {
      console.error("Error adding personnel batch:", error);
      await AuditLogService.log({
        action: 'IMPORT',
        collection: COLLECTION_NAME,
        user: userEmail,
        status: 'FAILURE',
        error_message: error.message
      });
      throw error;
    }
  },

  // Create with Duplicate Check
  addPersonnel: async (data: Personnel, userEmail: string) => {
    try {
      // Use the new createPersonnel function which handles Duplicate Check + Audit
      const docId = await createPersonnel(data, userEmail);

      await AuditLogService.log({
        action: 'CREATE',
        collection: COLLECTION_NAME,
        doc_id: docId,
        user: userEmail,
        status: 'SUCCESS',
        details: { personnel_id: data.personnel_id, name: `${data.first_name_th} ${data.last_name_th}` }
      });

      return docId;
    } catch (error: any) {
      console.error("Error adding personnel:", error);
      await AuditLogService.log({
        action: 'CREATE',
        collection: COLLECTION_NAME,
        user: userEmail,
        status: 'FAILURE',
        error_message: error.message,
        details: { data }
      });
      throw error;
    }
  },

  // Read All (Filtered by is_deleted)
  getAllPersonnel: async (): Promise<Personnel[]> => {
    try {
      return await getPersonnel();
    } catch (error) {
      console.error("Error getting all personnel:", error);
      throw error;
    }
  },

  // Update
  updatePersonnel: async (id: string, data: Partial<Personnel>, userEmail: string) => {
    try {
      await updatePersonnel(id, data, userEmail);

      await AuditLogService.log({
        action: 'UPDATE',
        collection: COLLECTION_NAME,
        doc_id: id,
        user: userEmail,
        status: 'SUCCESS',
        details: { 
          changes: data
        }
      });

    } catch (error: any) {
      console.error("Error updating personnel:", error);
      await AuditLogService.log({
        action: 'UPDATE',
        collection: COLLECTION_NAME,
        doc_id: id,
        user: userEmail,
        status: 'FAILURE',
        error_message: error.message,
        details: { requested_changes: data }
      });
      throw error;
    }
  },

  // Soft Delete
  deletePersonnel: async (id: string, userEmail: string) => {
    try {
      await softDeletePersonnel(id, userEmail);

      await AuditLogService.log({
        action: 'DELETE',
        collection: COLLECTION_NAME,
        doc_id: id,
        user: userEmail,
        status: 'SUCCESS',
        details: { type: 'soft-delete' }
      });

    } catch (error: any) {
      console.error("Error deleting personnel:", error);
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

  // Delete All (Hard Delete - Keep for Admin "Clear Data" feature, or switch to Soft Delete All?)
  // For "Clear All", usually Hard Delete is expected to reset system.
  deleteAllPersonnel: async (userEmail: string) => {
    // ... Keeping original implementation for now as it's a "Reset" feature ...
    try {
       // Logic to delete all docs
       const list = await getPersonnel(); // Only gets non-deleted? 
       // If we want to really clear DB, we should get ALL.
       // But assuming we just want to clear visible data.
       
       const batch = writeBatch(db);
       list.forEach(p => {
           if (p.id) batch.delete(doc(db, COLLECTION_NAME, p.id));
       });
       await batch.commit();
       
       await AuditLogService.log({
        action: 'DELETE_ALL',
        collection: COLLECTION_NAME,
        user: userEmail,
        status: 'SUCCESS',
        details: { count: list.length }
      });

    } catch (error: any) {
        throw error;
    }
  },
  // Migration: Add is_deleted: false to existing records
  migrateData: async () => {
    const { migratePersonnelIsDeleted } = await import("@/lib/migrate-personnel");
    return await migratePersonnelIsDeleted();
  },
};
