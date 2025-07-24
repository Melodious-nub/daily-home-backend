const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

// Load environment variables
dotenv.config();

// Connect MongoDB
connectDB();

// Init app
const app = express();

// Middlewares
app.use(cors());

// ✅ Set body size limits only once (this is important)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/members', require('./routes/memberRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/wallets', require('./routes/walletRoutes'));
app.use('/api/bazars', require('./routes/bazarRoutes'));
app.use('/api/meals', require('./routes/mealRoutes'));
app.use('/api/summary', require('./routes/summaryRoutes'));

// Root
app.get('/', (req, res) => res.send('Home Management API Running'));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));