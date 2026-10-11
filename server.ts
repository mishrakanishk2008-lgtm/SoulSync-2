import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(apiKey),
    timestamp: new Date().toISOString(),
  });
});

// Spotify OAuth Callback Route Handler
app.get(['/auth/callback/spotify', '/auth/callback/spotify/'], (req, res) => {
  const code = req.query.code || '';
  const error = req.query.error || '';

  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Spotify Authentication - SoulSync</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #0f172a; color: #fff; }
          .card { text-align: center; padding: 2.5rem; background: #1e293b; border-radius: 1.5rem; box-shadow: 0 20px 40px rgba(0,0,0,0.5); max-w: 380px; }
          h2 { color: #1db954; margin-top: 0; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>🎶 Spotify Connected!</h2>
          <p>Sending authorization to SoulSync...</p>
          <script>
            try {
              if (window.opener) {
                window.opener.postMessage({ type: 'SPOTIFY_OAUTH_CODE', code: '${code}', error: '${error}' }, '*');
                setTimeout(() => { window.close(); }, 600);
              } else {
                window.location.href = '/?spotify_code=' + encodeURIComponent('${code}');
              }
            } catch (e) {
              window.close();
            }
          </script>
        </div>
      </body>
    </html>
  `);
});

// AI Date Idea Generator
app.post('/api/gemini/date-ideas', async (req, res) => {
  const {
    mood = 'Cozy & Relaxed',
    budget = '$$',
    time = 'Evening (2-3 hrs)',
    partner1Name = 'Partner 1',
    partner2Name = 'Partner 2',
    excludeTitles = [],
  } = req.body;

  if (ai) {
    try {
      const prompt = `You are a warm, thoughtful romantic relationship coach for ${partner1Name} and ${partner2Name}.
Create 3 distinct, creative, and memorable date plans tailored for them:
- Mood: ${mood}
- Budget: ${budget}
- Available Time: ${time}
- Previous suggestions to AVOID repeating: ${excludeTitles.join(', ') || 'None'}

Return a JSON array of exactly 3 date ideas. Each object must have:
- title: cute, catchy date title
- vibe: 2-4 word mood descriptor (e.g. "Fairy Lights & Melodies", "Sweet & Playful")
- steps: array of 3-4 sequential fun activities or milestones during the date
- budgetEstimate: short budget description (e.g. "Under $25 total", "Free & Cozy")
- prepTip: one sweet practical or romantic prep tip (e.g. "Chill two wine glasses beforehand and queue their favorite Spotify playlist")`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                vibe: { type: Type.STRING },
                steps: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                budgetEstimate: { type: Type.STRING },
                prepTip: { type: Type.STRING },
              },
              required: ['title', 'vibe', 'steps', 'budgetEstimate', 'prepTip'],
            },
          },
        },
      });

      const text = response.text?.trim();
      if (text) {
        const parsed = JSON.parse(text);
        return res.json({ ideas: parsed, source: 'gemini' });
      }
    } catch (error) {
      console.warn('Gemini API error for date ideas, falling back to curated suggestions:', error);
    }
  }

  // Graceful fallback suggestions tailored to mood & budget
  const fallbackBank = [
    {
      title: 'Blanket Fort Cinema & Gourmet Hot Cocoa',
      vibe: 'Warm Glow & Snuggles',
      steps: [
        'Assemble a giant pillow & fairy light blanket fort in the living room',
        'Whip up rich stovetop hot chocolate with toasted mini marshmallows',
        'Watch a nostalgic movie you both loved as kids with zero phone screens',
      ],
      budgetEstimate: 'Under $15',
      prepTip: 'Put fluffy socks and blankets in the dryer for 10 minutes right before you climb in.',
    },
    {
      title: 'Glow-in-the-Dark Living Room Picnic',
      vibe: 'Dreamy & Whimsical',
      steps: [
        'Spread your best picnic quilt on the floor with tea candles and fairy lights',
        'Craft a custom charcuterie board featuring both of your favorite cheeses and grapes',
        'Take turns asking each other 10 deep conversation cards or throwback questions',
      ],
      budgetEstimate: '$20 - $30',
      prepTip: 'Light a vanilla or sandalwood candle 20 minutes before to set the cozy ambience.',
    },
    {
      title: 'Golden Hour Photo Stroll & Pastry Hunt',
      vibe: 'Sweet, Sunlit & Tender',
      steps: [
        'Wander down a quiet local street or park 45 minutes before sunset',
        'Snap disposable-style candid photos of each other laughing',
        'Pick up fresh warm pastries or croissants to share on a park bench',
      ],
      budgetEstimate: '$10 - $20',
      prepTip: 'Bring an instant or phone camera and set a rule: only candid snaps of smiles!',
    },
    {
      title: 'Cook-Off Challenge: The $15 Mystery Ingredient',
      vibe: 'Playful & Deliciously Competitive',
      steps: [
        'Visit a local grocery market with a $15 shared budget',
        'Each partner picks one surprise quirky ingredient the other must incorporate',
        'Team up in the kitchen with upbeat music and plate your culinary masterpiece',
      ],
      budgetEstimate: '$15 - $25',
      prepTip: 'Have an apron ready and pick an energetic cooking playlist together.',
    },
    {
      title: 'Midnight Stargazing & Acoustic Melodies',
      vibe: 'Quiet Starlight & Soul Whispers',
      steps: [
        'Drive or walk to a quiet spot with open sky views away from city glow',
        'Share a single thermal mug of chamomile tea or cider under a heavy duvet',
        'Listen to an acoustic playlist while pointing out constellations and dreaming together',
      ],
      budgetEstimate: 'Free & Priceless',
      prepTip: 'Download an offline stargazing map app so you can spot celestial wonders.',
    },
  ];

  // Filter out any recently excluded titles if possible
  const filtered = fallbackBank.filter(item => !excludeTitles.includes(item.title));
  const selection = (filtered.length >= 3 ? filtered : fallbackBank).slice(0, 3);
  res.json({ ideas: selection, source: 'curated' });
});

// AI Quote Background Theme Generator
app.post('/api/gemini/background-theme', async (req, res) => {
  const { quote, theme, person } = req.body;

  if (ai) {
    try {
      const prompt = `Design an abstract gradient background that matches the following quote: "${quote}". 
Theme: ${theme}. Person: ${person}.
For Taylor Swift quotes, lean toward soft, dreamy, "eras"-inspired palettes (rose gold, lavender, cream, midnight blue, sparkle). 
For Ronaldo quotes, lean toward bold, high-energy palettes (deep red, black, gold, white) with sporty patterns.
Return ONLY a JSON object: 
{ "mood": "...", "palette": ["#hex","#hex","#hex"], "angle": 0-360, "pattern": "none|sparkles|stars|motion-lines|waves|bokeh|grain|diagonal-stripes", "textColor": "#hex", "emoji": "✨" }
No extra text or Markdown.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const text = response.text?.trim()?.replace(/```json/g, '')?.replace(/```/g, '');
      const json = JSON.parse(text || '{}');
      res.json(json);
    } catch (error) {
      console.error('Background generation error:', error);
      res.status(500).json({ error: 'Failed to generate background' });
    }
  } else {
    res.status(500).json({ error: 'AI not configured' });
  }
});

// AI Romantic Note Polisher
app.post('/api/gemini/polish-note', async (req, res) => {
  const {
    draft = '',
    tone = 'Poetic',
    senderName = 'Me',
    recipientName = 'My Love',
  } = req.body;

  if (!draft.trim()) {
    return res.status(400).json({ error: 'Please provide a draft note to polish.' });
  }

  if (ai) {
    try {
      const tonePrompts: Record<string, string> = {
        Poetic: 'Lyrical, deeply heartfelt, evocative imagery, gentle romantic cadence without sounding cheesy or archaic.',
        Funny: 'Charming, playfully teasing, witty, warm humor with authentic romance and smiles.',
        'Formal-cute': 'Endearing, respectful, adorably polite like a royal love letter or sweet vintage courtship note.',
        'Short & Sweet': 'Concise, punchy, packed with pure adoration, easy to read in 5 seconds with a big heart-flutter.',
      };

      const toneGuidance = tonePrompts[tone] || tonePrompts['Poetic'];

      const prompt = `You are polishing a private romantic love note from ${senderName} to ${recipientName}.
Draft provided by ${senderName}:
"${draft}"

Style tone required: ${tone} (${toneGuidance})

Rewrite the note so it feels authentic, warm, and deeply touching for a private couple dashboard.
Keep it between 1 and 4 sentences (or a short couplet if Poetic). Do not add preamble or quotation marks. Return only the polished love note.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const text = response.text?.trim();
      if (text) {
        return res.json({ polishedNote: text.replace(/^"|"$/g, ''), source: 'gemini' });
      }
    } catch (error) {
      console.warn('Gemini API error for polish note, falling back:', error);
    }
  }

  // Graceful fallback transformation based on tone
  let fallback = draft.trim();
  if (tone === 'Poetic') {
    fallback = `Every quiet second with you feels like home. ${draft.trim()} You are my favorite heartbeat.`;
  } else if (tone === 'Funny') {
    fallback = `Just a daily reminder: ${draft.trim()} Also, 10/10 would choose you over extra fries every single time. ❤️`;
  } else if (tone === 'Formal-cute') {
    fallback = `Dearest ${recipientName}, I hereby present this official proclamation: ${draft.trim()} Yours unconditionally and forever.`;
  } else {
    fallback = `${draft.trim()} ❤️ Always you, always us.`;
  }

  res.json({ polishedNote: fallback, source: 'curated' });
});

// AI Quote Theme Generator
app.post('/api/gemini/quote-theme', async (req, res) => {
  const { quoteText, person, theme } = req.body;

  if (ai) {
    try {
      const prompt = `Design an abstract gradient and pattern background theme for this quote by ${person} (Theme: ${theme}):
Quote: "${quoteText}"

Rules:
- Abstract gradient backgrounds only. No people, faces, logos, or copyrighted artwork.
- For Taylor Swift quotes: lean toward soft, dreamy, eras-inspired palettes (rose gold, lavender, cream, midnight blue, sparkle).
- For Ronaldo quotes: lean toward bold, high-energy palettes (deep red, black, gold, white) with sporty or sharp patterns.
- Match palette to the quote's theme and emotion.
- Return ONLY valid JSON, with no markdown fences, matching this exact schema:
{
  "mood": "string (short description)",
  "palette": ["#hex", "#hex", "#hex"],
  "angle": number (0-360),
  "pattern": "none|sparkles|stars|motion-lines|waves|bokeh|grain|diagonal-stripes",
  "textColor": "#hex",
  "emoji": "string (single emoji symbol)"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              mood: { type: Type.STRING },
              palette: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              angle: { type: Type.NUMBER },
              pattern: { type: Type.STRING },
              textColor: { type: Type.STRING },
              emoji: { type: Type.STRING },
            },
            required: ['mood', 'palette', 'angle', 'pattern', 'textColor', 'emoji'],
          },
        },
      });

      const text = response.text?.trim();
      if (text) {
        const json = JSON.parse(text);
        return res.json({ theme: json, source: 'gemini' });
      }
    } catch (err) {
      console.warn('Gemini error for quote theme, using fallback:', err);
    }
  }

  // Graceful fallback preset themes
  const fallbackThemes = person === 'Taylor Swift' ? [
    { mood: 'Dreamy Eras Glow', palette: ['#fbcfe8', '#f472b6', '#db2777'], angle: 135, pattern: 'sparkles', textColor: '#831843', emoji: '✨' },
    { mood: 'Midnight Lavender', palette: ['#ede9fe', '#c4b5fd', '#8b5cf6'], angle: 45, pattern: 'stars', textColor: '#3b0764', emoji: '🌙' },
    { mood: 'Golden String', palette: ['#fef3c7', '#fde68a', '#f59e0b'], angle: 90, pattern: 'bokeh', textColor: '#78350f', emoji: '🌟' }
  ] : [
    { mood: 'Relentless Drive', palette: ['#991b1b', '#7f1d1d', '#18181b'], angle: 120, pattern: 'motion-lines', textColor: '#ffffff', emoji: '⚡' },
    { mood: 'Champion Gold', palette: ['#18181b', '#27272a', '#d97706'], angle: 180, pattern: 'diagonal-stripes', textColor: '#fef3c7', emoji: '🏆' },
    { mood: 'Victory Focus', palette: ['#dc2626', '#b91c1c', '#09090b'], angle: 45, pattern: 'waves', textColor: '#ffffff', emoji: '🔥' }
  ];

  const chosen = fallbackThemes[Math.floor(Math.random() * fallbackThemes.length)];
  res.json({ theme: chosen, source: 'fallback' });
});

// Setup Vite in Dev or Static files in Prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SoulSync server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();

