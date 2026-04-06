import { Navbar } from "@/components/layout/navbar/navbar";
import { ChatWidget } from "@/components/chat/chat-widget";
import { BackgroundCanvasWrapper } from "@/components/effects/background-canvas-wrapper";
import { PageTransition } from "@/components/transition/page-transition";

export default function TerminalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col text-[rgb(var(--text-color))]">
      <BackgroundCanvasWrapper />
      <Navbar />
      <PageTransition>
        <div className="relative z-[11] flex min-h-0 flex-1 flex-col pt-14">{children}</div>
      </PageTransition>
      <ChatWidget />
    </div>
  );
}
