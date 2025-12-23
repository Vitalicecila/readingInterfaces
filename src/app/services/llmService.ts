import OpenAI from 'openai';

interface CharacterContext {
  characterName: string;
  currentText: string;
  lastSeenInfo?: {
    page: number;
    chapter: string;
    pagesDiff: number;
  };
  characterInfo: {
    description: string;
    role: string;
  };
}

let openaiClient: OpenAI | null = null;

export function initializeOpenAI(apiKey: string) {
  openaiClient = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true // Note: For production, use a backend proxy
  });
}

export async function generateCharacterContext(context: CharacterContext): Promise<string[]> {
  if (!openaiClient) {
    // Fallback if API key not set
    return generateFallbackContext(context);
  }

  try {
    const prompt = buildPrompt(context);

    const response = await openaiClient.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful reading assistant that provides concise, contextual information about characters in literature. Keep responses brief and natural, as if seamlessly embedded in the text.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 150
    });

    const generatedText = response.choices[0]?.message?.content?.trim();

    if (generatedText) {
      // Parse the response into parts (description and context)
      return parseGeneratedContext(generatedText, context);
    }

    return generateFallbackContext(context);
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    return generateFallbackContext(context);
  }
}

function buildPrompt(context: CharacterContext): string {
  const { characterName, currentText, lastSeenInfo, characterInfo } = context;

  let prompt = `In the novel excerpt below, the character "${characterName}" appears. `;
  prompt += `Provide a brief (1-2 sentence) contextual reminder about who ${characterName} is`;

  if (lastSeenInfo && lastSeenInfo.pagesDiff > 0) {
    prompt += `, noting that they last appeared ${lastSeenInfo.pagesDiff} page(s) ago`;
  }

  prompt += `.

Character info: ${characterInfo.description} (${characterInfo.role})

Current excerpt:
"${currentText.substring(0, 300)}..."

Provide:
1. A natural description of the character (what's most relevant to remember now)
2. ${lastSeenInfo && lastSeenInfo.pagesDiff > 0 ? 'A brief note about when they were last seen' : ''}

Format as: [Description] | [Last seen note if applicable]`;

  return prompt;
}

function parseGeneratedContext(generated: string, context: CharacterContext): string[] {
  const parts = generated.split('|').map(s => s.trim());

  if (parts.length >= 2) {
    return parts.filter(p => p.length > 0);
  }

  // If not properly formatted, treat as single description
  return [generated];
}

function generateFallbackContext(context: CharacterContext): string[] {
  const { characterName, lastSeenInfo, characterInfo } = context;
  const parts = [];

  // Main description
  parts.push(characterInfo.description);

  // Last seen information
  if (lastSeenInfo && lastSeenInfo.pagesDiff > 0) {
    const firstName = characterName.split(' ')[0];
    if (lastSeenInfo.pagesDiff === 1) {
      parts.push(`We last encountered ${firstName} on the previous page`);
    } else if (lastSeenInfo.pagesDiff === 2) {
      parts.push(`${firstName} was last mentioned two pages ago`);
    } else {
      parts.push(`${firstName} hasn't appeared for ${lastSeenInfo.pagesDiff} pages`);
    }
  }

  return parts;
}

export function isOpenAIInitialized(): boolean {
  return openaiClient !== null;
}
