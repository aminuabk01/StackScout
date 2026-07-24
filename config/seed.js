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
    contractId: null, // fill in with the real deployed contract principal for live tracking
  },
  {
    name: 'BitFlow',
    slug: 'bitflow',
    category: 'DeFi',
    description: 'A decentralized exchange for Bitcoiners, enabling swaps across Stacks-based assets.',
    websiteUrl: 'https://www.bitflow.finance/',
    contractId: null,
  },
  {
    name: 'Alex',
    slug: 'alex',
    category: 'DeFi',
    description: 'An autonomous Bitcoin liquidity protocol for liquidity providers, borrowers, and liquidators.',
    githubUrl: 'https://github.com/alexgo-io',
    websiteUrl: 'https://alexgo.io/',
    contractId: null,
  },
  {
    name: 'Stacking DAO',
    slug: 'stacking-dao',
    category: 'DeFi',
    description: 'Liquidity for stacked STX tokens on Stacks.',
    websiteUrl: 'https://stackingdao.com/',
    contractId: null,
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
