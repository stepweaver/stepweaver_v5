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
        <div className="flex flex-col lg:grid lg:grid-cols-[minmax(260px,380px)_minmax(0,1fr)] xl:grid-cols-[minmax(300px,440px)_minmax(0,1.35fr)] gap-8 lg:gap-10 xl:gap-16 2xl:gap-24 lg:items-stretch">
          {/* max-lg:contents lets headline + bio interleave with card in one column; lg groups them in the right column top cell */}
          <div className="max-lg:contents lg:col-start-2 lg:row-start-1 flex flex-col min-h-0 min-w-0 lg:pl-4 xl:pl-10 2xl:pl-14 lg:border-l border-[rgb(var(--border)/0.12)] lg:pt-1">
            <div className="order-1 lg:order-none">
              <HeroHeadline />
            </div>
            <div className="order-3 lg:order-none">
              <HeroDescription />
            </div>
          </div>
          <div className="order-2 lg:order-none lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:pt-4 xl:pt-8 lg:flex lg:flex-col">
            <HeroOperatorCard />
          </div>
          <div className="order-4 lg:order-none lg:col-start-2 lg:row-start-2 flex flex-col min-h-0 min-w-0 lg:pl-4 xl:pl-10 2xl:pl-14">
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
