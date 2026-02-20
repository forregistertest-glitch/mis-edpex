
const XLSX = require('xlsx');
const fs = require('fs');

const FILE_PATH = 'source/academic/ฐานข้อมูลนิสิต.xlsx';

try {
  if (!fs.existsSync(FILE_PATH)) {
    console.error(`File not found: ${FILE_PATH}`);
    process.exit(1);
  }

  console.log('Reading file...');
  // Read file - should be fast now
  const workbook = XLSX.readFile(FILE_PATH);
  console.log('Workbook Sheets:', workbook.SheetNames);

  workbook.SheetNames.forEach(sheetName => {
    console.log(`\n--- Sheet: ${sheetName} ---`);
    const sheet = workbook.Sheets[sheetName];
    
    // Convert to JSON with a limit of 5 rows to see headers and sample data
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1, limit: 5 });
    
    // Find header row (row with "รหัสนิสิต" or similar)
    let headerRowIndex = -1;
    for(let i=0; i<json.length; i++) {
        const row = json[i];
        if (row && (row.includes('รหัสนิสิต') || row.includes('ชื่อ') || row.includes('Name'))) {
            headerRowIndex = i;
            break;
        }
    }

    if (headerRowIndex !== -1) {
        console.log(`Header found at row ${headerRowIndex + 1}`);
        const headers = json[headerRowIndex];
        console.log('Headers:', headers);
        
        if (json.length > headerRowIndex + 1) {
            console.log('Sample Data Row:', json[headerRowIndex + 1]);
        }
    } else {
        console.log('Could not identify header row automatically. Dumping first 3 rows:');
        console.log(json.slice(0, 3));
    }
  });

} catch (error) {
  console.error('Error processing file:', error);
}
