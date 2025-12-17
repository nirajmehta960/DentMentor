import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { BenefitCards } from "@/components/apply/BenefitCards";
import { RequirementsChecklist } from "@/components/apply/RequirementsChecklist";
import { HowToBecomeMentor } from "@/components/apply/HowToBecomeMentor";
import { SuccessStories } from "@/components/apply/SuccessStories";
import { EarningsCalculator } from "@/components/apply/EarningsCalculator";
import { Button } from "@/components/ui/button";
import { UserPlus, ArrowRight, Shield, Award } from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

const ApplyMentor = () => {
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="pt-20 sm:pt-24 pb-12 sm:pb-16 bg-gradient-to-br from-primary via-primary/95 to-accent relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="container mx-auto px-3 sm:px-4 md:px-6 relative z-10">
          <div className="text-center text-white max-w-4xl mx-auto">
            <div
              className={`transition-all duration-1000 ${
                heroVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="p-2 sm:p-3 bg-white/10 rounded-xl sm:rounded-2xl backdrop-blur-sm">
                  <UserPlus className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold">
                  Become a <span className="text-secondary">DentMentor</span>
                </h1>
              </div>

              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-6 sm:mb-8 leading-relaxed px-4">
                Share your expertise, transform careers, and earn meaningful
                income while making a difference in the dental community.
              </p>

              <div className="flex justify-center mb-8 sm:mb-10 md:mb-12 px-4">
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base md:text-lg group w-full sm:w-auto"
                >
                  <Link to="/auth" className="flex items-center justify-center">
                    Start Application
                    <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto px-4">
                <div className="text-center p-4 sm:p-5 md:p-6 bg-white/10 rounded-xl sm:rounded-2xl backdrop-blur-sm hover:bg-white/20 hover:scale-105 transition-all duration-300 cursor-pointer group">
                  <div className="text-2xl sm:text-3xl font-bold text-secondary mb-1 sm:mb-2 group-hover:scale-110 transition-transform">
                    $120+
                  </div>
                  <div className="text-xs sm:text-sm text-white/80 group-hover:scale-105 transition-transform">
                    Average per hour
                  </div>
                </div>
                <div className="text-center p-4 sm:p-5 md:p-6 bg-white/10 rounded-xl sm:rounded-2xl backdrop-blur-sm hover:bg-white/20 hover:scale-105 transition-all duration-300 cursor-pointer group">
                  <div className="text-2xl sm:text-3xl font-bold text-secondary mb-1 sm:mb-2 group-hover:scale-110 transition-transform">
                    15+
                  </div>
                  <div className="text-xs sm:text-sm text-white/80 group-hover:scale-105 transition-transform">
                    Verified mentors
                  </div>
                </div>
                <div className="text-center p-4 sm:p-5 md:p-6 bg-white/10 rounded-xl sm:rounded-2xl backdrop-blur-sm hover:bg-white/20 hover:scale-105 transition-all duration-300 cursor-pointer group">
                  <div className="text-2xl sm:text-3xl font-bold text-secondary mb-1 sm:mb-2 group-hover:scale-110 transition-transform">
                    95%
                  </div>
                  <div className="text-xs sm:text-sm text-white/80 group-hover:scale-105 transition-transform">
                    Platform rating
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 px-4">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-white/70">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm">Secure Process</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Award className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm">Verified Mentors</span>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <BenefitCards />

      {/* Earnings Calculator */}
      <EarningsCalculator />

      {/* Requirements */}
      <RequirementsChecklist />

      {/* How to Become a Mentor */}
      <HowToBecomeMentor />

      {/* Success Stories */}
      <SuccessStories />
    </div>
  );
};

export default ApplyMentor;
