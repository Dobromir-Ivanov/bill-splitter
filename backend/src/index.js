const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());


app.use(express.static(path.join(__dirname, '../../frontend/dist/bill-splitter-frontend/browser')));


// File upload configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/api/upload-receipt', upload.single('receipt'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Converti l'immagine in base64
        const imageBase64 = req.file.buffer.toString('base64');

        const apiKey = 'AIzaSyAzSHKHoPCC-ARiu5n8hK0i5K4qlwPhccw';
        const geminiModel = 'gemini-2.0-flash-exp';//'gemini-1.5-flash';  // Nome effettivo del modello
        const gemini2Endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`;
        
        // Richiesta all'API di Gemini 1.5 Flash
        const response = await axios.post(
            gemini2Endpoint,
            {
                contents: [{
                    parts: [
                        { text: "Estrai in formato JSON un elenco di prodotti con nome e prezzo dallo scontrino. Ogni prodotto deve avere una proprietà 'name' e una 'price'. Usa un formato che possa essere facilmente parsato da JSON.parse()" },
                        { 
                            inlineData: {
                                mimeType: "image/jpeg",
                                data: imageBase64
                            }
                        }
                    ]
                }],
                generationConfig: {
                    temperature: 0.4,
                    maxOutputTokens: 500
                }
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        // Elabora la risposta di Gemini
        const responseText = response.data.candidates[0].content.parts[0].text;

        // Rimuovi eventuali marcatori di codice ```json
        const cleanedResponseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

        // Parsing dei prodotti
        let items;
        try {
            items = JSON.parse(cleanedResponseText);
        } catch (parseError) {
            console.error('Errore nel parsing JSON:', parseError);
            console.error('Testo ricevuto:', cleanedResponseText);
            
            // Fallback parsing
            items = parseReceiptText(cleanedResponseText);
        }

        res.json({ items });
    } catch (error) {
        console.error('Detailed Error:', error.response ? error.response.data : error);
        res.status(500).json({ 
            error: 'Failed to process receipt',
            details: error.response ? error.response.data : error.message 
        });
    }
});

// Funzione di parsing di fallback
function parseReceiptText(text) {
    const items = [];
    
    // Espressione regolare per trovare prodotti e prezzi
    const itemRegex = /(.+?)\s*(\d+(?:\.\d{1,2})?)\s*€?/g;
    
    let match;
    while ((match = itemRegex.exec(text)) !== null) {
        items.push({
            name: match[1].trim(),
            price: parseFloat(match[2])
        });
    }

    return items;
}
// Simula il salvataggio dei dati in un database
const bills = {};

app.post('/api/bills', async (req, res) => {
    try {
        const items = req.body.items;
        const billId = 'bill-' + Date.now();
          const newBill = {
            id: billId,
             createdAt: new Date(),
            items,
             participants: [],
              totalAmount: items.reduce((sum, item) => sum + item.price, 0),
            paidAmount: 0
          };
        bills[billId] = newBill;

        res.status(201).json({ id: billId });
    } catch (error) {
        console.error('Error creating bill:', error);
        res.status(500).json({ error: 'Failed to create bill' });
    }
});

app.get('/api/bills/:id', async (req, res) => {
    try {
        const billId = req.params.id;
        const bill = bills[billId];
        if (!bill) {
            return res.status(404).json({ error: 'Bill not found' });
        }
        res.json(bill);
    } catch (error) {
        console.error('Error retrieving bill:', error);
        res.status(500).json({ error: 'Failed to retrieve bill' });
    }
});

app.post('/api/bills/:billId/participants', (req, res) => {
  try {
    const billId = req.params.billId;
    const newParticipant = req.body;

     if (!bills[billId]) {
        return res.status(404).json({ error: 'Bill not found' });
      }


    if (bills[billId].participants.some(p => p.name === newParticipant.name)) {
       return res.status(400).json({ error: 'Participant with this name already exists' });
    }
    
        bills[billId].participants.push({
        ...newParticipant,
        selectedItems: [],
        amount: 0
      });
    res.status(201).json(bills[billId]);
  } catch (error) {
    console.error('Error adding participant:', error);
    res.status(500).json({ error: 'Failed to add participant' });
  }
});


app.put('/api/bills/:billId/participants/:participantName', (req, res) => {
  try {
    const billId = req.params.billId;
    const participantName = req.params.participantName;
    const selectedItems = req.body.selectedItems;
      
     if (!bills[billId]) {
      return res.status(404).json({ error: 'Bill not found' });
     }
    
     const participantIndex = bills[billId].participants.findIndex(p => p.name === participantName);

     if(participantIndex === -1){
          return res.status(404).json({ error: 'Participant not found' });
     }
     bills[billId].participants[participantIndex].selectedItems = selectedItems;
      bills[billId].participants[participantIndex].amount = selectedItems.reduce((sum, item) => sum + item.price, 0);
      
      bills[billId].paidAmount = bills[billId].participants.reduce((total, p) => total + p.amount, 0);

    res.json(bills[billId]);
  } catch (error) {
      console.error('Error updating bill items:', error);
    res.status(500).json({ error: 'Failed to update bill items' });
  }
});


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});