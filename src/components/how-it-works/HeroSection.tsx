import { Target, ArrowDown } from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { useScrollProgress } from "@/hooks/use-scroll-progress";

const HeroSection = () => {
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation({
    threshold: 0.2,
  });
  const scrollProgress = useScrollProgress();

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20"
    >
      {/* Parallax Background Elements */}
      <div className="absolute inset-0">
        <div
          className="absolute top-20 left-10 w-64 h-64 bg-white/30 rounded-full blur-3xl"
          style={{
            transform: `translateY(${scrollProgress * 0.3}px) rotate(${
              scrollProgress * 0.5
            }deg)`,
          }}
        ></div>
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-accent/30 rounded-full blur-3xl"
          style={{
            transform: `translateY(-${scrollProgress * 0.5}px) rotate(-${
              scrollProgress * 0.3
            }deg)`,
          }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/20 rounded-full blur-3xl"
          style={{
            transform: `translate(-50%, -50%) scale(${
              1 + scrollProgress * 0.001
            })`,
          }}
        ></div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 md:px-6 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Animated Icon */}
          <div
            className={`inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-primary rounded-2xl sm:rounded-3xl mb-6 sm:mb-8 scroll-animate ${
              heroVisible ? "animate-in" : ""
            }`}
          >
            <Target className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white animate-pulse" />
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-primary mb-4 sm:mb-6 leading-tight px-4">
            <span
              className={`block scroll-animate stagger-1 ${
                heroVisible ? "animate-in" : ""
              }`}
            >
              How DentMentor
            </span>
            <span
              className={`block scroll-animate stagger-2 ${
                heroVisible ? "animate-in" : ""
              } bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent`}
            >
              Transforms
            </span>
            <span
              className={`block scroll-animate stagger-3 ${
                heroVisible ? "animate-in" : ""
              }`}
            >
              Your Career
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className={`text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-8 sm:mb-10 md:mb-12 max-w-3xl mx-auto leading-relaxed px-4 scroll-animate stagger-4 ${
              heroVisible ? "animate-in" : ""
            }`}
          >
            From international dental graduate to successful U.S. applications
            in 4 simple steps. Get personalized mentorship for CV review, mock
            interviews, SOP feedback, and application strategy.
          </p>

          {/* Progress Indicator */}
          <div
            className={`flex items-center justify-center gap-3 sm:gap-4 scroll-animate stagger-5 ${
              heroVisible ? "animate-in" : ""
            } px-4`}
          >
            <div className="text-xs sm:text-sm font-medium text-muted-foreground">
              Scroll to explore
            </div>
            <ArrowDown className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground animate-bounce" />
          </div>
        </div>
      </div>

      {/* Scroll Progress Bar */}
      <div className="fixed top-20 left-0 right-0 z-50 h-1 bg-muted/30">
        <div
          className="h-full bg-gradient-primary transition-all duration-100 ease-out"
          style={{ width: `${Math.min(scrollProgress, 100)}%` }}
        />
      </div>
    </section>
  );
};

export default HeroSection;
