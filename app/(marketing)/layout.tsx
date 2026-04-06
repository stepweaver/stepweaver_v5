import { Navbar } from "@/components/layout/navbar/navbar";
import { Footer } from "@/components/layout/footer/footer";
import { ChatWidget } from "@/components/chat/chat-widget";
import { GlobalCommandPalette } from "@/components/command-palette/global-command-palette";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <GlobalCommandPalette />
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
      <ChatWidget />
    </div>
  );
}
