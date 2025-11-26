import type { Rule, ContractTree, RuleResult, Finding } from "../types";
import { normalizeTokens } from "../utils";

export function mustHaveClause(rule: Rule, tree: ContractTree): RuleResult {
  const findings: Finding[] = [];
  const clauseName = rule.clauseName;
  if (!clauseName) {
    return { findings };
  }

  const found = tree.sections.some((section) =>
    section.clauses.some((clause) =>
      normalizeTokens(clause.text).includes(normalizeTokens(clauseName))
    )
  );

  if (!found) {
    findings.push({
      rule,
      message: `The contract is missing the '${clauseName}' clause.`,
    });
  }

  return { findings };
}

export function forbiddenPhrase(rule: Rule, tree: ContractTree): RuleResult {
  const findings: Finding[] = [];
  const phrase = rule.phrase;
  if (!phrase) {
    return { findings };
  }

  tree.sections.forEach((section) => {
    section.clauses.forEach((clause) => {
      if (normalizeTokens(clause.text).includes(normalizeTokens(phrase))) {
        findings.push({
          rule,
          message: `The contract contains the forbidden phrase '${phrase}'.`,
          clause,
        });
      }
    });
  });

  return { findings };
}

export function numericLimit(rule: Rule, tree: ContractTree): RuleResult {
  // Placeholder implementation
  return { findings: [] };
}

export function preferredWording(rule: Rule, tree: ContractTree): RuleResult {
  // Placeholder implementation
  return { findings: [] };
}

export function checkDefinedTerms(
  rule: Rule,
  tree: ContractTree
): RuleResult {
  const findings: Finding[] = [];
  const definedTerms = Object.keys(tree.definedTerms);
  const allText = tree.sections
    .flatMap((s) => s.clauses)
    .map((c) => c.text)
    .join("\n");

  // Check for unused terms
  for (const term of definedTerms) {
    const regex = new RegExp(`\\b${term}\\b`, "g");
    const matches = (allText.match(regex) || []).length;
    if (matches <= 1) {
      // Only found in its own definition
      findings.push({
        rule,
        message: `Defined term '${term}' is defined but never used.`,
      });
    }
  }

  // Check for undefined terms (simple version)
  const potentialTerms = allText.match(/\b([A-Z][a-zA-Z]+(\s[A-Z][a-zA-Z]+)*)\b/g) || [];
  const uniquePotentialTerms = [...new Set(potentialTerms)];

  for (const term of uniquePotentialTerms) {
    if (!tree.definedTerms[term] && term.toUpperCase() !== term) { // Exclude acronyms
        let isDefined = false;
        for(const defined of definedTerms) {
            if(defined.toLowerCase() === term.toLowerCase()) {
                isDefined = true;
                break;
            }
        }
        if(!isDefined) {
            findings.push({
                rule,
                message: `Term '${term}' may be used but is not defined.`,
            });
        }
    }
  }

  return { findings };
}

export function checkCrossReferences(
  rule: Rule,
  tree: ContractTree
): RuleResult {
  const findings: Finding[] = [];
  const bookmarks = tree.bookmarks || new Set();

  for (const ref of tree.references) {
    if (!bookmarks.has(ref)) {
      // Also check against clause numbers for text-based refs like "see clause 1.2"
      const clauseNumbers = new Set(tree.sections.flatMap((s) => s.clauses).map((c) => c.number));
      if (!clauseNumbers.has(ref)) {
        findings.push({
          rule,
          message: `Broken cross-reference: The reference to '${ref}' does not point to a valid bookmark or clause number.`,
        });
      }
    }
  }
  return { findings };
}

export function checkNumbering(rule: Rule, tree: ContractTree): RuleResult {
  const findings: Finding[] = [];
  const clauses = tree.sections.flatMap((s) => s.clauses);
  for (let i = 1; i < clauses.length; i++) {
    const prev = clauses[i - 1].number;
    const curr = clauses[i].number;

    const prevParts = prev.split(".").map(Number);
    const currParts = curr.split(".").map(Number);

    let parentSame = false;
    if (currParts.length > 1 && prevParts.length === currParts.length) {
        const parentCurr = curr.substring(0, curr.lastIndexOf('.'));
        const parentPrev = prev.substring(0, prev.lastIndexOf('.'));
        if(parentCurr === parentPrev) {
            parentSame = true;
        }
    }

    if (parentSame && currParts[currParts.length - 1] < prevParts[prevParts.length - 1]) {
      findings.push({
        rule,
        message: `Incorrect numbering sequence: '${prev}' is followed by '${curr}'.`,
        clause: clauses[i],
      });
    }
  }
  return { findings };
}

export function checkPartyNames(rule: Rule, tree: ContractTree): RuleResult {
    const findings: Finding[] = [];
    if (tree.parties.length > 1) {
        const firstParty = tree.parties[0];
        for (let i = 1; i < tree.parties.length; i++) {
            if (tree.parties[i].toLowerCase() !== firstParty.toLowerCase()) {
                // This is a very basic check. A more advanced check would use string similarity.
            }
        }
    }
    return { findings };
}
