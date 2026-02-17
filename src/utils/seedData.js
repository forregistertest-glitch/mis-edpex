
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// Note: This script is designed to be run via 'node src/utils/seedData.js'
// It duplicates some logic from studentImport.ts because TS->JS execution in node is tricky without build steps.
// For a robust system, we would share the logic, but for this task, standalone is safer/faster.

const SOURCE_DIR = path.join(__dirname, '../../source/academic');
const DATA_DIR = path.join(__dirname, '../data');

// Ensure data dir exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Interfaces (Mental Model)
// Student: { student_id, first_name_th, ... }
// Advisor: { name, department }
// Publication: { student_id, title, ... }
// Milestone: { student_id, milestone_name, ... }

const studentsMap = new Map(); // Key: student_id
const advisorsMap = new Map(); // Key: name
const publications = [];
const milestones = [];

function parseThaiDate(dateStr) {
    if (!dateStr) return null;
    // Simple parser for "15/05/2563" or "15 พ.ค. 2563"
    // For now, returning raw string if complex parsing needed, or basic ISO if possible
    return dateStr; 
}

function cleanString(str) {
    if (typeof str !== 'string') return str;
    return str.trim().replace(/\s+/g, ' ');
}

// 1. Process Advisors & Students (Active/Grad)
const fileActive = path.join(SOURCE_DIR, 'ฐานข้อมูลนิสิต_clean_นิสิตคงอยู่ สำเร็จ.csv');
if (fs.existsSync(fileActive)) {
    console.log('Processing Active/Grad Students...');
    const content = fs.readFileSync(fileActive, 'utf8');
    // Simple line parsing since we know structure
    const lines = content.split(/\r?\n/).slice(13); // Skip headers
    lines.forEach(line => {
        // Regex split to handle quotes
        const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(p => p.replace(/^"|"$/g, '').trim());
        if (parts.length > 10) {
            const id = parts[1]; // รหัสนิสิต
            const name = parts[2]; // ชื่อ
            const degree = parts[5];
            const major = parts[8];
            const advisor = parts[9]; // อาจารย์ที่ปรึกษา
            const status = parts[15]; // สถานะปัจจุบัน

            if (id && id.length > 5) {
                if (!studentsMap.has(id)) {
                    studentsMap.set(id, {
                        student_id: id,
                        full_name_th: name,
                        degree_level: degree,
                        major_name: major,
                        advisor_name: advisor,
                        current_status: status,
                        source_file: 'active_grad'
                    });
                }
            }

            if (advisor && advisor.length > 5 && !advisor.includes('ไม่มี')) {
                advisorsMap.set(advisor, { name: advisor, department: parts[10] || '' });
            }
        }
    });
}

// 2. Process Publications
const filePubs = path.join(SOURCE_DIR, 'ฐานข้อมูลนิสิต_clean_การตีพิมพ์ผลงาน.csv');
if (fs.existsSync(filePubs)) {
    console.log('Processing Publications...');
    const content = fs.readFileSync(filePubs, 'utf8');
    const lines = content.split(/\r?\n/).slice(1); 
    lines.forEach(line => {
        const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(p => p.replace(/^"|"$/g, '').trim());
        if (parts.length > 8) {
            const id = parts[1];
            const title = parts[6];
            const journal = parts[7];
            const year = parts[13];
            
            if (id && title) {
                publications.push({
                    id: crypto.randomUUID(),
                    student_id: id,
                    article_title: title,
                    journal_name: journal,
                    published_year: year
                });
                
                // Update student if missing
                if (!studentsMap.has(id)) {
                     studentsMap.set(id, {
                        student_id: id,
                        full_name_th: parts[2],
                        degree_level: parts[3],
                        major_name: parts[4],
                        advisor_name: parts[5],
                        source_file: 'pubs'
                    });
                }
            }
        }
    });
}

// 3. Process Progress (Milestones)
const fileProgress = path.join(SOURCE_DIR, 'ฐานข้อมูลนิสิต_clean_รายงานความก้าวหน้า.csv');
if (fs.existsSync(fileProgress)) {
    console.log('Processing Progress...');
    const content = fs.readFileSync(fileProgress, 'utf8');
    const lines = content.split(/\r?\n/).slice(1);
    lines.forEach(line => {
        const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(p => p.replace(/^"|"$/g, '').trim());
        // Header: STUDENT_ID (0), ...
        // This file is tricky as milestones are columns, but we will grab core info
        if (parts.length > 5) {
             const id = parts[0];
             if (id && !isNaN(parseInt(id.charAt(0)))) {
                 // Check for specific milestones in columns?
                 // For now, let's just make sure student exists
                 if (!studentsMap.has(id)) {
                     studentsMap.set(id, {
                         student_id: id,
                         title_th: parts[2],
                         first_name_th: parts[3],
                         last_name_th: parts[5],
                         full_name_th: parts[2] + parts[3] + ' ' + parts[5],
                         full_name_en: parts[7] + ' ' + parts[9],
                         advisor_name: parts[33], // ADVISOR_NAME_TH
                         current_status: 'Studying' // Default
                     });
                 }
                 
                 // Extract Milestones (Columns 41, 45, 47, 49, 51, 53)
                 // ENGEXAM_STATUS (40), COMPREHENSIVE_ORAL (46), etc.
                 // Need careful index mapping, this is approximate based on view_file
                 
                 const addMilestone = (name, status, date) => {
                     if (status) {
                         milestones.push({
                             id: crypto.randomUUID(),
                             student_id: id,
                             milestone_name: name,
                             status: status,
                             exam_date: date
                         });
                     }
                 };

                 // Approximate indices from previous view_file
                 addMilestone('English Exam', parts[40], parts[41]);
                 addMilestone('Comprehensive Oral', parts[46], parts[47]);
                 addMilestone('Qualify Exam', parts[48], parts[49]);
                 addMilestone('Thesis Defense', parts[52], parts[53]);
             }
        }
    });
}

// Write Output
fs.writeFileSync(path.join(DATA_DIR, 'students.json'), JSON.stringify(Array.from(studentsMap.values()), null, 2));
fs.writeFileSync(path.join(DATA_DIR, 'advisors.json'), JSON.stringify(Array.from(advisorsMap.values()), null, 2));
fs.writeFileSync(path.join(DATA_DIR, 'publications.json'), JSON.stringify(publications, null, 2));
fs.writeFileSync(path.join(DATA_DIR, 'milestones.json'), JSON.stringify(milestones, null, 2));

console.log('Seeding Complete.');
console.log(`Students: ${studentsMap.size}`);
console.log(`Advisors: ${advisorsMap.size}`);
console.log(`Publications: ${publications.length}`);
console.log(`Milestones: ${milestones.length}`);
