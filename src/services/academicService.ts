import { db } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where,
  Timestamp,
  orderBy,
  writeBatch
} from "firebase/firestore";
import { StudentPublication, StudentProgress } from "@/types/academic";
import { AuditLogService } from "./auditLogService";

const PUBLICATIONS_COLLECTION = "student_publications";
const PROGRESS_COLLECTION = "student_progress";

export const AcademicService = {
  // --- Publications ---
  
  getPublicationsByStudentId: async (studentId: string): Promise<StudentPublication[]> => {
    try {
      const q = query(
        collection(db, PUBLICATIONS_COLLECTION), 
        where("student_id", "==", studentId),
        orderBy("year", "desc")
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudentPublication));
    } catch (error) {
      console.error("Error fetching publications:", error);
      return [];
    }
  },

  addPublication: async (data: StudentPublication, userEmail: string) => {
    try {
      const docRef = await addDoc(collection(db, PUBLICATIONS_COLLECTION), {
        ...data,
        created_at: Timestamp.now(),
        created_by: userEmail
      });
      
      await AuditLogService.log({
        action: 'CREATE',
        collection: PUBLICATIONS_COLLECTION,
        doc_id: docRef.id,
        user: userEmail,
        status: 'SUCCESS',
        details: { student_id: data.student_id, title: data.publication_title }
      });
      return docRef.id;
    } catch (error: any) {
      throw error;
    }
  },

  deletePublication: async (id: string, userEmail: string) => {
    try {
       await deleteDoc(doc(db, PUBLICATIONS_COLLECTION, id));
       await AuditLogService.log({
        action: 'DELETE',
        collection: PUBLICATIONS_COLLECTION,
        doc_id: id,
        user: userEmail,
        status: 'SUCCESS'
       });
    } catch (error) {
       throw error;
    }
  },

  // --- Progress ---

  getProgressByStudentId: async (studentId: string): Promise<StudentProgress[]> => {
    try {
      const q = query(
        collection(db, PROGRESS_COLLECTION), 
        where("student_id", "==", studentId),
        orderBy("exam_date", "asc")
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudentProgress));
    } catch (error) {
      console.error("Error fetching progress:", error);
      return [];
    }
  },

  addProgress: async (data: StudentProgress, userEmail: string) => {
    try {
      const docRef = await addDoc(collection(db, PROGRESS_COLLECTION), {
        ...data,
        created_at: Timestamp.now(),
        created_by: userEmail
      });

      await AuditLogService.log({
        action: 'CREATE',
        collection: PROGRESS_COLLECTION,
        doc_id: docRef.id,
        user: userEmail,
        status: 'SUCCESS',
         details: { student_id: data.student_id, milestone: data.milestone_type }
      });
      return docRef.id;
    } catch (error: any) {
      throw error;
    }
  },

  deleteProgress: async (id: string, userEmail: string) => {
    try {
       await deleteDoc(doc(db, PROGRESS_COLLECTION, id));
       await AuditLogService.log({
        action: 'DELETE',
        collection: PROGRESS_COLLECTION,
        doc_id: id,
        user: userEmail,
        status: 'SUCCESS'
       });
    } catch (error) {
       throw error;
    }
  },

  // --- Batch Operations ---

  addPublicationBatch: async (publications: StudentPublication[], userEmail: string) => {
    try {
      const batch = writeBatch(db);
      const collectionRef = collection(db, PUBLICATIONS_COLLECTION);
      
      publications.forEach(pub => {
        const docRef = doc(collectionRef); // Auto-ID
        batch.set(docRef, {
          ...pub,
          created_at: Timestamp.now(),
          created_by: userEmail
        });
      });
      
      await batch.commit();
    } catch (error) {
       console.error("Batch publication import failed:", error);
       throw error;
    }
  },

  addProgressBatch: async (progressList: StudentProgress[], userEmail: string) => {
    try {
      const batch = writeBatch(db);
      const collectionRef = collection(db, PROGRESS_COLLECTION);
      
      progressList.forEach(prog => {
         const docRef = doc(collectionRef); // Auto-ID
         batch.set(docRef, {
           ...prog,
           created_at: Timestamp.now(),
           created_by: userEmail
         });
      });

      await batch.commit();
    } catch (error) {
       console.error("Batch progress import failed:", error);
       throw error;
    }
  },

  // --- Reporting Support ---

  getAllPublications: async (): Promise<StudentPublication[]> => {
    try {
      const snapshot = await getDocs(collection(db, PUBLICATIONS_COLLECTION));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudentPublication));
    } catch (error) {
      console.error("Error fetching all publications:", error);
      return [];
    }
  },

  getAllProgress: async (): Promise<StudentProgress[]> => {
    try {
      const snapshot = await getDocs(collection(db, PROGRESS_COLLECTION));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudentProgress));
    } catch (error) {
      console.error("Error fetching all progress:", error);
      return [];
    }
  }
};
