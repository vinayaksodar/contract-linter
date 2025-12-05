import { useState } from "react";
import { useEngine } from "../hooks/useEngine";
// import { FindingsList } from "./FindingsList";
import {
  getGeminiApiKey,
  saveGeminiApiKey,
} from "../../engine/storage/settingsStore";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";

export function AnalysisPanel() {
  const { runAnalysis, state } = useEngine();
  const [showFindings, setShowFindings] = useState(false);
  const [apiKey, setApiKey] = useState(getGeminiApiKey() ?? "");

  const handleAnalysis = () => {
    runAnalysis();
    setShowFindings(true);
  };

  const handleApiKeySave = () => {
    saveGeminiApiKey(apiKey);
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg shadow-sm">
      <div className="space-y-2">
        <Label htmlFor="gemini-api-key">Gemini API Key:</Label>
        <Input
          id="gemini-api-key"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your Gemini API key"
        />
        <Button onClick={handleApiKeySave} className="w-full">
          Save Key
        </Button>
      </div>
      <hr className="my-4" />
      <Button
        onClick={handleAnalysis}
        disabled={state.isRunning}
        className="w-full"
      >
        {state.isRunning ? "Analyzing..." : "Analyze Document"}
      </Button>
      {showFindings && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold">Analysis Complete</h2>
          <p>{state.findings.length} findings found.</p>
          {/* <FindingsList findings={state.findings} /> */}
        </div>
      )}
    </div>
  );
}
