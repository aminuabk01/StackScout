const axios = require('axios');

const BASE_URL = process.env.HIRO_API_BASE || 'https://api.hiro.so';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: process.env.HIRO_API_KEY ? { 'x-api-key': process.env.HIRO_API_KEY } : {},
});

/**
 * Fetch recent transactions for a given contract (as the tx_events / address txs endpoint).
 * Docs: GET /extended/v1/address/{principal}/transactions
 */
async function getContractTransactions(contractId, limit = 50) {
  const { data } = await client.get(`/extended/v1/address/${contractId}/transactions`, {
    params: { limit },
  });
  return data; // { limit, offset, total, results: [...] }
}

/**
 * Fetch basic account/contract balance + tx count info.
 * Docs: GET /extended/v1/address/{principal}/balances
 */
async function getAddressBalances(principal) {
  const { data } = await client.get(`/extended/v1/address/${principal}/balances`);
  return data;
}

/**
 * Derive a simple activity snapshot for a tracked contract from its recent tx history.
 * This is intentionally simple for the MVP — count txs in the last 24h vs. total available.
 */
async function buildActivitySnapshot(contractId) {
  const txData = await getContractTransactions(contractId, 50);
  const results = txData.results || [];

  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;

  const txCount24h = results.filter((tx) => {
    const ts = tx.burn_block_time ? tx.burn_block_time * 1000 : null;
    return ts && now - ts <= oneDayMs;
  }).length;

  const lastTx = results[0];
  const lastTxTimestamp = lastTx && lastTx.burn_block_time ? new Date(lastTx.burn_block_time * 1000) : null;

  let activityLevel = 'unknown';
  if (txCount24h >= 20) activityLevel = 'high';
  else if (txCount24h >= 5) activityLevel = 'growing';
  else if (txCount24h >= 1) activityLevel = 'steady';
  else activityLevel = 'quiet';

  return {
    txCount24h,
    txCountTotal: txData.total || results.length,
    lastTxTimestamp,
    fetchedAt: new Date(),
    activityLevel,
  };
}

module.exports = {
  getContractTransactions,
  getAddressBalances,
  buildActivitySnapshot,
};
