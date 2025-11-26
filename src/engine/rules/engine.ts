import type { Playbook, ContractTree, RuleResult, Finding } from "../types";
import * as builtins from "./builtins";
import { analyzeClauseWithLLM } from "../llm/adapter";

export async function runPlaybook(
  playbook: Playbook,
  tree: ContractTree
): Promise<RuleResult[]> {
  const results: RuleResult[] = [];

  for (const rule of playbook.rules) {
    let result: RuleResult = { findings: [] };
    if (rule.semantic_policy) {
      const clause = tree.sections
        .flatMap((section) => section.clauses)
        .find((c) => c.text.includes(rule.clause || ""));
      if (clause) {
        const semanticResult = await analyzeClauseWithLLM(clause, rule);
        const finding: Finding = {
          rule,
          message: semanticResult.message,
          clause,
        };
        result = { findings: [finding] };
      }
    } else {
      switch (rule.type) {
        case "must_have_clause":
          result = builtins.mustHaveClause(rule, tree);
          break;
        case "forbidden_phrase":
          result = builtins.forbiddenPhrase(rule, tree);
          break;
        case "numeric_limit":
          result = builtins.numericLimit(rule, tree);
          break;
        case "preferred_wording":
          result = builtins.preferredWording(rule, tree);
          break;
        case "check_defined_terms":
          result = builtins.checkDefinedTerms(rule, tree);
          break;
        case "check_cross_references":
          result = builtins.checkCrossReferences(rule, tree);
          break;
        case "check_numbering":
          result = builtins.checkNumbering(rule, tree);
          break;
        case "check_party_names":
          result = builtins.checkPartyNames(rule, tree);
          break;
      }
    }
    results.push(result);
  }

  return results;
}
