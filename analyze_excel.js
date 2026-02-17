
const XLSX = require('xlsx');
const fs = require('fs');

const FILE_PATH = 'source/academic/ฐานข้อมูลนิสิต.xlsx';

try {
  if (!fs.existsSync(FILE_PATH)) {
    console.error(`File not found: ${FILE_PATH}`);
    process.exit(1);
  }

  // Read only the first 50kb of the file if possible or just use sheet_to_json with limit
  // For xlsx, we usually read the whole file to get the structure, but we can limit the output processing.
  // We will read the file but only log the first few rows.
  
  console.log('Reading file...');
  const workbook = XLSX.readFile(FILE_PATH);
  console.log('Workbook Sheets:', workbook.SheetNames);

  workbook.SheetNames.forEach(sheetName => {
    console.log(`\n--- Sheet: ${sheetName} ---`);
    const sheet = workbook.Sheets[sheetName];
    
    // Convert to JSON with a limit
    // We only need the first 5 rows to see headers and some data
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1, range: 0, limit: 5 });
    
    // Find header row (row with "รหัสนิสิต" or similar)
    let headerRowIndex = -1;
    for(let i=0; i<json.length; i++) {
        const row = json[i];
        if (row && (row.includes('รหัสนิสิต') || row.includes('ชื่อ'))) {
            headerRowIndex = i;
            break;
        }
    }

    if (headerRowIndex !== -1) {
        console.log(`Header found at row ${headerRowIndex + 1}`);
        const headers = json[headerRowIndex];
        console.log('Headers:', headers);

        // Calculate missing fields based on standard schema
        // This is just a visual check for now
        
    } else {
        console.log('Could not identify header row automatically. Dumping first 5 rows:');
    }
    console.log(json);
  });

} catch (error) {
  console.error('Error processing file:', error);
}
