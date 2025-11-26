import { mustHaveClause } from "../../src/engine/rules/builtins";
import { ContractTree, Rule } from "../../src/engine/types";

describe("mustHaveClause", () => {
  it("should return a finding if the clause is missing", () => {
    const rule: Rule = {
      id: "must_have_clause",
      type: "must_have_clause",
      clauseName: "Governing Law",
    };
    const tree: ContractTree = {
      title: "Contract",
      sections: [],
      definedTerms: {},
      references: [],
      parties: [],
    };
    const result = mustHaveClause(rule, tree);
    expect(result.findings.length).toBe(1);
    expect(result.findings[0].message).toBe(
      "The contract is missing the 'Governing Law' clause."
    );
  });
});
