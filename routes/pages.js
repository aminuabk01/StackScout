const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Opportunity = require('../models/Opportunity');
const { requireAuth } = require('../middleware/auth');

// Keywords matched against an opportunity's skillsNeeded/description/type for each user role.
const ROLE_KEYWORDS = {
  developer: ['react', 'clarity', 'typescript', 'javascript', 'node', 'backend', 'frontend', 'smart contract', 'solidity', 'rust', 'developer', 'security', 'engineer'],
  designer: ['design', 'ui', 'ux', 'figma', 'branding', 'visual'],
  writer: ['writing', 'content', 'copywriting', 'documentation', 'docs', 'blog', 'writer'],
  community: ['community', 'moderation', 'events', 'discord', 'social', 'outreach', 'ambassador'],
  researcher: ['research', 'analysis', 'tokenomics', 'data', 'analyst'],
};

// Home — discover projects + open opportunities
router.get('/', async (req, res) => {
  const typeFilter = req.query.type || null;
  const oppFilter = { reviewStatus: 'approved', status: 'open' };
  if (typeFilter) oppFilter.type = typeFilter;

  const [projects, opportunities, topActive, newOnRadar] = await Promise.all([
    Project.find().sort({ 'activity.txCount24h': -1 }).lean(),
    Opportunity.find(oppFilter).sort({ createdAt: -1 }).limit(12).lean(),
    Project.find({ 'activity.txCount24h': { $gt: 0 } }).sort({ 'activity.txCount24h': -1 }).limit(5).lean(),
    Project.find().sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  let recommended = [];
  if (req.user && req.user.role && ROLE_KEYWORDS[req.user.role]) {
    const keywords = ROLE_KEYWORDS[req.user.role];
    const regex = new RegExp(keywords.join('|'), 'i');
    recommended = await Opportunity.find({
      reviewStatus: 'approved',
      status: 'open',
      $or: [{ skillsNeeded: regex }, { description: regex }, { title: regex }],
    })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();
  }

  res.render('index', {
    projects,
    opportunities,
    topActive,
    newOnRadar,
    recommended,
    submitted: req.query.submitted === '1',
    activeType: typeFilter,
  });
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

// Single opportunity detail page
router.get('/opportunities/:id', async (req, res) => {
  let opportunity;
  try {
    opportunity = await Opportunity.findOne({
      _id: req.params.id,
      reviewStatus: 'approved',
    }).lean();
  } catch (err) {
    return res.status(404).render('404'); // invalid ObjectId format
  }

  if (!opportunity) return res.status(404).render('404');

  const project = opportunity.project ? await Project.findById(opportunity.project).lean() : null;

  res.render('opportunity', { opportunity, project });
});

// Submit an opportunity — form
router.get('/submit', requireAuth, (req, res) => {
  res.render('submit', { error: null });
});

router.post('/submit', requireAuth, async (req, res) => {
  try {
    const { title, projectName, type, skillsNeeded, description, reward, stacksRelevance, applyUrl, deadline } = req.body;

    if (!stacksRelevance || !stacksRelevance.trim()) {
      return res.render('submit', { error: 'Please explain why this opportunity is relevant to Stacks.' });
    }

    await Opportunity.create({
      title,
      projectName,
      type,
      skillsNeeded: skillsNeeded ? skillsNeeded.split(',').map((s) => s.trim()).filter(Boolean) : [],
      description,
      reward,
      stacksRelevance,
      applyUrl,
      deadline: deadline || null,
      submittedBy: req.user.username,
      submittedByUser: req.user._id,
      reviewStatus: 'pending',
    });

    res.redirect('/?submitted=1');
  } catch (err) {
    res.render('submit', { error: 'Something went wrong — check your fields and try again.' });
  }
});

module.exports = router;
