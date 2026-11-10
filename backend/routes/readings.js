const express = require('express');
const pool = require('../db');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token.' });
    req.user = user;
    next();
  });
};

// 1. Add Reading with Validations
router.post('/', verifyToken, async (req, res) => {
  try {
    const { date, slot, value } = req.body;
    const userId = req.user.id;

    // Validation 1: Value required & whole number between 40 and 600
    if (value === undefined || value === null || value === '') {
      return res.status(400).json({ error: 'Please enter a glucose value.' });
    }
    const numValue = Number(value);
    if (!Number.isInteger(numValue) || numValue < 40 || numValue > 600) {
      return res.status(400).json({ error: 'Value must be between 40 and 600 mg/dl.' });
    }

    // Validation 2: Date cannot be in the future
    const today = new Date().toISOString().split('T')[0];
    if (date > today) {
      return res.status(400).json({ error: 'Date cannot be in the future.' });
    }

    // Validation 3: Maximum 4 readings per day
    const dayCountCheck = await pool.query(
      'SELECT COUNT(*) FROM readings WHERE user_id = $1 AND date = $2',
      [userId, date]
    );
    if (parseInt(dayCountCheck.rows[0].count) >= 4) {
      return res.status(400).json({ error: 'You can add only 4 readings per day.' });
    }

    // Validation 4: Only one reading per slot per day
    const slotCheck = await pool.query(
      'SELECT * FROM readings WHERE user_id = $1 AND date = $2 AND slot = $3',
      [userId, date, slot]
    );
    if (slotCheck.rows.length > 0) {
      return res.status(400).json({ error: `You already have an ${slot} reading for this date.` });
    }

    // Insert reading
    const newReading = await pool.query(
      'INSERT INTO readings (user_id, date, slot, value) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, date, slot, numValue]
    );

    res.status(201).json({
      message: 'Reading added successfully!',
      reading: newReading.rows[0],
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while adding reading.' });
  }
});

// 2. Get All Readings for Logged-in User
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const readings = await pool.query(
      'SELECT * FROM readings WHERE user_id = $1 ORDER BY date DESC, created_at DESC',
      [userId]
    );
    res.json(readings.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while fetching readings.' });
  }
});

// 3. Delete Reading
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const deleteOp = await pool.query(
      'DELETE FROM readings WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (deleteOp.rows.length === 0) {
      return res.status(404).json({ error: 'Reading not found or unauthorized.' });
    }

    res.json({ message: 'Reading deleted successfully!' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while deleting reading.' });
  }
});

module.exports = router;