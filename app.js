const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const socketAuth = require('./middleware/socketAuth');
const socketHandlers = require('./socket/socketHandlers');

// Load environment variables
dotenv.config();

// Connect MongoDB
connectDB();

// Init app
const app = express();
const httpServer = createServer(app);

// Socket.IO setup with CORS - Allow all origins
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
  },
  transports: ['websocket', 'polling']
});

// Middlewares - Allow all origins
app.use(cors({
  origin: "*", // Allow all origins
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true
}));

// ✅ Set body size limits only once (this is important)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/mess', require('./routes/messRoutes'));
app.use('/api/wallets', require('./routes/walletRoutes'));
app.use('/api/bazars', require('./routes/bazarRoutes'));
app.use('/api/meals', require('./routes/mealRoutes'));
app.use('/api/summary', require('./routes/summaryRoutes'));

// Root
app.get('/', (req, res) => res.send('DailyHome API Running'));

// Socket.IO middleware for authentication
io.use(socketAuth);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.userId}`);
  
  // Join user to their personal room
  socket.join(`user:${socket.userId}`);
  
  // Handle socket events
  socketHandlers(io, socket);
  
  socket.on('disconnect', () => {
    console.log(`🔌 User disconnected: ${socket.userId}`);
  });
});

// Make io available globally for use in controllers
global.io = io;

// Start server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔌 WebSocket server ready for real-time connections`);
});