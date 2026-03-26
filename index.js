const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const FIREBASE_PROJECT = 'crm-kurumsal';
const FIREBASE_KEY = process.env.FIREBASE_KEY; // Railway'e eklenecek

// ── FIREBASE YARDIMCI ──
async function fbGet(path) {
  const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents/${path}?key=${FIREBASE_KEY}`;
  const r = await fetch(url);
  return r.json();
}

async function fbSet(collection, docId, fields) {
  const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents/${collection}/${docId}?key=${FIREBASE_KEY}`;
  const body = { fields: {} };
  for (const [k, v] of Object.entries(fields)) {
    if (typeof v === 'string') body.fields[k] = { stringValue: v };
    else if (typeof v === 'number') body.fields[k] = { integerValue: v };
    else if (Array.isArray(v)) body.fields[k] = { arrayValue: { values: v.map(s => ({ stringValue: s })) } };
  }
  const r = await fetch(url, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return r.json();
}

async function fbQuery(collection, filters = []) {
  const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents:runQuery?key=${FIREBASE_KEY}`;
  const body = {
    structuredQuery: {
      from: [{ collectionId: collection }],
      where: filters.length ? {
        compositeFilter: {
          op: 'AND',
          filters: filters.map(f => ({
            fieldFilter: { field: { fieldPath: f.field }, op: f.op, value: { [f.type]: f.value } }
          }))
        }
      } : undefined,
      orderBy: [{ field: { fieldPath: 'savedAt' }, direction: 'DESCENDING' }],
      limit: 200
    }
  };
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return r.json();
}

async function fbDelete(name) {
  const url = `https://firestore.googleapis.com/v1/${name}?key=${FIREBASE_KEY}`;
  await fetch(url, { method: 'DELETE' });
}

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

// ── TECHSWIPE: ETİKET ──
app.post('/api/tag', async (req, res) => {
  const { title } = req.body;
  if (!title) return res.json({ tags: [] });
  if (!ANTHROPIC_API_KEY) return res.json({ tags: [] });
  try {
    const system = `Sen bir teknoloji haberi sınıflandırıcısısın. Verilen haber başlığına göre aşağıdaki etiketlerden hangilerinin uygun olduğuna karar ver.

Etiketler: Samsung, LG, Sony, Apple, Xiaomi, Philips, TCL, Grundig, Thomson, Peak, Anker, Baseus, TTech, Huawei, Powerbank, Kulaklık, Mobil, TV, Laptop, Yapay Zeka

Kurallar:
- Sadece haberin ANA konusuyla ilgili etiketleri seç
- Haber başlığında açıkça geçen veya ana konu olan marka/kategoriyi seç
- Başlıkta geçmese bile haberin özü o konuysa seç
- Alakasız etiket koyma, az ama doğru ol
- SADECE JSON dizi döndür: ["Etiket1", "Etiket2"]
- Hiç uygun yoksa boş dizi: []`;
    let result = await callClaude(system, title, 100);
    // Markdown, açıklama vs temizle — sadece JSON array al
    result = result.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    // JSON array'i bul
    const match = result.match(/\[.*?\]/s);
    if (!match) { res.json({ tags: [] }); return; }
    const tags = JSON.parse(match[0]);
    res.json({ tags: Array.isArray(tags) ? tags : [] });
  } catch (err) {
    console.error('Tag error:', err.message);
    res.json({ tags: [] });
  }
});

// ── TECHSWIPE: HABERLERİ KAYDET ──
app.post('/api/news/save', async (req, res) => {
  const { items } = req.body;
  if (!items || !items.length) return res.status(400).json({ error: 'items gerekli' });
  if (!FIREBASE_KEY) return res.status(500).json({ error: 'Firebase key eksik' });

  let saved = 0, skipped = 0;
  for (const item of items) {
    // Link'ten benzersiz ID üret
    const id = Buffer.from(item.link).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 50);
    try {
      // Zaten var mı kontrol et
      const existing = await fbGet(`techswipe_news/${id}`);
      if (existing.fields) { skipped++; continue; }

      await fbSet('techswipe_news', id, {
        title: item.title || '',
        link: item.link || '',
        description: item.description || '',
        source: item.source || '',
        sourceLang: item.sourceLang || 'tr',
        sourceColor: item.sourceColor || '#888',
        tags: item.tags || [],
        pubDate: item.pubDate || '',
        savedAt: Date.now()
      });
      saved++;
    } catch (e) {
      console.error('Save error:', e.message);
    }
  }

  // 7 günden eski haberleri temizle
  try {
    const cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const old = await fbQuery('techswipe_news', [
      { field: 'savedAt', op: 'LESS_THAN', type: 'integerValue', value: cutoff }
    ]);
    if (Array.isArray(old)) {
      for (const doc of old) {
        if (doc.document?.name) await fbDelete(doc.document.name);
      }
    }
  } catch (e) {
    console.error('Cleanup error:', e.message);
  }

  res.json({ saved, skipped });
});

// ── TECHSWIPE: HABERLERİ GETİR ──
app.get('/api/news', async (req, res) => {
  if (!FIREBASE_KEY) return res.status(500).json({ error: 'Firebase key eksik' });
  const { days = 7 } = req.query;

  try {
    const cutoff = Date.now() - (parseInt(days) * 24 * 60 * 60 * 1000);
    const result = await fbQuery('techswipe_news', [
      { field: 'savedAt', op: 'GREATER_THAN', type: 'integerValue', value: cutoff }
    ]);

    const items = [];
    if (Array.isArray(result)) {
      for (const doc of result) {
        if (!doc.document?.fields) continue;
        const f = doc.document.fields;
        items.push({
          title: f.title?.stringValue || '',
          link: f.link?.stringValue || '',
          description: f.description?.stringValue || '',
          source: f.source?.stringValue || '',
          sourceLang: f.sourceLang?.stringValue || 'tr',
          sourceColor: f.sourceColor?.stringValue || '#888',
          tags: f.tags?.arrayValue?.values?.map(v => v.stringValue) || [],
          pubDate: f.pubDate?.stringValue || '',
          savedAt: parseInt(f.savedAt?.integerValue || 0)
        });
      }
    }

    items.sort((a, b) => b.savedAt - a.savedAt);
    res.json({ items });
  } catch (err) {
    console.error('News fetch error:', err.message);
    res.status(500).json({ error: 'Haberler alinamadi' });
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
app.get('/health', (req, res) => res.json({ status: 'ok', key: ANTHROPIC_API_KEY ? 'var' : 'YOK', firebase: FIREBASE_KEY ? 'var' : 'YOK' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Kobar backend port ${PORT}'de calisiyor`));

