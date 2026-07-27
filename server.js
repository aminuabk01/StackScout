require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

const pageRoutes = require('./routes/pages');
const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const { attachUser } = require('./middleware/auth');
const { startActivityRefresher } = require('./services/activityRefresher');

const app = express();
const PORT = process.env.PORT || 3000;

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(attachUser); // makes res.locals.user available in every view

// Routes
app.use('/', authRoutes);
app.use('/', adminRoutes);
app.use('/', pageRoutes);
app.use('/api', apiRoutes);

// 404
app.use((req, res) => res.status(404).render('404'));

async function start() {
  try {
    if (!process.env.JWT_SECRET) {
      console.error('Missing JWT_SECRET in environment — set one before starting the server.');
      process.exit(1);
    }

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
