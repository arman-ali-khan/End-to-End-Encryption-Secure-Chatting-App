import { ReactNode } from "react";
import ChatSidebar from "@/components/chat/chat-sidebar";

export default function ChatLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen">
      <ChatSidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}