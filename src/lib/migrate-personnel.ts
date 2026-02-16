import { db } from "./firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

export async function migratePersonnelIsDeleted() {
  console.log("Starting migration: Updating personnel records...");
  const snap = await getDocs(collection(db, "personnel"));
  let count = 0;
  
  // Backfill date: 15/2/2568 23:59 (2025-02-15T16:59:00Z if UTC+7, or just use Thai local style string)
  // Let's use ISO string for 15 Feb 2025 23:59:00
  const backfillDate = "2025-02-15T23:59:00.000Z"; 
  const backfillUser = "ระบบ";

  for (const d of snap.docs) {
    const data = d.data();
    const updates: any = {};
    
    if (data.is_deleted === undefined) {
      updates.is_deleted = false;
    }
    
    if (!data.created_at) {
      updates.created_at = backfillDate;
    }
    
    if (!data.created_by) {
      updates.created_by = backfillUser;
    }

    if (Object.keys(updates).length > 0) {
      await updateDoc(doc(db, "personnel", d.id), updates);
      count++;
    }
  }
  console.log(`Migration finished. Updated ${count} records.`);
  return count;
}
