/**
 * NOTE: If you are having trouble running this CLI version (errors with 'canvas' or 'gyp'),
 * please use the WEB VERSION instead.
 * 
 * HOW TO RUN WEB VERSION:
 * 1. Open the folder k:\Project\OCR in File Explorer.
 * 2. Double-click 'index.html'.
 * 3. Use the tool in your browser.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
const Tesseract = require('tesseract.js');
const { createCanvas } = require('canvas');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

// Canvas Factory for pdfjs in Node.js
function NodeCanvasFactory() {}
NodeCanvasFactory.prototype = {
  create: function (width, height) {
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');
    return {
      canvas: canvas,
      context: context,
    };
  },
  reset: function (ctx, width, height) {
    ctx.canvas.width = width;
    ctx.canvas.height = height;
  },
  destroy: function (ctx) {
    ctx.canvas.width = 0;
    ctx.canvas.height = 0;
    ctx.canvas = null;
    ctx.context = null;
  },
};

async function extractTextFromPdf(pdfPath) {
  // Check if file exists
  if (!fs.existsSync(pdfPath)) {
    console.error(`Error: File not found at ${pdfPath}`);
    return;
  }

  let fullText = '';
  const startTime = Date.now();

  try {
    const data = new Uint8Array(fs.readFileSync(pdfPath));
    const loadingTask = pdfjsLib.getDocument({
      data: data,
      cMapUrl: './node_modules/pdfjs-dist/cmaps/',
      cMapPacked: true,
      standardFontDataUrl: './node_modules/pdfjs-dist/standard_fonts/',
      canvasFactory: new NodeCanvasFactory(),
    });

    const doc = await loadingTask.promise;
    console.log(`\nLoaded PDF: ${pdfPath}`);
    console.log(`Number of pages: ${doc.numPages}`);

    for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
      console.log(`Processing page ${pageNum}/${doc.numPages}...`);
      const page = await doc.getPage(pageNum);
      
      const viewport = page.getViewport({ scale: 2.0 }); // Scale up for better OCR results
      const canvasFactory = new NodeCanvasFactory();
      const canvasContext = canvasFactory.create(viewport.width, viewport.height);
      
      await page.render({
        canvasContext: canvasContext.context,
        viewport: viewport,
        canvasFactory: canvasFactory
      }).promise;

      const imageBuffer = canvasContext.canvas.toBuffer('image/png');
      
      // Perform OCR
      const { data: { text } } = await Tesseract.recognize(
        imageBuffer,
        'eng',
        { logger: m => {} } // Silence logger for cleaner output
      );
      
      const pageText = `\n--- Page ${pageNum} ---\n${text}\n`;
      fullText += pageText;
      console.log(`Page ${pageNum} completed.`);
    }

    // Generate output filename
    const parsedPath = path.parse(pdfPath);
    const outputPath = path.join(parsedPath.dir, `${parsedPath.name}_ocr.txt`);
    
    fs.writeFileSync(outputPath, fullText);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n----------------------------------------`);
    console.log(`Conversion completed in ${duration}s`);
    console.log(`Text data saved to: ${outputPath}`);
    console.log(`----------------------------------------`);

  } catch (error) {
    console.error('Error processing PDF:', error);
  }
}

async function main() {
  let inputPdfPath = process.argv[2];

  if (!inputPdfPath) {
    inputPdfPath = await askQuestion('Please enter the path to the PDF file: ');
    // Remove quotes if user dragged and dropped file in terminal
    inputPdfPath = inputPdfPath.replace(/^"|"$/g, '').trim();
  }

  rl.close();

  if (inputPdfPath) {
    await extractTextFromPdf(inputPdfPath);
  } else {
    console.log('No file path provided. Exiting.');
  }
}

main();
