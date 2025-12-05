import { useState } from "react";
import { extractContract } from "../../engine/extractor";
import { runPlaybook } from "../../engine/rules/engine";
import { getDocumentBodyOoxml } from "../wordBridge";
import { getPlaybooks } from "../../engine/storage/playbookStore";
import type { Finding } from "../../engine/types";

export function useEngine() {
  const [isRunning, setIsRunning] = useState(false);
  const [findings, setFindings] = useState<Finding[]>([]);

  const runAnalysis = async () => {
    setIsRunning(true);
    try {
      const ooxml = await getDocumentBodyOoxml();
      const tree = extractContract(ooxml);
      let playbooks = getPlaybooks();
      if (playbooks.length === 0) {
        playbooks = [
          {
            id: "default",
            name: "Default Playbook",
            rules: [
              {
                id: "defined-terms",
                name: "Check Defined Terms",
                type: "check_defined_terms",
              },
              {
                id: "cross-references",
                name: "Check Cross-References",
                type: "check_cross_references",
              },
              {
                id: "numbering",
                name: "Check Numbering",
                type: "check_numbering",
              },
              {
                id: "party-names",
                name: "Check Party Names",
                type: "check_party_names",
              },
            ],
          },
        ];
      }
      const results = await runPlaybook(playbooks[0], tree);
      const allFindings = results.flatMap((result) => result.findings);
      setFindings(allFindings);
    } catch (error) {
      console.error("Error running analysis:", error);
    } finally {
      setIsRunning(false);
    }
  };

  return {
    runAnalysis,
    state: {
      isRunning,
      findings,
    },
  };
}
