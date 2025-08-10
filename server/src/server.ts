import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors'; // Import the cors package if not already there

const app = express();
const httpServer = createServer(app);

// Use the environment variable for the client URL
// Fallback to localhost for local development
const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

const io = new Server(httpServer, {
  cors: {
    origin: clientUrl, // Use the dynamic clientUrl here
    methods: ['GET', 'POST'],
  },
});

// Use the port provided by the environment, or default to 5000 for local development
const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Hello from the server!');
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  socket.on('drawing', (data) => {
    socket.broadcast.emit('drawing', data);
  });
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}`); // Log the actual port being used
  console.log(`CORS origin set to: ${clientUrl}`); // Log the CORS origin for verification
});
