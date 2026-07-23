require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

const pageRoutes = require('./routes/pages');
const apiRoutes = require('./routes/api');
const { startActivityRefresher } = require('./services/activityRefresher');

const app = express();
const PORT = process.env.PORT || 3000;

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', pageRoutes);
app.use('/api', apiRoutes);

// 404
app.use((req, res) => res.status(404).render('404'));

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    startActivityRefresher();

    app.listen(PORT, () => {
      console.log(`StackScout running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
