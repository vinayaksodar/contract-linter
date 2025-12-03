import { Thread } from "../../components/assistant-ui/thread";

function Chat() {
  return (
    <div style={{ height: "calc(100vh - 200px)", overflowY: "auto" }}>
      <Thread />
    </div>
  );
}

export function ChatPage() {
  return <Chat />;
}
