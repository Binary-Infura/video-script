const fs = require('fs');
const pdfParse = require('pdf-parse');

const pdfPath = '/Users/parthsinghrao/Documents/code-zone/video-script/mastery_guide.pdf';

async function readPdf() {
  const dataBuffer = fs.readFileSync(pdfPath);
  try {
    const data = await pdfParse(dataBuffer);
    console.log(data.text);
  } catch (error) {
    console.error("Error reading PDF:", error);
  }
}

readPdf();
