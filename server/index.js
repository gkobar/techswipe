const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// RSS proxy endpoint
app.get('/api/rss', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL gerekli' });

  try {
    const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}&api_key=free&count=20`;
    const response = await fetch(proxyUrl);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'RSS alınamadı' });
  }
});

// Çeviri endpoint
app.post('/api/translate', async (req, res) => {
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ error: 'Başlık gerekli' });

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
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: `Aşağıdaki teknoloji haberini Türkçeye çevir. Sadece JSON formatında yanıt ver, başka hiçbir şey yazma:
{"title": "çevrilmiş başlık", "description": "çevrilmiş açıklama (max 2 cümle)"}

Başlık: ${title}
Açıklama: ${description || ''}`
        }]
      })
    });

    const data = await response.json();
    const text = data.content[0].text.trim();
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: 'Çeviri başarısız' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`TechSwipe backend port ${PORT}'de çalışıyor`));

