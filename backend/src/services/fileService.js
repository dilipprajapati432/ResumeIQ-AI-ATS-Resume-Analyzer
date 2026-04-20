const pdfParse = require('pdf-parse');

async function extractTextFromFile(file) {
  if (file.mimetype === 'text/plain') return file.buffer.toString('utf-8');
  if (file.mimetype === 'application/pdf') {
    const res = await pdfParse(file.buffer);
    return res.text;
  }
  return '';
}

module.exports = {
  extractTextFromFile
};
