import { excerptA, excerptB, excerptC, excerptD, PageContent } from './bookData';

/**
 * Latin Square Counterbalancing for 4x4 design
 * Each condition assigns a different excerpt to each interface
 *
 * Condition 1: Tabbed=A, Clickable=B, Network=C, LLM=D
 * Condition 2: Tabbed=B, Clickable=C, Network=D, LLM=A
 * Condition 3: Tabbed=C, Clickable=D, Network=A, LLM=B
 * Condition 4: Tabbed=D, Clickable=A, Network=B, LLM=C
 */
const COUNTERBALANCING: Record<number, Record<string, PageContent[]>> = {
  1: { tabbed: excerptA, clickable: excerptB, network: excerptC, llm: excerptD },
  2: { tabbed: excerptB, clickable: excerptC, network: excerptD, llm: excerptA },
  3: { tabbed: excerptC, clickable: excerptD, network: excerptA, llm: excerptB },
  4: { tabbed: excerptD, clickable: excerptA, network: excerptB, llm: excerptC },
};

/**
 * Get excerpt based on URL parameters for experimental counterbalancing
 *
 * Usage: ?condition=1&mode=tabbed
 *
 * @param mode - The interface mode (tabbed, clickable, network, llm)
 * @returns The appropriate excerpt for the given condition and mode
 */
export function getExcerptForMode(mode: 'tabbed' | 'clickable' | 'network' | 'llm'): PageContent[] {
  if (typeof window === 'undefined') {
    return excerptA; // Server-side rendering fallback
  }

  const params = new URLSearchParams(window.location.search);
  const conditionParam = params.get('condition');
  const condition = conditionParam ? parseInt(conditionParam) : 1;

  console.log(`[Counterbalancing] Mode: ${mode}, Condition: ${condition}, URL: ${window.location.search}`);

  // Validate condition is 1-4
  if (condition < 1 || condition > 4) {
    console.warn(`Invalid condition ${condition}, using condition 1`);
    return COUNTERBALANCING[1][mode];
  }

  const excerpt = COUNTERBALANCING[condition][mode];
  console.log(`[Counterbalancing] Returning excerpt with ${excerpt.length} pages`);

  return excerpt;
}

/**
 * Legacy function for backward compatibility
 * Get excerpt based on URL parameter
 * Usage: ?excerpt=A or ?excerpt=B or ?excerpt=C or ?excerpt=D
 */
export function getExcerptFromURL(): PageContent[] {
  if (typeof window === 'undefined') {
    return excerptA;
  }

  const params = new URLSearchParams(window.location.search);
  const excerptParam = params.get('excerpt')?.toUpperCase();

  switch (excerptParam) {
    case 'A':
      return excerptA;
    case 'B':
      return excerptB;
    case 'C':
      return excerptC;
    case 'D':
      return excerptD;
    default:
      return excerptA;
  }
}
