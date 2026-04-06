import { HeroOperatorCard } from "./hero-operator-card";
import { HeroHeadline } from "./hero-headline";
import { HeroDescription } from "./hero-description";
import { ProjectCarousel } from "./project-carousel";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center">
      <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 md:px-8 lg:px-12 pt-20 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(280px,420px)_1fr] gap-8 lg:gap-14 xl:gap-20">
          <div className="order-2 lg:order-1">
            <HeroOperatorCard />
          </div>
          <div className="order-1 lg:order-2 flex flex-col justify-center lg:pl-2 xl:pl-6">
            <HeroHeadline />
            <HeroDescription />
          </div>
        </div>
        <div className="mt-12 lg:mt-16 max-w-none">
          <ProjectCarousel />
        </div>
      </div>
    </section>
  );
}
