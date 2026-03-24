/**
 * Excel to CSV Export Script (JavaScript version)
 * สำหรับแปลงไฟล์ Excel เป็น CSV เพื่อวิเคราะห์โครงสร้างข้อมูล
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const excelFiles = [
  {
    name: 'HR_MIS',
    path: path.join(__dirname, '../docs/HR_MIS.xlsx'),
    outputFolder: path.join(__dirname, '../docs/csv/hr-data')
  },
  {
    name: 'Postgraduate',
    path: path.join(__dirname, '../docs/หัวข้อของหน่วยบัณฑิตศึกษา.xlsx'),
    outputFolder: path.join(__dirname, '../docs/csv/postgraduate')
  },
  {
    name: 'Academic',
    path: path.join(__dirname, '../docs/หัวข้อของ Resideny-Intern.xlsx'),
    outputFolder: path.join(__dirname, '../docs/csv/academic')
  }
];

/**
 * แปลง Excel workbook เป็น CSV files (แยกแต่ละ sheet)
 */
function convertExcelToCSV(filePath, outputFolder, fileName) {
  try {
    // อ่านไฟล์ Excel
    const workbook = XLSX.readFile(filePath);
    
    // สร้าง output folder ถ้ายังไม่มี
    if (!fs.existsSync(outputFolder)) {
      fs.mkdirSync(outputFolder, { recursive: true });
    }

    console.log(`\n📊 Processing: ${fileName}`);
    console.log(`📁 Sheets found: ${workbook.SheetNames.length}`);

    // แปลงแต่ละ sheet เป็น CSV
    workbook.SheetNames.forEach((sheetName, index) => {
      const worksheet = workbook.Sheets[sheetName];
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      
      // สร้างชื่อไฟล์ CSV
      const sanitizedSheetName = sheetName.replace(/[/\\?%*:|"<>]/g, '-');
      const csvFileName = `${index + 1}_${sanitizedSheetName}.csv`;
      const csvFilePath = path.join(outputFolder, csvFileName);
      
      // บันทึกไฟล์ CSV
      fs.writeFileSync(csvFilePath, csv, 'utf-8');
      
      console.log(`  ✅ Sheet ${index + 1}: "${sheetName}" → ${csvFileName}`);
      
      // แสดงตัวอย่างข้อมูล (5 บรรทัดแรก)
      const lines = csv.split('\n').slice(0, 5);
      console.log(`     Preview (first 5 lines):`);
      lines.forEach((line, i) => {
        if (line.trim()) {
          const preview = line.substring(0, 100);
          console.log(`     ${i + 1}. ${preview}${line.length > 100 ? '...' : ''}`);
        }
      });
    });

    // สร้างไฟล์สรุป
    const summary = {
      fileName,
      filePath,
      totalSheets: workbook.SheetNames.length,
      sheets: workbook.SheetNames.map((name, index) => ({
        index: index + 1,
        name,
        csvFile: `${index + 1}_${name.replace(/[/\\?%*:|"<>]/g, '-')}.csv`
      })),
      exportedAt: new Date().toISOString()
    };

    const summaryPath = path.join(outputFolder, '_summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf-8');
    console.log(`  📝 Summary saved: _summary.json\n`);

  } catch (error) {
    console.error(`❌ Error processing ${fileName}:`, error.message);
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🔄 Excel to CSV Conversion Script');
  console.log('='.repeat(60));

  excelFiles.forEach(file => {
    if (fs.existsSync(file.path)) {
      convertExcelToCSV(file.path, file.outputFolder, file.name);
    } else {
      console.log(`⚠️  File not found: ${file.path}`);
    }
  });

  console.log('='.repeat(60));
  console.log('✅ Conversion completed!');
  console.log('\n📂 Output folders:');
  excelFiles.forEach(file => {
    if (fs.existsSync(file.outputFolder)) {
      const files = fs.readdirSync(file.outputFolder);
      console.log(`   - ${file.outputFolder} (${files.length} files)`);
    }
  });
}

// Run
main();
