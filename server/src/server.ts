import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors'; // Ensure cors is imported

const app = express();
const httpServer = createServer(app);

// Use the environment variable for the client URL, fallback to localhost for local dev
const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

const io = new Server(httpServer, {
  cors: {
    origin: clientUrl, // This should be your Vercel client URL (e.g., https://your-vercel-app.vercel.app)
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
  
  // Listener for drawing data: receives from one client, broadcasts to others
  socket.on('drawing', (data) => {
    socket.broadcast.emit('drawing', data);
  });
  
  // *** THIS IS THE CRUCIAL PART FOR "CLEAR ALL" ***
  // Listener for clear whiteboard event: receives from one client, broadcasts to others
  socket.on('clearWhiteboard', () => {
    console.log('Whiteboard cleared by:', socket.id);
    // Broadcast the 'clearWhiteboard' event to all other connected clients
    socket.broadcast.emit('clearWhiteboard'); 
  });

  // Listener for disconnect event
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`CORS origin set to: ${clientUrl}`);
});
