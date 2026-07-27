const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Attaches req.user + res.locals.user if a valid session cookie is present.
// Never blocks the request — use requireAuth for that.
async function attachUser(req, res, next) {
  res.locals.user = null;
  const token = req.cookies && req.cookies.stackscout_session;
  if (!token) return next();

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select('username email isAdmin').lean();
    if (user) {
      req.user = user;
      res.locals.user = user;
    }
  } catch (err) {
    // invalid/expired token — treat as logged out
  }
  next();
}

// Blocks the request unless logged in, redirecting to login with a return path.
function requireAuth(req, res, next) {
  if (!req.user) {
    return res.redirect('/login?next=' + encodeURIComponent(req.originalUrl));
  }
  next();
}

// Blocks the request unless logged in AND flagged as an admin.
async function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.redirect('/login?next=' + encodeURIComponent(req.originalUrl));
  }
  const fullUser = await User.findById(req.user._id).select('isAdmin').lean();
  if (!fullUser || !fullUser.isAdmin) {
    return res.status(403).render('403');
  }
  next();
}

module.exports = { attachUser, requireAuth, requireAdmin };
