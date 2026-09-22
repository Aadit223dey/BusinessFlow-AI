import { ChatContainer } from "@/features/ai-assistant/components/ChatContainer";

export const dynamic = "force-dynamic";

export default function CustomerAiAssistantPage() {
  return <ChatContainer portalRole="CUSTOMER" />;
}
