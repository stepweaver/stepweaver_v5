import { HeroOperatorCard } from "./hero-operator-card";
import { HeroHeadline } from "./hero-headline";
import { HeroDescription } from "./hero-description";
import { ProjectCarousel } from "./project-carousel";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full pt-20 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-[390px_1fr] gap-8 lg:gap-12">
          <div className="order-2 lg:order-1">
            <HeroOperatorCard />
          </div>
          <div className="order-1 lg:order-2 flex flex-col justify-center">
            <HeroHeadline />
            <HeroDescription />
          </div>
        </div>
        <div className="mt-12">
          <ProjectCarousel />
        </div>
      </div>
    </section>
  );
}
