import { AnalysisPanel } from "./components/AnalysisPanel.tsx";
import { PlaybookEditor } from "./components/PlaybookEditor.tsx";
import "./App.css";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Contract Linter</h1>
      </header>
      <main>
        <AnalysisPanel />
        <PlaybookEditor />
      </main>
    </div>
  );
}

export default App;
