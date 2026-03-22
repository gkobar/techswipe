const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// ── RSS PROXY ──
app.get('/api/rss', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL gerekli' });
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TechSwipe RSS Reader)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*'
      },
      timeout: 10000
    });
    const xml = await response.text();
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.send(xml);
  } catch (err) {
    res.status(500).json({ error: 'RSS alinamadi', detail: err.message });
  }
});

// ── TRANSLATE ──
app.post('/api/translate', async (req, res) => {
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ error: 'Baslik gerekli' });
  if (!ANTHROPIC_API_KEY) return res.status(500).json({ error: 'API key eksik' });
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: `Teknoloji haberini Türkçeye çevir. Sadece JSON formatında yanıt ver, başka hiçbir şey yazma:\n{"title":"çevrilmiş başlık","description":"çevrilmiş açıklama (max 2 cümle)"}\n\nBaşlık: ${title}\nAçıklama: ${description || ''}`
        }]
      })
    });
    const data = await response.json();
    const text = data.content[0].text.trim();
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: 'Ceviri basarisiz' });
  }
});

// ── HEALTH ──
app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`TechSwipe backend port ${PORT}'de calisiyor`));
