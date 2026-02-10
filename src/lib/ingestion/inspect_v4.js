const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const sourceDir = './source';
const files = fs.readdirSync(sourceDir).filter(f => f.endsWith('.xlsx'));

files.forEach(file => {
  console.log(`\n=========================================`);
  console.log(`FILE: ${file}`);
  console.log(`=========================================`);
  const workbook = xlsx.readFile(path.join(sourceDir, file));
  
  workbook.SheetNames.forEach(sheetName => {
    const worksheet = workbook.Sheets[sheetName];
    // Use {header: 1} to get raw arrays
    const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    console.log(`\n[Sheet: ${sheetName}]`);
    if (data.length > 0) {
      // Take first 10 rows to see the structure
      data.slice(0, 10).forEach((row, idx) => {
        console.log(`Row ${idx}: ${JSON.stringify(row)}`);
      });
    } else {
      console.log('No data found.');
    }
  });
});
