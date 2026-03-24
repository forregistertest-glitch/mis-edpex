/**
 * Excel to CSV Export Script
 * สำหรับแปลงไฟล์ Excel เป็น CSV เพื่อวิเคราะห์โครงสร้างข้อมูล
 */

import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

interface ExcelFile {
  name: string;
  path: string;
  outputFolder: string;
}

const excelFiles: ExcelFile[] = [
  {
    name: 'HR_MIS',
    path: '/home/anmkr57/projects/mis-edpex/docs/HR_MIS.xlsx',
    outputFolder: '/home/anmkr57/projects/mis-edpex/docs/csv/hr-data'
  },
  {
    name: 'Postgraduate',
    path: '/home/anmkr57/projects/mis-edpex/docs/หัวข้อของหน่วยบัณฑิตศึกษา.xlsx',
    outputFolder: '/home/anmkr57/projects/mis-edpex/docs/csv/postgraduate'
  },
  {
    name: 'Academic',
    path: '/home/anmkr57/projects/mis-edpex/docs/หัวข้อของ Resideny-Intern.xlsx',
    outputFolder: '/home/anmkr57/projects/mis-edpex/docs/csv/academic'
  }
];

/**
 * แปลง Excel workbook เป็น CSV files (แยกแต่ละ sheet)
 */
function convertExcelToCSV(filePath: string, outputFolder: string, fileName: string): void {
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
          console.log(`     ${i + 1}. ${line.substring(0, 100)}${line.length > 100 ? '...' : ''}`);
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
    console.error(`❌ Error processing ${fileName}:`, error);
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🔄 Excel to CSV Conversion Script');
  console.log('=' .repeat(60));

  excelFiles.forEach(file => {
    if (fs.existsSync(file.path)) {
      convertExcelToCSV(file.path, file.outputFolder, file.name);
    } else {
      console.log(`⚠️  File not found: ${file.path}`);
    }
  });

  console.log('=' .repeat(60));
  console.log('✅ Conversion completed!');
  console.log('\n📂 Output folders:');
  excelFiles.forEach(file => {
    if (fs.existsSync(file.outputFolder)) {
      console.log(`   - ${file.outputFolder}`);
    }
  });
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { convertExcelToCSV };
