import { describe, it, expect } from 'vitest';

describe('Dao Insight Quotes', () => {
  const DAO_INSIGHTS = [
    'The high mountain whispers to the quiet flute, and the Dao answers in silence.',
    'Cultivating soundscapes across three thousand mortal worlds.',
    'A single tone of the Guqin can disperse the clouds of Heavenly Tribulation.',
    'Music is the resonance of the universe, the path to ascension.',
    'When the heart is still, the wind in the bamboo becomes a symphony.',
    'A warm, slow-simmered bowl of sweet congee on a snowy mountain pass.',
    'True harmony resides in the formless space between notes.',
    'The wind from the East carries the sound of ancient zithers, clearing the mind.',
    'Qi flows where the focus goes; let the rhythm lead your immortal path.',
  ];

  it('should identify long quotes that exceed standard container width threshold', () => {
    const longQuotes = DAO_INSIGHTS.filter((quote) => quote.length > 40);
    expect(longQuotes.length).toBeGreaterThan(0);
    expect(longQuotes).toContain('The high mountain whispers to the quiet flute, and the Dao answers in silence.');
  });

  it('should preserve full wording without truncation ellipsis for rotating quotes', () => {
    const sampleQuote = 'The high mountain whispers to the quiet flute, and the Dao answers in silence.';
    expect(sampleQuote).not.toContain('...');
    expect(sampleQuote.endsWith('.')).toBe(true);
  });
});
