import type { ClauseNode } from "../engine/types";

export function buildTree(flatClauses: ClauseNode[]): ClauseNode[] {
  const tree: ClauseNode[] = [];
  const clauseMap: { [key: string]: ClauseNode } = {};

  flatClauses.forEach((clause) => {
    clauseMap[clause.number] = clause;
  });

  flatClauses.forEach((clause) => {
    const parentNumber = clause.number.substring(
      0,
      clause.number.lastIndexOf(".")
    );
    const parent = clauseMap[parentNumber];
    if (parent) {
      parent.children = parent.children || [];
      parent.children.push(clause);
    } else {
      tree.push(clause);
    }
  });

  return tree;
}

export function findClauseByNumber(
  tree: ClauseNode[],
  number: string
): ClauseNode | undefined {
  for (const clause of tree) {
    if (clause.number === number) {
      return clause;
    }
    if (clause.children) {
      const found = findClauseByNumber(clause.children, number);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
}
