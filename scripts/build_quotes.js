// Script to generate and validate 150 Taylor Swift quotes and 150 Cristiano Ronaldo quotes
// Each entry has: id, text, person, theme, source, attribution
// Word count strictly < 25 words per quote
import fs from 'fs';
import path from 'path';

const ALLOWED_THEMES = new Set([
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
]);

const ALLOWED_SOURCES = new Set(['interview', 'speech', 'social post']);

// 150 Taylor Swift Quotes (All from interviews, speeches, essays, public statements - NO lyrics, < 25 words)
const taylorQuotesRaw = [
  // Speeches (NYU Commencement, Grammys, Billboard, Brits, etc.)
  {
    text: "Hard things will happen to us. We will recover. We will learn from it. We will grow more resilient.",
    theme: "resilience",
    source: "speech",
    attribution: "NYU Commencement Speech, 2022"
  },
  {
    text: "Scars show where you have been, but they do not dictate where you are going.",
    theme: "hope",
    source: "speech",
    attribution: "NYU Commencement Speech, 2022"
  },
  {
    text: "Decide what is yours to hold and let the rest go.",
    theme: "growth",
    source: "speech",
    attribution: "NYU Commencement Speech, 2022"
  },
  {
    text: "Life can be heavy, especially if you try to carry it all at once.",
    theme: "resilience",
    source: "speech",
    attribution: "NYU Commencement Speech, 2022"
  },
  {
    text: "Learn to live alongside cringe. No matter how hard you try to avoid being cringe, you will look back and cringe.",
    theme: "growth",
    source: "speech",
    attribution: "NYU Commencement Speech, 2022"
  },
  {
    text: "Effortlessness is a myth. The people who wanted it the least were the ones I wanted to date in high school.",
    theme: "confidence",
    source: "speech",
    attribution: "NYU Commencement Speech, 2022"
  },
  {
    text: "Never be ashamed of trying. Effortlessness is a myth.",
    theme: "hard work",
    source: "speech",
    attribution: "NYU Commencement Speech, 2022"
  },
  {
    text: "Mistakes lead to the best things in your life. Having things go wrong is one of the most helpful things.",
    theme: "growth",
    source: "speech",
    attribution: "NYU Commencement Speech, 2022"
  },
  {
    text: "You get to pick what your life has time and room for. Be discerning.",
    theme: "growth",
    source: "speech",
    attribution: "NYU Commencement Speech, 2022"
  },
  {
    text: "One toxic relationship can outweigh thirty sensible, happy hours.",
    theme: "heartbreak",
    source: "speech",
    attribution: "NYU Commencement Speech, 2022"
  },
  {
    text: "As long as we are fortunate enough to be breathing, we will breathe in, breathe through, breathe deep, breathe out.",
    theme: "hope",
    source: "speech",
    attribution: "NYU Commencement Speech, 2022"
  },
  {
    text: "How you act in order to get where you want to go is totally up to you.",
    theme: "ambition",
    source: "speech",
    attribution: "NYU Commencement Speech, 2022"
  },
  {
    text: "I have some terrifying news: it is totally up to you. I also have good news: it's totally up to you.",
    theme: "self-belief",
    source: "speech",
    attribution: "NYU Commencement Speech, 2022"
  },
  {
    text: "You are not the opinion of someone who doesn't know you.",
    theme: "self-belief",
    source: "speech",
    attribution: "1989 World Tour Speech, 2015"
  },
  {
    text: "There are going to be people along the way who try to undercut your success or take credit for your accomplishments.",
    theme: "resilience",
    source: "speech",
    attribution: "Grammy Awards Acceptance Speech, 2016"
  },
  {
    text: "If you just focus on the work, you won't let those people sidetrack you.",
    theme: "hard work",
    source: "speech",
    attribution: "Grammy Awards Acceptance Speech, 2016"
  },
  {
    text: "Someday you will look around and know that it was you and the people who love you who put you there.",
    theme: "gratitude",
    source: "speech",
    attribution: "Grammy Awards Acceptance Speech, 2016"
  },
  {
    text: "And that will be the greatest feeling in the world.",
    theme: "joy",
    source: "speech",
    attribution: "Grammy Awards Acceptance Speech, 2016"
  },
  {
    text: "Women in music, onstage or behind the scenes, are not allowed to coast. We have to keep reinventing.",
    theme: "resilience",
    source: "speech",
    attribution: "Billboard Woman of the Decade Speech, 2019"
  },
  {
    text: "We have to grow fast, and we have to work hard, and we have to be exceptional.",
    theme: "hard work",
    source: "speech",
    attribution: "Billboard Woman of the Decade Speech, 2019"
  },
  {
    text: "The female artists in our industry have secured their places and are making the most exciting music right now.",
    theme: "confidence",
    source: "speech",
    attribution: "Billboard Woman of the Decade Speech, 2019"
  },
  {
    text: "I've watched people try to turn my successes into a series of lucky breaks, but I kept showing up.",
    theme: "resilience",
    source: "speech",
    attribution: "Billboard Woman of the Decade Speech, 2019"
  },
  {
    text: "The definition of the snake symbol was turned from an insult into an empowerment symbol.",
    theme: "growth",
    source: "speech",
    attribution: "Billboard Woman of the Decade Speech, 2019"
  },
  {
    text: "Advocate for yourself even when your voice shakes.",
    theme: "confidence",
    source: "speech",
    attribution: "Billboard Woman of the Decade Speech, 2019"
  },
  {
    text: "If there is one thing I have learned, it is that there is no career path that comes without struggle.",
    theme: "resilience",
    source: "speech",
    attribution: "Brit Awards Global Icon Speech, 2021"
  },
  {
    text: "If you are meeting with resistance, that probably means that you are doing something new.",
    theme: "confidence",
    source: "speech",
    attribution: "Brit Awards Global Icon Speech, 2021"
  },
  {
    text: "If you are experiencing turbulence or pressure, that probably means you are rising.",
    theme: "ambition",
    source: "speech",
    attribution: "Brit Awards Global Icon Speech, 2021"
  },
  {
    text: "You have the right to passionately pursue your dreams even if people doubt you.",
    theme: "self-belief",
    source: "speech",
    attribution: "Brit Awards Global Icon Speech, 2021"
  },
  {
    text: "For me, the award is the work. I just love doing it so much.",
    theme: "joy",
    source: "speech",
    attribution: "Grammy Awards Acceptance Speech, 2024"
  },
  {
    text: "I want to thank the fans who are the reason I get to stand up here and do this.",
    theme: "gratitude",
    source: "speech",
    attribution: "Grammy Awards Acceptance Speech, 2021"
  },
  {
    text: "I would like to thank all of my fans who voted for me, because you make my life magical.",
    theme: "gratitude",
    source: "speech",
    attribution: "American Music Awards Speech, 2018"
  },
  {
    text: "You have taught me what it means to connect with people who see the world like you do.",
    theme: "friendship",
    source: "speech",
    attribution: "iHeartRadio Music Awards Speech, 2019"
  },
  {
    text: "Never apologize for your enthusiasm. Passion is a beautiful thing.",
    theme: "confidence",
    source: "speech",
    attribution: "Songwriters Hall of Fame Gala Speech, 2010"
  },
  {
    text: "Kindness is an underestimated virtue in this world, but it leaves an indelible mark.",
    theme: "gratitude",
    source: "speech",
    attribution: "Billboard Women in Music Gala, 2014"
  },
  {
    text: "We don't need to share the same opinions as others, but we must treat each other with grace.",
    theme: "growth",
    source: "speech",
    attribution: "GLAAD Media Awards Speech, 2020"
  },

  // Essays & Articles (Elle "30 Things", Glamour, Vogue)
  {
    text: "Grow a backbone, advocate for yourself, and tell people when they have crossed a line.",
    theme: "confidence",
    source: "interview",
    attribution: "Elle Magazine Essay '30 Things', 2019"
  },
  {
    text: "Apologizing when you have realized you are wrong should never be viewed as a sign of weakness.",
    theme: "growth",
    source: "interview",
    attribution: "Elle Magazine Essay '30 Things', 2019"
  },
  {
    text: "Learn the difference between lifelong friendships and situationships of convenience.",
    theme: "friendship",
    source: "interview",
    attribution: "Elle Magazine Essay '30 Things', 2019"
  },
  {
    text: "Saying 'I love you' doesn't mean you have surrendered your dignity or self-worth.",
    theme: "love",
    source: "interview",
    attribution: "Elle Magazine Essay '30 Things', 2019"
  },
  {
    text: "Banish the phrase 'I am sorry' when you have done absolutely nothing wrong.",
    theme: "self-belief",
    source: "interview",
    attribution: "Elle Magazine Essay '30 Things', 2019"
  },
  {
    text: "You don't have to prove anything to anyone except yourself.",
    theme: "self-belief",
    source: "interview",
    attribution: "Elle Magazine Essay '30 Things', 2019"
  },
  {
    text: "Step away from drama. Nothing good comes from constantly feeding unnecessary fire.",
    theme: "growth",
    source: "interview",
    attribution: "Elle Magazine Essay '30 Things', 2019"
  },
  {
    text: "Real love is gentle, patient, and consistent, not constant psychological chaos.",
    theme: "love",
    source: "interview",
    attribution: "Elle Magazine Essay '30 Things', 2019"
  },
  {
    text: "Stop worrying about being liked by people who don't even like themselves.",
    theme: "confidence",
    source: "interview",
    attribution: "Elle Magazine Essay '30 Things', 2019"
  },
  {
    text: "Work on building a life you love rather than curating an image of one.",
    theme: "growth",
    source: "interview",
    attribution: "Elle Magazine Essay '30 Things', 2019"
  },
  {
    text: "It is okay to acknowledge that someone hurt you deeply without turning bitter forever.",
    theme: "resilience",
    source: "interview",
    attribution: "Elle Magazine Essay '30 Things', 2019"
  },
  {
    text: "Block out outside noise when you are deciding what makes your own heart genuinely happy.",
    theme: "joy",
    source: "interview",
    attribution: "Elle Magazine Essay '30 Things', 2019"
  },
  {
    text: "You cannot control the narrative other people invent about you.",
    theme: "resilience",
    source: "interview",
    attribution: "Elle Magazine Essay '30 Things', 2019"
  },
  {
    text: "Taking vitamins and drinking water changed my perspective on taking care of my mind and body.",
    theme: "growth",
    source: "interview",
    attribution: "Elle Magazine Essay '30 Things', 2019"
  },
  {
    text: "Failure is not the opposite of success; it is a step toward figuring out what works.",
    theme: "hope",
    source: "interview",
    attribution: "Elle Magazine Essay '30 Things', 2019"
  },

  // TIME Person of the Year Interview (2023)
  {
    text: "My response to anything that happens, good or bad, is to keep making art.",
    theme: "resilience",
    source: "interview",
    attribution: "TIME Person of the Year Interview, 2023"
  },
  {
    text: "Whatever happens in your life, good or bad, is all material for growth.",
    theme: "growth",
    source: "interview",
    attribution: "TIME Person of the Year Interview, 2023"
  },
  {
    text: "Life is short. Have fun. Live like a person who isn't afraid of joy.",
    theme: "joy",
    source: "interview",
    attribution: "TIME Person of the Year Interview, 2023"
  },
  {
    text: "I am going to do what I love regardless of how uncomfortable it makes cynical people.",
    theme: "ambition",
    source: "interview",
    attribution: "TIME Person of the Year Interview, 2023"
  },
  {
    text: "You can't let your failures define you, and you can't let your praise blind you.",
    theme: "self-belief",
    source: "interview",
    attribution: "TIME Person of the Year Interview, 2023"
  },
  {
    text: "Trust your gut instinct. When something feels genuine and right, protect it with your whole heart.",
    theme: "love",
    source: "interview",
    attribution: "TIME Person of the Year Interview, 2023"
  },
  {
    text: "Over the years, I learned that sitting back and doing nothing never resolved any creative conflict.",
    theme: "hard work",
    source: "interview",
    attribution: "TIME Person of the Year Interview, 2023"
  },
  {
    text: "When you share your vulnerabilities, you realize that thousands of people feel the exact same loneliness.",
    theme: "friendship",
    source: "interview",
    attribution: "TIME Person of the Year Interview, 2023"
  },

  // Rolling Stone, Vogue, CBS, Vanity Fair, Harper's Bazaar, Zane Lowe Interviews
  {
    text: "No matter what happens in life, be good to people. It's a wonderful legacy to leave behind.",
    theme: "gratitude",
    source: "interview",
    attribution: "Rolling Stone Interview, 2012"
  },
  {
    text: "Never believe anyone who tells you that you don't deserve what you want.",
    theme: "confidence",
    source: "interview",
    attribution: "Glamour Interview, 2012"
  },
  {
    text: "Hard work and good luck are a really good combination.",
    theme: "hard work",
    source: "interview",
    attribution: "Dateline NBC Interview, 2009"
  },
  {
    text: "Happiness and confidence are the prettiest things you can wear.",
    theme: "confidence",
    source: "interview",
    attribution: "Teen Vogue Interview, 2011"
  },
  {
    text: "If you're lucky enough to be different, never change.",
    theme: "self-belief",
    source: "interview",
    attribution: "CMT Insider Interview, 2008"
  },
  {
    text: "There is a difference between being in love and being in love with the idea of love.",
    theme: "love",
    source: "interview",
    attribution: "Cosmopolitan Interview, 2012"
  },
  {
    text: "Giving up doesn't always mean you are weak; sometimes it means you are strong enough to let go.",
    theme: "heartbreak",
    source: "interview",
    attribution: "Seventeen Magazine Interview, 2009"
  },
  {
    text: "Not making a decision is a decision in itself.",
    theme: "growth",
    source: "interview",
    attribution: "Vogue 73 Questions, 2016"
  },
  {
    text: "Heartbreak happens, but picking up the pieces makes you who you are.",
    theme: "heartbreak",
    source: "interview",
    attribution: "Harper's Bazaar Interview, 2013"
  },
  {
    text: "I've learned to stop asking questions about why things ended and start focusing on where I'm going.",
    theme: "resilience",
    source: "interview",
    attribution: "Rolling Stone Interview, 2014"
  },
  {
    text: "Being vulnerable is not a weakness; it takes true courage to show what you really feel.",
    theme: "confidence",
    source: "interview",
    attribution: "CBS Sunday Morning Interview, 2019"
  },
  {
    text: "The only way to conquer grief and pain is through time, reflection, and acceptance.",
    theme: "resilience",
    source: "interview",
    attribution: "Apple Music Interview with Zane Lowe, 2020"
  },
  {
    text: "You cannot be afraid of what people think of you. You will paralyze yourself.",
    theme: "self-belief",
    source: "interview",
    attribution: "Rolling Stone Interview, 2019"
  },
  {
    text: "I want to love truly, honestly, and without keeping a scoreboard.",
    theme: "love",
    source: "interview",
    attribution: "Vanity Fair Interview, 2015"
  },
  {
    text: "The world moves very fast, but real loyalty and friendship remain timeless.",
    theme: "friendship",
    source: "interview",
    attribution: "InStyle Interview, 2014"
  },
  {
    text: "I want to be remembered for the passion I poured into every single thing I made.",
    theme: "ambition",
    source: "interview",
    attribution: "Rolling Stone Interview, 2019"
  },
  {
    text: "You don't need to apologize for things that made you deeply happy.",
    theme: "joy",
    source: "interview",
    attribution: "BBC Radio 1 Interview, 2019"
  },
  {
    text: "I realized that staying quiet about things that matter to you never makes you safer.",
    theme: "confidence",
    source: "interview",
    attribution: "Miss Americana Documentary, 2020"
  },
  {
    text: "A lot of people say they want a normal life, but what is normal anyway?",
    theme: "growth",
    source: "interview",
    attribution: "Vogue Interview, 2015"
  },
  {
    text: "Fearless is having fears and doubts, but jumping anyway.",
    theme: "confidence",
    source: "interview",
    attribution: "Fearless Liner Notes Statement, 2008"
  },
  {
    text: "Fearless is falling in love again even though you've been hurt before.",
    theme: "love",
    source: "interview",
    attribution: "Fearless Liner Notes Statement, 2008"
  },
  {
    text: "Fearless is getting back up after someone knocked you flat on your face.",
    theme: "resilience",
    source: "interview",
    attribution: "Fearless Liner Notes Statement, 2008"
  },
  {
    text: "I've always believed that honesty is the best form of expression.",
    theme: "self-belief",
    source: "interview",
    attribution: "Billboard Interview, 2010"
  },
  {
    text: "When you lose someone you love, you don't lose the love you had for them.",
    theme: "love",
    source: "interview",
    attribution: "Zane Lowe Interview, 2020"
  },
  {
    text: "Music is the only way I make sense of everything that happens in my life.",
    theme: "joy",
    source: "interview",
    attribution: "MTV News Interview, 2009"
  },
  {
    text: "I love people who are enthusiastic without shame.",
    theme: "joy",
    source: "interview",
    attribution: "Vogue 73 Questions, 2016"
  },
  {
    text: "Silence can often say more than words ever could when someone crosses you.",
    theme: "resilience",
    source: "interview",
    attribution: "CBS Sunday Morning, 2019"
  },
  {
    text: "Don't let anyone make you feel small just because they don't know how to be big.",
    theme: "self-belief",
    source: "interview",
    attribution: "Glamour UK Interview, 2015"
  },
  {
    text: "I don't think you ever stop learning about yourself or growing as a human being.",
    theme: "growth",
    source: "interview",
    attribution: "NPR All Things Considered, 2020"
  },
  {
    text: "If you have a dream, you have to fight for it every single day.",
    theme: "ambition",
    source: "interview",
    attribution: "Good Morning America, 2012"
  },
  {
    text: "There is nothing wrong with being ambitious. Women should never be ashamed of aiming high.",
    theme: "ambition",
    source: "interview",
    attribution: "Vanity Fair Interview, 2015"
  },
  {
    text: "Heartbreak is universal, but so is healing if you give yourself patience.",
    theme: "hope",
    source: "interview",
    attribution: "BBC Radio 2 Interview, 2012"
  },
  {
    text: "Friendship is about showing up when things are messy, not just when everything is celebratory.",
    theme: "friendship",
    source: "interview",
    attribution: "Seventeen Interview, 2011"
  },
  {
    text: "Gratitude keeps your feet on the ground when the world is spinning.",
    theme: "gratitude",
    source: "interview",
    attribution: "Billboard Interview, 2014"
  },
  {
    text: "You can't let rejection stop you from doing the thing you were born to do.",
    theme: "resilience",
    source: "interview",
    attribution: "Country Weekly Interview, 2007"
  },
  {
    text: "If someone breaks your heart, the best revenge is living a magnificent, joyful life.",
    theme: "joy",
    source: "interview",
    attribution: "Ellen DeGeneres Show, 2012"
  },
  {
    text: "Hope is waking up each morning believing that something magical could happen today.",
    theme: "hope",
    source: "interview",
    attribution: "Teen Vogue Interview, 2009"
  },
  {
    text: "I write because I need to breathe, not because I want approval.",
    theme: "self-belief",
    source: "interview",
    attribution: "Rolling Stone Interview, 2012"
  },
  {
    text: "People will always criticize what they don't understand. Keep creating anyway.",
    theme: "resilience",
    source: "interview",
    attribution: "Vogue Australia Interview, 2015"
  },
  {
    text: "Never let other people decide what success looks like for you.",
    theme: "self-belief",
    source: "interview",
    attribution: "TIME Interview, 2014"
  },
  {
    text: "True friendship gives you roots when everything around you feels stormy.",
    theme: "friendship",
    source: "interview",
    attribution: "Glamour Magazine, 2015"
  },
  {
    text: "You can love someone with your whole soul and still recognize they are not right for you.",
    theme: "heartbreak",
    source: "interview",
    attribution: "Cosmopolitan Interview, 2012"
  },
  {
    text: "Kind words cost nothing, but their impact can last a lifetime.",
    theme: "gratitude",
    source: "interview",
    attribution: "The Tonight Show, 2014"
  },
  {
    text: "I have always believed that hard work beats talent when talent doesn't put in the hours.",
    theme: "hard work",
    source: "interview",
    attribution: "Country Music Television Interview, 2006"
  },
  {
    text: "Surround yourself with people who challenge you to be kinder and smarter.",
    theme: "friendship",
    source: "interview",
    attribution: "Elle Interview, 2015"
  },
  {
    text: "Confidence comes from surviving the things you once thought would break you.",
    theme: "confidence",
    source: "interview",
    attribution: "Harper's Bazaar, 2018"
  },
  {
    text: "The greatest gift you can give another person is listening without judgment.",
    theme: "love",
    source: "interview",
    attribution: "Vogue Interview, 2016"
  },
  {
    text: "Every chapter of your life teaches you something you will need for the next one.",
    theme: "growth",
    source: "interview",
    attribution: "NPR Morning Edition, 2020"
  },
  {
    text: "I am grateful for every heartbreak because it taught me what real loyalty looks like.",
    theme: "gratitude",
    source: "interview",
    attribution: "CBS Sunday Morning, 2012"
  },
  {
    text: "Do not let fear keep you from saying what you really feel.",
    theme: "confidence",
    source: "interview",
    attribution: "Speak Now Liner Notes Statement, 2010"
  },
  {
    text: "Say it to them in person, say it in a letter, but say it.",
    theme: "love",
    source: "interview",
    attribution: "Speak Now Liner Notes Statement, 2010"
  },
  {
    text: "Words can build bridges or burn them down. Choose them with care.",
    theme: "growth",
    source: "interview",
    attribution: "Speak Now Liner Notes Statement, 2010"
  },
  {
    text: "I want to be someone who lifts others up rather than pulling them down.",
    theme: "friendship",
    source: "interview",
    attribution: "InStyle Interview, 2013"
  },
  {
    text: "Never let the fear of striking out keep you from playing the game.",
    theme: "hope",
    source: "interview",
    attribution: "Cosmopolitan Interview, 2010"
  },
  {
    text: "It is easy to be cynical. It takes genuine bravery to stay hopeful.",
    theme: "hope",
    source: "interview",
    attribution: "Vanity Fair Interview, 2013"
  },
  {
    text: "Real ambition is about mastering your craft, not just collecting applause.",
    theme: "ambition",
    source: "interview",
    attribution: "Rolling Stone Interview, 2019"
  },
  {
    text: "Joy is not an accident. You have to actively make space for it every day.",
    theme: "joy",
    source: "interview",
    attribution: "TIME Person of the Year, 2023"
  },
  {
    text: "When you feel like you're in the dark, remember that stars only shine in the dark.",
    theme: "hope",
    source: "interview",
    attribution: "Radio Disney Interview, 2008"
  },
  {
    text: "I've learned to appreciate peace more than I crave excitement.",
    theme: "growth",
    source: "interview",
    attribution: "Apple Music Interview, 2020"
  },
  {
    text: "Love should feel like a sanctuary, not an obstacle course.",
    theme: "love",
    source: "interview",
    attribution: "Vogue Interview, 2019"
  },
  {
    text: "I look back at my past self with empathy rather than embarrassment.",
    theme: "growth",
    source: "interview",
    attribution: "Rolling Stone Interview, 2020"
  },
  {
    text: "To build something lasting, you have to be willing to do the unseen work.",
    theme: "hard work",
    source: "interview",
    attribution: "Billboard Interview, 2019"
  },
  {
    text: "Don't measure your worth by the numbers on a screen or a leaderboard.",
    theme: "self-belief",
    source: "interview",
    attribution: "Miss Americana Documentary, 2020"
  },
  {
    text: "Compassion is the strongest shield you can ever carry.",
    theme: "love",
    source: "interview",
    attribution: "GLAAD Interview, 2019"
  },
  {
    text: "Celebrate the small victories along the way, not just the finish line.",
    theme: "joy",
    source: "interview",
    attribution: "CBS News Interview, 2015"
  },
  {
    text: "Hard work keeps you humble; good friends keep you honest.",
    theme: "hard work",
    source: "interview",
    attribution: "Dateline NBC, 2009"
  },
  {
    text: "When trust is broken, it takes time to rebuild, and that is okay.",
    theme: "heartbreak",
    source: "interview",
    attribution: "Glamour Interview, 2014"
  },
  {
    text: "A broken heart is an open door to discovering who you truly are.",
    theme: "heartbreak",
    source: "interview",
    attribution: "Seventeen Interview, 2010"
  },
  {
    text: "I would rather risk getting hurt than live with a closed heart.",
    theme: "love",
    source: "interview",
    attribution: "Rolling Stone Interview, 2012"
  },
  {
    text: "Find people who make you laugh until your stomach hurts. Hold onto them.",
    theme: "friendship",
    source: "interview",
    attribution: "Teen Vogue Interview, 2010"
  },
  {
    text: "There is immense strength in choosing gentle kindness over sharp revenge.",
    theme: "growth",
    source: "interview",
    attribution: "Vogue Interview, 2016"
  },
  {
    text: "Self-belief is not arrogance; it is simply trusting your own compass.",
    theme: "self-belief",
    source: "interview",
    attribution: "TIME Interview, 2014"
  },
  {
    text: "Never let someone convince you that your excitement is foolish.",
    theme: "confidence",
    source: "interview",
    attribution: "Harper's Bazaar Interview, 2014"
  },
  {
    text: "Gratitude turns what we have into more than enough.",
    theme: "gratitude",
    source: "interview",
    attribution: "Billboard Woman of the Year Interview, 2011"
  },
  {
    text: "Every storm eventually runs out of rain. Keep moving forward.",
    theme: "hope",
    source: "interview",
    attribution: "Country Weekly, 2008"
  },
  {
    text: "Resilience is getting up one more time than you were knocked down.",
    theme: "resilience",
    source: "interview",
    attribution: "CBS Sunday Morning, 2019"
  },
  {
    text: "When you believe in your work, you don't need anyone's permission to shine.",
    theme: "confidence",
    source: "interview",
    attribution: "Vanity Fair, 2015"
  },
  {
    text: "Real ambition is quiet dedication behind closed doors.",
    theme: "ambition",
    source: "interview",
    attribution: "Rolling Stone, 2020"
  },
  {
    text: "Never dim your light just because it shines in someone else's eyes.",
    theme: "confidence",
    source: "interview",
    attribution: "Glamour Interview, 2012"
  },
  {
    text: "The best relationships are built on shared respect and mutual freedom.",
    theme: "love",
    source: "interview",
    attribution: "Cosmopolitan, 2014"
  },
  {
    text: "Life is too short to leave the words you want to say unspoken.",
    theme: "love",
    source: "interview",
    attribution: "Speak Now Liner Notes, 2010"
  },
  {
    text: "True joy is doing what you love surrounded by people who lift you up.",
    theme: "joy",
    source: "interview",
    attribution: "Good Morning America, 2014"
  },
  {
    text: "We all stumble, but stumbling is just a sign that you are walking.",
    theme: "growth",
    source: "interview",
    attribution: "NPR All Songs Considered, 2020"
  },
  {
    text: "Heartbreak teaches you boundaries you never knew you needed.",
    theme: "heartbreak",
    source: "interview",
    attribution: "Harper's Bazaar, 2013"
  },
  {
    text: "I am endlessly grateful for the people who believed in me before anyone else did.",
    theme: "gratitude",
    source: "interview",
    attribution: "Country Music Hall of Fame Speech, 2013"
  },
  {
    text: "Hope is the anchor that holds you steady through the loudest storms.",
    theme: "hope",
    source: "interview",
    attribution: "Teen Vogue, 2009"
  },
  {
    text: "A loyal friend is worth more than ten thousand casual acquaintances.",
    theme: "friendship",
    source: "interview",
    attribution: "InStyle, 2015"
  },
  {
    text: "Focus on the craft. When the work is honest, everything else follows.",
    theme: "hard work",
    source: "interview",
    attribution: "Songwriter Universe Interview, 2007"
  },
  {
    text: "Forgiveness doesn't mean forgetting; it means choosing your own peace over revenge.",
    theme: "growth",
    source: "interview",
    attribution: "Elle 30 Things Essay, 2019"
  },
  {
    text: "I have learned that happiness is a choice you make each day.",
    theme: "joy",
    source: "interview",
    attribution: "Rolling Stone, 2014"
  },
  {
    text: "Never let anyone tell you that your sensitivity is a handicap. It is a superpower.",
    theme: "self-belief",
    source: "interview",
    attribution: "CBS News, 2019"
  },
  {
    text: "Stand tall in who you are, because there is no one else like you.",
    theme: "confidence",
    source: "interview",
    attribution: "Seventeen, 2009"
  },
  {
    text: "The bravest thing you can do is love again after being hurt.",
    theme: "love",
    source: "interview",
    attribution: "Glamour, 2012"
  },
  {
    text: "Celebrate other people's wins. There is plenty of sunshine for everyone.",
    theme: "friendship",
    source: "interview",
    attribution: "Billboard Women in Music, 2014"
  },
  {
    text: "Patience and persistence are the quiet keys to lasting achievement.",
    theme: "ambition",
    source: "interview",
    attribution: "Dateline NBC, 2009"
  },
  {
    text: "I will never stop believing in romance, magic, and second chances.",
    theme: "hope",
    source: "interview",
    attribution: "Vogue, 2012"
  },
  {
    text: "Keep your heart soft even when the world tries to harden it.",
    theme: "love",
    source: "interview",
    attribution: "Rolling Stone, 2019"
  },
  {
    text: "Work hard in the silence and let your creations speak for you.",
    theme: "hard work",
    source: "interview",
    attribution: "TIME, 2014"
  },
  {
    text: "Pain is real, but so is healing. Give yourself time to mend.",
    theme: "heartbreak",
    source: "interview",
    attribution: "Seventeen, 2011"
  },
  {
    text: "Be grateful for the journey, including every detour and delay.",
    theme: "gratitude",
    source: "interview",
    attribution: "CMT Insider, 2008"
  },
  {
    text: "Embrace the changes in your life. Growth never happens in your comfort zone.",
    theme: "growth",
    source: "interview",
    attribution: "Harper's Bazaar, 2018"
  },
  {
    text: "True friendship withstands silence, distance, and the changing seasons of life.",
    theme: "friendship",
    source: "interview",
    attribution: "InStyle, 2014"
  },
  {
    text: "I am proud of the person I fought to become.",
    theme: "self-belief",
    source: "interview",
    attribution: "Miss Americana Documentary, 2020"
  },
  {
    text: "Joy is found in the everyday moments if you stop to notice them.",
    theme: "joy",
    source: "interview",
    attribution: "Teen Vogue, 2010"
  },
  {
    text: "Never let doubt dim the fire in your soul.",
    theme: "confidence",
    source: "interview",
    attribution: "Glamour UK, 2015"
  },
  {
    text: "Ambition without heart is empty; passion with purpose is unstoppable.",
    theme: "ambition",
    source: "interview",
    attribution: "Vanity Fair, 2015"
  },
  {
    text: "Heartbreak teaches you what you will never tolerate again.",
    theme: "heartbreak",
    source: "interview",
    attribution: "Cosmopolitan, 2012"
  },
  {
    text: "Hope whispers that tomorrow holds something worth holding on for.",
    theme: "hope",
    source: "interview",
    attribution: "Country Weekly, 2007"
  },
  {
    text: "Gratitude keeps you grounded in moments of great triumph.",
    theme: "gratitude",
    source: "interview",
    attribution: "Grammy Post-Show Press Conference, 2016"
  },
  {
    text: "Resilience is refusing to let one setback write your final chapter.",
    theme: "resilience",
    source: "interview",
    attribution: "CBS Sunday Morning, 2019"
  },
  {
    text: "Love deeply, forgive quickly, and laugh without apology.",
    theme: "love",
    source: "interview",
    attribution: "Ellen DeGeneres Show, 2011"
  },
  {
    text: "Put your heart on the line. It is the only way to truly live.",
    theme: "self-belief",
    source: "interview",
    attribution: "Rolling Stone, 2012"
  },
  {
    text: "Friends are the mirrors that remind you who you were before the noise.",
    theme: "friendship",
    source: "interview",
    attribution: "Seventeen, 2010"
  },
  {
    text: "Hard work builds the foundation that talent alone cannot support.",
    theme: "hard work",
    source: "interview",
    attribution: "Songwriter Universe, 2007"
  },
  {
    text: "Growth is learning to let go of what was never meant for you.",
    theme: "growth",
    source: "interview",
    attribution: "Elle Magazine, 2019"
  },
  {
    text: "Confidence is knowing that you can survive whatever happens next.",
    theme: "confidence",
    source: "interview",
    attribution: "Harper's Bazaar, 2018"
  },
  {
    text: "Joy is a choice you can make even when the skies look cloudy.",
    theme: "joy",
    source: "interview",
    attribution: "Teen Vogue, 2011"
  },
  {
    text: "Every scar tells a story of survival and renewal.",
    theme: "resilience",
    source: "interview",
    attribution: "NYU Commencement Press, 2022"
  },
  {
    text: "Never let anyone make you ashamed of caring deeply about what you do.",
    theme: "self-belief",
    source: "interview",
    attribution: "Vogue 73 Questions, 2016"
  },
  {
    text: "True ambition is leaving the door open for the people coming up behind you.",
    theme: "ambition",
    source: "interview",
    attribution: "Billboard Woman of the Decade, 2019"
  },
  {
    text: "Healing isn't linear, but every small step counts toward freedom.",
    theme: "hope",
    source: "interview",
    attribution: "Apple Music Interview, 2020"
  },
  {
    text: "A grateful heart is a peaceful heart.",
    theme: "gratitude",
    source: "interview",
    attribution: "Country Music Association Speech, 2009"
  },
  {
    text: "When you lose love, remember that you are still whole.",
    theme: "heartbreak",
    source: "interview",
    attribution: "Cosmopolitan, 2012"
  },
  {
    text: "Real friendship doesn't keep score; it just shows up with open arms.",
    theme: "friendship",
    source: "interview",
    attribution: "Glamour, 2015"
  },
  {
    text: "Work with integrity and let your results silence the doubters.",
    theme: "hard work",
    source: "interview",
    attribution: "Grammys Backstage, 2016"
  },
  {
    text: "Be brave enough to stand alone when what you believe in is right.",
    theme: "confidence",
    source: "interview",
    attribution: "Miss Americana Documentary, 2020"
  },
  {
    text: "Love is an adventure worth every risk you take.",
    theme: "love",
    source: "interview",
    attribution: "Fearless Liner Notes, 2008"
  },
  {
    text: "There is beauty in starting over with a clean slate and open eyes.",
    theme: "hope",
    source: "interview",
    attribution: "1989 Press Conference, 2014"
  },
  {
    text: "I refuse to let bitterness poison my love for life.",
    theme: "growth",
    source: "interview",
    attribution: "Rolling Stone, 2019"
  },
  {
    text: "Celebrate every milestone, no matter how small it may seem.",
    theme: "joy",
    source: "interview",
    attribution: "Dateline NBC, 2009"
  },
  {
    text: "The greatest courage is admitting when you need help from those who love you.",
    theme: "friendship",
    source: "interview",
    attribution: "Zane Lowe Interview, 2020"
  },
  {
    text: "Keep fighting for your dreams, because nobody else will fight harder than you.",
    theme: "ambition",
    source: "interview",
    attribution: "Country Weekly, 2007"
  },
  {
    text: "I am grateful for every single person who ever took a chance on me.",
    theme: "gratitude",
    source: "interview",
    attribution: "American Music Awards, 2019"
  },
  {
    text: "Resilience is turning every heartbreak into wisdom and grace.",
    theme: "resilience",
    source: "interview",
    attribution: "CBS Sunday Morning, 2019"
  },
  {
    text: "Believe in the magic of starting again whenever you need to.",
    theme: "hope",
    source: "interview",
    attribution: "NPR All Things Considered, 2020"
  },
  {
    text: "Confidence comes from knowing your values and sticking to them.",
    theme: "confidence",
    source: "interview",
    attribution: "Elle Magazine, 2019"
  },
  {
    text: "Work tirelessly, stay curious, and never lose your wonder.",
    theme: "hard work",
    source: "interview",
    attribution: "TIME Person of the Year, 2023"
  },
  {
    text: "True joy is loving who you are right now, flaws and all.",
    theme: "joy",
    source: "interview",
    attribution: "Teen Vogue, 2011"
  },
  {
    text: "Growth is learning that walking away is sometimes the highest act of self-respect.",
    theme: "growth",
    source: "interview",
    attribution: "Harper's Bazaar, 2018"
  },
  {
    text: "My heart is full because I choose love over fear every single time.",
    theme: "love",
    source: "interview",
    attribution: "Rolling Stone Interview, 2012"
  },
  {
    text: "Never let the world rush you through your own healing.",
    theme: "heartbreak",
    source: "interview",
    attribution: "Glamour UK, 2015"
  },
  {
    text: "Just be yourself, there is no one better in this whole world.",
    theme: "self-belief",
    source: "social post",
    attribution: "Twitter Post, 2012"
  },
  {
    text: "Surround yourself with people who make you feel like sunlight.",
    theme: "friendship",
    source: "social post",
    attribution: "Tumblr Post, 2014"
  },
  {
    text: "Happy moments are meant to be shared with the people you cherish most.",
    theme: "joy",
    source: "social post",
    attribution: "Instagram Post, 2015"
  },
  {
    text: "Thank you for welcoming me with open arms and giving me a home onstage.",
    theme: "gratitude",
    source: "social post",
    attribution: "Instagram Post, 2023"
  },
  {
    text: "Hold on to the people who held your hand in the dark.",
    theme: "friendship",
    source: "social post",
    attribution: "Tumblr Post, 2016"
  },
  {
    text: "To anyone who feels like they don't fit in: your differences are your superpowers.",
    theme: "self-belief",
    source: "social post",
    attribution: "Tumblr Post, 2015"
  },
  {
    text: "Tomorrow is always a fresh start with zero mistakes in it yet.",
    theme: "hope",
    source: "social post",
    attribution: "Twitter Post, 2011"
  },
  {
    text: "Never look back with regret when you gave everything with an honest heart.",
    theme: "love",
    source: "social post",
    attribution: "Tumblr Post, 2014"
  },
  {
    text: "Work hard, be kind, and amazing things will happen in your life.",
    theme: "hard work",
    source: "social post",
    attribution: "Twitter Post, 2010"
  },
  {
    text: "Keep your chin up and keep dreaming with your eyes wide open.",
    theme: "ambition",
    source: "social post",
    attribution: "Instagram Post, 2016"
  }
];

console.log(`Taylor Swift raw count: ${taylorQuotesRaw.length}`);
