# StackScout

Discover where to build, contribute, and grow within the Stacks ecosystem.

StackScout tracks live on-chain activity for Stacks projects (via the Hiro
Stacks Blockchain API) and pairs it with open opportunities — jobs, bounties,
grants, and contribution requests — so builders can see not just what
projects exist, but which ones are actually active right now.

## Stack

- Node.js + Express
- MongoDB + Mongoose
- EJS templates
- node-cron for periodic on-chain activity refresh
- Hiro Stacks Blockchain API (`api.hiro.so`) for on-chain data

## Project structure

```
stackscout/
  server.js                 # app entry point
  models/
    Project.js               # tracked project + cached activity snapshot
    Opportunity.js            # job/bounty/grant/contribution listing
  routes/
    pages.js                 # HTML pages (home, project detail, submit form)
    api.js                    # JSON API (projects, opportunities, manual refresh)
  services/
    hiroApi.js                # Hiro API client + activity snapshot logic
    activityRefresher.js      # cron job that refreshes cached activity
  views/                     # EJS templates
  public/css/style.css        # design system
  config/seed.js              # demo data for projects + opportunities
```

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Copy the environment file and fill in your values:
   ```
   cp .env.example .env
   ```
   - `MONGO_URI` — your MongoDB connection string (local or Atlas)
   - `HIRO_API_KEY` — optional, but recommended for higher rate limits
     (get one at https://www.hiro.so/)
   - `TRACKED_CONTRACTS` — comma-separated Stacks contract principals you
     want StackScout to track (used as a reference; wire actual contract
     IDs into `config/seed.js` per project for live tracking)

3. Seed demo data (project + opportunity listings for the demo):
   ```
   npm run seed
   ```

4. Start the server:
   ```
   npm start
   ```
   or with auto-reload during development:
   ```
   npm run dev
   ```

5. Visit `http://localhost:3000`

## How live activity tracking works

- Each `Project` document can have a `contractId` (a Stacks contract
  principal, e.g. `SP2C2...ZR.arkadiko-token`).
- On boot, and every 30 minutes via `node-cron`, `activityRefresher.js`
  pulls recent transactions for each tracked contract from the Hiro API
  and derives a simple activity level: `high`, `growing`, `steady`, or
  `quiet`, based on transaction count in the last 24 hours.
- If a project has no `contractId` set, it shows as "not yet tracked" —
  useful for projects you've added manually before wiring up their
  on-chain address.
- You can trigger a manual refresh (handy right before a demo) by hitting:
  ```
  POST /api/refresh-activity
  ```

## What's next (post-MVP)

- Builder/contributor profiles pulled from address activity
- GitHub activity signal layered alongside on-chain activity
- Opportunity moderation queue (the `approved` field on `Opportunity` is
  already there, just defaulted to `true` for the demo)
- Chainhooks for real-time "new contract deployed" notifications instead
  of polling
