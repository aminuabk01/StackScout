const express = require('express');
const router = express.Router();
const Opportunity = require('../models/Opportunity');
const { requireAdmin } = require('../middleware/auth');

// Dashboard — pending queue by default, with tabs for approved/rejected
router.get('/admin', requireAdmin, async (req, res) => {
  const tab = ['pending', 'approved', 'rejected'].includes(req.query.tab) ? req.query.tab : 'pending';

  const opportunities = await Opportunity.find({ reviewStatus: tab })
    .populate('submittedByUser', 'username email')
    .sort({ createdAt: -1 })
    .lean();

  res.render('admin', { opportunities, tab });
});

// Approve
router.post('/admin/opportunities/:id/approve', requireAdmin, async (req, res) => {
  await Opportunity.findByIdAndUpdate(req.params.id, {
    reviewStatus: 'approved',
    reviewerNote: null,
  });
  res.redirect('/admin?tab=pending');
});

// Reject (with a required note — also used for "request changes")
router.post('/admin/opportunities/:id/reject', requireAdmin, async (req, res) => {
  await Opportunity.findByIdAndUpdate(req.params.id, {
    reviewStatus: 'rejected',
    reviewerNote: req.body.reviewerNote || 'Did not meet StackScout listing criteria.',
  });
  res.redirect('/admin?tab=pending');
});

// Reset back to pending (undo an approve/reject, or re-open after changes were requested)
router.post('/admin/opportunities/:id/reset', requireAdmin, async (req, res) => {
  await Opportunity.findByIdAndUpdate(req.params.id, {
    reviewStatus: 'pending',
  });
  res.redirect('/admin?tab=' + (req.query.tab || 'pending'));
});

module.exports = router;
