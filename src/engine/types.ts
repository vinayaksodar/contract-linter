export interface ContractTree {
  title: string;
  sections: Section[];
  definedTerms: Record<string, DefinedTerm>;
  references: string[];
  parties: string[];
  bookmarks?: Set<string>;
}

export interface Section {
  number: string;
  title: string;
  clauses: ClauseNode[];
}

export interface ClauseNode {
  number: string;
  text: string;
  start: number;
  children?: ClauseNode[];
}

export interface DefinedTerm {
  definedAt: string;
  text: string;
}

export interface Finding {
  rule: Rule;
  message: string;
  clause?: ClauseNode;
}

export interface RuleResult {
  findings: Finding[];
}

export interface Playbook {
  name: string;
  rules: Rule[];
}

export interface Rule {
  id: string;
  type: string;
  clauseName?: string;
  phrase?: string;
  text?: string;
  clause?: string;
  policyText?: string;
  semantic_policy?: boolean;
}
