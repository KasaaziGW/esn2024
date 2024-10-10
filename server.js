const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware to parse JSON requests
app.use(bodyParser.json());

// In-memory storage for messages
let messages = [];

// Endpoint to send a private chat message
app.post('/send-message', (req, res) => {
    const { senderId, recipientId, content } = req.body;

    // Basic validation
    if (!senderId || !recipientId || !content) {
        return res.status(400).json({ error: 'Sender ID, Recipient ID, and content are required.' });
    }

    // Create a new message object
    const newMessage = {
        id: messages.length + 1, // simple incrementing ID
        senderId,
        recipientId,
        content,
        timestamp: new Date(),
    };

    // Store the message
    messages.push(newMessage);

    // Respond with the newly created message
    res.status(201).json(newMessage);
});

// Endpoint to get messages for a specific recipient
app.get('/messages/:recipientId', (req, res) => {
    const { recipientId } = req.params;

    // Filter messages for the specified recipient
    const userMessages = messages.filter(msg => msg.recipientId === recipientId);

    res.status(200).json(userMessages);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
