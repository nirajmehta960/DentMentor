import { useEffect, useState } from 'react';
import { Target, Heart, Globe } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';

const missionText = "To empower international dental graduates with personalized mentorship, expert guidance, and unwavering support as they navigate their journey toward practicing dentistry in the United States.";

const visionText = "A world where talented dental professionals can seamlessly transition between countries, sharing their expertise across borders and improving oral healthcare globally.";

export const MissionStatement = () => {
  const { ref: sectionRef, isVisible } = useScrollAnimation();
  const [displayedMission, setDisplayedMission] = useState('');
  const [displayedVision, setDisplayedVision] = useState('');
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
    <section ref={sectionRef} className="py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold text-primary mb-4 transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              Our Mission & Vision
            </h2>
            <p className={`text-xl text-muted-foreground transition-all duration-1000 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              The driving force behind everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Mission */}
            <div className={`transition-all duration-1000 delay-300 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            }`}>
              <div className="relative p-8 bg-white rounded-3xl shadow-soft border border-border/50">
                {/* Decorative Elements */}
                <div className="absolute top-6 right-6 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Target className="w-8 h-8 text-primary" />
                </div>
                
                <div className="pr-20">
                  <h3 className="text-2xl font-bold text-foreground mb-6">Our Mission</h3>
                  <div className="relative">
                    <p className="text-lg text-muted-foreground leading-relaxed min-h-[160px]">
                      {displayedMission}
                      <span className={`inline-block w-0.5 h-6 bg-primary ml-1 ${
                        !missionComplete ? 'animate-pulse' : 'opacity-0'
                      }`} />
                    </p>
                  </div>
                </div>

                {/* Progress Indicator */}
                <div className="mt-6 w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${(displayedMission.length / missionText.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Vision */}
            <div className={`transition-all duration-1000 delay-500 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
            }`}>
              <div className="relative p-8 bg-white rounded-3xl shadow-soft border border-border/50">
                {/* Decorative Elements */}
                <div className="absolute top-6 right-6 w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
                  <Globe className="w-8 h-8 text-accent" />
                </div>
                
                <div className="pr-20">
                  <h3 className="text-2xl font-bold text-foreground mb-6">Our Vision</h3>
                  <div className="relative">
                    <p className="text-lg text-muted-foreground leading-relaxed min-h-[160px]">
                      {displayedVision}
                      <span className={`inline-block w-0.5 h-6 bg-accent ml-1 ${
                        missionComplete && displayedVision.length < visionText.length ? 'animate-pulse' : 'opacity-0'
                      }`} />
                    </p>
                  </div>
                </div>

                {/* Progress Indicator */}
                <div className="mt-6 w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-accent h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${(displayedVision.length / visionText.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className={`text-center mt-16 transition-all duration-1000 delay-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="inline-flex items-center gap-4 p-6 bg-gradient-to-r from-primary to-accent rounded-2xl text-white">
              <Heart className="w-8 h-8" />
              <div className="text-left">
                <div className="text-xl font-bold">Join Our Mission</div>
                <div className="text-white/90">Be part of something bigger than yourself</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};