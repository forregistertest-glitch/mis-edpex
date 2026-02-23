
import { db } from "./src/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

async function checkNcbiData() {
    try {
        const researchRef = collection(db, "research_records");
        const q = query(researchRef, where("imported_from", "==", "ncbi_api"));
        const snap = await getDocs(q);

        console.log(`Found ${snap.size} records imported from NCBI.`);
        snap.docs.forEach(doc => {
            const data = doc.data();
            console.log(`- [${doc.id}] ${data.title} (Year: ${data.year})`);
        });

        const logRef = collection(db, "ncbi_sync_logs");
        const logSnap = await getDocs(logRef);
        console.log(`\nFound ${logSnap.size} NCBI sync logs.`);
        logSnap.docs.forEach(doc => {
            const data = doc.data();
            console.log(`- [${data.timestamp}] User: ${data.user}, Result: +${data.new_count}/~${data.update_count}`);
        });

    } catch (error) {
        console.error("Error checking data:", error);
    }
}

checkNcbiData();
