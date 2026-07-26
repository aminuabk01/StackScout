const axios = require('axios');

const RESEND_API_URL = 'https://api.resend.com/emails';

// Uses Resend's shared onboarding sender — works immediately with no domain setup.
// Swap in a verified custom domain address later if you want a StackScout-branded "from".
const FROM_ADDRESS = 'StackScout <onboarding@resend.dev>';

function welcomeEmailHtml(username) {
  return `
  <div style="font-family: Arial, sans-serif; background:#000000; padding:32px; color:#f5f5f7;">
    <div style="max-width:480px; margin:0 auto;">
      <h1 style="font-size:22px; margin-bottom:4px;">Welcome to StackScout, ${username} 👋</h1>
      <p style="color:#9a9aa2; font-size:14px; line-height:1.6;">
        You're in. StackScout helps you discover where to build, contribute, and grow within the Stacks ecosystem.
      </p>

      <div style="margin:24px 0; padding:18px; border:1px solid #2a2a2a; border-radius:8px;">
        <p style="margin:0 0 10px; font-weight:bold;">Here's what you can do:</p>
        <ul style="margin:0; padding-left:18px; color:#9a9aa2; font-size:14px; line-height:1.8;">
          <li>Browse live Stacks projects ranked by real on-chain activity</li>
          <li>Find open jobs, bounties, and grants across the ecosystem</li>
          <li>Post your own opportunity — every submission goes through a quick review before it's listed</li>
          <li>Track your submissions and their status from your profile</li>
        </ul>
      </div>

      <a href="https://stackscout.onrender.com" style="display:inline-block; background:linear-gradient(90deg,#6c4ce8,#f2994a); color:#000000; font-weight:bold; padding:12px 22px; border-radius:6px; text-decoration:none; font-size:14px;">
        Explore StackScout
      </a>

      <p style="color:#63636e; font-size:12px; margin-top:32px;">
        StackScout — scouting the Stacks ecosystem for builders, one block at a time.
      </p>
    </div>
  </div>
  `;
}

async function sendWelcomeEmail(user) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY not set — skipping welcome email.');
    return;
  }

  try {
    await axios.post(
      RESEND_API_URL,
      {
        from: FROM_ADDRESS,
        to: user.email,
        subject: 'Welcome to StackScout 🎯',
        html: welcomeEmailHtml(user.username),
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log(`[email] welcome email sent to ${user.email}`);
  } catch (err) {
    // Never block signup if the email fails — just log it.
    console.error('[email] failed to send welcome email:', err.response ? err.response.data : err.message);
  }
}

module.exports = { sendWelcomeEmail };
