const express = require('express');
const pool = require('../db');
const jwt = require('jsonwebtoken');

const router = express.Router();

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

const calculateStats = (rows) => {
  if (!rows || rows.length === 0) {
    return { count: 0, highest: null, lowest: null, average: null };
  }
  const values = rows.map(r => Number(r.value));
  const highest = Math.max(...values);
  const lowest = Math.min(...values);
  const sum = values.reduce((acc, val) => acc + val, 0);
  const average = parseFloat((sum / values.length).toFixed(1));

  return { count: rows.length, highest, lowest, average };
};

router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    let selectedDate = req.query.date;

    if (!selectedDate) {
      selectedDate = new Date().toISOString().split('T')[0];
    } else {
      // Ensure date format is YYYY-MM-DD
      selectedDate = selectedDate.split('T')[0];
    }

    // 1. Daily Report
    const dailyQuery = await pool.query(
      'SELECT * FROM readings WHERE user_id = $1 AND TO_CHAR(date, \'YYYY-MM-DD\') = $2 ORDER BY created_at ASC',
      [userId, selectedDate]
    );

    // 2. Month-to-date Report
    const dateObj = new Date(selectedDate);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const startOfMonth = `${year}-${month}-01`;

    const mtdQuery = await pool.query(
      'SELECT * FROM readings WHERE user_id = $1 AND date >= $2 AND date <= $3',
      [userId, startOfMonth, selectedDate]
    );

    // 3. Monthly Report (Previous month)
    let prevYear = year;
    let prevMonth = dateObj.getMonth();
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear -= 1;
    }
    const prevMonthStr = String(prevMonth).padStart(2, '0');
    const lastDayOfPrevMonth = new Date(prevYear, prevMonth, 0).getDate();
    const startOfPrevMonth = `${prevYear}-${prevMonthStr}-01`;
    const endOfPrevMonth = `${prevYear}-${prevMonthStr}-${lastDayOfPrevMonth}`;

    const monthlyQuery = await pool.query(
      'SELECT * FROM readings WHERE user_id = $1 AND date >= $2 AND date <= $3',
      [userId, startOfPrevMonth, endOfPrevMonth]
    );

    res.json({
      selectedDate,
      daily: {
        range: selectedDate,
        readings: dailyQuery.rows,
        stats: calculateStats(dailyQuery.rows),
      },
      monthToDate: {
        range: `${startOfMonth} to ${selectedDate}`,
        stats: calculateStats(mtdQuery.rows),
      },
      previousMonthly: {
        range: `${startOfPrevMonth} to ${endOfPrevMonth}`,
        stats: calculateStats(monthlyQuery.rows),
      },
    });
  } catch (err) {
    console.error('Reports Error:', err.message);
    res.status(500).json({ error: 'Server error while generating reports.' });
  }
});

module.exports = router;