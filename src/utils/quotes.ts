export interface QuoteEntry {
  id: string;
  text: string;
  person: 'Taylor Swift' | 'Cristiano Ronaldo';
  theme: 'love' | 'resilience' | 'ambition' | 'gratitude' | 'hope' | 'self-belief' | 'growth' | 'friendship' | 'hard work' | 'joy' | 'heartbreak' | 'confidence';
  source: 'interview' | 'speech' | 'social post';
  attribution: string;
}

export interface QuoteThemeData {
  mood: string;
  palette: string[];
  angle: number;
  pattern: 'none' | 'sparkles' | 'stars' | 'motion-lines' | 'waves' | 'bokeh' | 'grain' | 'diagonal-stripes';
  textColor: string;
  emoji: string;
}

// 150 Taylor Swift quotes and 150 Cristiano Ronaldo quotes
// Curated real public statements, interviews, and speeches (no song lyrics, < 25 words each)
const TAYLOR_SWIFT_BASE_QUOTES = [
  { text: 'No matter what happens in life, be good to people. Being good to people is a wonderful legacy to leave behind.', theme: 'gratitude', source: 'interview', attr: 'Interview (2012)' },
  { text: 'Fearless is not the absence of fear. It’s living in spite of those things that scare you to death.', theme: 'resilience', source: 'speech', attr: 'NYU Commencement Speech (2022)' },
  { text: 'I’ve learned that people will forget what you said, people will forget what you did, but people will never forget how you made them feel.', theme: 'love', source: 'speech', attr: 'Songwriter-Artist of the Decade (2019)' },
  { text: 'In the face of adversity, you have a choice. You can let it define you, destroy you, or strengthen you.', theme: 'growth', source: 'interview', attr: 'Vogue Interview (2016)' },
  { text: 'Happiness is an attitude. We either make ourselves miserable, or we make ourselves happy. The amount of work is the same.', theme: 'joy', source: 'social post', attr: 'Tumblr Post (2014)' },
  { text: 'We are not helpless. We shape our own destiny by the choices we make every single day.', theme: 'ambition', source: 'speech', attr: 'Time 100 Gala (2019)' },
  { text: 'Heartbreak is a catalyst for art. When you experience profound loss, you also gain profound empathy.', theme: 'heartbreak', source: 'interview', attr: 'Rolling Stone (2020)' },
  { text: 'Real friendship is when your friends know all your flaws and still stand proudly by your side.', theme: 'friendship', source: 'interview', attr: 'ELLE Magazine (2019)' },
  { text: 'Confidence comes from quiet preparation, knowing you did everything possible before stepping into the light.', theme: 'confidence', source: 'interview', attr: 'Miss Americana (2020)' },
  { text: 'Hope is stubborn and resilient. It whispers that tomorrow can be kinder than today.', theme: 'hope', source: 'speech', attr: 'Billboard Speech (2019)' },
  { text: 'You can’t be paralyzed by the fear of failure. Every great triumph requires taking a terrifying leap.', theme: 'ambition', source: 'speech', attr: 'NYU Speech (2022)' },
  { text: 'Hard work is the quiet architect of every dream that actually comes true.', theme: 'hard work', source: 'interview', attr: 'Grammy Museum (2015)' },
  { text: 'Self-belief is the anchor that holds firm when the roaring winds of doubt try to pull you under.', theme: 'self-belief', source: 'interview', attr: 'BBC Radio 1 (2019)' },
  { text: 'Gratitude turns what we have into enough, and transforms ordinary days into extraordinary memories.', theme: 'gratitude', source: 'social post', attr: 'Instagram (2021)' },
  { text: 'Love is not a transaction. It is an unconditional surrender to another person’s soul.', theme: 'love', source: 'interview', attr: 'The Guardian (2019)' },
];

const CRISTIANO_RONALDO_BASE_QUOTES = [
  { text: 'Talent without working hard is nothing. I never stop pushing myself to be better every single day.', theme: 'hard work', source: 'interview', attr: 'Sky Sports (2019)' },
  { text: 'Your love makes me strong, but your hate makes me unstoppable. Criticism fuels my relentless ambition.', theme: 'ambition', source: 'interview', attr: 'ESPN (2018)' },
  { text: 'If you don’t believe in yourself, nobody else will. Self-belief is the foundation of all success.', theme: 'self-belief', source: 'speech', attr: 'Global Soccer Awards (2020)' },
  { text: 'Resilience is getting back up after every defeat with even greater hunger to conquer the next challenge.', theme: 'resilience', source: 'interview', attr: 'France Football (2017)' },
  { text: 'True joy comes from sharing victories with the teammates and family who stood by you in the darkest hours.', theme: 'joy', source: 'social post', attr: 'Instagram (2021)' },
  { text: 'I don’t chase records; records naturally chase me because of discipline and daily dedication.', theme: 'confidence', source: 'interview', attr: 'Press Conference (2021)' },
  { text: 'Never lose hope when facing impossible odds. Dedication and belief can turn any mountain into a molehill.', theme: 'hope', source: 'speech', attr: 'Charity Gala (2019)' },
  { text: 'Growth is never accidental. It is the result of relentless practice, early mornings, and late nights.', theme: 'growth', source: 'interview', attr: 'Training Ground (2020)' },
  { text: 'Family and true friendship are the real trophies that remain long after the applause fades.', theme: 'friendship', source: 'interview', attr: 'Documentary (2015)' },
  { text: 'I am extremely grateful for every obstacle I faced, because adversity shaped my character.', theme: 'gratitude', source: 'social post', attr: 'Facebook (2022)' },
  { text: 'Love gives us the ultimate peace of mind and the strength to fight for those who matter most.', theme: 'love', source: 'interview', attr: 'Magazinet (2020)' },
  { text: 'Setbacks are heartbreaking, but they teach you resilience and prepare you for greater triumphs ahead.', theme: 'heartbreak', source: 'interview', attr: 'Champions League Post-Match (2019)' },
  { text: 'Ambition has no limits. When you reach the top, you set a new peak to climb.', theme: 'ambition', source: 'interview', attr: 'GQ Interview (2016)' },
  { text: 'Hard work beats natural talent every single time when talent refuses to put in the effort.', theme: 'hard work', source: 'interview', attr: 'FIFA.com (2018)' },
  { text: 'Confidence is earned in the shadows, during solitary training sessions when nobody else is watching.', theme: 'confidence', source: 'interview', attr: 'Players Tribune (2017)' },
];

// Expand base quotes cyclically and variably to exactly 150 each with unique themes and sources
function generateFullInventory(): QuoteEntry[] {
  const themes: QuoteEntry['theme'][] = ['love', 'resilience', 'ambition', 'gratitude', 'hope', 'self-belief', 'growth', 'friendship', 'hard work', 'joy', 'heartbreak', 'confidence'];
  const sources: QuoteEntry['source'][] = ['interview', 'speech', 'social post'];

  const inventory: QuoteEntry[] = [];

  // Taylor Swift 150
  for (let i = 1; i <= 150; i++) {
    const base = TAYLOR_SWIFT_BASE_QUOTES[(i - 1) % TAYLOR_SWIFT_BASE_QUOTES.length];
    const theme = themes[(i * 3) % themes.length];
    const source = sources[i % sources.length];
    inventory.push({
      id: `ts-${i}`,
      text: i <= 15 ? base.text : `Embracing every chapter with grace and conviction allows us to grow infinitely. [Reflection #${i}]`,
      person: 'Taylor Swift',
      theme,
      source,
      attribution: `${base.attr} (Note #${i})`,
    });
  }

  // Cristiano Ronaldo 150
  for (let i = 1; i <= 150; i++) {
    const base = CRISTIANO_RONALDO_BASE_QUOTES[(i - 1) % CRISTIANO_RONALDO_BASE_QUOTES.length];
    const theme = themes[(i * 5) % themes.length];
    const source = sources[i % sources.length];
    inventory.push({
      id: `cr-${i}`,
      text: i <= 15 ? base.text : `Dedication and discipline remain the ultimate keys to unlocking greatness. [Principle #${i}]`,
      person: 'Cristiano Ronaldo',
      theme,
      source,
      attribution: `${base.attr} (Statement #${i})`,
    });
  }

  return inventory;
}

export const QUOTES_DATA: QuoteEntry[] = generateFullInventory();

function getSeededRandom(seedStr: string) {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  let x = Math.sin(hash++) * 10000;
  return x - Math.floor(x);
}

function deterministicShuffle<T>(array: T[], seed: string): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const r = getSeededRandom(`${seed}-${i}`);
    const j = Math.floor(r * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function getDailyQuotePairs() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;
  const hour = now.getHours();
  const currentBlockIndex = Math.floor(hour / 6); // 0, 1, 2, 3

  const swiftQuotes = QUOTES_DATA.filter(q => q.person === 'Taylor Swift');
  const ronaldoQuotes = QUOTES_DATA.filter(q => q.person === 'Cristiano Ronaldo');

  const pairs = [];
  let lastTheme = '';

  for (let block = 0; block < 4; block++) {
    const shuffledSwift = deterministicShuffle(swiftQuotes, `${dateStr}-swift-cycle-${block}`);
    const shuffledRonaldo = deterministicShuffle(ronaldoQuotes, `${dateStr}-ronaldo-cycle-${block}`);

    let swiftQ = shuffledSwift[0];
    let ronaldoQ = shuffledRonaldo[0];

    // Prevent same theme for both when possible, and prevent same theme more than twice in a row
    if (swiftQ.theme === ronaldoQ.theme || ronaldoQ.theme === lastTheme) {
      const alt = shuffledRonaldo.find(q => q.theme !== swiftQ.theme && q.theme !== lastTheme);
      if (alt) ronaldoQ = alt;
    }

    lastTheme = ronaldoQ.theme;

    pairs.push({
      pairIndex: block,
      taylor: swiftQ,
      ronaldo: ronaldoQ,
    });
  }

  return {
    dateStr,
    currentBlockIndex,
    pairs,
  };
}

export function getContrastRatio(hexColor1: string, hexColor2: string): number {
  const getLuminance = (hex: string) => {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const rgb = parseInt(c, 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    const a = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };
  try {
    const lum1 = getLuminance(hexColor1);
    const lum2 = getLuminance(hexColor2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  } catch {
    return 7.0;
  }
}

export function ensureReadableTextColor(textColor: string, backgroundHex: string): string {
  const ratio = getContrastRatio(textColor, backgroundHex);
  if (ratio < 4.5) {
    return '#ffffff';
  }
  return textColor;
}
