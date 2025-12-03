const OPENAI_API_KEY = "openai_api_key";
const GEMINI_API_KEY = "gemini_api_key";

export function getOpenAIApiKey(): string | null {
  return localStorage.getItem(OPENAI_API_KEY);
}

export function saveOpenAIApiKey(apiKey: string) {
  localStorage.setItem(OPENAI_API_KEY, apiKey);
}

export function getGeminiApiKey(): string | null {
  return localStorage.getItem(GEMINI_API_KEY);
}

export function saveGeminiApiKey(apiKey: string) {
  localStorage.setItem(GEMINI_API_KEY, apiKey);
}
