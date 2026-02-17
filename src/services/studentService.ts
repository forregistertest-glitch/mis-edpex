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
import { GraduateStudent } from "@/types/student";
import { AuditLogService } from "./auditLogService";

const COLLECTION_NAME = "graduate_students";

export const StudentService = {
  // Batch Create/Upsert (Secondary method via Excel)
  addStudentBatch: async (studentList: GraduateStudent[], userEmail: string) => {
    try {
      const batch = writeBatch(db);
      const collectionRef = collection(db, COLLECTION_NAME);

      studentList.forEach(data => {
        if (!data.student_id) return; 

        const docRef = doc(collectionRef, data.student_id);
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
        details: { count: studentList.length, note: "Batch upsert via Excel (Student)" }
      });

    } catch (error: any) {
      console.error("Error adding student batch:", error);
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

  // Create (Primary method via Direct Input)
  addStudent: async (data: GraduateStudent, userEmail: string) => {
    try {
      // Check for duplicate student_id
      const existing = await StudentService.getStudentByStudentId(data.student_id);
      if (existing) {
        throw new Error(`รหัสนิสิต ${data.student_id} มีอยู่ในระบบแล้ว`);
      }

      // Use student_id as the document ID for consistency with personnel logic
      const docRef = doc(db, COLLECTION_NAME, data.student_id);
      await writeBatch(db).set(docRef, {
        ...data,
        updated_at: Timestamp.now(),
      }).commit();

      await AuditLogService.log({
        action: 'CREATE',
        collection: COLLECTION_NAME,
        doc_id: data.student_id,
        user: userEmail,
        status: 'SUCCESS',
        details: { student_id: data.student_id, name: data.full_name_th }
      });

      return data.student_id;
    } catch (error: any) {
      console.error("Error adding student:", error);
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
  getAllStudents: async (): Promise<GraduateStudent[]> => {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as GraduateStudent[];
    } catch (error) {
      console.error("Error getting all students:", error);
      throw error;
    }
  },

  // Read One by Student ID (Primary Key)
  getStudentByStudentId: async (studentId: string): Promise<GraduateStudent | null> => {
    try {
      const docRef = doc(db, COLLECTION_NAME, studentId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as GraduateStudent;
      }
      return null;
    } catch (error) {
      console.error("Error getting student by Student ID:", error);
      throw error;
    }
  },

  // Update
  updateStudent: async (studentId: string, data: Partial<GraduateStudent>, userEmail: string) => {
    try {
      const oldData = await StudentService.getStudentByStudentId(studentId);

      const docRef = doc(db, COLLECTION_NAME, studentId);
      await updateDoc(docRef, {
        ...data,
        updated_at: Timestamp.now(),
        updated_by: userEmail
      });

      await AuditLogService.log({
        action: 'UPDATE',
        collection: COLLECTION_NAME,
        doc_id: studentId,
        user: userEmail,
        status: 'SUCCESS',
        details: { 
          student_id: studentId,
          changes: data,
          old_values: oldData 
        }
      });

    } catch (error: any) {
      console.error("Error updating student:", error);
      await AuditLogService.log({
        action: 'UPDATE',
        collection: COLLECTION_NAME,
        doc_id: studentId,
        user: userEmail,
        status: 'FAILURE',
        error_message: error.message,
        details: { requested_changes: data }
      });
      throw error;
    }
  },

  // Delete
  deleteStudent: async (studentId: string, userEmail: string) => {
    try {
      const docRef = doc(db, COLLECTION_NAME, studentId);
      await updateDoc(docRef, {
        is_deleted: true,
        updated_at: Timestamp.now(),
        updated_by: userEmail
      });

      await AuditLogService.log({
        action: 'DELETE',
        collection: COLLECTION_NAME,
        doc_id: studentId,
        user: userEmail,
        status: 'SUCCESS',
        details: { 
           student_id: studentId,
           note: "Soft delete performed"
        }
      });

    } catch (error: any) {
      console.error("Error deleting student:", error);
      await AuditLogService.log({
        action: 'DELETE',
        collection: COLLECTION_NAME,
        doc_id: studentId,
        user: userEmail,
        status: 'FAILURE',
        error_message: error.message
      });
      throw error;
    }
  },

  // Delete All
  deleteAllStudents: async (userEmail: string) => {
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
      console.error("Error deleting all students:", error);
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

  // Migrate/Fix data visibility
  migrateData: async () => {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const batch = writeBatch(db);
    let count = 0;
    querySnapshot.docs.forEach((d) => {
      const data = d.data();
      if (data.is_deleted === undefined) {
        batch.update(d.ref, { is_deleted: false });
        count++;
      }
    });
    await batch.commit();
    return count;
  }
};
