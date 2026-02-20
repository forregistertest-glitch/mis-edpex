const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, 'source/academic/master_template/master_template_kuvet_res_pub.xlsx');

try {
    const workbook = XLSX.readFile(filePath);
    const result = {};

    workbook.SheetNames.forEach((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        // Get headers (first row)
        const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0];
        // Get first few rows of data
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }).slice(1, 4); // Rows 2-4
        
        result[sheetName] = {
            headers: headers,
            sampleData: data
        };
    });

    const jsonString = JSON.stringify(result);
    const base64String = Buffer.from(jsonString).toString('base64');
    console.log("BASE64_START");
    console.log(base64String);
    console.log("BASE64_END");

} catch (error) {
    console.error("Error reading file:", error.message);
}
