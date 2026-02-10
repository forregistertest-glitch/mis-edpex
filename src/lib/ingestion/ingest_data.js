const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, setDoc, doc } = require('firebase/firestore');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const firebaseConfig = {
  apiKey: "AIzaSyAJFjuIPNLw34kjFDbrUnepwFyOPwHqBFY",
  authDomain: "mis-edpex.firebaseapp.com",
  projectId: "mis-edpex",
  storageBucket: "mis-edpex.firebasestorage.app",
  messagingSenderId: "469911386708",
  appId: "1:469911386708:web:1052a81f8fa9615035cbc1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function ingestExcel(filePath, collectionName) {
  console.log(`Ingesting ${filePath} into ${collectionName}...`);
  const workbook = xlsx.readFile(filePath);
  
  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    const rawData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (rawData.length < 2) continue;

    const kpiDescription = rawData[0][0]; // Usually the title
    const dataRows = rawData.slice(1);

    for (const row of dataRows) {
        if (!row || row.length === 0) continue;
        
        // This is a simplified logic for prototype demonstration
        // Mapping complex sheet structures to a flat document
        const docData = {
            kpi_id: sheetName,
            description: kpiDescription,
            raw_data: row,
            ingested_at: new Date().toISOString()
        };

        try {
            const docRef = await addDoc(collection(db, collectionName), docData);
            console.log(`Document written with ID: ${docRef.id} for sheet ${sheetName}`);
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    }
  }
}

async function runIngestion() {
  const files = [
    { path: './source/Copy of กราฟ KPI7.1_edited by Nook.xlsx', coll: 'academic_results' },
    { path: './source/กราฟ KPI 7-2.1._edited by Nook.xlsx', coll: 'customer_feedback' },
    { path: './source/กราฟ KPI7.3 อ้อแก้ไข.xlsx', coll: 'workforce_stats' },
    { path: './source/กราฟ KPI7.4-1-KPI7.4-15 อ้อแก้ไข.xlsx', coll: 'strategic_kpis' }
  ];

  for (const file of files) {
    await ingestExcel(file.path, file.coll);
  }
  console.log('Ingestion complete!');
}

runIngestion();
