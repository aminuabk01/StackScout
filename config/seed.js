require('dotenv').config();
const mongoose = require('mongoose');
const Project = require('../models/Project');
const Opportunity = require('../models/Opportunity');

const projects = [
  {
    name: 'Zest Protocol',
    slug: 'zest-protocol',
    category: 'DeFi',
    description: 'A lending protocol built for Bitcoin, letting users borrow and lend against BTC-backed collateral.',
    githubUrl: 'https://github.com/Zest-Protocol/zest-contracts',
    websiteUrl: 'https://app.zestprotocol.com',
    contractId: 'SP1A27KFY4XERQCCRCARCYD1CC5N7M6688BSYADJ7.zest-token', // fill in with the real deployed contract principal for live tracking
  },
  {
    name: 'BitFlow',
    slug: 'bitflow',
    category: 'DeFi',
    description: 'A decentralized exchange for Bitcoiners, enabling swaps across Stacks-based assets.',
    websiteUrl: 'https://www.bitflow.finance/',
    contractId: 'SP2PPPT2R6S1G8VF2HQ3AHVGPH0XQQ68J4QV39AA6.bitflow',
  },
  {
    name: 'Alex',
    slug: 'alex',
    category: 'DeFi',
    description: 'An autonomous Bitcoin liquidity protocol for liquidity providers, borrowers, and liquidators.',
    githubUrl: 'https://github.com/alexgo-io',
    websiteUrl: 'https://alexgo.io/',
    contractId: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.age000-governance-token',
  },
  {
    name: 'Stacking DAO',
    slug: 'stacking-dao',
    category: 'DeFi',
    description: 'Liquidity for stacked STX tokens on Stacks.',
    websiteUrl: 'https://stackingdao.com/',
    contractId: 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.stacking-dao-core-v6',
  },
];

const opportunities = [
  {
    title: 'Frontend contributor needed',
    projectName: 'Zest Protocol',
    type: 'Contribution',
    skillsNeeded: ['React', 'TypeScript'],
    description: 'Help build out lending dashboard UI components.',
    applyUrl: 'https://github.com/Zest-Protocol/zest-contracts/issues',
  },
  {
    title: 'Clarity smart contract auditor (bounty)',
    projectName: 'Alex',
    type: 'Bounty',
    skillsNeeded: ['Clarity', 'Security'],
    description: 'Review a new liquidity pool contract before mainnet deploy.',
    applyUrl: 'https://alexgo.io/',
  },
  {
    title: 'Ecosystem grant: DeFi tooling',
    projectName: 'Stacks Ecosystem',
    type: 'Grant',
    skillsNeeded: ['Any'],
    description: 'Open grant round for builders creating public DeFi tooling on Stacks.',
    applyUrl: 'https://stacksendowment.co/grants',
  },
  {
    title: 'DeGrants Cohort 4 — Community Grants (closes July 26!)',
    projectName: 'Stacks Ecosystem',
    type: 'Grant',
    skillsNeeded: ['Any'],
    description: 'Community-led grants funding culture, education, adoption, and engagement projects across Stacks. Up to $5,000 in STX. Applications close Sunday, July 26.',
    applyUrl: 'https://stacksendowment.co/blog/degrants-cohort-4-now-open',
    deadline: '2026-07-26',
  },
  {
    title: 'Builder Grants — Quarterly Funding',
    projectName: 'Stacks Ecosystem',
    type: 'Grant',
    skillsNeeded: ['Any'],
    description: 'For teams with proven traction — rewards measurable impact on TVL growth, transaction volume, and infrastructure. $10,000–$50,000 in STX.',
    applyUrl: 'https://stacksendowment.co/grants',
  },
  {
    title: 'Bug Bounty — Security Vulnerability Disclosure',
    projectName: 'Stacks Ecosystem',
    type: 'Bounty',
    skillsNeeded: ['Security', 'Clarity'],
    description: 'Earn bounties for discovering and responsibly disclosing bugs and vulnerabilities via Immunefi.',
    applyUrl: 'https://stacks.org/grants',
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Seeding...');

  await Project.deleteMany({});
  await Opportunity.deleteMany({});

  const createdProjects = await Project.insertMany(projects);
  const nameToId = Object.fromEntries(createdProjects.map((p) => [p.name, p._id]));

  const opportunitiesWithRefs = opportunities.map((o) => ({
    ...o,
    project: nameToId[o.projectName] || null,
  }));
  await Opportunity.insertMany(opportunitiesWithRefs);

  console.log(`Seeded ${createdProjects.length} projects and ${opportunitiesWithRefs.length} opportunities.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
