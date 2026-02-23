import fs from 'fs';
import { printPrescription } from './src/utils/printUtils.js';

// Mock the printHtml function to save to a file instead of creating an iframe
const originalPrintPrescription = printPrescription.toString();
const modifiedPrintPrescription = originalPrintPrescription.replace('printHtml(printContent);', 'fs.writeFileSync("test-print.html", printContent);');

// Evaluate the modified function
const testPrint = eval('(' + modifiedPrintPrescription + ')');

const mockPatient = {
    name: "Juan Perez",
    id: "1768616054482",
    age: "36 Años",
    birthDate: "1990-01-01"
};

const mockRx = {
    od: { sph: "-2.00", cyl: "-0.50", axis: "180", add: "+2.00" },
    oi: { sph: "-2.25", cyl: "-0.75", axis: "170", add: "+2.00" }
};

const mockExam = {
    dip: "62",
    altura: "20"
};

const mockDiagnosis = {
    plan: "Uso de lentes permanente. Control en 1 año.",
    medications: [
        { name: "Systane Ultra", freq: "1 gota c/8h", duration: "1 mes" },
        { name: "Tobradex", freq: "1 gota c/12h", duration: "7 días" }
    ]
};

testPrint(mockPatient, mockRx, mockExam, mockDiagnosis);
console.log("HTML generated!");
