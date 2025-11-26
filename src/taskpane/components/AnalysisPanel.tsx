import { useState } from "react";
import { useEngine } from "../hooks/useEngine";
import { FindingsList } from "./FindingsList";

export function AnalysisPanel() {
  const { runAnalysis, state } = useEngine();
  const [showFindings, setShowFindings] = useState(false);

  const handleAnalysis = () => {
    runAnalysis();
    setShowFindings(true);
  };

  return (
    <div>
      <button onClick={handleAnalysis} disabled={state.isRunning}>
        {state.isRunning ? "Analyzing..." : "Analyze Document"}
      </button>
      {showFindings && (
        <div>
          <h2>Analysis Complete</h2>
          <p>{state.findings.length} findings found.</p>
          <FindingsList findings={state.findings} />
        </div>
      )}
    </div>
  );
}
