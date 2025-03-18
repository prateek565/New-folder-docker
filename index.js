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

  const typingTimeouts = {}; 
  
  // Handle real-time updates
  socket.on("editor-data", async (data) => {
    const { docId, text } = data;
    if (!docId) return;

    // Broadcast updates in real-time to other users
    socket.to(docId).emit("editor-data", data);

    // Debounce Redis and Kafka updates (wait before saving)
    if (typingTimeouts[docId]) {
      clearTimeout(typingTimeouts[docId]); // Reset previous timeout
    }

    typingTimeouts[docId] = setTimeout(async () => {
      try {
        // Save final text to Redis
        await redisClient.set(docId, text);
        console.log(`Saved document "${docId}" to Redis`);

        // Send final update to Kafka
        sendToKafka("editor-events", JSON.stringify(data));
        console.log(`Sent document "${docId}" to Kafka`);
      } catch (error) {
        console.error(`Error processing document "${docId}":`, error);
      }
    }, 500); // Wait .5 second after the last keystroke
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
initConsumer(io, redisClient);

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
