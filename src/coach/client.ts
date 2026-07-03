import type { CoachPrompt } from './promptTemplates';
import { apiKeyStore } from '../storage/db';

/**
 * Thin wrapper around the Anthropic Messages API, called directly from the
 * browser using the "bring your own key" CORS pattern (the
 * `anthropic-dangerous-direct-browser-access` header). The user enters
 * their own key once in Settings (from console.anthropic.com); it is
 * stored locally in IndexedDB and sent only to api.anthropic.com.
 *
 * Security tradeoff, stated plainly (see TECHNICAL_SPEC.md §4.2): a key
 * living in client-side JS on your own phone, for your own single-user
 * install, is a reasonable risk. It stops being reasonable the moment this
 * codebase is deployed somewhere public or shared with anyone else — at
 * that point, replace this file with calls to a small server-side proxy
 * that holds the key instead. Do not skip that step if this ever changes
 * from "just me" to "more than one person".
 */

const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-5';
const ANTHROPIC_VERSION = '2023-06-01';

export class CoachClientError extends Error {}

interface AnthropicContentBlock {
  type: string;
  text?: string;
}
interface AnthropicMessageResponse {
  content: AnthropicContentBlock[];
}

export async function callCoach(prompt: CoachPrompt, maxTokens = 512): Promise<string> {
  const apiKey = await apiKeyStore.get();
  if (!apiKey) {
    throw new CoachClientError(
      'Belum ada Anthropic API key tersimpan. Buka Pengaturan → AI Coach untuk memasukkannya (dari console.anthropic.com).'
    );
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system: prompt.system,
      messages: [{ role: 'user', content: prompt.user }],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new CoachClientError(`AI Coach request gagal (HTTP ${response.status}): ${body}`);
  }

  const data = (await response.json()) as AnthropicMessageResponse;
  const textBlock = data.content?.find((b) => b.type === 'text' && typeof b.text === 'string');
  if (!textBlock?.text) {
    throw new CoachClientError('AI Coach tidak mengembalikan teks.');
  }
  return textBlock.text;
}
