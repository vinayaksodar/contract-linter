import { ClauseNode, Rule } from "@/engine/types";

export interface LLMRequest {
  clause: ClauseNode;
  policy: Rule;
}

export interface LLMResponse {
  result: SemanticResult;
}

export interface SemanticResult {
  message: string;
  suggestion?: string;
}
