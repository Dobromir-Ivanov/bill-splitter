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
const worker = createWorker();

// Routes
app.post('/api/upload-receipt', upload.single('receipt'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        await worker.load();
        await worker.loadLanguage('eng');
        await worker.initialize('eng');

        const { data: { text } } = await worker.recognize(req.file.buffer);
        
        // Process the OCR text to extract products and prices
        // This is a basic implementation - you'll need to enhance it based on receipt format
        const lines = text.split('\n');
        const items = lines.map(line => {
            // Basic parsing - enhance based on actual receipt format
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
    }
});

// Bills endpoints
let bills = [];

app.post('/api/bills', (req, res) => {
    const newBill = {
        id: Date.now().toString(),
        items: req.body.items,
        participants: [],
        totalAmount: req.body.items.reduce((sum, item) => sum + item.price, 0),
        paidAmount: 0
    };
    bills.push(newBill);
    res.json(newBill);
});

app.post('/api/bills/:billId/participants', (req, res) => {
    const { billId } = req.params;
    const { name } = req.body;
    
    const bill = bills.find(b => b.id === billId);
    if (!bill) {
        return res.status(404).json({ error: 'Bill not found' });
    }

    bill.participants.push({
        name,
        selectedItems: [],
        amount: 0
    });

    res.json(bill);
});

app.post('/api/bills/:billId/select-items', (req, res) => {
    const { billId } = req.params;
    const { participantName, selectedItems } = req.body;
    
    const bill = bills.find(b => b.id === billId);
    if (!bill) {
        return res.status(404).json({ error: 'Bill not found' });
    }

    const participant = bill.participants.find(p => p.name === participantName);
    if (!participant) {
        return res.status(404).json({ error: 'Participant not found' });
    }

    participant.selectedItems = selectedItems;
    participant.amount = selectedItems.reduce((sum, item) => sum + item.price, 0);
    bill.paidAmount = bill.participants.reduce((sum, p) => sum + p.amount, 0);

    res.json(bill);
});

app.get('/api/bills/:billId', (req, res) => {
    const { billId } = req.params;
    const bill = bills.find(b => b.id === billId);
    
    if (!bill) {
        return res.status(404).json({ error: 'Bill not found' });
    }

    res.json(bill);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
