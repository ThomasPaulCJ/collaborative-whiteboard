import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    // IMPORTANT: Replace this with your Vercel client's public URL once deployed!
    // For local testing, it can stay http://localhost:3000 for now.
    origin: 'https://your-vercel-client.vercel.app', // <-- REPLACE THIS
    methods: ['GET', 'POST'],
  },
});

const port = 5000;

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
  console.log(`Server is running on http://localhost:${port}`);
});