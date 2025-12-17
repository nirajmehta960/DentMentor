import { useEffect, useState } from "react";
import { Target, Heart, Globe } from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

const missionText =
  "To empower international dental graduates with personalized mentorship, expert guidance, and unwavering support as they navigate their journey toward practicing dentistry in the United States.";

const visionText =
  "A world where talented dental professionals can seamlessly transition between countries, sharing their expertise across borders and improving oral healthcare globally.";

export const MissionStatement = () => {
  const { ref: sectionRef, isVisible } = useScrollAnimation();
  const [displayedMission, setDisplayedMission] = useState("");
  const [displayedVision, setDisplayedVision] = useState("");
  const [missionComplete, setMissionComplete] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Mission typewriter effect
      let missionIndex = 0;
      const missionTimer = setInterval(() => {
        if (missionIndex < missionText.length) {
          setDisplayedMission(missionText.slice(0, missionIndex + 1));
          missionIndex++;
        } else {
          clearInterval(missionTimer);
          setMissionComplete(true);

          // Start vision typewriter after mission is complete
          setTimeout(() => {
            let visionIndex = 0;
            const visionTimer = setInterval(() => {
              if (visionIndex < visionText.length) {
                setDisplayedVision(visionText.slice(0, visionIndex + 1));
                visionIndex++;
              } else {
                clearInterval(visionTimer);
              }
            }, 30);
          }, 500);
        }
      }, 30);

      return () => clearInterval(missionTimer);
    }
  }, [isVisible]);

  return (
    <section
      ref={sectionRef}
      className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5"
    >
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2
              className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-3 sm:mb-4 transition-all duration-1000 px-4 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              Our Mission & Vision
            </h2>
            <p
              className={`text-base sm:text-lg md:text-xl text-muted-foreground transition-all duration-1000 delay-200 px-4 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              The driving force behind everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
            {/* Mission */}
            <div
              className={`transition-all duration-1000 delay-300 px-4 sm:px-0 ${
                isVisible
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-8"
              }`}
            >
              <div className="relative p-5 sm:p-6 md:p-8 bg-white rounded-2xl sm:rounded-3xl shadow-soft border border-border/50">
                {/* Decorative Elements */}
                <div className="absolute top-4 right-4 sm:top-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary" />
                </div>

                <div className="pr-16 sm:pr-20">
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-5 md:mb-6">
                    Our Mission
                  </h3>
                  <div className="relative">
                    <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed min-h-[120px] sm:min-h-[140px] md:min-h-[160px]">
                      {displayedMission}
                      <span
                        className={`inline-block w-0.5 h-4 sm:h-5 md:h-6 bg-primary ml-1 ${
                          !missionComplete ? "animate-pulse" : "opacity-0"
                        }`}
                      />
                    </p>
                  </div>
                </div>

                {/* Progress Indicator */}
                <div className="mt-4 sm:mt-5 md:mt-6 w-full bg-muted rounded-full h-1.5 sm:h-2">
                  <div
                    className="bg-primary h-1.5 sm:h-2 rounded-full transition-all duration-300 ease-out"
                    style={{
                      width: `${
                        (displayedMission.length / missionText.length) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Vision */}
            <div
              className={`transition-all duration-1000 delay-500 px-4 sm:px-0 ${
                isVisible
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-8"
              }`}
            >
              <div className="relative p-5 sm:p-6 md:p-8 bg-white rounded-2xl sm:rounded-3xl shadow-soft border border-border/50">
                {/* Decorative Elements */}
                <div className="absolute top-4 right-4 sm:top-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-accent/10 rounded-full flex items-center justify-center">
                  <Globe className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-accent" />
                </div>

                <div className="pr-16 sm:pr-20">
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-5 md:mb-6">
                    Our Vision
                  </h3>
                  <div className="relative">
                    <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed min-h-[120px] sm:min-h-[140px] md:min-h-[160px]">
                      {displayedVision}
                      <span
                        className={`inline-block w-0.5 h-4 sm:h-5 md:h-6 bg-accent ml-1 ${
                          missionComplete &&
                          displayedVision.length < visionText.length
                            ? "animate-pulse"
                            : "opacity-0"
                        }`}
                      />
                    </p>
                  </div>
                </div>

                {/* Progress Indicator */}
                <div className="mt-4 sm:mt-5 md:mt-6 w-full bg-muted rounded-full h-1.5 sm:h-2">
                  <div
                    className="bg-accent h-1.5 sm:h-2 rounded-full transition-all duration-300 ease-out"
                    style={{
                      width: `${
                        (displayedVision.length / visionText.length) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div
            className={`text-center mt-10 sm:mt-12 md:mt-16 transition-all duration-1000 delay-700 px-4 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="inline-flex items-center gap-3 sm:gap-4 p-4 sm:p-5 md:p-6 bg-gradient-to-r from-primary to-accent rounded-xl sm:rounded-2xl text-white">
              <Heart className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 flex-shrink-0" />
              <div className="text-left">
                <div className="text-lg sm:text-xl font-bold">
                  Join Our Mission
                </div>
                <div className="text-sm sm:text-base text-white/90">
                  Be part of something bigger than yourself
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
