import type { HomeIntelPayload } from "@/lib/home/recent-intel";
import { HeroOperatorCard } from "./hero-operator-card";
import { HeroHeadline } from "./hero-headline";
import { HeroDescription } from "./hero-description";
import { HeroRecentIntel } from "./hero-recent-intel";
import { ProjectCarousel } from "./project-carousel";

export function Hero({ recentIntel }: { recentIntel: HomeIntelPayload | null }) {
  return (
    <section className="relative min-h-screen flex items-center">
      <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-5 md:px-6 lg:px-10 xl:px-14 2xl:px-16 pt-20 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(260px,380px)_minmax(0,1fr)] xl:grid-cols-[minmax(300px,440px)_minmax(0,1.35fr)] gap-8 lg:gap-10 xl:gap-16 2xl:gap-24 lg:items-stretch">
          <div className="order-2 lg:order-1 lg:pt-4 xl:pt-8 lg:flex lg:flex-col">
            <HeroOperatorCard />
          </div>
          <div className="order-1 lg:order-2 flex flex-col min-h-0 min-w-0 lg:pl-4 xl:pl-10 2xl:pl-14 lg:border-l border-[rgb(var(--border)/0.12)] lg:pt-1">
            <HeroHeadline />
            <HeroDescription />
            <HeroRecentIntel intel={recentIntel} />
          </div>
        </div>
        <div className="mt-14 lg:mt-20 w-full lg:-mx-2 xl:-mx-4 2xl:-mx-6 max-w-none">
          <ProjectCarousel />
        </div>
      </div>
    </section>
  );
}
