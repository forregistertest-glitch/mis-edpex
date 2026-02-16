const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, 'source/academic/master_template/master_template_kuvet_res_pub.xlsx');

try {
    console.log(`Reading file: ${filePath}`);
    const workbook = XLSX.readFile(filePath);
    console.log("Sheet Names:", workbook.SheetNames);

    workbook.SheetNames.forEach((sheetName, index) => {
        const worksheet = workbook.Sheets[sheetName];
        // Get headers (first row)
        const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0];
        console.log(`\n--- Sheet ${index + 1}: ${sheetName} ---`);
        console.log("Headers:", JSON.stringify(headers, null, 2));
        
        // Preview first row of data
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[1];
        console.log("First Data Row:", JSON.stringify(data, null, 2));
    });

} catch (error) {
    console.error("Error reading file:", error.message);
}
