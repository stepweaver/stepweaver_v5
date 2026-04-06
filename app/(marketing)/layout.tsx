import { Navbar } from "@/components/layout/navbar/navbar";
import { Footer } from "@/components/layout/footer/footer";
import { ChatWidget } from "@/components/chat/chat-widget";
import { BackgroundCanvasWrapper } from "@/components/effects/background-canvas-wrapper";
import { PageTransition } from "@/components/transition/page-transition";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <BackgroundCanvasWrapper />
      <Navbar />
      <PageTransition>
        <div className="relative z-[11] flex-1">{children}</div>
      </PageTransition>
      <Footer />
      <ChatWidget />
    </div>
  );
}
