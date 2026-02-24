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
import { Advisor as Instructor } from "@/types/advisor";
import { AuditLogService } from "./auditLogService";

const COLLECTION_NAME = "instructors";

export const InstructorService = {
  // Create
  addInstructor: async (data: Instructor, userEmail: string) => {
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
      console.error("Error adding instructor:", error);
      throw error;
    }
  },

  // Read All
  getAllInstructors: async (): Promise<Instructor[]> => {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      return querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as Instructor))
        .filter(a => !a.is_deleted);
    } catch (error) {
      console.error("Error getting all instructors:", error);
      throw error;
    }
  },

  // Read One
  getInstructorById: async (id: string): Promise<Instructor | null> => {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Instructor;
      }
      return null;
    } catch (error) {
      console.error("Error getting instructor:", error);
      throw error;
    }
  },

  // Update
  updateInstructor: async (id: string, data: Partial<Instructor>, userEmail: string) => {
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
      console.error("Error updating instructor:", error);
      throw error;
    }
  },

  // Soft Delete
  deleteInstructor: async (id: string, userEmail: string) => {
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
      console.error("Error deleting instructor:", error);
      throw error;
    }
  }
};
