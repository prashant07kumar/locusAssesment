const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db.js');
const setupSocketHandlers = require('./socket/socketHandler.js');


const authRoutes = require('./routes/authRoutes.js');
const eventRoutes = require('./routes/eventRoutes.js');
const registrationRoutes = require('./routes/registrationRoutes.js');

dotenv.config();

connectDB();

const app = express();

// Enable CORS for all origins (for testing)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true
  },
});

setupSocketHandlers(io);

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);


io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));