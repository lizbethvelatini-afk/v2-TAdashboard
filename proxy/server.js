const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();

app.use(cors({
  origin: '*'
}));;

const GH_KEY = process.env.GREENHOUSE_API_KEY;
const BASE = 'https://harvest.greenhouse.io/v1';

function authHeader() {
  return 'Basic ' + Buffer.from(GH_KEY + ':').toString('base64');
}

async function fetchAll(path) {
  let results = [], page = 1;
  while (true) {
    const r = await fetch(`${BASE}${path}${path.includes('?') ? '&' : '?'}per_page=500&page=${page}`, {
      headers: { 'Authorization': authHeader() }
    });
    const data = await r.json();
    if (!Array.isArray(data) || data.length === 0) break;
    results = results.concat(data);
    if (data.length < 500) break;
    page++;
  }
  return results;
}

app.get('/api/jobs', async (req, res) => {
  try {
    const data = await fetchAll('/jobs?status=open');
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/applications', async (req, res) => {
  try {
    const data = await fetchAll('/applications');
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/offers', async (req, res) => {
  try {
    const data = await fetchAll('/offers');
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/candidates', async (req, res) => {
  try {
    const data = await fetchAll('/candidates');
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
