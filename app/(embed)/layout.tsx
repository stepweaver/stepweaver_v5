import { PageTransition } from "@/components/transition/page-transition";

export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-0">
      <PageTransition>{children}</PageTransition>
    </div>
  );
}
