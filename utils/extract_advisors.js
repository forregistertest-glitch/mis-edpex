const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, 'source/academic');
const outputFile = path.join(__dirname, 'src/data/advisors.json');

const filesToScan = [
    {
        name: 'ฐานข้อมูลนิสิต_clean_สรุปอาจารย์ที่ปรึกษา.csv', 
        colIndex: 0,
        startLine: 12 // Data starts around line 13
    },
    {
        name: 'ฐานข้อมูลนิสิต_clean_นิสิตคงอยู่ สำเร็จ.csv', 
        colIndex: 9,
        startLine: 13 // Data starts around line 14
    }
];

function cleanName(name) {
    if (!name) return null;
    let Cleaned = name.trim();
    Cleaned = Cleaned.replace(/["']/g, ''); // Remove quotes
    Cleaned = Cleaned.replace(/\s+/g, ' '); // Normalize spaces
    
    if (Cleaned.length < 3 || Cleaned === '-' || Cleaned === 'nan') return null;
    
    // Garbage filter for header fragments
    if (['ที่ต้องจบ', 'ตามแผนเรียน', 'ปัจจุบัน', 'วิทยานิพนธ์หลัก', 'ภาควิชาที่', 'อาจารย์ที่ปรึกษาสังกัด'].some(bad => Cleaned.includes(bad))) {
        return null;
    }

    return Cleaned;
}

const advisors = new Set();

filesToScan.forEach(fileConfig => {
    const filePath = path.join(sourceDir, fileConfig.name);
    if (fs.existsSync(filePath)) {
        console.log(`Scanning ${fileConfig.name}...`);
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split(/\r?\n/);
        
        if (lines.length > fileConfig.startLine) {
             const dataLines = lines.slice(fileConfig.startLine);
             
             dataLines.forEach((line) => {
                 // regex to handle quoted CSV fields
                 const regex = /(".*?"|[^",\s]+)(?=\s*,|\s*$)/g;
                 // But simple split is often enough if we just grab the index and clean it, 
                 // provided the earlier columns don't have extra commas.
                 // Let's use a slightly more robust split for the specific column.
                 
                 const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
                 
                 if (parts.length > fileConfig.colIndex) {
                     let rawName = parts[fileConfig.colIndex];
                     if (rawName) {
                         const name = cleanName(rawName);
                         // Strict filter: Must start with typical Thai titles or be a long enough Thai string
                         if (name && (name.includes('อ.') || name.includes('ดร.') || name.includes('ศ.') || name.includes('น.สพ.') || name.length > 10)) {
                             // Exclude known non-names
                             if (!name.includes('ไม่ต้องแต่งตั้ง') && !name.includes('อาจารย์ที่ปรึกษา')) {
                                 advisors.add(name);
                             }
                         }
                     }
                 }
             });
        }
    } else {
        console.warn(`File not found: ${fileConfig.name}`);
    }
});

const sortedAdvisors = Array.from(advisors).sort();
const outputData = {
    updated_at: new Date().toISOString(),
    count: sortedAdvisors.length,
    advisors: sortedAdvisors
};

// Ensure dir exists
if (!fs.existsSync(path.dirname(outputFile))) {
    fs.mkdirSync(path.dirname(outputFile), { recursive: true });
}

fs.writeFileSync(outputFile, JSON.stringify(outputData, null, 2), 'utf8');
console.log(`Extracted ${sortedAdvisors.length} advisors to ${outputFile}`);
console.log('Sample:', sortedAdvisors.slice(0, 10));
