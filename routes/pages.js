const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Opportunity = require('../models/Opportunity');

// Home — discover projects + open opportunities
router.get('/', async (req, res) => {
  const [projects, opportunities] = await Promise.all([
    Project.find().sort({ 'activity.txCount24h': -1 }).lean(),
    Opportunity.find({ reviewStatus: 'approved', status: 'open' }).sort({ createdAt: -1 }).limit(12).lean(),
  ]);
  res.render('index', { projects, opportunities, submitted: req.query.submitted === '1' });
});

// Single project detail + its open opportunities
router.get('/projects/:slug', async (req, res) => {
  const project = await Project.findOne({ slug: req.params.slug }).lean();
  if (!project) return res.status(404).render('404');

  const opportunities = await Opportunity.find({
    reviewStatus: 'approved',
    status: 'open',
    project: project._id,
  }).lean();

  res.render('project', { project, opportunities });
});

// Submit an opportunity — form
router.get('/submit', (req, res) => {
  res.render('submit', { error: null });
});

router.post('/submit', async (req, res) => {
  try {
    const { title, projectName, type, skillsNeeded, description, applyUrl, deadline, submittedBy } = req.body;

    await Opportunity.create({
      title,
      projectName,
      type,
      skillsNeeded: skillsNeeded ? skillsNeeded.split(',').map((s) => s.trim()).filter(Boolean) : [],
      description,
      applyUrl,
      deadline: deadline || null,
      submittedBy: submittedBy || 'Anonymous',
      reviewStatus: 'pending',
    });

    res.redirect('/?submitted=1');
  } catch (err) {
    res.render('submit', { error: 'Something went wrong — check your fields and try again.' });
  }
});

module.exports = router;
