import type { Finding } from "../../engine/types";
import {
  applyRedline,
  selectClauseInEditor,
} from "../wordBridge";

interface FindingsListProps {
  findings: Finding[];
}

export function FindingsList({ findings }: FindingsListProps) {
  const handleApplyRedline = (finding: Finding) => {
    if (finding.clause) {
      applyRedline(finding.clause, "suggestion");
    }
  };

  const handleSelectClause = (finding: Finding) => {
    if (finding.clause) {
      selectClauseInEditor(finding.clause);
    }
  };

  return (
    <div>
      {findings.map((finding, index) => (
        <div key={index}>
          <h3>{finding.rule.id}</h3>
          <p>{finding.message}</p>
          {finding.clause && (
            <div>
              <button onClick={() => handleSelectClause(finding)}>
                Go to clause
              </button>
              <button onClick={() => handleApplyRedline(finding)}>
                Apply suggestion
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
