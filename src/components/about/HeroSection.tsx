import { Heart, Users, Globe } from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

export const HeroSection = () => {
  const { ref: heroRef, isVisible } = useScrollAnimation();

  return (
    <section
      ref={heroRef}
      className="pt-20 sm:pt-24 pb-12 sm:pb-16 md:pb-20 bg-gradient-to-br from-primary/10 via-background to-accent/10 relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
      <div className="absolute top-20 right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-48 h-48 bg-accent/5 rounded-full blur-2xl" />

      <div className="container mx-auto px-3 sm:px-4 md:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div
            className={`transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
              <div className="p-2 sm:p-3 bg-primary/10 rounded-xl sm:rounded-2xl backdrop-blur-sm">
                <Heart className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary" />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground">
                Our <span className="text-primary">Story</span>
              </h1>
            </div>

            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-6 sm:mb-8 leading-relaxed px-4">
              How a simple idea to help international dental graduates became a
              global movement transforming careers and building bridges across
              continents.
            </p>

            {/* Key Values Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mt-10 sm:mt-12 md:mt-16 px-4">
              <div
                className={`transition-all duration-700 delay-200 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
              >
                <div className="p-4 sm:p-5 md:p-6 bg-white/50 rounded-xl sm:rounded-2xl backdrop-blur-sm border border-border/50">
                  <Heart className="w-10 h-10 sm:w-12 sm:h-12 text-red-500 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                    Driven by Passion
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Every story we create is fueled by genuine care for student
                    success.
                  </p>
                </div>
              </div>

              <div
                className={`transition-all duration-700 delay-400 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
              >
                <div className="p-4 sm:p-5 md:p-6 bg-white/50 rounded-xl sm:rounded-2xl backdrop-blur-sm border border-border/50">
                  <Users className="w-10 h-10 sm:w-12 sm:h-12 text-blue-500 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                    Community First
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Building connections that last beyond mentorship sessions.
                  </p>
                </div>
              </div>

              <div
                className={`transition-all duration-700 delay-600 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
              >
                <div className="p-4 sm:p-5 md:p-6 bg-white/50 rounded-xl sm:rounded-2xl backdrop-blur-sm border border-border/50">
                  <Globe className="w-10 h-10 sm:w-12 sm:h-12 text-green-500 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                    Global Impact
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Connecting mentors and students across 50+ countries
                    worldwide.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
