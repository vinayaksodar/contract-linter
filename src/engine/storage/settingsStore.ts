const OPENAI_API_KEY = "openai_api_key";

export function getOpenAIApiKey(): string | null {
  return localStorage.getItem(OPENAI_API_KEY);
}

export function saveOpenAIApiKey(apiKey: string) {
  localStorage.setItem(OPENAI_API_KEY, apiKey);
}
