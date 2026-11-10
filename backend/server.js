const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db');
const authRoutes = require('./routes/auth'); // Import auth routes
const readingsRoutes = require('./routes/readings');
const reportsRoutes = require('./routes/reports');
const app = express();

app.use(cors());
app.use(express.json());

// Use Routes
app.use('/api/auth', authRoutes);

app.use('/api/reports', reportsRoutes);
app.use('/api/readings', readingsRoutes);

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Sweety Blood Glucose Tracker API is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});