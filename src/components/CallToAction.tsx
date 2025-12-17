import { ArrowRight, CheckCircle, GraduationCap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { Link } from "react-router-dom";

const CallToAction = () => {
  const { ref: ctaRef, isVisible: ctaVisible } = useScrollAnimation();

  const benefits = [
    "Connect with verified mentors within 24 hours",
    "Personalized application strategy consultation",
    "Interview preparation and mock sessions",
    "Ongoing support throughout your journey",
  ];

  return (
    <section
      ref={ctaRef}
      className="py-12 sm:py-16 md:py-20 relative overflow-hidden"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-hero">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-accent/90"></div>

        {/* Floating Elements */}
        <div
          className={`absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse ${
            ctaVisible ? "pulse-glow" : ""
          }`}
        ></div>
        <div
          className={`absolute bottom-20 right-20 w-48 h-48 bg-white/10 rounded-full blur-2xl animate-pulse ${
            ctaVisible ? "pulse-glow" : ""
          }`}
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 md:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main CTA Content */}
          <div className={`scroll-animate ${ctaVisible ? "animate-in" : ""}`}>
            <div className="inline-flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8 bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl px-4 sm:px-6 py-2.5 sm:py-3 hover:bg-white/20 hover:scale-105 transition-all duration-300 cursor-pointer group">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:scale-110 transition-transform" />
              <span className="text-white font-medium text-sm sm:text-base group-hover:scale-105 transition-transform">
                Ready to Transform Your Career?
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight px-4">
              Start Your Success Story Today
            </h2>

            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-8 sm:mb-10 md:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
              Join thousands of international dental graduates who've
              successfully navigated their path to practicing dentistry in the
              United States.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-10 md:mb-12">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className={`scroll-animate stagger-${index + 1} ${
                  ctaVisible ? "animate-in" : ""
                } 
                  flex items-center gap-3 sm:gap-4 bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 group hover:bg-white/20 transition-colors`}
              >
                <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-secondary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <span className="text-white font-medium text-left text-sm sm:text-base">
                  {benefit}
                </span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div
            className={`scroll-animate stagger-5 ${
              ctaVisible ? "animate-in" : ""
            } flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4`}
          >
            <Button
              asChild
              variant="secondary-gradient"
              size="lg"
              className="group shadow-orange-glow hover:shadow-orange-glow w-full sm:w-auto text-sm sm:text-base"
            >
              <Link to="/auth" className="flex items-center justify-center">
                Get Started Now
                <ArrowRight className="ml-2 sm:ml-3 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="bg-transparent text-white border-white/30 hover:bg-white hover:text-primary group backdrop-blur-sm w-full sm:w-auto text-sm sm:text-base transition-colors"
            >
              <Link to="/mentors" className="flex items-center justify-center">
                <Users className="mr-2 sm:mr-3 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                Browse Mentors
              </Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div
            className={`mt-10 sm:mt-12 md:mt-16 scroll-animate stagger-6 ${
              ctaVisible ? "animate-in" : ""
            } px-4`}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 items-center opacity-80">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                  15+
                </div>
                <div className="text-white/70 text-xs sm:text-sm">
                  Verified Mentors
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                  95%
                </div>
                <div className="text-white/70 text-xs sm:text-sm">
                  Platform Rating
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                  10+
                </div>
                <div className="text-white/70 text-xs sm:text-sm">
                  Students Helped
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                  8+
                </div>
                <div className="text-white/70 text-xs sm:text-sm">
                  Countries
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
