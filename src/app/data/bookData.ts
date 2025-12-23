/**
 * BOOK DATA CONFIGURATION
 *
 * To use your own PDF book:
 * 1. Extract text from your PDF using a PDF-to-text converter
 * 2. Update the 'characters' object with your book's characters
 * 3. Break the text into pages in the 'pages' array
 * 4. Save this file and refresh the app
 */

export interface Character {
  name: string;
  description: string;
  role: string;
  appearances: number;
  relationships?: Array<{
    character: string;
    type: string;
  }>;
}

export interface PageContent {
  text: string;
  chapter: string;
}

// ============================================
// CHARACTER DEFINITIONS
// ============================================
export const characters: Record<string, Character> = {
  'Mr. Bennet': {
    name: "Mr. Bennet",
    description: "The father of the Bennet family, known for his sarcastic wit and indifference to societal expectations.",
    role: "Supporting Character",
    appearances: 5,
    relationships: [
      { character: "Mrs. Bennet", type: "husband" },
      { character: "Elizabeth", type: "father" },
      { character: "Jane", type: "father" },
    ]
  },
  'Mrs. Bennet': {
    name: "Mrs. Bennet",
    description: "The mother of the Bennet family, eager to see her daughters married off to wealthy suitors.",
    role: "Supporting Character",
    appearances: 6,
    relationships: [
      { character: "Mr. Bennet", type: "wife" },
      { character: "Elizabeth", type: "mother" },
      { character: "Jane", type: "mother" },
    ]
  },
  'Richelieu': {
    name: "Cardinal Richelieu",
    description: "The legendary predecessor of Mazarin, whose shadow still looms over French politics.",
    role: "Supporting Character",
    appearances: 1,
    relationships: [
      { character: "Mazarin", type: "predecessor" },
    ]
  },
  'Mazarin': {
    name: "Cardinal Mazarin",
    description: "A powerful and cunning political figure, Mazarin is aware of his precarious position as a favorite and is determined to manipulate public sentiment to his advantage.",
    role: "Protagonist",
    appearances: 6,
    relationships: [
      { character: "Richelieu", type: "successor" },
      { character: "Orléans", type: "ally" },
      { character: "Montargis", type: "ally" },
      { character: "Duke de Beaufort", type: "political rival" },
      { character: "Prince de Condé", type: "political rival" },
    ]
  },
  'Earl of Essex': {
    name: "Earl of Essex",
    description: "A historical figure referenced by Mazarin, known for his relationship with the royal mistress and his downfall.",
    role: "Supporting Character",
    appearances: 1
  },
  'Duke de Beaufort': {
    name: "Duke de Beaufort",
    description: "A nobleman mentioned by Mazarin as a figure he intends to manipulate public sentiment towards.",
    role: "Supporting Character",
    appearances: 1,
    relationships: [
      { character: "Mazarin", type: "political rival" },
    ]
  },
  'Prince de Condé': {
    name: "Prince de Cond\u00e9",
    description: "Another nobleman referenced by Mazarin, whom he plans to use in his political machinations.",
    role: "Supporting Character",
    appearances: 1,
    relationships: [
      { character: "Mazarin", type: "political rival" },
    ]
  },
  'Orléans': {
    name: "Orl\u00e9ans",
    description: "A political ally of Mazarin, mentioned as being part of his plans to control the parliament.",
    role: "Supporting Character",
    appearances: 1,
    relationships: [
      { character: "Mazarin", type: "ally" },
      { character: "Montargis", type: "ally" },
    ]
  },
  'Montargis': {
    name: "Montargis",
    description: "Another ally of Mazarin, involved in his political strategies against the parliament.",
    role: "Supporting Character",
    appearances: 1,
    relationships: [
      { character: "Mazarin", type: "ally" },
      { character: "Orléans", type: "ally" },
    ]
  },
  'Elizabeth': {
    name: "Elizabeth Bennet",
    description: "A concerned sister who watches the proceedings with anxious attention and shares in her sister's happiness.",
    role: "Protagonist",
    appearances: 3,
    relationships: [
      { character: "Jane", type: "sister" },
      { character: "Mr. Bennet", type: "daughter" },
      { character: "Mrs. Bennet", type: "daughter" },
      { character: "Mr. Darcy", type: "love interest" },
    ]
  },
  'Jane': {
    name: "Jane Bennet",
    description: "Elizabeth's sister, known for her sweet disposition and elegant manners, making her universally beloved.",
    role: "Supporting Character",
    appearances: 2,
    relationships: [
      { character: "Elizabeth", type: "sister" },
      { character: "Mr. Bennet", type: "daughter" },
      { character: "Mrs. Bennet", type: "daughter" },
      { character: "Mr. Bingley", type: "love interest" },
      { character: "Mr. Darcy", type: "subject of admiration" },
    ]
  },
  'Mr. Darcy': {
    name: "Mr. Fitzwilliam Darcy",
    description: "A wealthy and proud gentleman whose penetrating gaze and air of superiority make him disagreeable to many.",
    role: "Antagonist",
    appearances: 3,
    relationships: [
      { character: "Elizabeth", type: "love interest" },
      { character: "Jane", type: "subject of admiration" },
      { character: "Mr. Bingley", type: "friend" },
    ]
  },
  'Mr. Bingley': {
    name: "Mr. Charles Bingley",
    description: "A friendly and sociable gentleman who appreciates the pleasant company of the girls at the assembly.",
    role: "Supporting Character",
    appearances: 4,
    relationships: [
      { character: "Jane", type: "love interest" },
      { character: "Mr. Darcy", type: "friend" },
    ]
  },
  'Lady Lucas': {
    name: "Lady Lucas",
    description: "The Bennet family's neighbor who provides a favorable report about Mr. Bingley.",
    role: "Supporting Character",
    appearances: 2,
    relationships: [
      { character: "Sir William", type: "wife" },
    ]
  },
  'Sir William': {
    name: "Sir William Lucas",
    description: "Lady Lucas's husband, who provides a favorable report about Mr. Bingley.",
    role: "Supporting Character",
    appearances: 2,
    relationships: [
      { character: "Lady Lucas", type: "husband" },
    ]
  },
  'Mrs. Long': {
    name: "Mrs. Long",
    description: "A neighbor who brings news to Mrs. Bennet about Netherfield Park being let.",
    role: "Supporting Character",
    appearances: 2
  },
};

// ============================================
// BOOK PAGES/CHAPTERS
// Four different excerpts for counterbalancing in experiments
// Each interface can use any excerpt via URL parameter
// ============================================

// Excerpt A - Opening conversation between Mr. and Mrs. Bennet
export const excerptA: PageContent[] = [
  {
    chapter: 'Chapter 1',
    text: `It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.

However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters.

"My dear Mr. Bennet," said his lady to him one day, "have you heard that Netherfield Park is let at last?"

Mrs. Bennet replied that he had not.

"But it is," returned she; "for Mrs. Long has just been here, and she told me all about it."

Mr. Bennet made no answer.

"Do you not want to know who has taken it?" cried his wife impatiently.

"You want to tell me, and I have no objection to hearing it."

This was invitation enough.`
  },
  {
    chapter: 'Chapter 1 (continued)',
    text: `"Why, my dear, you must know, Mrs. Long says that Netherfield is taken by a young man of large fortune from the north of England; that he came down on Monday in a chaise and four to see the place, and was so much delighted with it, that he agreed with Mr. Morris immediately; that he is to take possession before Michaelmas, and some of his servants are to be in the house by the end of next week."

"What is his name?"

"Mr. Bingley."

"Is he married or single?"

"Oh! Single, my dear, to be sure! A single man of large fortune; four or five thousand a year. What a fine thing for our girls!"

"How so? How can it affect them?"

"My dear Mr. Bennet," replied his wife, "how can you be so tiresome! You must know that I am thinking of his marrying one of them."`
  },
  {
    chapter: 'Chapter 3',
    text: `Not all that Mrs. Bennet, however, with the assistance of her five daughters, could ask on the subject, was sufficient to draw from her husband any satisfactory description of Mr. Bingley. They attacked him in various ways—with barefaced questions, ingenious suppositions, and distant surmises; but he eluded the skill of them all, and they were at last obliged to accept the second-hand intelligence of their neighbour, Lady Lucas.

Her report was highly favourable. Sir William had been delighted with him. He was quite young, wonderfully handsome, extremely agreeable, and, to crown the whole, he meant to be at the next assembly with a large party. Nothing could be more delightful! To be fond of dancing was a certain step towards falling in love; and very lively hopes of Mr. Bingley's heart were entertained.

"If I can but see one of my daughters happily settled at Netherfield," said Mrs. Bennet to her husband, "and all the others equally well married, I shall have nothing to wish for."`
  },
  {
    chapter: 'Chapter 5',
    text: `Elizabeth stood by her sister with the utmost concern, and watched the proceedings with anxious attention. Jane's sweet disposition and elegant manners made her universally beloved, and Elizabeth shared in her happiness.

Mr. Darcy stood near them in silent contemplation. Elizabeth could not help but notice his penetrating gaze, though she attributed it to his general air of superiority. His wealth and status were undeniable, yet his proud demeanor had already made him disagreeable to the entire assembly.

"I would not be so fastidious as you are," cried Mr. Bingley, "for a kingdom! Upon my honour, I never met with so many pleasant girls in my life as I have this evening; and there are several of them you see uncommonly pretty."

"You are dancing with the only handsome girl in the room," said Mr. Darcy, looking at Jane.

"Oh! She is the most beautiful creature I ever beheld! But there is one of her sisters sitting down just behind you, who is very pretty, and I dare say very agreeable. Do let me ask my partner to introduce you."

"Which do you mean?" and turning round he looked for a moment at Elizabeth, till catching her eye, he withdrew his own and coldly said: "She is tolerable, but not handsome enough to tempt me."`
  }
];

// Excerpt B - Richelieu and Mazarino
export const excerptB: PageContent[] = [
  {
    chapter: 'Twenty Years After - Chapter 1 (Alexandre Dumas)',
    text: `
The shade of Richelieu was Mazarin. Now Mazarin was alone and
defenceless, as he well knew.

“Foreigner!” he ejaculated, “Italian! that is their mean yet mighty
byword of reproach—the watchword with which they assassinated, hanged,
and made away with Concini; and if I gave them their way they would
assassinate, hang, and make away with me in the same manner, although
they have nothing to complain of except a tax or two now and then.
Idiots! ignorant of their real enemies, they do not perceive that it is
not the Italian who speaks French badly, but those who can say fine
things to them in the purest Parisian accent, who are their real foes.

“Yes, yes,” Mazarin continued, whilst his wonted smile, full of
subtlety, lent a strange expression to his pale lips; “yes, these
noises prove to me, indeed, that the destiny of favorites is
precarious; but ye shall know I am no ordinary favorite. No! The Earl
of Essex, ’tis true, wore a splendid ring, set with diamonds, given him
by his royal mistress, whilst I—I have nothing but a simple circlet of
gold, with a cipher on it and a date; but that ring has been blessed in
the chapel of the Palais Royal,* so they will never ruin me, as they
long to do, and whilst they shout, ‘Down with Mazarin!’ I, unknown, and
unperceived by them, incite them to cry out, ‘Long live the Duke de
Beaufort’ one day; another, ‘Long live the Prince de Condé;’ and again,
‘Long live the parliament!’” And at this word the smile on the
cardinal’s lips assumed an expression of hatred, of which his mild
countenance seemed incapable. “The parliament! We shall soon see how to
dispose,” he continued, “of the parliament! Both Orléans and Montargis
are ours. It will be a work of time, but those who have begun by crying
out: Down with Mazarin! will finish by shouting out, Down with all the
people I have mentioned, each in his turn.`
  }
];

// Excerpt C - The assembly ball and first impressions
export const excerptC: PageContent[] = [
  {
    chapter: 'Chapter 3',
    text: `Elizabeth stood by her sister with the utmost concern, and watched the proceedings with anxious attention. Jane's sweet disposition and elegant manners made her universally beloved, and Elizabeth shared in her happiness.

Mr. Darcy stood near them in silent contemplation. Elizabeth could not help but notice his penetrating gaze, though she attributed it to his general air of superiority. His wealth and status were undeniable, yet his proud demeanor had already made him disagreeable to the entire assembly.

"I would not be so fastidious as you are," cried Mr. Bingley, "for a kingdom! Upon my honour, I never met with so many pleasant girls in my life as I have this evening; and there are several of them you see uncommonly pretty."

"You are dancing with the only handsome girl in the room," said Mr. Darcy, looking at Jane.

"Oh! She is the most beautiful creature I ever beheld! But there is one of her sisters sitting down just behind you, who is very pretty, and I dare say very agreeable. Do let me ask my partner to introduce you."

"Which do you mean?" and turning round he looked for a moment at Elizabeth, till catching her eye, he withdrew his own and coldly said: "She is tolerable, but not handsome enough to tempt me."`
  }
];

// Excerpt D - Family dynamics and Mr. Bingley's arrival
export const excerptD: PageContent[] = [
  {
    chapter: 'Chapter 3',
    text: `Not all that Mrs. Bennet, however, with the assistance of her five daughters, could ask on the subject, was sufficient to draw from her husband any satisfactory description of Mr. Bingley. They attacked him in various ways—with barefaced questions, ingenious suppositions, and distant surmises; but he eluded the skill of them all, and they were at last obliged to accept the second-hand intelligence of their neighbour, Lady Lucas.

Her report was highly favourable. Sir William had been delighted with him. He was quite young, wonderfully handsome, extremely agreeable, and, to crown the whole, he meant to be at the next assembly with a large party. Nothing could be more delightful! To be fond of dancing was a certain step towards falling in love; and very lively hopes of Mr. Bingley's heart were entertained.

"If I can but see one of my daughters happily settled at Netherfield," said Mrs. Bennet to her husband, "and all the others equally well married, I shall have nothing to wish for."`
  }
];

// Backwards compatibility exports
export const tabbedPages = excerptA;
export const clickablePages = excerptB;
export const networkPages = excerptC;
export const llmPages = excerptA;
export const pages = excerptA;

// ============================================
// BOOK METADATA
// ============================================
export const bookMetadata = {
  title: 'Pride and Prejudice',
  author: 'Jane Austen',
  year: 1813
};
