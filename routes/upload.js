const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const { extractTextFromPDF, extractTextFromDocx } = require('../utils/extractText');

const uploadPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

// 🔒 Middleware to prevent duplicate uploads
const checkDuplicate = (req, res, next) => {
  const fileName = req.headers['x-filename'];
  if (fileName) {
    const isDuplicate = fs.readdirSync(uploadPath).some(existing => {
      const nameWithoutTimestamp = existing.split('_').slice(1).join('_');
      return nameWithoutTimestamp === fileName;
    });

    if (isDuplicate) {
      return res.status(409).json({ error: 'File already uploaded.' });
    }
  }
  next();
};

// 🗃️ Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`)
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.pdf' && ext !== '.docx') {
      return cb(new Error('UNSUPPORTED_FILE_TYPE'));
    }
    cb(null, true);
  }
}).single('file');

// 📥 Upload and chunk route
router.post('/', checkDuplicate, (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      if (err.message === 'UNSUPPORTED_FILE_TYPE') {
        return res.status(400).json({ error: 'Unsupported file type.' });
      }
      return res.status(500).json({ error: 'Upload failed.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    try {
      const file = req.file;
      const filePath = file.path;
      const ext = path.extname(file.originalname).toLowerCase();

      let text = '';
      if (ext === '.pdf') {
        text = await extractTextFromPDF(filePath);
      } else if (ext === '.docx') {
        text = await extractTextFromDocx(filePath);
      }

      const chunks = chunkBySentences(text, 3);
      fs.writeFileSync(path.join(__dirname, '../extractedChunks.json'), JSON.stringify(chunks, null, 2));

      // ✅ Store embeddings in Chroma via Python
      exec("python embedStore.py", (error, stdout, stderr) => {
        if (error) {
          console.error("Embedding error:", error.message);
        } else {
          console.log("✅ Embedding complete:", stdout);
        }
      });

      res.json({
        message: '✅ File uploaded and text extracted successfully!',
        chunks,
      });

    } catch (error) {
      console.error('❌ Upload error:', error);
      res.status(500).json({ error: 'Something went wrong during upload.' });
    }
  });
});


function chunkBySentences(text, maxSentences = 3) {
  const sentences = text.split(/(?<=[.?!])\s+/);
  const chunks = [];
  for (let i = 0; i < sentences.length; i += maxSentences) {
    chunks.push(sentences.slice(i, i + maxSentences).join(" "));
  }
  return chunks;
}

module.exports = router;
