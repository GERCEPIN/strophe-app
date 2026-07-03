import { describe, it, expect, beforeEach, vi } from 'vitest';
import { callCoach, CoachClientError } from './client';
import { apiKeyStore } from '../storage/db';
import { resetAllData } from '../storage/db';

function mockFetchOnce(response: Partial<Response> & { jsonBody?: unknown; textBody?: string }) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: response.ok ?? true,
    status: response.status ?? 200,
    json: async () => response.jsonBody,
    text: async () => response.textBody ?? '',
  } as Response);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('callCoach', () => {
  beforeEach(async () => {
    await resetAllData();
    vi.unstubAllGlobals();
  });

  it('throws a clear, actionable error when no API key has been configured', async () => {
    await expect(callCoach({ system: 'sys', user: 'hello' })).rejects.toThrow(CoachClientError);
    await expect(callCoach({ system: 'sys', user: 'hello' })).rejects.toThrow(/Pengaturan/);
  });

  it('sends the correct URL, headers, and body shape to the Anthropic API', async () => {
    await apiKeyStore.set('sk-ant-test-key');
    const fetchMock = mockFetchOnce({
      jsonBody: { content: [{ type: 'text', text: 'halo dari coach' }] },
    });

    await callCoach({ system: 'system prompt', user: 'user prompt' }, 256);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.anthropic.com/v1/messages');
    expect(init.headers['x-api-key']).toBe('sk-ant-test-key');
    expect(init.headers['anthropic-dangerous-direct-browser-access']).toBe('true');
    expect(init.headers['anthropic-version']).toBe('2023-06-01');

    const body = JSON.parse(init.body as string);
    expect(body.system).toBe('system prompt');
    expect(body.messages).toEqual([{ role: 'user', content: 'user prompt' }]);
    expect(body.max_tokens).toBe(256);
  });

  it('returns the text content from a successful response', async () => {
    await apiKeyStore.set('sk-ant-test-key');
    mockFetchOnce({ jsonBody: { content: [{ type: 'text', text: 'ini jawabannya' }] } });
    const result = await callCoach({ system: 's', user: 'u' });
    expect(result).toBe('ini jawabannya');
  });

  it('throws CoachClientError with the status code when the API returns a non-OK response', async () => {
    await apiKeyStore.set('sk-ant-test-key');
    mockFetchOnce({ ok: false, status: 401, textBody: 'invalid x-api-key' });
    await expect(callCoach({ system: 's', user: 'u' })).rejects.toThrow(/401/);
  });

  it('throws CoachClientError when the response has no text block', async () => {
    await apiKeyStore.set('sk-ant-test-key');
    mockFetchOnce({ jsonBody: { content: [{ type: 'tool_use' }] } });
    await expect(callCoach({ system: 's', user: 'u' })).rejects.toThrow(CoachClientError);
  });
});
