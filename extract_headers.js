const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const filePath = path.join(__dirname, 'source/academic/master_template/master_template_kuvet_res_pub.xlsx');
const outputPath = path.join(__dirname, 'headers.json');

try {
    const workbook = XLSX.readFile(filePath);
    const result = {};

    workbook.SheetNames.forEach((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0];
        result[sheetName] = headers || [];
    });

    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    console.log("Headers extracted to headers.json");

} catch (error) {
    console.error("Error:", error.message);
}
