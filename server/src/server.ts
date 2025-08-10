// server/src/server.ts

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const port = 5000;

app.get('/', (req, res) => {
  res.send('Hello from the server!');
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // This is the listener that receives drawing data from one client
  socket.on('drawing', (data) => {
    // This is the broadcast that sends the data to all other clients
    socket.broadcast.emit('drawing', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

httpServer.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});