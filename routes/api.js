const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Opportunity = require('../models/Opportunity');
const { refreshAllProjects } = require('../services/activityRefresher');

router.get('/projects', async (req, res) => {
  const projects = await Project.find().sort({ 'activity.txCount24h': -1 }).lean();
  res.json(projects);
});

router.get('/opportunities', async (req, res) => {
  const { type, skill } = req.query;
  const filter = { approved: true, status: 'open' };
  if (type) filter.type = type;
  if (skill) filter.skillsNeeded = skill;

  const opportunities = await Opportunity.find(filter).sort({ createdAt: -1 }).lean();
  res.json(opportunities);
});

// Manually trigger an activity refresh (handy for demo day)
router.post('/refresh-activity', async (req, res) => {
  try {
    await refreshAllProjects();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
