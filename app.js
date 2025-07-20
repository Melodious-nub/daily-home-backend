const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

// Load env
dotenv.config();

// Connect MongoDB
connectDB();

// Init app
const app = express();
app.use(cors());
app.use(express.json());

// Swagger route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/members', require('./routes/memberRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/wallets', require('./routes/walletRoutes'));
app.use('/api/bazars', require('./routes/bazarRoutes'));
app.use('/api/meals', require('./routes/mealRoutes'));
app.use('/api/summary', require('./routes/summaryRoutes'));

app.get('/', (req, res) => res.send('Home Management API Running'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));