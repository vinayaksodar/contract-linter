import { AssistantRuntimeProvider, useLocalRuntime } from "@assistant-ui/react";
import { Thread } from "../../components/assistant-ui/thread";
import geminiAdapter from "../../engine/llm/geminiAdapter";

function Chat() {
  const runtime = useLocalRuntime(geminiAdapter);

  return (
    <div style={{ height: 'calc(100vh - 200px)', overflowY: 'auto' }}>
      <AssistantRuntimeProvider runtime={runtime}>
        <Thread />
      </AssistantRuntimeProvider>
    </div>
  );
}

export function ChatPage() {
  return <Chat />;
}
