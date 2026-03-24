const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// ── ORTAK CLAUDE ÇAĞRISI ──
async function callClaude(system, userContent, maxTokens = 300) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: userContent }]
    })
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  if (!data.content?.[0]) throw new Error('Beklenmeyen yanit');
  return data.content[0].text.trim();
}

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

// ── TECHSWIPE: TRANSLATE ──
app.post('/api/translate', async (req, res) => {
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ error: 'Baslik gerekli' });
  if (!ANTHROPIC_API_KEY) return res.status(500).json({ error: 'API key eksik' });
  try {
    const system = 'Teknoloji haberini Türkçeye çevir. Sadece JSON formatında yanıt ver, markdown kullanma.';
    const userContent = `{"title":"çevrilmiş başlık","description":"çevrilmiş açıklama (max 2 cümle)"}\n\nBaşlık: ${title}\nAçıklama: ${description || ''}`;
    let text = await callClaude(system, userContent, 300);
    text = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    res.json(JSON.parse(text));
  } catch (err) {
    console.error('Translate error:', err.message);
    res.status(500).json({ error: 'Ceviri basarisiz', detail: err.message });
  }
});

// ── BRAINBOX: SINIFLANDIR ──
app.post('/api/classify', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Metin gerekli' });
  if (!ANTHROPIC_API_KEY) return res.status(500).json({ error: 'API key eksik' });
  try {
    const system = `Brain dump ayıklayıcısı. SADECE JSON döndür.
{"category":"fikir|yapilacak|ilginc|takip|diger","summary":"1 cümle Türkçe özet","actions":["eylem1","eylem2"]}
fikir=uygulama/bot/fikir, yapilacak=todo/görev, ilginc=kaydetmek istenen, takip=izlenecek/beklenen, diger=diğer. actions max 2, çok kısa.`;
    let result = await callClaude(system, text, 300);
    result = result.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    res.json(JSON.parse(result));
  } catch (err) {
    console.error('Classify error:', err.message);
    res.status(500).json({ error: 'Siniflandirma basarisiz', detail: err.message });
  }
});

// ── BRAINBOX: GÜNLÜK ÖZET ──
app.post('/api/digest', async (req, res) => {
  const { notes } = req.body;
  if (!notes || !notes.length) return res.status(400).json({ error: 'Notlar gerekli' });
  if (!ANTHROPIC_API_KEY) return res.status(500).json({ error: 'API key eksik' });
  try {
    const system = 'Kullanıcının brain dump notlarını Türkçe, kısa ve akıcı özetle. Kategorilere göre grupla, en önemli fikirleri ve öncelikli görevleri öne çıkar. Madde işareti kullanma, paragraf yaz. Maksimum 120 kelime.';
    const dump = notes.map(n => `[${n.cat || '?'}] ${n.text}`).join('\n');
    const result = await callClaude(system, dump, 500);
    res.json({ summary: result });
  } catch (err) {
    console.error('Digest error:', err.message);
    res.status(500).json({ error: 'Ozet basarisiz', detail: err.message });
  }
});

// ── HEALTH ──
app.get('/health', (req, res) => res.json({ status: 'ok', key: ANTHROPIC_API_KEY ? 'var' : 'YOK' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Kobar backend port ${PORT}'de calisiyor`));
