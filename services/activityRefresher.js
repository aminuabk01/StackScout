const cron = require('node-cron');
const Project = require('../models/Project');
const { buildActivitySnapshot } = require('./hiroApi');

async function refreshAllProjects() {
  const projects = await Project.find({ contractId: { $ne: null } });

  for (const project of projects) {
    try {
      const snapshot = await buildActivitySnapshot(project.contractId);
      project.activity = {
        txCount24h: snapshot.txCount24h,
        txCountTotal: snapshot.txCountTotal,
        lastTxTimestamp: snapshot.lastTxTimestamp,
        fetchedAt: snapshot.fetchedAt,
      };
      project.activityLevel = snapshot.activityLevel;
      await project.save();
      console.log(`[activity] refreshed ${project.name} -> ${snapshot.activityLevel}`);
    } catch (err) {
      console.error(`[activity] failed for ${project.name}:`, err.message);
    }
  }
}

// Runs every 30 minutes. Adjust to your Hiro API rate limit tier.
function startActivityRefresher() {
  cron.schedule('*/30 * * * *', refreshAllProjects);
  // Also run once on boot so the site isn't empty on first load.
  refreshAllProjects();
}

module.exports = { startActivityRefresher, refreshAllProjects };
