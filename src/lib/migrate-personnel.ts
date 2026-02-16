import { db } from "./firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

export async function migratePersonnelIsDeleted() {
  console.log("Starting migration: Adding is_deleted: false to all personnel...");
  const snap = await getDocs(collection(db, "personnel"));
  let count = 0;
  for (const d of snap.docs) {
    const data = d.data();
    if (data.is_deleted === undefined) {
      await updateDoc(doc(db, "personnel", d.id), {
        is_deleted: false
      });
      count++;
    }
  }
  console.log(`Migration finished. Updated ${count} records.`);
  return count;
}
