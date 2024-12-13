const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { createWorker } = require('tesseract.js');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// File upload configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// OCR worker initialization
const worker = createWorker(); // Remove the logger for now

app.post('/api/upload-receipt', upload.single('receipt'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        await worker.load();
        await worker.loadLanguage('eng');
        await worker.initialize('eng');

        const { data: { text } } = await worker.recognize(req.file.buffer);
        
        const lines = text.split('\n');
        const items = lines.map(line => {
            const match = line.match(/(.+?)\s+(\d+[\.,]\d{2})/);
            if (match) {
                return {
                    name: match[1].trim(),
                    price: parseFloat(match[2].replace(',', '.'))
                };
            }
            return null;
        }).filter(item => item !== null);

        res.json({ items });
    } catch (error) {
        console.error('OCR Error:', error);
        res.status(500).json({ error: 'Failed to process receipt' });
    } finally {
        await worker.terminate();
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});