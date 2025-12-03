import { AssistantRuntimeProvider, useLocalRuntime } from "@assistant-ui/react";
import geminiAdapter from "../engine/llm/geminiAdapter.ts";
import { AnalysisPanel } from "./components/AnalysisPanel.tsx";
import { ChatPage } from "./components/ChatPage.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

function App() {
  const runtime = useLocalRuntime(geminiAdapter);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-blue-600 p-4 text-white shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold">Contract Linter</h1>
      </header>
      <main className="p-4">
        <AssistantRuntimeProvider runtime={runtime}>
          <Tabs defaultValue="analysis" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="chat">Chat</TabsTrigger>
            </TabsList>
            <TabsContent value="analysis">
              <AnalysisPanel />
            </TabsContent>
            <TabsContent
              value="chat"
              className="max-h-[calc(100vh-150px)] overflow-y-auto min-h-[400px]"
            >
              <ChatPage />
            </TabsContent>
          </Tabs>
        </AssistantRuntimeProvider>
      </main>
    </div>
  );
}

export default App;