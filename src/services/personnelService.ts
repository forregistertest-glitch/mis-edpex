import { db } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where,
  Timestamp,
  writeBatch 
} from "firebase/firestore";
import { Personnel } from "@/types/personnel";
import { AuditLogService } from "./auditLogService";

const COLLECTION_NAME = "personnel";

export const PersonnelService = {
  // Batch Create/Upsert
  addPersonnelBatch: async (personnelList: Personnel[], userEmail: string) => {
    try {
      const batch = writeBatch(db);
      const collectionRef = collection(db, COLLECTION_NAME);

      personnelList.forEach(data => {
        if (!data.personnel_id) return; 

        const docRef = doc(collectionRef, data.personnel_id);
        batch.set(docRef, {
          ...data,
          updated_at: Timestamp.now(),
        }, { merge: true });
      });

      await batch.commit();

      // Log Batch Import
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

  // Create
  addPersonnel: async (data: Personnel, userEmail: string) => {
    try {
      if (data.personnel_id) {
        const existing = await PersonnelService.getPersonnelByEmployeeId(data.personnel_id);
        if (existing) {
          throw new Error(`Personnel ID ${data.personnel_id} already exists.`);
        }
      }

      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...data,
        updated_at: Timestamp.now(),
      });

      await AuditLogService.log({
        action: 'CREATE',
        collection: COLLECTION_NAME,
        doc_id: docRef.id,
        user: userEmail,
        status: 'SUCCESS',
        details: { personnel_id: data.personnel_id, name: `${data.first_name_th} ${data.last_name_th}` }
      });

      return docRef.id;
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

  // Read All
  getAllPersonnel: async (): Promise<Personnel[]> => {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Personnel[];
    } catch (error) {
      console.error("Error getting all personnel:", error);
      throw error;
    }
  },

  // Read One by Doc ID
  getPersonnelById: async (id: string): Promise<Personnel | null> => {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Personnel;
      }
      return null;
    } catch (error) {
      console.error("Error getting personnel by ID:", error);
      throw error;
    }
  },

  // Read One by Employee ID
  getPersonnelByEmployeeId: async (employeeId: string): Promise<Personnel | null> => {
    try {
      const q = query(collection(db, COLLECTION_NAME), where("personnel_id", "==", employeeId));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as Personnel;
      }
      return null;
    } catch (error) {
      console.error("Error getting personnel by Employee ID:", error);
      throw error;
    }
  },

  // Update
  updatePersonnel: async (id: string, data: Partial<Personnel>, userEmail: string) => {
    try {
      // Get old data for audit trail
      const oldData = await PersonnelService.getPersonnelById(id);

      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...data,
        updated_at: Timestamp.now(),
      });

      await AuditLogService.log({
        action: 'UPDATE',
        collection: COLLECTION_NAME,
        doc_id: id,
        user: userEmail,
        status: 'SUCCESS',
        details: { 
          personnel_id: oldData?.personnel_id,
          changes: data,
          old_values: oldData 
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

  // Delete
  deletePersonnel: async (id: string, userEmail: string) => {
    try {
      const oldData = await PersonnelService.getPersonnelById(id);
      
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);

      await AuditLogService.log({
        action: 'DELETE',
        collection: COLLECTION_NAME,
        doc_id: id,
        user: userEmail,
        status: 'SUCCESS',
        details: { 
           personnel_id: oldData?.personnel_id,
           name: oldData ? `${oldData.first_name_th} ${oldData.last_name_th}` : "Unknown"
        }
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

  // Delete All
  deleteAllPersonnel: async (userEmail: string) => {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      const batch = writeBatch(db);
      
      const count = querySnapshot.size;
      querySnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      await AuditLogService.log({
        action: 'DELETE_ALL',
        collection: COLLECTION_NAME,
        user: userEmail,
        status: 'SUCCESS',
        details: { count_deleted: count }
      });

    } catch (error: any) {
      console.error("Error deleting all personnel:", error);
      await AuditLogService.log({
        action: 'DELETE_ALL',
        collection: COLLECTION_NAME,
        user: userEmail,
        status: 'FAILURE',
        error_message: error.message
      });
      throw error;
    }
  },
};
