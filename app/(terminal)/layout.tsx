import { Navbar } from "@/components/layout/navbar/navbar";
import { ChatWidget } from "@/components/chat/chat-widget";

export default function TerminalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[rgb(var(--bg))] text-[rgb(var(--text-color))]">
      <Navbar />
      <div className="flex-1 flex flex-col min-h-0 pt-14">{children}</div>
      <ChatWidget />
    </div>
  );
}
