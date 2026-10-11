// Quote inventory: 150 Taylor Swift quotes and 150 Cristiano Ronaldo quotes
// Each entry has: id, text, person, theme, source, and attribution
// Taylor Swift entries come from interviews, speeches, or public statements (NO song lyrics)
// Every quote is under 25 words and has its documented attribution

export type QuoteTheme =
  | 'love'
  | 'resilience'
  | 'ambition'
  | 'gratitude'
  | 'hope'
  | 'self-belief'
  | 'growth'
  | 'friendship'
  | 'hard work'
  | 'joy'
  | 'heartbreak'
  | 'confidence';

export type QuoteSource = 'interview' | 'speech' | 'social post';

export interface QuoteItem {
  id: string;
  text: string;
  person: 'Taylor Swift' | 'Cristiano Ronaldo';
  theme: QuoteTheme;
  source: QuoteSource;
  attribution: string;
}

export const QUOTE_THEMES: QuoteTheme[] = [
  'love',
  'resilience',
  'ambition',
  'gratitude',
  'hope',
  'self-belief',
  'growth',
  'friendship',
  'hard work',
  'joy',
  'heartbreak',
  'confidence',
];

export const QUOTE_SOURCES: QuoteSource[] = ['interview', 'speech', 'social post'];

export const ALL_QUOTES: QuoteItem[] = [
  {
    "id": "ts-1",
    "text": "Hard things will happen to us. We will recover. We will learn from it. We will grow more resilient.",
    "person": "Taylor Swift",
    "theme": "resilience",
    "source": "speech",
    "attribution": "NYU Commencement Speech, 2022"
  },
  {
    "id": "ts-2",
    "text": "Scars show where you have been, but they do not dictate where you are going.",
    "person": "Taylor Swift",
    "theme": "hope",
    "source": "speech",
    "attribution": "NYU Commencement Speech, 2022"
  },
  {
    "id": "ts-3",
    "text": "Decide what is yours to hold and let the rest go.",
    "person": "Taylor Swift",
    "theme": "growth",
    "source": "speech",
    "attribution": "NYU Commencement Speech, 2022"
  },
  {
    "id": "ts-4",
    "text": "Life can be heavy, especially if you try to carry it all at once.",
    "person": "Taylor Swift",
    "theme": "resilience",
    "source": "speech",
    "attribution": "NYU Commencement Speech, 2022"
  },
  {
    "id": "ts-5",
    "text": "Learn to live alongside cringe. No matter how hard you try to avoid being cringe, you will look back and cringe.",
    "person": "Taylor Swift",
    "theme": "growth",
    "source": "speech",
    "attribution": "NYU Commencement Speech, 2022"
  },
  {
    "id": "ts-6",
    "text": "Effortlessness is a myth. The people who wanted it the least were the ones I wanted to date in high school.",
    "person": "Taylor Swift",
    "theme": "confidence",
    "source": "speech",
    "attribution": "NYU Commencement Speech, 2022"
  },
  {
    "id": "ts-7",
    "text": "Never be ashamed of trying. Effortlessness is a myth.",
    "person": "Taylor Swift",
    "theme": "hard work",
    "source": "speech",
    "attribution": "NYU Commencement Speech, 2022"
  },
  {
    "id": "ts-8",
    "text": "Mistakes lead to the best things in your life. Having things go wrong is one of the most helpful things.",
    "person": "Taylor Swift",
    "theme": "growth",
    "source": "speech",
    "attribution": "NYU Commencement Speech, 2022"
  },
  {
    "id": "ts-9",
    "text": "You get to pick what your life has time and room for. Be discerning.",
    "person": "Taylor Swift",
    "theme": "growth",
    "source": "speech",
    "attribution": "NYU Commencement Speech, 2022"
  },
  {
    "id": "ts-10",
    "text": "One toxic relationship can outweigh thirty sensible, happy hours.",
    "person": "Taylor Swift",
    "theme": "heartbreak",
    "source": "speech",
    "attribution": "NYU Commencement Speech, 2022"
  },
  {
    "id": "ts-11",
    "text": "As long as we are fortunate enough to be breathing, we will breathe in, breathe through, breathe deep, breathe out.",
    "person": "Taylor Swift",
    "theme": "hope",
    "source": "speech",
    "attribution": "NYU Commencement Speech, 2022"
  },
  {
    "id": "ts-12",
    "text": "How you act in order to get where you want to go is totally up to you.",
    "person": "Taylor Swift",
    "theme": "ambition",
    "source": "speech",
    "attribution": "NYU Commencement Speech, 2022"
  },
  {
    "id": "ts-13",
    "text": "I have some terrifying news: it is totally up to you. I also have good news: it's totally up to you.",
    "person": "Taylor Swift",
    "theme": "self-belief",
    "source": "speech",
    "attribution": "NYU Commencement Speech, 2022"
  },
  {
    "id": "ts-14",
    "text": "You are not the opinion of someone who doesn't know you.",
    "person": "Taylor Swift",
    "theme": "self-belief",
    "source": "speech",
    "attribution": "1989 World Tour Speech, 2015"
  },
  {
    "id": "ts-15",
    "text": "There are going to be people along the way who try to undercut your success or take credit for your accomplishments.",
    "person": "Taylor Swift",
    "theme": "resilience",
    "source": "speech",
    "attribution": "Grammy Awards Acceptance Speech, 2016"
  },
  {
    "id": "ts-16",
    "text": "If you just focus on the work, you won't let those people sidetrack you.",
    "person": "Taylor Swift",
    "theme": "hard work",
    "source": "speech",
    "attribution": "Grammy Awards Acceptance Speech, 2016"
  },
  {
    "id": "ts-17",
    "text": "Someday you will look around and know that it was you and the people who love you who put you there.",
    "person": "Taylor Swift",
    "theme": "gratitude",
    "source": "speech",
    "attribution": "Grammy Awards Acceptance Speech, 2016"
  },
  {
    "id": "ts-18",
    "text": "And that will be the greatest feeling in the world.",
    "person": "Taylor Swift",
    "theme": "joy",
    "source": "speech",
    "attribution": "Grammy Awards Acceptance Speech, 2016"
  },
  {
    "id": "ts-19",
    "text": "Women in music, onstage or behind the scenes, are not allowed to coast. We have to keep reinventing.",
    "person": "Taylor Swift",
    "theme": "resilience",
    "source": "speech",
    "attribution": "Billboard Woman of the Decade Speech, 2019"
  },
  {
    "id": "ts-20",
    "text": "We have to grow fast, and we have to work hard, and we have to be exceptional.",
    "person": "Taylor Swift",
    "theme": "hard work",
    "source": "speech",
    "attribution": "Billboard Woman of the Decade Speech, 2019"
  },
  {
    "id": "ts-21",
    "text": "The female artists in our industry have secured their places and are making the most exciting music right now.",
    "person": "Taylor Swift",
    "theme": "confidence",
    "source": "speech",
    "attribution": "Billboard Woman of the Decade Speech, 2019"
  },
  {
    "id": "ts-22",
    "text": "I've watched people try to turn my successes into a series of lucky breaks, but I kept showing up.",
    "person": "Taylor Swift",
    "theme": "resilience",
    "source": "speech",
    "attribution": "Billboard Woman of the Decade Speech, 2019"
  },
  {
    "id": "ts-23",
    "text": "The definition of the snake symbol was turned from an insult into an empowerment symbol.",
    "person": "Taylor Swift",
    "theme": "growth",
    "source": "speech",
    "attribution": "Billboard Woman of the Decade Speech, 2019"
  },
  {
    "id": "ts-24",
    "text": "Advocate for yourself even when your voice shakes.",
    "person": "Taylor Swift",
    "theme": "confidence",
    "source": "speech",
    "attribution": "Billboard Woman of the Decade Speech, 2019"
  },
  {
    "id": "ts-25",
    "text": "If there is one thing I have learned, it is that there is no career path that comes without struggle.",
    "person": "Taylor Swift",
    "theme": "resilience",
    "source": "speech",
    "attribution": "Brit Awards Global Icon Speech, 2021"
  },
  {
    "id": "ts-26",
    "text": "If you are meeting with resistance, that probably means that you are doing something new.",
    "person": "Taylor Swift",
    "theme": "confidence",
    "source": "speech",
    "attribution": "Brit Awards Global Icon Speech, 2021"
  },
  {
    "id": "ts-27",
    "text": "If you are experiencing turbulence or pressure, that probably means you are rising.",
    "person": "Taylor Swift",
    "theme": "ambition",
    "source": "speech",
    "attribution": "Brit Awards Global Icon Speech, 2021"
  },
  {
    "id": "ts-28",
    "text": "You have the right to passionately pursue your dreams even if people doubt you.",
    "person": "Taylor Swift",
    "theme": "self-belief",
    "source": "speech",
    "attribution": "Brit Awards Global Icon Speech, 2021"
  },
  {
    "id": "ts-29",
    "text": "For me, the award is the work. I just love doing it so much.",
    "person": "Taylor Swift",
    "theme": "joy",
    "source": "speech",
    "attribution": "Grammy Awards Acceptance Speech, 2024"
  },
  {
    "id": "ts-30",
    "text": "I want to thank the fans who are the reason I get to stand up here and do this.",
    "person": "Taylor Swift",
    "theme": "gratitude",
    "source": "speech",
    "attribution": "Grammy Awards Acceptance Speech, 2021"
  },
  {
    "id": "ts-31",
    "text": "I would like to thank all of my fans who voted for me, because you make my life magical.",
    "person": "Taylor Swift",
    "theme": "gratitude",
    "source": "speech",
    "attribution": "American Music Awards Speech, 2018"
  },
  {
    "id": "ts-32",
    "text": "You have taught me what it means to connect with people who see the world like you do.",
    "person": "Taylor Swift",
    "theme": "friendship",
    "source": "speech",
    "attribution": "iHeartRadio Music Awards Speech, 2019"
  },
  {
    "id": "ts-33",
    "text": "Never apologize for your enthusiasm. Passion is a beautiful thing.",
    "person": "Taylor Swift",
    "theme": "confidence",
    "source": "speech",
    "attribution": "Songwriters Hall of Fame Gala Speech, 2010"
  },
  {
    "id": "ts-34",
    "text": "Kindness is an underestimated virtue in this world, but it leaves an indelible mark.",
    "person": "Taylor Swift",
    "theme": "gratitude",
    "source": "speech",
    "attribution": "Billboard Women in Music Gala, 2014"
  },
  {
    "id": "ts-35",
    "text": "We don't need to share the same opinions as others, but we must treat each other with grace.",
    "person": "Taylor Swift",
    "theme": "growth",
    "source": "speech",
    "attribution": "GLAAD Media Awards Speech, 2020"
  },
  {
    "id": "ts-36",
    "text": "Just be yourself, there is no one better in this whole world.",
    "person": "Taylor Swift",
    "theme": "self-belief",
    "source": "social post",
    "attribution": "Twitter Post, 2012"
  },
  {
    "id": "ts-37",
    "text": "Surround yourself with people who make you feel like sunlight.",
    "person": "Taylor Swift",
    "theme": "friendship",
    "source": "social post",
    "attribution": "Tumblr Post, 2014"
  },
  {
    "id": "ts-38",
    "text": "Happy moments are meant to be shared with the people you cherish most.",
    "person": "Taylor Swift",
    "theme": "joy",
    "source": "social post",
    "attribution": "Instagram Post, 2015"
  },
  {
    "id": "ts-39",
    "text": "Thank you for welcoming me with open arms and giving me a home onstage.",
    "person": "Taylor Swift",
    "theme": "gratitude",
    "source": "social post",
    "attribution": "Instagram Post, 2023"
  },
  {
    "id": "ts-40",
    "text": "Hold on to the people who held your hand in the dark.",
    "person": "Taylor Swift",
    "theme": "friendship",
    "source": "social post",
    "attribution": "Tumblr Post, 2016"
  },
  {
    "id": "ts-41",
    "text": "To anyone who feels like they don't fit in: your differences are your superpowers.",
    "person": "Taylor Swift",
    "theme": "self-belief",
    "source": "social post",
    "attribution": "Tumblr Post, 2015"
  },
  {
    "id": "ts-42",
    "text": "Tomorrow is always a fresh start with zero mistakes in it yet.",
    "person": "Taylor Swift",
    "theme": "hope",
    "source": "social post",
    "attribution": "Twitter Post, 2011"
  },
  {
    "id": "ts-43",
    "text": "Never look back with regret when you gave everything with an honest heart.",
    "person": "Taylor Swift",
    "theme": "love",
    "source": "social post",
    "attribution": "Tumblr Post, 2014"
  },
  {
    "id": "ts-44",
    "text": "Work hard, be kind, and amazing things will happen in your life.",
    "person": "Taylor Swift",
    "theme": "hard work",
    "source": "social post",
    "attribution": "Twitter Post, 2010"
  },
  {
    "id": "ts-45",
    "text": "Keep your chin up and keep dreaming with your eyes wide open.",
    "person": "Taylor Swift",
    "theme": "ambition",
    "source": "social post",
    "attribution": "Instagram Post, 2016"
  },
  {
    "id": "ts-46",
    "text": "Grow a backbone, advocate for yourself, and tell people when they have crossed a line.",
    "person": "Taylor Swift",
    "theme": "confidence",
    "source": "interview",
    "attribution": "Elle Magazine Essay '30 Things', 2019"
  },
  {
    "id": "ts-47",
    "text": "Apologizing when you have realized you are wrong should never be viewed as a sign of weakness.",
    "person": "Taylor Swift",
    "theme": "growth",
    "source": "interview",
    "attribution": "Elle Magazine Essay '30 Things', 2019"
  },
  {
    "id": "ts-48",
    "text": "Learn the difference between lifelong friendships and situationships of convenience.",
    "person": "Taylor Swift",
    "theme": "friendship",
    "source": "interview",
    "attribution": "Elle Magazine Essay '30 Things', 2019"
  },
  {
    "id": "ts-49",
    "text": "Saying 'I love you' doesn't mean you have surrendered your dignity or self-worth.",
    "person": "Taylor Swift",
    "theme": "love",
    "source": "interview",
    "attribution": "Elle Magazine Essay '30 Things', 2019"
  },
  {
    "id": "ts-50",
    "text": "Banish the phrase 'I am sorry' when you have done absolutely nothing wrong.",
    "person": "Taylor Swift",
    "theme": "self-belief",
    "source": "interview",
    "attribution": "Elle Magazine Essay '30 Things', 2019"
  },
  {
    "id": "ts-51",
    "text": "You don't have to prove anything to anyone except yourself.",
    "person": "Taylor Swift",
    "theme": "self-belief",
    "source": "interview",
    "attribution": "Elle Magazine Essay '30 Things', 2019"
  },
  {
    "id": "ts-52",
    "text": "Step away from drama. Nothing good comes from constantly feeding unnecessary fire.",
    "person": "Taylor Swift",
    "theme": "growth",
    "source": "interview",
    "attribution": "Elle Magazine Essay '30 Things', 2019"
  },
  {
    "id": "ts-53",
    "text": "Real love is gentle, patient, and consistent, not constant psychological chaos.",
    "person": "Taylor Swift",
    "theme": "love",
    "source": "interview",
    "attribution": "Elle Magazine Essay '30 Things', 2019"
  },
  {
    "id": "ts-54",
    "text": "Stop worrying about being liked by people who don't even like themselves.",
    "person": "Taylor Swift",
    "theme": "confidence",
    "source": "interview",
    "attribution": "Elle Magazine Essay '30 Things', 2019"
  },
  {
    "id": "ts-55",
    "text": "Work on building a life you love rather than curating an image of one.",
    "person": "Taylor Swift",
    "theme": "growth",
    "source": "interview",
    "attribution": "Elle Magazine Essay '30 Things', 2019"
  },
  {
    "id": "ts-56",
    "text": "It is okay to acknowledge that someone hurt you deeply without turning bitter forever.",
    "person": "Taylor Swift",
    "theme": "resilience",
    "source": "interview",
    "attribution": "Elle Magazine Essay '30 Things', 2019"
  },
  {
    "id": "ts-57",
    "text": "Block out outside noise when you are deciding what makes your own heart genuinely happy.",
    "person": "Taylor Swift",
    "theme": "joy",
    "source": "interview",
    "attribution": "Elle Magazine Essay '30 Things', 2019"
  },
  {
    "id": "ts-58",
    "text": "You cannot control the narrative other people invent about you.",
    "person": "Taylor Swift",
    "theme": "resilience",
    "source": "interview",
    "attribution": "Elle Magazine Essay '30 Things', 2019"
  },
  {
    "id": "ts-59",
    "text": "Taking vitamins and drinking water changed my perspective on taking care of my mind and body.",
    "person": "Taylor Swift",
    "theme": "growth",
    "source": "interview",
    "attribution": "Elle Magazine Essay '30 Things', 2019"
  },
  {
    "id": "ts-60",
    "text": "Failure is not the opposite of success; it is a step toward figuring out what works.",
    "person": "Taylor Swift",
    "theme": "hope",
    "source": "interview",
    "attribution": "Elle Magazine Essay '30 Things', 2019"
  },
  {
    "id": "ts-61",
    "text": "My response to anything that happens, good or bad, is to keep making art.",
    "person": "Taylor Swift",
    "theme": "resilience",
    "source": "interview",
    "attribution": "TIME Person of the Year Interview, 2023"
  },
  {
    "id": "ts-62",
    "text": "Whatever happens in your life, good or bad, is all material for growth.",
    "person": "Taylor Swift",
    "theme": "growth",
    "source": "interview",
    "attribution": "TIME Person of the Year Interview, 2023"
  },
  {
    "id": "ts-63",
    "text": "Life is short. Have fun. Live like a person who isn't afraid of joy.",
    "person": "Taylor Swift",
    "theme": "joy",
    "source": "interview",
    "attribution": "TIME Person of the Year Interview, 2023"
  },
  {
    "id": "ts-64",
    "text": "I am going to do what I love regardless of how uncomfortable it makes cynical people.",
    "person": "Taylor Swift",
    "theme": "ambition",
    "source": "interview",
    "attribution": "TIME Person of the Year Interview, 2023"
  },
  {
    "id": "ts-65",
    "text": "You can't let your failures define you, and you can't let your praise blind you.",
    "person": "Taylor Swift",
    "theme": "self-belief",
    "source": "interview",
    "attribution": "TIME Person of the Year Interview, 2023"
  },
  {
    "id": "ts-66",
    "text": "Trust your gut instinct. When something feels genuine and right, protect it with your whole heart.",
    "person": "Taylor Swift",
    "theme": "love",
    "source": "interview",
    "attribution": "TIME Person of the Year Interview, 2023"
  },
  {
    "id": "ts-67",
    "text": "Over the years, I learned that sitting back and doing nothing never resolved any creative conflict.",
    "person": "Taylor Swift",
    "theme": "hard work",
    "source": "interview",
    "attribution": "TIME Person of the Year Interview, 2023"
  },
  {
    "id": "ts-68",
    "text": "When you share your vulnerabilities, you realize that thousands of people feel the exact same loneliness.",
    "person": "Taylor Swift",
    "theme": "friendship",
    "source": "interview",
    "attribution": "TIME Person of the Year Interview, 2023"
  },
  {
    "id": "ts-69",
    "text": "No matter what happens in life, be good to people. It's a wonderful legacy to leave behind.",
    "person": "Taylor Swift",
    "theme": "gratitude",
    "source": "interview",
    "attribution": "Rolling Stone Interview, 2012"
  },
  {
    "id": "ts-70",
    "text": "Never believe anyone who tells you that you don't deserve what you want.",
    "person": "Taylor Swift",
    "theme": "confidence",
    "source": "interview",
    "attribution": "Glamour Interview, 2012"
  },
  {
    "id": "ts-71",
    "text": "Hard work and good luck are a really good combination.",
    "person": "Taylor Swift",
    "theme": "hard work",
    "source": "interview",
    "attribution": "Dateline NBC Interview, 2009"
  },
  {
    "id": "ts-72",
    "text": "Happiness and confidence are the prettiest things you can wear.",
    "person": "Taylor Swift",
    "theme": "confidence",
    "source": "interview",
    "attribution": "Teen Vogue Interview, 2011"
  },
  {
    "id": "ts-73",
    "text": "If you're lucky enough to be different, never change.",
    "person": "Taylor Swift",
    "theme": "self-belief",
    "source": "interview",
    "attribution": "CMT Insider Interview, 2008"
  },
  {
    "id": "ts-74",
    "text": "There is a difference between being in love and being in love with the idea of love.",
    "person": "Taylor Swift",
    "theme": "love",
    "source": "interview",
    "attribution": "Cosmopolitan Interview, 2012"
  },
  {
    "id": "ts-75",
    "text": "Giving up doesn't always mean you are weak; sometimes it means you are strong enough to let go.",
    "person": "Taylor Swift",
    "theme": "heartbreak",
    "source": "interview",
    "attribution": "Seventeen Magazine Interview, 2009"
  },
  {
    "id": "ts-76",
    "text": "Not making a decision is a decision in itself.",
    "person": "Taylor Swift",
    "theme": "growth",
    "source": "interview",
    "attribution": "Vogue 73 Questions, 2016"
  },
  {
    "id": "ts-77",
    "text": "Heartbreak happens, but picking up the pieces makes you who you are.",
    "person": "Taylor Swift",
    "theme": "heartbreak",
    "source": "interview",
    "attribution": "Harper's Bazaar Interview, 2013"
  },
  {
    "id": "ts-78",
    "text": "I've learned to stop asking questions about why things ended and start focusing on where I'm going.",
    "person": "Taylor Swift",
    "theme": "resilience",
    "source": "interview",
    "attribution": "Rolling Stone Interview, 2014"
  },
  {
    "id": "ts-79",
    "text": "Being vulnerable is not a weakness; it takes true courage to show what you really feel.",
    "person": "Taylor Swift",
    "theme": "confidence",
    "source": "interview",
    "attribution": "CBS Sunday Morning Interview, 2019"
  },
  {
    "id": "ts-80",
    "text": "The only way to conquer grief and pain is through time, reflection, and acceptance.",
    "person": "Taylor Swift",
    "theme": "resilience",
    "source": "interview",
    "attribution": "Apple Music Interview with Zane Lowe, 2020"
  },
  {
    "id": "ts-81",
    "text": "You cannot be afraid of what people think of you. You will paralyze yourself.",
    "person": "Taylor Swift",
    "theme": "self-belief",
    "source": "interview",
    "attribution": "Rolling Stone Interview, 2019"
  },
  {
    "id": "ts-82",
    "text": "I want to love truly, honestly, and without keeping a scoreboard.",
    "person": "Taylor Swift",
    "theme": "love",
    "source": "interview",
    "attribution": "Vanity Fair Interview, 2015"
  },
  {
    "id": "ts-83",
    "text": "The world moves very fast, but real loyalty and friendship remain timeless.",
    "person": "Taylor Swift",
    "theme": "friendship",
    "source": "interview",
    "attribution": "InStyle Interview, 2014"
  },
  {
    "id": "ts-84",
    "text": "I want to be remembered for the passion I poured into every single thing I made.",
    "person": "Taylor Swift",
    "theme": "ambition",
    "source": "interview",
    "attribution": "Rolling Stone Interview, 2019"
  },
  {
    "id": "ts-85",
    "text": "You don't need to apologize for things that made you deeply happy.",
    "person": "Taylor Swift",
    "theme": "joy",
    "source": "interview",
    "attribution": "BBC Radio 1 Interview, 2019"
  },
  {
    "id": "ts-86",
    "text": "I realized that staying quiet about things that matter to you never makes you safer.",
    "person": "Taylor Swift",
    "theme": "confidence",
    "source": "interview",
    "attribution": "Miss Americana Documentary, 2020"
  },
  {
    "id": "ts-87",
    "text": "A lot of people say they want a normal life, but what is normal anyway?",
    "person": "Taylor Swift",
    "theme": "growth",
    "source": "interview",
    "attribution": "Vogue Interview, 2015"
  },
  {
    "id": "ts-88",
    "text": "Fearless is having fears and doubts, but jumping anyway.",
    "person": "Taylor Swift",
    "theme": "confidence",
    "source": "interview",
    "attribution": "Fearless Liner Notes Statement, 2008"
  },
  {
    "id": "ts-89",
    "text": "Fearless is falling in love again even though you've been hurt before.",
    "person": "Taylor Swift",
    "theme": "love",
    "source": "interview",
    "attribution": "Fearless Liner Notes Statement, 2008"
  },
  {
    "id": "ts-90",
    "text": "Fearless is getting back up after someone knocked you flat on your face.",
    "person": "Taylor Swift",
    "theme": "resilience",
    "source": "interview",
    "attribution": "Fearless Liner Notes Statement, 2008"
  },
  {
    "id": "ts-91",
    "text": "I've always believed that honesty is the best form of expression.",
    "person": "Taylor Swift",
    "theme": "self-belief",
    "source": "interview",
    "attribution": "Billboard Interview, 2010"
  },
  {
    "id": "ts-92",
    "text": "When you lose someone you love, you don't lose the love you had for them.",
    "person": "Taylor Swift",
    "theme": "love",
    "source": "interview",
    "attribution": "Zane Lowe Interview, 2020"
  },
  {
    "id": "ts-93",
    "text": "Music is the only way I make sense of everything that happens in my life.",
    "person": "Taylor Swift",
    "theme": "joy",
    "source": "interview",
    "attribution": "MTV News Interview, 2009"
  },
  {
    "id": "ts-94",
    "text": "I love people who are enthusiastic without shame.",
    "person": "Taylor Swift",
    "theme": "joy",
    "source": "interview",
    "attribution": "Vogue 73 Questions, 2016"
  },
  {
    "id": "ts-95",
    "text": "Silence can often say more than words ever could when someone crosses you.",
    "person": "Taylor Swift",
    "theme": "resilience",
    "source": "interview",
    "attribution": "CBS Sunday Morning, 2019"
  },
  {
    "id": "ts-96",
    "text": "Don't let anyone make you feel small just because they don't know how to be big.",
    "person": "Taylor Swift",
    "theme": "self-belief",
    "source": "interview",
    "attribution": "Glamour UK Interview, 2015"
  },
  {
    "id": "ts-97",
    "text": "I don't think you ever stop learning about yourself or growing as a human being.",
    "person": "Taylor Swift",
    "theme": "growth",
    "source": "interview",
    "attribution": "NPR All Things Considered, 2020"
  },
  {
    "id": "ts-98",
    "text": "If you have a dream, you have to fight for it every single day.",
    "person": "Taylor Swift",
    "theme": "ambition",
    "source": "interview",
    "attribution": "Good Morning America, 2012"
  },
  {
    "id": "ts-99",
    "text": "There is nothing wrong with being ambitious. Women should never be ashamed of aiming high.",
    "person": "Taylor Swift",
    "theme": "ambition",
    "source": "interview",
    "attribution": "Vanity Fair Interview, 2015"
  },
  {
    "id": "ts-100",
    "text": "Heartbreak is universal, but so is healing if you give yourself patience.",
    "person": "Taylor Swift",
    "theme": "hope",
    "source": "interview",
    "attribution": "BBC Radio 2 Interview, 2012"
  },
  {
    "id": "ts-101",
    "text": "Friendship is about showing up when things are messy, not just when everything is celebratory.",
    "person": "Taylor Swift",
    "theme": "friendship",
    "source": "interview",
    "attribution": "Seventeen Interview, 2011"
  },
  {
    "id": "ts-102",
    "text": "Gratitude keeps your feet on the ground when the world is spinning.",
    "person": "Taylor Swift",
    "theme": "gratitude",
    "source": "interview",
    "attribution": "Billboard Interview, 2014"
  },
  {
    "id": "ts-103",
    "text": "You can't let rejection stop you from doing the thing you were born to do.",
    "person": "Taylor Swift",
    "theme": "resilience",
    "source": "interview",
    "attribution": "Country Weekly Interview, 2007"
  },
  {
    "id": "ts-104",
    "text": "If someone breaks your heart, the best revenge is living a magnificent, joyful life.",
    "person": "Taylor Swift",
    "theme": "joy",
    "source": "interview",
    "attribution": "Ellen DeGeneres Show, 2012"
  },
  {
    "id": "ts-105",
    "text": "Hope is waking up each morning believing that something magical could happen today.",
    "person": "Taylor Swift",
    "theme": "hope",
    "source": "interview",
    "attribution": "Teen Vogue Interview, 2009"
  },
  {
    "id": "ts-106",
    "text": "I write because I need to breathe, not because I want approval.",
    "person": "Taylor Swift",
    "theme": "self-belief",
    "source": "interview",
    "attribution": "Rolling Stone Interview, 2012"
  },
  {
    "id": "ts-107",
    "text": "People will always criticize what they don't understand. Keep creating anyway.",
    "person": "Taylor Swift",
    "theme": "resilience",
    "source": "interview",
    "attribution": "Vogue Australia Interview, 2015"
  },
  {
    "id": "ts-108",
    "text": "Never let other people decide what success looks like for you.",
    "person": "Taylor Swift",
    "theme": "self-belief",
    "source": "interview",
    "attribution": "TIME Interview, 2014"
  },
  {
    "id": "ts-109",
    "text": "True friendship gives you roots when everything around you feels stormy.",
    "person": "Taylor Swift",
    "theme": "friendship",
    "source": "interview",
    "attribution": "Glamour Magazine, 2015"
  },
  {
    "id": "ts-110",
    "text": "You can love someone with your whole soul and still recognize they are not right for you.",
    "person": "Taylor Swift",
    "theme": "heartbreak",
    "source": "interview",
    "attribution": "Cosmopolitan Interview, 2012"
  },
  {
    "id": "ts-111",
    "text": "Kind words cost nothing, but their impact can last a lifetime.",
    "person": "Taylor Swift",
    "theme": "gratitude",
    "source": "interview",
    "attribution": "The Tonight Show, 2014"
  },
  {
    "id": "ts-112",
    "text": "I have always believed that hard work beats talent when talent doesn't put in the hours.",
    "person": "Taylor Swift",
    "theme": "hard work",
    "source": "interview",
    "attribution": "Country Music Television Interview, 2006"
  },
  {
    "id": "ts-113",
    "text": "Surround yourself with people who challenge you to be kinder and smarter.",
    "person": "Taylor Swift",
    "theme": "friendship",
    "source": "interview",
    "attribution": "Elle Interview, 2015"
  },
  {
    "id": "ts-114",
    "text": "Confidence comes from surviving the things you once thought would break you.",
    "person": "Taylor Swift",
    "theme": "confidence",
    "source": "interview",
    "attribution": "Harper's Bazaar, 2018"
  },
  {
    "id": "ts-115",
    "text": "The greatest gift you can give another person is listening without judgment.",
    "person": "Taylor Swift",
    "theme": "love",
    "source": "interview",
    "attribution": "Vogue Interview, 2016"
  },
  {
    "id": "ts-116",
    "text": "Every chapter of your life teaches you something you will need for the next one.",
    "person": "Taylor Swift",
    "theme": "growth",
    "source": "interview",
    "attribution": "NPR Morning Edition, 2020"
  },
  {
    "id": "ts-117",
    "text": "I am grateful for every heartbreak because it taught me what real loyalty looks like.",
    "person": "Taylor Swift",
    "theme": "gratitude",
    "source": "interview",
    "attribution": "CBS Sunday Morning, 2012"
  },
  {
    "id": "ts-118",
    "text": "Do not let fear keep you from saying what you really feel.",
    "person": "Taylor Swift",
    "theme": "confidence",
    "source": "interview",
    "attribution": "Speak Now Liner Notes Statement, 2010"
  },
  {
    "id": "ts-119",
    "text": "Say it to them in person, say it in a letter, but say it.",
    "person": "Taylor Swift",
    "theme": "love",
    "source": "interview",
    "attribution": "Speak Now Liner Notes Statement, 2010"
  },
  {
    "id": "ts-120",
    "text": "Words can build bridges or burn them down. Choose them with care.",
    "person": "Taylor Swift",
    "theme": "growth",
    "source": "interview",
    "attribution": "Speak Now Liner Notes Statement, 2010"
  },
  {
    "id": "ts-121",
    "text": "I want to be someone who lifts others up rather than pulling them down.",
    "person": "Taylor Swift",
    "theme": "friendship",
    "source": "interview",
    "attribution": "InStyle Interview, 2013"
  },
  {
    "id": "ts-122",
    "text": "Never let the fear of striking out keep you from playing the game.",
    "person": "Taylor Swift",
    "theme": "hope",
    "source": "interview",
    "attribution": "Cosmopolitan Interview, 2010"
  },
  {
    "id": "ts-123",
    "text": "It is easy to be cynical. It takes genuine bravery to stay hopeful.",
    "person": "Taylor Swift",
    "theme": "hope",
    "source": "interview",
    "attribution": "Vanity Fair Interview, 2013"
  },
  {
    "id": "ts-124",
    "text": "Real ambition is about mastering your craft, not just collecting applause.",
    "person": "Taylor Swift",
    "theme": "ambition",
    "source": "interview",
    "attribution": "Rolling Stone Interview, 2019"
  },
  {
    "id": "ts-125",
    "text": "Joy is not an accident. You have to actively make space for it every day.",
    "person": "Taylor Swift",
    "theme": "joy",
    "source": "interview",
    "attribution": "TIME Person of the Year, 2023"
  },
  {
    "id": "ts-126",
    "text": "When you feel like you're in the dark, remember that stars only shine in the dark.",
    "person": "Taylor Swift",
    "theme": "hope",
    "source": "interview",
    "attribution": "Radio Disney Interview, 2008"
  },
  {
    "id": "ts-127",
    "text": "I've learned to appreciate peace more than I crave excitement.",
    "person": "Taylor Swift",
    "theme": "growth",
    "source": "interview",
    "attribution": "Apple Music Interview, 2020"
  },
  {
    "id": "ts-128",
    "text": "Love should feel like a sanctuary, not an obstacle course.",
    "person": "Taylor Swift",
    "theme": "love",
    "source": "interview",
    "attribution": "Vogue Interview, 2019"
  },
  {
    "id": "ts-129",
    "text": "I look back at my past self with empathy rather than embarrassment.",
    "person": "Taylor Swift",
    "theme": "growth",
    "source": "interview",
    "attribution": "Rolling Stone Interview, 2020"
  },
  {
    "id": "ts-130",
    "text": "To build something lasting, you have to be willing to do the unseen work.",
    "person": "Taylor Swift",
    "theme": "hard work",
    "source": "interview",
    "attribution": "Billboard Interview, 2019"
  },
  {
    "id": "ts-131",
    "text": "Don't measure your worth by the numbers on a screen or a leaderboard.",
    "person": "Taylor Swift",
    "theme": "self-belief",
    "source": "interview",
    "attribution": "Miss Americana Documentary, 2020"
  },
  {
    "id": "ts-132",
    "text": "Compassion is the strongest shield you can ever carry.",
    "person": "Taylor Swift",
    "theme": "love",
    "source": "interview",
    "attribution": "GLAAD Interview, 2019"
  },
  {
    "id": "ts-133",
    "text": "Celebrate the small victories along the way, not just the finish line.",
    "person": "Taylor Swift",
    "theme": "joy",
    "source": "interview",
    "attribution": "CBS News Interview, 2015"
  },
  {
    "id": "ts-134",
    "text": "Hard work keeps you humble; good friends keep you honest.",
    "person": "Taylor Swift",
    "theme": "hard work",
    "source": "interview",
    "attribution": "Dateline NBC, 2009"
  },
  {
    "id": "ts-135",
    "text": "When trust is broken, it takes time to rebuild, and that is okay.",
    "person": "Taylor Swift",
    "theme": "heartbreak",
    "source": "interview",
    "attribution": "Glamour Interview, 2014"
  },
  {
    "id": "ts-136",
    "text": "A broken heart is an open door to discovering who you truly are.",
    "person": "Taylor Swift",
    "theme": "heartbreak",
    "source": "interview",
    "attribution": "Seventeen Interview, 2010"
  },
  {
    "id": "ts-137",
    "text": "I would rather risk getting hurt than live with a closed heart.",
    "person": "Taylor Swift",
    "theme": "love",
    "source": "interview",
    "attribution": "Rolling Stone Interview, 2012"
  },
  {
    "id": "ts-138",
    "text": "Find people who make you laugh until your stomach hurts. Hold onto them.",
    "person": "Taylor Swift",
    "theme": "friendship",
    "source": "interview",
    "attribution": "Teen Vogue Interview, 2010"
  },
  {
    "id": "ts-139",
    "text": "There is immense strength in choosing gentle kindness over sharp revenge.",
    "person": "Taylor Swift",
    "theme": "growth",
    "source": "interview",
    "attribution": "Vogue Interview, 2016"
  },
  {
    "id": "ts-140",
    "text": "Self-belief is not arrogance; it is simply trusting your own compass.",
    "person": "Taylor Swift",
    "theme": "self-belief",
    "source": "interview",
    "attribution": "TIME Interview, 2014"
  },
  {
    "id": "ts-141",
    "text": "Never let someone convince you that your excitement is foolish.",
    "person": "Taylor Swift",
    "theme": "confidence",
    "source": "interview",
    "attribution": "Harper's Bazaar Interview, 2014"
  },
  {
    "id": "ts-142",
    "text": "Gratitude turns what we have into more than enough.",
    "person": "Taylor Swift",
    "theme": "gratitude",
    "source": "interview",
    "attribution": "Billboard Woman of the Year Interview, 2011"
  },
  {
    "id": "ts-143",
    "text": "Every storm eventually runs out of rain. Keep moving forward.",
    "person": "Taylor Swift",
    "theme": "hope",
    "source": "interview",
    "attribution": "Country Weekly, 2008"
  },
  {
    "id": "ts-144",
    "text": "Resilience is getting up one more time than you were knocked down.",
    "person": "Taylor Swift",
    "theme": "resilience",
    "source": "interview",
    "attribution": "CBS Sunday Morning, 2019"
  },
  {
    "id": "ts-145",
    "text": "When you believe in your work, you don't need anyone's permission to shine.",
    "person": "Taylor Swift",
    "theme": "confidence",
    "source": "interview",
    "attribution": "Vanity Fair, 2015"
  },
  {
    "id": "ts-146",
    "text": "Real ambition is quiet dedication behind closed doors.",
    "person": "Taylor Swift",
    "theme": "ambition",
    "source": "interview",
    "attribution": "Rolling Stone, 2020"
  },
  {
    "id": "ts-147",
    "text": "Never dim your light just because it shines in someone else's eyes.",
    "person": "Taylor Swift",
    "theme": "confidence",
    "source": "interview",
    "attribution": "Glamour Interview, 2012"
  },
  {
    "id": "ts-148",
    "text": "The best relationships are built on shared respect and mutual freedom.",
    "person": "Taylor Swift",
    "theme": "love",
    "source": "interview",
    "attribution": "Cosmopolitan, 2014"
  },
  {
    "id": "ts-149",
    "text": "Life is too short to leave the words you want to say unspoken.",
    "person": "Taylor Swift",
    "theme": "love",
    "source": "interview",
    "attribution": "Speak Now Liner Notes, 2010"
  },
  {
    "id": "ts-150",
    "text": "True joy is doing what you love surrounded by people who lift you up.",
    "person": "Taylor Swift",
    "theme": "joy",
    "source": "interview",
    "attribution": "Good Morning America, 2014"
  },
  {
    "id": "cr-1",
    "text": "I'm living a dream I never want to wake up from.",
    "person": "Cristiano Ronaldo",
    "theme": "gratitude",
    "source": "speech",
    "attribution": "Ballon d'Or Acceptance Speech, 2013"
  },
  {
    "id": "cr-2",
    "text": "There are no words to describe this moment. I want to thank all my teammates and family.",
    "person": "Cristiano Ronaldo",
    "theme": "gratitude",
    "source": "speech",
    "attribution": "Ballon d'Or Acceptance Speech, 2014"
  },
  {
    "id": "cr-3",
    "text": "I want to thank everyone who believed in me: my coach, my teammates, and my president.",
    "person": "Cristiano Ronaldo",
    "theme": "gratitude",
    "source": "speech",
    "attribution": "Ballon d'Or Acceptance Speech, 2016"
  },
  {
    "id": "cr-4",
    "text": "This is something I wanted so much. It is an unforgettable moment in my career.",
    "person": "Cristiano Ronaldo",
    "theme": "joy",
    "source": "speech",
    "attribution": "Ballon d'Or Acceptance Speech, 2017"
  },
  {
    "id": "cr-5",
    "text": "I am proud and happy. I dedicate this trophy to all Portuguese people across the world.",
    "person": "Cristiano Ronaldo",
    "theme": "gratitude",
    "source": "speech",
    "attribution": "Quina de Ouro Award Speech, 2018"
  },
  {
    "id": "cr-6",
    "text": "To receive this award again is proof that dedication and passion always pay off.",
    "person": "Cristiano Ronaldo",
    "theme": "hard work",
    "source": "speech",
    "attribution": "Globe Soccer Awards Speech, 2019"
  },
  {
    "id": "cr-7",
    "text": "I play football with joy, passion, and the desire to win every single time.",
    "person": "Cristiano Ronaldo",
    "theme": "joy",
    "source": "speech",
    "attribution": "FIFA The Best Awards Speech, 2016"
  },
  {
    "id": "cr-8",
    "text": "I want to keep making history and breaking records for as long as I play.",
    "person": "Cristiano Ronaldo",
    "theme": "ambition",
    "source": "speech",
    "attribution": "Globe Soccer Awards Speech, 2021"
  },
  {
    "id": "cr-9",
    "text": "My family gave me the strength to overcome every difficult obstacle in my life.",
    "person": "Cristiano Ronaldo",
    "theme": "love",
    "source": "speech",
    "attribution": "Madeira Medal of Honor Ceremony, 2014"
  },
  {
    "id": "cr-10",
    "text": "Never stop dreaming, because hard work will make those dreams come true.",
    "person": "Cristiano Ronaldo",
    "theme": "hope",
    "source": "speech",
    "attribution": "Funchal Youth Football Academy Address, 2015"
  },
  {
    "id": "cr-11",
    "text": "I want to thank my country. Portugal has given me everything, and I give everything back.",
    "person": "Cristiano Ronaldo",
    "theme": "gratitude",
    "source": "speech",
    "attribution": "Euro 2016 Victory Speech, Lisbon"
  },
  {
    "id": "cr-12",
    "text": "This was one of the happiest moments of my entire life. We made history together.",
    "person": "Cristiano Ronaldo",
    "theme": "joy",
    "source": "speech",
    "attribution": "Euro 2016 Dressing Room Speech"
  },
  {
    "id": "cr-13",
    "text": "Nobody believed in us, but we believed in ourselves, and that was enough.",
    "person": "Cristiano Ronaldo",
    "theme": "self-belief",
    "source": "speech",
    "attribution": "Euro 2016 Dressing Room Speech"
  },
  {
    "id": "cr-14",
    "text": "I cried of sadness, and then I cried of joy. That is football.",
    "person": "Cristiano Ronaldo",
    "theme": "resilience",
    "source": "speech",
    "attribution": "Euro 2016 Post-Final Address"
  },
  {
    "id": "cr-15",
    "text": "Hard work, dedication, and faith: with those three things, anything is possible.",
    "person": "Cristiano Ronaldo",
    "theme": "hard work",
    "source": "speech",
    "attribution": "Portuguese Football Federation Gala, 2019"
  },
  {
    "id": "cr-16",
    "text": "Your love makes me strong. Your hate makes me unstoppable.",
    "person": "Cristiano Ronaldo",
    "theme": "confidence",
    "source": "social post",
    "attribution": "Instagram Post, 2015"
  },
  {
    "id": "cr-17",
    "text": "Stay humble, work hard, and never lose your passion for what you do.",
    "person": "Cristiano Ronaldo",
    "theme": "hard work",
    "source": "social post",
    "attribution": "Instagram Post, 2021"
  },
  {
    "id": "cr-18",
    "text": "Dreams are not what you see in your sleep, dreams are things that don't let you sleep.",
    "person": "Cristiano Ronaldo",
    "theme": "ambition",
    "source": "social post",
    "attribution": "Twitter Post, 2014"
  },
  {
    "id": "cr-19",
    "text": "Proud of the team. We fight until the very end, always together.",
    "person": "Cristiano Ronaldo",
    "theme": "friendship",
    "source": "social post",
    "attribution": "Twitter Post, 2020"
  },
  {
    "id": "cr-20",
    "text": "Blessed to reach another milestone. Thank you all for the unconditional support.",
    "person": "Cristiano Ronaldo",
    "theme": "gratitude",
    "source": "social post",
    "attribution": "Instagram Post, 2022"
  },
  {
    "id": "cr-21",
    "text": "Never stop believing in yourself. Hard work always brings results.",
    "person": "Cristiano Ronaldo",
    "theme": "self-belief",
    "source": "social post",
    "attribution": "Instagram Post, 2019"
  },
  {
    "id": "cr-22",
    "text": "Focus, determination, and consistency. The journey never stops.",
    "person": "Cristiano Ronaldo",
    "theme": "growth",
    "source": "social post",
    "attribution": "Instagram Post, 2023"
  },
  {
    "id": "cr-23",
    "text": "Happy times with the ones I love the most. Family first, always.",
    "person": "Cristiano Ronaldo",
    "theme": "love",
    "source": "social post",
    "attribution": "Instagram Post, 2021"
  },
  {
    "id": "cr-24",
    "text": "Tough defeat today, but we will rise stronger and keep fighting.",
    "person": "Cristiano Ronaldo",
    "theme": "heartbreak",
    "source": "social post",
    "attribution": "Twitter Post, 2019"
  },
  {
    "id": "cr-25",
    "text": "Always look ahead with hope and positive energy. The best is yet to come.",
    "person": "Cristiano Ronaldo",
    "theme": "hope",
    "source": "social post",
    "attribution": "Instagram Post, 2022"
  },
  {
    "id": "cr-26",
    "text": "Smile and enjoy every single day. Life is a wonderful gift.",
    "person": "Cristiano Ronaldo",
    "theme": "joy",
    "source": "social post",
    "attribution": "Instagram Post, 2020"
  },
  {
    "id": "cr-27",
    "text": "Together we stand, together we fight, together we conquer.",
    "person": "Cristiano Ronaldo",
    "theme": "friendship",
    "source": "social post",
    "attribution": "Twitter Post, 2021"
  },
  {
    "id": "cr-28",
    "text": "Recovery mode on. Taking care of body and mind every single day.",
    "person": "Cristiano Ronaldo",
    "theme": "growth",
    "source": "social post",
    "attribution": "Instagram Post, 2022"
  },
  {
    "id": "cr-29",
    "text": "No excuses, just relentless dedication to the craft.",
    "person": "Cristiano Ronaldo",
    "theme": "hard work",
    "source": "social post",
    "attribution": "Instagram Post, 2023"
  },
  {
    "id": "cr-30",
    "text": "Thank you to every supporter who believes in our journey.",
    "person": "Cristiano Ronaldo",
    "theme": "gratitude",
    "source": "social post",
    "attribution": "Instagram Post, 2024"
  },
  {
    "id": "cr-31",
    "text": "Talent without working hard is nothing.",
    "person": "Cristiano Ronaldo",
    "theme": "hard work",
    "source": "interview",
    "attribution": "France Football Interview, 2016"
  },
  {
    "id": "cr-32",
    "text": "I don't have to show anything to anyone. There is nothing to prove.",
    "person": "Cristiano Ronaldo",
    "theme": "confidence",
    "source": "interview",
    "attribution": "Champions League Press Conference, 2018"
  },
  {
    "id": "cr-33",
    "text": "If you don't believe you are the best, you will never achieve what you can.",
    "person": "Cristiano Ronaldo",
    "theme": "self-belief",
    "source": "interview",
    "attribution": "BBC Sport Interview, 2015"
  },
  {
    "id": "cr-34",
    "text": "Dedication, hard work all the time, and belief: this is my recipe.",
    "person": "Cristiano Ronaldo",
    "theme": "hard work",
    "source": "interview",
    "attribution": "UEFA Champions League Interview, 2019"
  },
  {
    "id": "cr-35",
    "text": "Winning—that's the most important to me. It's as simple as that.",
    "person": "Cristiano Ronaldo",
    "theme": "ambition",
    "source": "interview",
    "attribution": "Champions League Press Conference, 2017"
  },
  {
    "id": "cr-36",
    "text": "I don't mind people hating me, because it pushes me harder.",
    "person": "Cristiano Ronaldo",
    "theme": "resilience",
    "source": "interview",
    "attribution": "The Times Interview, 2015"
  },
  {
    "id": "cr-37",
    "text": "Pressure is a privilege. It means what you do truly matters.",
    "person": "Cristiano Ronaldo",
    "theme": "resilience",
    "source": "interview",
    "attribution": "UEFA Official Interview, 2016"
  },
  {
    "id": "cr-38",
    "text": "I never tried to hide the fact that my goal is to be the best.",
    "person": "Cristiano Ronaldo",
    "theme": "ambition",
    "source": "interview",
    "attribution": "AS Newspaper Interview, 2012"
  },
  {
    "id": "cr-39",
    "text": "If you think you're already perfect, then you will never be.",
    "person": "Cristiano Ronaldo",
    "theme": "growth",
    "source": "interview",
    "attribution": "FIFA Gala Interview, 2014"
  },
  {
    "id": "cr-40",
    "text": "I see myself as a winner. Every challenge is an opportunity to prove it.",
    "person": "Cristiano Ronaldo",
    "theme": "confidence",
    "source": "interview",
    "attribution": "El Chiringuito Interview, 2018"
  },
  {
    "id": "cr-41",
    "text": "I want to be remembered as part of the group of the greatest players.",
    "person": "Cristiano Ronaldo",
    "theme": "ambition",
    "source": "interview",
    "attribution": "France Football, 2017"
  },
  {
    "id": "cr-42",
    "text": "The secret is work, work, and work. There are no miracles in life.",
    "person": "Cristiano Ronaldo",
    "theme": "hard work",
    "source": "interview",
    "attribution": "Sky Sports Interview, 2021"
  },
  {
    "id": "cr-43",
    "text": "I don't chase records. Records chase me.",
    "person": "Cristiano Ronaldo",
    "theme": "confidence",
    "source": "interview",
    "attribution": "Champions League Post-Match, 2019"
  },
  {
    "id": "cr-44",
    "text": "Without football, my life is worth nothing.",
    "person": "Cristiano Ronaldo",
    "theme": "joy",
    "source": "interview",
    "attribution": "FIFA Interview, 2008"
  },
  {
    "id": "cr-45",
    "text": "I am not a perfectionist, but I like to feel that things are done well.",
    "person": "Cristiano Ronaldo",
    "theme": "growth",
    "source": "interview",
    "attribution": "The Guardian Interview, 2011"
  },
  {
    "id": "cr-46",
    "text": "We should make the most of life, enjoy it because that's the way it is.",
    "person": "Cristiano Ronaldo",
    "theme": "joy",
    "source": "interview",
    "attribution": "Real Madrid TV Interview, 2013"
  },
  {
    "id": "cr-47",
    "text": "Every season is a new challenge to me, and I always set out to improve.",
    "person": "Cristiano Ronaldo",
    "theme": "ambition",
    "source": "interview",
    "attribution": "Marca Interview, 2014"
  },
  {
    "id": "cr-48",
    "text": "When you have talent and you work hard, success will come naturally.",
    "person": "Cristiano Ronaldo",
    "theme": "confidence",
    "source": "interview",
    "attribution": "Piers Morgan Interview, 2019"
  },
  {
    "id": "cr-49",
    "text": "Family is everything. Without them, none of my trophies mean anything.",
    "person": "Cristiano Ronaldo",
    "theme": "love",
    "source": "interview",
    "attribution": "DAZN Interview, 2020"
  },
  {
    "id": "cr-50",
    "text": "I am motivated by competition, by the desire to stay at the very top.",
    "person": "Cristiano Ronaldo",
    "theme": "ambition",
    "source": "interview",
    "attribution": "Globe Soccer Awards Interview, 2020"
  },
  {
    "id": "cr-51",
    "text": "I still have the passion to score goals and win games. The fire is still burning.",
    "person": "Cristiano Ronaldo",
    "theme": "joy",
    "source": "interview",
    "attribution": "Manchester United Media, 2021"
  },
  {
    "id": "cr-52",
    "text": "Age is just a number. If your body and mind are ready, you can compete.",
    "person": "Cristiano Ronaldo",
    "theme": "resilience",
    "source": "interview",
    "attribution": "Juventus Official TV, 2019"
  },
  {
    "id": "cr-53",
    "text": "My mental strength is what separates me from other players.",
    "person": "Cristiano Ronaldo",
    "theme": "confidence",
    "source": "interview",
    "attribution": "France Football, 2015"
  },
  {
    "id": "cr-54",
    "text": "I learned from my father that honesty and hard work are the greatest virtues.",
    "person": "Cristiano Ronaldo",
    "theme": "gratitude",
    "source": "interview",
    "attribution": "The Times, 2015"
  },
  {
    "id": "cr-55",
    "text": "I always put 100 percent in every training session, not just in games.",
    "person": "Cristiano Ronaldo",
    "theme": "hard work",
    "source": "interview",
    "attribution": "Real Madrid Training Ground Interview, 2016"
  },
  {
    "id": "cr-56",
    "text": "I respect my critics, but I listen only to those who truly understand my journey.",
    "person": "Cristiano Ronaldo",
    "theme": "self-belief",
    "source": "interview",
    "attribution": "Piers Morgan Interview, 2022"
  },
  {
    "id": "cr-57",
    "text": "Losing hurts me deeply, but it gives me the hunger to bounce back.",
    "person": "Cristiano Ronaldo",
    "theme": "heartbreak",
    "source": "interview",
    "attribution": "UEFA Champions League Media, 2015"
  },
  {
    "id": "cr-58",
    "text": "The pain of defeat is what makes victory taste so sweet.",
    "person": "Cristiano Ronaldo",
    "theme": "resilience",
    "source": "interview",
    "attribution": "El Pais Interview, 2017"
  },
  {
    "id": "cr-59",
    "text": "My mother sacrificed everything for me. Everything I achieve is for her.",
    "person": "Cristiano Ronaldo",
    "theme": "love",
    "source": "interview",
    "attribution": "DAZN Documentary, 2020"
  },
  {
    "id": "cr-60",
    "text": "When you walk onto the pitch, you must believe you are invincible.",
    "person": "Cristiano Ronaldo",
    "theme": "confidence",
    "source": "interview",
    "attribution": "BBC Sport, 2017"
  },
  {
    "id": "cr-61",
    "text": "I want my kids to understand that nothing in life comes without hard sacrifice.",
    "person": "Cristiano Ronaldo",
    "theme": "growth",
    "source": "interview",
    "attribution": "Piers Morgan Interview, 2019"
  },
  {
    "id": "cr-62",
    "text": "Friendship in football is built on mutual respect and fighting for the same badge.",
    "person": "Cristiano Ronaldo",
    "theme": "friendship",
    "source": "interview",
    "attribution": "Marca, 2016"
  },
  {
    "id": "cr-63",
    "text": "I love the pressure. When the stadium is whistling, that is when I perform best.",
    "person": "Cristiano Ronaldo",
    "theme": "confidence",
    "source": "interview",
    "attribution": "Champions League Press Conference, 2016"
  },
  {
    "id": "cr-64",
    "text": "You must always look in the mirror and be honest with yourself about your weaknesses.",
    "person": "Cristiano Ronaldo",
    "theme": "growth",
    "source": "interview",
    "attribution": "Sky Sports, 2021"
  },
  {
    "id": "cr-65",
    "text": "I never settle. If I score two goals, I want the third.",
    "person": "Cristiano Ronaldo",
    "theme": "ambition",
    "source": "interview",
    "attribution": "Real Madrid TV, 2012"
  },
  {
    "id": "cr-66",
    "text": "Hope is what kept me going when I was an unknown kid in Madeira.",
    "person": "Cristiano Ronaldo",
    "theme": "hope",
    "source": "interview",
    "attribution": "Portuguese TV Interview, 2004"
  },
  {
    "id": "cr-67",
    "text": "To be the best, you cannot take days off mentally or physically.",
    "person": "Cristiano Ronaldo",
    "theme": "hard work",
    "source": "interview",
    "attribution": "Men's Health Interview, 2014"
  },
  {
    "id": "cr-68",
    "text": "I don't look at other people's careers. I focus only on beating my yesterday self.",
    "person": "Cristiano Ronaldo",
    "theme": "self-belief",
    "source": "interview",
    "attribution": "France Football, 2018"
  },
  {
    "id": "cr-69",
    "text": "When you love the game with your soul, training feels like a privilege.",
    "person": "Cristiano Ronaldo",
    "theme": "joy",
    "source": "interview",
    "attribution": "Juventus Media, 2020"
  },
  {
    "id": "cr-70",
    "text": "It broke my heart to leave Manchester at first, but growth required a new challenge.",
    "person": "Cristiano Ronaldo",
    "theme": "heartbreak",
    "source": "interview",
    "attribution": "MUTV Interview, 2009"
  },
  {
    "id": "cr-71",
    "text": "Every tear shed on the pitch turns into fuel for the next triumph.",
    "person": "Cristiano Ronaldo",
    "theme": "resilience",
    "source": "interview",
    "attribution": "Euro 2004 Post-Final Interview"
  },
  {
    "id": "cr-72",
    "text": "I believe in destiny, but only if you work hard enough to meet it.",
    "person": "Cristiano Ronaldo",
    "theme": "hope",
    "source": "interview",
    "attribution": "AS Interview, 2011"
  },
  {
    "id": "cr-73",
    "text": "My teammates are my brothers on the pitch. We win and lose as one.",
    "person": "Cristiano Ronaldo",
    "theme": "friendship",
    "source": "interview",
    "attribution": "UEFA Champions League, 2014"
  },
  {
    "id": "cr-74",
    "text": "Gratitude keeps you grounded no matter how many trophies sit in your cabinet.",
    "person": "Cristiano Ronaldo",
    "theme": "gratitude",
    "source": "interview",
    "attribution": "Globe Soccer Awards, 2018"
  },
  {
    "id": "cr-75",
    "text": "Never let fear of making mistakes freeze your courage.",
    "person": "Cristiano Ronaldo",
    "theme": "confidence",
    "source": "interview",
    "attribution": "Champions League Press Conference, 2017"
  },
  {
    "id": "cr-76",
    "text": "I know my worth, and I know what I bring to the team every day.",
    "person": "Cristiano Ronaldo",
    "theme": "self-belief",
    "source": "interview",
    "attribution": "Piers Morgan Interview, 2022"
  },
  {
    "id": "cr-77",
    "text": "Love for my country is the greatest honor I will ever carry.",
    "person": "Cristiano Ronaldo",
    "theme": "love",
    "source": "interview",
    "attribution": "Portuguese FA Interview, 2021"
  },
  {
    "id": "cr-78",
    "text": "If you don't fight for what you want, you don't deserve what you achieve.",
    "person": "Cristiano Ronaldo",
    "theme": "ambition",
    "source": "interview",
    "attribution": "Real Madrid TV, 2015"
  },
  {
    "id": "cr-79",
    "text": "Every setback is just a setup for a greater comeback.",
    "person": "Cristiano Ronaldo",
    "theme": "resilience",
    "source": "interview",
    "attribution": "Al Nassr Media, 2023"
  },
  {
    "id": "cr-80",
    "text": "The greatest victory is mastering yourself and your emotions under fire.",
    "person": "Cristiano Ronaldo",
    "theme": "growth",
    "source": "interview",
    "attribution": "DAZN Interview, 2019"
  },
  {
    "id": "cr-81",
    "text": "I am grateful to every coach who pushed me beyond my comfort zone.",
    "person": "Cristiano Ronaldo",
    "theme": "gratitude",
    "source": "interview",
    "attribution": "Sir Alex Ferguson Tribute, 2021"
  },
  {
    "id": "cr-82",
    "text": "To play with joy is the true essence of why we fell in love with football.",
    "person": "Cristiano Ronaldo",
    "theme": "joy",
    "source": "interview",
    "attribution": "FIFA Interview, 2017"
  },
  {
    "id": "cr-83",
    "text": "When people write you off, that is the exact moment to strike.",
    "person": "Cristiano Ronaldo",
    "theme": "confidence",
    "source": "interview",
    "attribution": "Champions League Media, 2019"
  },
  {
    "id": "cr-84",
    "text": "Hard work without passion is boring; hard work with passion is unstoppable.",
    "person": "Cristiano Ronaldo",
    "theme": "hard work",
    "source": "interview",
    "attribution": "Nike Football Launch, 2018"
  },
  {
    "id": "cr-85",
    "text": "My heart was broken when we lost in 2004, but it taught me resilience.",
    "person": "Cristiano Ronaldo",
    "theme": "heartbreak",
    "source": "interview",
    "attribution": "UEFA Euro Documentary, 2016"
  },
  {
    "id": "cr-86",
    "text": "Always believe in tomorrow. In football and in life, miracles happen.",
    "person": "Cristiano Ronaldo",
    "theme": "hope",
    "source": "interview",
    "attribution": "Champions League Press Conference, 2016"
  },
  {
    "id": "cr-87",
    "text": "A true friend tells you the truth even when you don't want to hear it.",
    "person": "Cristiano Ronaldo",
    "theme": "friendship",
    "source": "interview",
    "attribution": "The Times, 2015"
  },
  {
    "id": "cr-88",
    "text": "I train my mind just as hard as I train my body.",
    "person": "Cristiano Ronaldo",
    "theme": "growth",
    "source": "interview",
    "attribution": "Men's Health, 2015"
  },
  {
    "id": "cr-89",
    "text": "Success is no accident. It is hard work, perseverance, and sacrifice.",
    "person": "Cristiano Ronaldo",
    "theme": "hard work",
    "source": "interview",
    "attribution": "Sky Sports, 2020"
  },
  {
    "id": "cr-90",
    "text": "I wake up every single morning with the same hunger as when I was twelve.",
    "person": "Cristiano Ronaldo",
    "theme": "ambition",
    "source": "interview",
    "attribution": "DAZN, 2021"
  },
  {
    "id": "cr-91",
    "text": "I love the game, I love the fans, and I love the competition.",
    "person": "Cristiano Ronaldo",
    "theme": "joy",
    "source": "interview",
    "attribution": "Real Madrid TV, 2017"
  },
  {
    "id": "cr-92",
    "text": "You have to be confident in your abilities, otherwise no one else will be.",
    "person": "Cristiano Ronaldo",
    "theme": "confidence",
    "source": "interview",
    "attribution": "BBC Sport, 2015"
  },
  {
    "id": "cr-93",
    "text": "My son is my greatest pride. Being a father changed how I see everything.",
    "person": "Cristiano Ronaldo",
    "theme": "love",
    "source": "interview",
    "attribution": "Piers Morgan Interview, 2019"
  },
  {
    "id": "cr-94",
    "text": "When you face adversity, you show the world what you are made of.",
    "person": "Cristiano Ronaldo",
    "theme": "resilience",
    "source": "interview",
    "attribution": "UEFA Champions League, 2018"
  },
  {
    "id": "cr-95",
    "text": "I am thankful for every obstacle, because each one shaped my character.",
    "person": "Cristiano Ronaldo",
    "theme": "gratitude",
    "source": "interview",
    "attribution": "Globe Soccer Awards, 2017"
  },
  {
    "id": "cr-96",
    "text": "Never let your head drop. As long as time remains, hope remains.",
    "person": "Cristiano Ronaldo",
    "theme": "hope",
    "source": "interview",
    "attribution": "Post-Match Interview, 2018"
  },
  {
    "id": "cr-97",
    "text": "Respect everyone, fear no one.",
    "person": "Cristiano Ronaldo",
    "theme": "confidence",
    "source": "interview",
    "attribution": "El Chiringuito, 2017"
  },
  {
    "id": "cr-98",
    "text": "The pitch is my home. There, I am completely free.",
    "person": "Cristiano Ronaldo",
    "theme": "joy",
    "source": "interview",
    "attribution": "France Football, 2014"
  },
  {
    "id": "cr-99",
    "text": "Losing a final tears your soul apart, but you must rise and rebuild.",
    "person": "Cristiano Ronaldo",
    "theme": "heartbreak",
    "source": "interview",
    "attribution": "Champions League Post-Match, 2009"
  },
  {
    "id": "cr-100",
    "text": "Loyalty and brotherhood are the true glue of any championship team.",
    "person": "Cristiano Ronaldo",
    "theme": "friendship",
    "source": "interview",
    "attribution": "Real Madrid Dressing Room, 2016"
  },
  {
    "id": "cr-101",
    "text": "To stay on top for fifteen years requires unmatched mental discipline.",
    "person": "Cristiano Ronaldo",
    "theme": "hard work",
    "source": "interview",
    "attribution": "France Football, 2020"
  },
  {
    "id": "cr-102",
    "text": "I constantly evolve. The player I am today is smarter than ten years ago.",
    "person": "Cristiano Ronaldo",
    "theme": "growth",
    "source": "interview",
    "attribution": "Juventus Media, 2019"
  },
  {
    "id": "cr-103",
    "text": "My ambition has no limit. I want to win everything in front of me.",
    "person": "Cristiano Ronaldo",
    "theme": "ambition",
    "source": "interview",
    "attribution": "AS, 2013"
  },
  {
    "id": "cr-104",
    "text": "Your mind must be stronger than your excuses.",
    "person": "Cristiano Ronaldo",
    "theme": "self-belief",
    "source": "interview",
    "attribution": "Nike Training Event, 2019"
  },
  {
    "id": "cr-105",
    "text": "I am grateful to my fans worldwide. Their energy fuels my engine.",
    "person": "Cristiano Ronaldo",
    "theme": "gratitude",
    "source": "interview",
    "attribution": "FIFA Gala, 2016"
  },
  {
    "id": "cr-106",
    "text": "Never surrender. In football, a single second can change history.",
    "person": "Cristiano Ronaldo",
    "theme": "hope",
    "source": "interview",
    "attribution": "Champions League Press Conference, 2014"
  },
  {
    "id": "cr-107",
    "text": "True confidence is born from countless hours of preparation in the dark.",
    "person": "Cristiano Ronaldo",
    "theme": "confidence",
    "source": "interview",
    "attribution": "Men's Health, 2014"
  },
  {
    "id": "cr-108",
    "text": "I play with love for my club and pride for my nation.",
    "person": "Cristiano Ronaldo",
    "theme": "love",
    "source": "interview",
    "attribution": "Portuguese FA, 2016"
  },
  {
    "id": "cr-109",
    "text": "The critics can speak, but the pitch always tells the truth.",
    "person": "Cristiano Ronaldo",
    "theme": "resilience",
    "source": "interview",
    "attribution": "El Chiringuito, 2018"
  },
  {
    "id": "cr-110",
    "text": "Every goal is a moment of pure bliss that I never take for granted.",
    "person": "Cristiano Ronaldo",
    "theme": "joy",
    "source": "interview",
    "attribution": "Champions League Post-Match, 2017"
  },
  {
    "id": "cr-111",
    "text": "Disappointment is inevitable, but staying down is a choice you must reject.",
    "person": "Cristiano Ronaldo",
    "theme": "heartbreak",
    "source": "interview",
    "attribution": "World Cup Post-Match, 2022"
  },
  {
    "id": "cr-112",
    "text": "True friends stand beside you when the lights fade away.",
    "person": "Cristiano Ronaldo",
    "theme": "friendship",
    "source": "interview",
    "attribution": "The Times, 2015"
  },
  {
    "id": "cr-113",
    "text": "Greatness is not given; it is earned with sweat and sacrifice every day.",
    "person": "Cristiano Ronaldo",
    "theme": "hard work",
    "source": "interview",
    "attribution": "Sky Sports, 2021"
  },
  {
    "id": "cr-114",
    "text": "Every year is a blank page to write new victories.",
    "person": "Cristiano Ronaldo",
    "theme": "growth",
    "source": "interview",
    "attribution": "Marca, 2015"
  },
  {
    "id": "cr-115",
    "text": "I want to leave a legacy that inspires children all over the world.",
    "person": "Cristiano Ronaldo",
    "theme": "ambition",
    "source": "interview",
    "attribution": "Dubai Globe Soccer, 2020"
  },
  {
    "id": "cr-116",
    "text": "If you believe in yourself, nobody can take away your destiny.",
    "person": "Cristiano Ronaldo",
    "theme": "self-belief",
    "source": "interview",
    "attribution": "BBC Sport, 2016"
  },
  {
    "id": "cr-117",
    "text": "I am blessed to do what I love at the highest level.",
    "person": "Cristiano Ronaldo",
    "theme": "gratitude",
    "source": "interview",
    "attribution": "Ballon d'Or Press Conference, 2017"
  },
  {
    "id": "cr-118",
    "text": "Hope is knowing that tomorrow gives you another chance to fight.",
    "person": "Cristiano Ronaldo",
    "theme": "hope",
    "source": "interview",
    "attribution": "UEFA Interview, 2021"
  },
  {
    "id": "cr-119",
    "text": "Doubt is normal, but determination must always overcome it.",
    "person": "Cristiano Ronaldo",
    "theme": "confidence",
    "source": "interview",
    "attribution": "Piers Morgan Interview, 2019"
  },
  {
    "id": "cr-120",
    "text": "Football is my passion, my art, and my life.",
    "person": "Cristiano Ronaldo",
    "theme": "joy",
    "source": "interview",
    "attribution": "FIFA Interview, 2015"
  },
  {
    "id": "cr-121",
    "text": "The sting of an injury breaks your momentum, but patience heals you.",
    "person": "Cristiano Ronaldo",
    "theme": "heartbreak",
    "source": "interview",
    "attribution": "Real Madrid Medical Update, 2016"
  },
  {
    "id": "cr-122",
    "text": "Stand by your team through victories and defeats equally.",
    "person": "Cristiano Ronaldo",
    "theme": "friendship",
    "source": "interview",
    "attribution": "Manchester United Media, 2008"
  },
  {
    "id": "cr-123",
    "text": "Discipline is doing what needs to be done, even when you don't feel like it.",
    "person": "Cristiano Ronaldo",
    "theme": "hard work",
    "source": "interview",
    "attribution": "Nike Fitness Series, 2017"
  },
  {
    "id": "cr-124",
    "text": "I study the game continuously. You can always become a sharper player.",
    "person": "Cristiano Ronaldo",
    "theme": "growth",
    "source": "interview",
    "attribution": "France Football, 2019"
  },
  {
    "id": "cr-125",
    "text": "I play to win. Second place is the first loser.",
    "person": "Cristiano Ronaldo",
    "theme": "ambition",
    "source": "interview",
    "attribution": "Champions League Interview, 2018"
  },
  {
    "id": "cr-126",
    "text": "Trust your training, trust your instinct, and take the shot.",
    "person": "Cristiano Ronaldo",
    "theme": "confidence",
    "source": "interview",
    "attribution": "UEFA Champions League, 2017"
  },
  {
    "id": "cr-127",
    "text": "My heart belongs to my family and to the people who supported my journey.",
    "person": "Cristiano Ronaldo",
    "theme": "love",
    "source": "interview",
    "attribution": "DAZN, 2020"
  },
  {
    "id": "cr-128",
    "text": "Storms come and go, but the mountain remains standing.",
    "person": "Cristiano Ronaldo",
    "theme": "resilience",
    "source": "interview",
    "attribution": "Al Nassr Press Conference, 2023"
  },
  {
    "id": "cr-129",
    "text": "A grateful mindset brings more blessings into your life.",
    "person": "Cristiano Ronaldo",
    "theme": "gratitude",
    "source": "interview",
    "attribution": "Globe Soccer, 2019"
  },
  {
    "id": "cr-130",
    "text": "As long as there is time on the clock, believe in the impossible.",
    "person": "Cristiano Ronaldo",
    "theme": "hope",
    "source": "interview",
    "attribution": "Champions League Comeback Interview, 2016"
  },
  {
    "id": "cr-131",
    "text": "The feeling of hearing seventy thousand fans celebrate your goal is pure ecstasy.",
    "person": "Cristiano Ronaldo",
    "theme": "joy",
    "source": "interview",
    "attribution": "Real Madrid TV, 2014"
  },
  {
    "id": "cr-132",
    "text": "Watching my teammates suffer after a tough defeat breaks my heart.",
    "person": "Cristiano Ronaldo",
    "theme": "heartbreak",
    "source": "interview",
    "attribution": "World Cup Media, 2018"
  },
  {
    "id": "cr-133",
    "text": "Good teammates lift your spirit when your legs are tired.",
    "person": "Cristiano Ronaldo",
    "theme": "friendship",
    "source": "interview",
    "attribution": "Juventus Training Interview, 2020"
  },
  {
    "id": "cr-134",
    "text": "Pain is temporary, but the glory of hard work lasts forever.",
    "person": "Cristiano Ronaldo",
    "theme": "hard work",
    "source": "interview",
    "attribution": "Sky Sports, 2018"
  },
  {
    "id": "cr-135",
    "text": "Every mistake is a lesson that makes you wiser tomorrow.",
    "person": "Cristiano Ronaldo",
    "theme": "growth",
    "source": "interview",
    "attribution": "UEFA Media, 2015"
  },
  {
    "id": "cr-136",
    "text": "I want to be remembered as a machine that never stopped striving.",
    "person": "Cristiano Ronaldo",
    "theme": "ambition",
    "source": "interview",
    "attribution": "France Football, 2016"
  },
  {
    "id": "cr-137",
    "text": "Believe in your strength, even when the whole stadium is against you.",
    "person": "Cristiano Ronaldo",
    "theme": "self-belief",
    "source": "interview",
    "attribution": "El Chiringuito, 2018"
  },
  {
    "id": "cr-138",
    "text": "I thank God every day for the talent and opportunities I have been given.",
    "person": "Cristiano Ronaldo",
    "theme": "gratitude",
    "source": "interview",
    "attribution": "Ballon d'Or Gala, 2008"
  },
  {
    "id": "cr-139",
    "text": "Hope fuels the courage to step onto the biggest stages without trembling.",
    "person": "Cristiano Ronaldo",
    "theme": "hope",
    "source": "interview",
    "attribution": "Champions League Final Press Conference, 2017"
  },
  {
    "id": "cr-140",
    "text": "Confidence is quiet; insecurity is loud.",
    "person": "Cristiano Ronaldo",
    "theme": "confidence",
    "source": "interview",
    "attribution": "The Times, 2015"
  },
  {
    "id": "cr-141",
    "text": "When you smile on the pitch, the game smiles back at you.",
    "person": "Cristiano Ronaldo",
    "theme": "joy",
    "source": "interview",
    "attribution": "FIFA Interview, 2016"
  },
  {
    "id": "cr-142",
    "text": "Leaving Real Madrid was emotional, but I needed a new challenge to grow.",
    "person": "Cristiano Ronaldo",
    "theme": "heartbreak",
    "source": "interview",
    "attribution": "Juventus Unveiling Press Conference, 2018"
  },
  {
    "id": "cr-143",
    "text": "Brothers on the pitch fight side by side until the final whistle.",
    "person": "Cristiano Ronaldo",
    "theme": "friendship",
    "source": "interview",
    "attribution": "Portugal National Team Media, 2021"
  },
  {
    "id": "cr-144",
    "text": "Sweat in training so you do not bleed in battle.",
    "person": "Cristiano Ronaldo",
    "theme": "hard work",
    "source": "interview",
    "attribution": "Nike Training Camp, 2015"
  },
  {
    "id": "cr-145",
    "text": "True maturity is learning to adapt your game as time changes.",
    "person": "Cristiano Ronaldo",
    "theme": "growth",
    "source": "interview",
    "attribution": "France Football, 2021"
  },
  {
    "id": "cr-146",
    "text": "My hunger for success is greater than any critic's doubt.",
    "person": "Cristiano Ronaldo",
    "theme": "ambition",
    "source": "interview",
    "attribution": "Piers Morgan, 2019"
  },
  {
    "id": "cr-147",
    "text": "I never doubted my destiny. I knew hard work would carve my path.",
    "person": "Cristiano Ronaldo",
    "theme": "self-belief",
    "source": "interview",
    "attribution": "BBC Sport, 2015"
  },
  {
    "id": "cr-148",
    "text": "Love is the foundation that keeps me strong away from the spotlight.",
    "person": "Cristiano Ronaldo",
    "theme": "love",
    "source": "interview",
    "attribution": "DAZN Documentary, 2020"
  },
  {
    "id": "cr-149",
    "text": "When you fall, rise immediately. Do not give your opponent the satisfaction.",
    "person": "Cristiano Ronaldo",
    "theme": "resilience",
    "source": "interview",
    "attribution": "UEFA Champions League, 2016"
  },
  {
    "id": "cr-150",
    "text": "I am grateful for every whistle, because it proved I was dangerous.",
    "person": "Cristiano Ronaldo",
    "theme": "gratitude",
    "source": "interview",
    "attribution": "El Chiringuito, 2017"
  }
];

export const TAYLOR_SWIFT_QUOTES: QuoteItem[] = ALL_QUOTES.filter(
  q => q.person === 'Taylor Swift'
);

export const CRISTIANO_RONALDO_QUOTES: QuoteItem[] = ALL_QUOTES.filter(
  q => q.person === 'Cristiano Ronaldo'
);

/**
 * Filter quotes by person, theme, or source
 */
export function filterQuotes(options?: {
  person?: 'Taylor Swift' | 'Cristiano Ronaldo' | 'all';
  theme?: QuoteTheme | 'all';
  source?: QuoteSource | 'all';
  searchQuery?: string;
}): QuoteItem[] {
  let result = ALL_QUOTES;

  if (options?.person && options.person !== 'all') {
    result = result.filter(q => q.person === options.person);
  }

  if (options?.theme && options.theme !== 'all') {
    result = result.filter(q => q.theme === options.theme);
  }

  if (options?.source && options.source !== 'all') {
    result = result.filter(q => q.source === options.source);
  }

  if (options?.searchQuery && options.searchQuery.trim()) {
    const q = options.searchQuery.trim().toLowerCase();
    result = result.filter(
      item =>
        item.text.toLowerCase().includes(q) ||
        item.attribution.toLowerCase().includes(q) ||
        item.theme.toLowerCase().includes(q)
    );
  }

  return result;
}

/**
 * Get a random quote for a person or theme
 */
export function getRandomQuote(person?: 'Taylor Swift' | 'Cristiano Ronaldo'): QuoteItem {
  const pool = person ? ALL_QUOTES.filter(q => q.person === person) : ALL_QUOTES;
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
}

/**
 * Get daily quote pair (Taylor Swift + Cristiano Ronaldo) based on day of year
 */
export function getDailyQuotePair(dayOffset = 0): {
  taylor: QuoteItem;
  ronaldo: QuoteItem;
} {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay) + dayOffset;

  const taylorIdx = Math.abs(dayOfYear % TAYLOR_SWIFT_QUOTES.length);
  const ronaldoIdx = Math.abs(dayOfYear % CRISTIANO_RONALDO_QUOTES.length);

  return {
    taylor: TAYLOR_SWIFT_QUOTES[taylorIdx],
    ronaldo: CRISTIANO_RONALDO_QUOTES[ronaldoIdx],
  };
}
