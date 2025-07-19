const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env
dotenv.config();

// Connect MongoDB
connectDB();

// Init app
const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/members', require('./routes/memberRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/wallets', require('./routes/walletRoutes'));
app.use('/api/bazars', require('./routes/bazarRoutes'));
app.use('/api/meals', require('./routes/mealRoutes'));
app.use('/api/calculate', require('./routes/calculateRoutes'));

app.get('/', (req, res) => res.send('Home Management API Running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));