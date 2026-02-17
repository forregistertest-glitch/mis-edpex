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
import { Advisor } from "@/types/advisor";
import { AuditLogService } from "./auditLogService";

const COLLECTION_NAME = "advisors";

export const AdvisorService = {
  // Create
  addAdvisor: async (data: Advisor, userEmail: string) => {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...data,
        is_deleted: false,
        created_at: Timestamp.now(),
        created_by: userEmail,
        updated_at: Timestamp.now(),
      });

      await AuditLogService.log({
        action: 'CREATE',
        collection: COLLECTION_NAME,
        doc_id: docRef.id,
        user: userEmail,
        status: 'SUCCESS',
        details: { name: data.full_name }
      });

      return docRef.id;
    } catch (error: any) {
      console.error("Error adding advisor:", error);
      throw error;
    }
  },

  // Read All
  getAllAdvisors: async (): Promise<Advisor[]> => {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      return querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as Advisor))
        .filter(a => !a.is_deleted);
    } catch (error) {
      console.error("Error getting all advisors:", error);
      throw error;
    }
  },

  // Read One
  getAdvisorById: async (id: string): Promise<Advisor | null> => {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Advisor;
      }
      return null;
    } catch (error) {
      console.error("Error getting advisor:", error);
      throw error;
    }
  },

  // Update
  updateAdvisor: async (id: string, data: Partial<Advisor>, userEmail: string) => {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...data,
        updated_at: Timestamp.now(),
        updated_by: userEmail
      });

      await AuditLogService.log({
        action: 'UPDATE',
        collection: COLLECTION_NAME,
        doc_id: id,
        user: userEmail,
        status: 'SUCCESS',
        details: { changes: data }
      });
    } catch (error: any) {
      console.error("Error updating advisor:", error);
      throw error;
    }
  },

  // Soft Delete
  deleteAdvisor: async (id: string, userEmail: string) => {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        is_deleted: true,
        updated_at: Timestamp.now(),
        updated_by: userEmail
      });

      await AuditLogService.log({
        action: 'DELETE',
        collection: COLLECTION_NAME,
        doc_id: id,
        user: userEmail,
        status: 'SUCCESS',
      });
    } catch (error: any) {
      console.error("Error deleting advisor:", error);
      throw error;
    }
  },

  // Get distinct advisor names from Students collection (for autocomplete)
  getDistinctAdvisorNames: async (): Promise<string[]> => {
    try {
      const querySnapshot = await getDocs(collection(db, "graduate_students"));
      const names = new Set<string>();
      querySnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.advisor_name && data.advisor_name.trim().length > 3) {
          names.add(data.advisor_name.trim());
        }
      });
      return Array.from(names).sort();
    } catch (error) {
      console.error("Error getting distinct advisor names:", error);
      return [];
    }
  },

  // Batch Create
  addAdvisorBatch: async (advisorList: Advisor[], userEmail: string) => {
    try {
      const batch = writeBatch(db);
      const collectionRef = collection(db, COLLECTION_NAME);

      advisorList.forEach(data => {
        const docRef = doc(collectionRef);
        batch.set(docRef, {
          ...data,
          is_deleted: false,
          created_at: Timestamp.now(),
          created_by: userEmail,
          updated_at: Timestamp.now(),
        });
      });

      await batch.commit();
    } catch (error: any) {
      console.error("Error batch adding advisors:", error);
      throw error;
    }
  }
};
