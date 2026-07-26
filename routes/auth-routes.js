const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Opportunity = require('../models/Opportunity');
const { requireAuth } = require('../middleware/auth');

const COOKIE_NAME = 'stackscout_session';
const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

function issueSession(res, user) {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  res.cookie(COOKIE_NAME, token, COOKIE_OPTS);
}

// --- Signup ---
router.get('/signup', (req, res) => {
  if (req.user) return res.redirect('/profile');
  res.render('signup', { error: null });
});

router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password || password.length < 6) {
      return res.render('signup', { error: 'Fill in all fields — password needs at least 6 characters.' });
    }

    const existing = await User.findOne({ $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }] });
    if (existing) {
      return res.render('signup', { error: 'That username or email is already taken.' });
    }

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({ username, email, passwordHash });

    issueSession(res, user);
    res.redirect('/profile');
  } catch (err) {
    res.render('signup', { error: 'Something went wrong — try again.' });
  }
});

// --- Login ---
router.get('/login', (req, res) => {
  if (req.user) return res.redirect('/profile');
  res.render('login', { error: null, next: req.query.next || '/' });
});

router.post('/login', async (req, res) => {
  try {
    const { identifier, password, next } = req.body;
    const user = await User.findOne({
      $or: [{ username: (identifier || '').toLowerCase() }, { email: (identifier || '').toLowerCase() }],
    });

    if (!user || !(await user.comparePassword(password))) {
      return res.render('login', { error: 'Incorrect username/email or password.', next: next || '/' });
    }

    issueSession(res, user);
    res.redirect(next && next.startsWith('/') ? next : '/profile');
  } catch (err) {
    res.render('login', { error: 'Something went wrong — try again.', next: '/' });
  }
});

// --- Logout ---
router.post('/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME);
  res.redirect('/');
});

// --- Profile ---
router.get('/profile', requireAuth, async (req, res) => {
  const submissions = await Opportunity.find({ submittedByUser: req.user._id }).sort({ createdAt: -1 }).lean();
  res.render('profile', { user: req.user, submissions });
});

module.exports = router;
