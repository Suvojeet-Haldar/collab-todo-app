const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/task');
const logRoutes = require('./routes/log');

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes(io)); // passing io for real-time events
app.use('/api/logs', logRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    server.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch(err => console.log(err));
