import type { ClauseNode, Rule } from "../types";
import type { LLMRequest, SemanticResult } from "./types";
import { getOpenAIApiKey } from "../storage/settingsStore";
import { prompts } from "../llm/prompts";

async function analyzeClauseWithLLM(
  clause: ClauseNode,
  policy: Rule
): Promise<SemanticResult> {
  const apiKey = getOpenAIApiKey();
  if (!apiKey) {
    return {
      message: "OpenAI API key not found.",
    };
  }

  const prompt = prompts.policyEvaluation
    .replace("{clause}", clause.text)
    .replace("{policy}", policy.policyText || "");

  const response = await fetch("https://api.openai.com/v1/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "text-davinci-003",
      prompt,
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    return {
      message: `Error from OpenAI API: ${error.error.message}`,
    };
  }

  const data = await response.json();
  const result = JSON.parse(data.choices[0].text);

  return {
    message: result.evaluation,
    suggestion: result.suggestion,
  };
}

export { analyzeClauseWithLLM };
