import express from 'express';
import 'dotenv/config';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import moduleRoutes from './routes/moduleRoutes.js';
import messageRoutes from "./routes/messageRoutes.js";
import Message from "./models/messageModel.js";

import { createServer } from 'http';
import { Server } from 'socket.io';

connectDB();

const app = express();

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});


app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use('/api/users', userRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/messages', messageRoutes);

io.on('connection', (socket) => {
  console.log(`User Connected to Socket: ${socket.id}`);

  socket.on('join_chat', (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  socket.on('send_message', async (messageData) => {
    socket.to(messageData.room).emit('receive_message', messageData);

    try {
      await Message.create(messageData.dbPayload); 
    } catch (error) {
      console.error("Failed to save message to DB", error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User Disconnected');
  });
});


app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});