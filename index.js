const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const { sendToKafka } = require('./kafka/producer');
const { initConsumer } = require('./kafka/consumer');
const { connectRedis, redisClient } = require('./redis/redisClient');

const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Connect Redis
connectRedis();

// Create an HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server);

// Socket.io event handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // User joins a specific document
  socket.on("join-document", async (docId) => {
    socket.join(docId);
    const storedText = (await redisClient.get(docId)) || "";
    socket.emit("editor-data", { docId, text: storedText });
  });

  // Handle real-time updates
  socket.on("editor-data", async (data) => {
    const { docId, text } = data;
    if (!docId) return;

    await redisClient.set(docId, text); // Store latest text in Redis
    sendToKafka("editor-events", JSON.stringify(data)); // Persist in Kafka

    // Broadcast only to users in the same document room
    socket.to(docId).emit("editor-data", data);
  });


  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// API Routes
app.get('/set', async (req, res) => {
  try {
    await redisClient.set('message', 'Hello from Redis!');
    res.send('Value set in Redis');
  } catch (error) {
    res.status(500).send(`Error setting value in Redis: ${error.message}`);
  }
});

app.get('/get', async (req, res) => {
  try {
    const value = await redisClient.get('message');
    res.send(`Value from Redis: ${value}`);
  } catch (error) {
    res.status(500).send(`Error getting value from Redis: ${error.message}`);
  }
});

// Start Kafka Consumer
initConsumer();

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
