import {
  UserPlus,
  FileText,
  Upload,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { Link } from "react-router-dom";

const steps = [
  {
    id: 1,
    icon: UserPlus,
    title: "Sign Up as Mentor",
    description:
      "Create your mentor account and provide basic information about yourself and your background.",
    details:
      "Complete the initial registration with your contact details and professional information.",
    color: "primary",
  },
  {
    id: 2,
    icon: FileText,
    title: "Complete Onboarding",
    description:
      "Fill out your detailed mentor profile including specialties, experience, and availability.",
    details:
      "Tell us about your expertise, teaching style, and how you can help international students.",
    color: "secondary",
  },
  {
    id: 3,
    icon: Upload,
    title: "Submit Documents",
    description:
      "Upload required documents including dental school diploma, license, and background verification.",
    details:
      "Provide proof of your qualifications and complete our verification process.",
    color: "accent",
  },
  {
    id: 4,
    icon: CheckCircle,
    title: "Get Verified & Start",
    description:
      "Once verified, your profile goes live and you can start receiving mentoring requests.",
    details:
      "Begin helping students achieve their dreams while earning meaningful income.",
    color: "primary",
  },
];

export const HowToBecomeMentor = () => {
  const { ref: sectionRef, isVisible } = useScrollAnimation();

  return (
    <section ref={sectionRef} className="py-12 sm:py-16 md:py-20 bg-background">
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h2
            className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-3 sm:mb-4 transition-all duration-1000 px-4 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            How to Become a Mentor at DentMentor
          </h2>
          <p
            className={`text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto transition-all duration-1000 delay-200 px-4 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            Join our community of dental professionals in just a few simple
            steps. Start making a difference while earning meaningful income.
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              const isLastStep = index === steps.length - 1;

              return (
                <div key={step.id} className="relative h-full">
                  {/* Step Card */}
                  <div
                    className={`card-hover rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 scroll-animate ${
                      isVisible ? "animate-in" : ""
                    } group relative overflow-hidden h-full flex flex-col border-2 border-transparent hover:border-primary/20 transition-all duration-300`}
                    style={{ transitionDelay: `${index * 150}ms` }}
                  >
                    {/* Background Gradient */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br from-${step.color}/5 via-${step.color}/3 to-transparent group-hover:from-${step.color}/10 group-hover:via-${step.color}/5 transition-all duration-300`}
                    ></div>

                    {/* Subtle Pattern Overlay */}
                    <div
                      className="absolute inset-0 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-300"
                      style={{
                        backgroundImage: `radial-gradient(circle at 25% 25%, ${
                          step.color === "primary"
                            ? "#059669"
                            : step.color === "secondary"
                            ? "#dc2626"
                            : "#7c3aed"
                        } 2px, transparent 2px)`,
                        backgroundSize: "20px 20px",
                      }}
                    ></div>

                    {/* Step Number */}
                    <div
                      className={`absolute top-4 right-4 sm:top-5 sm:right-5 md:top-6 md:right-6 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gradient-${step.color} rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base md:text-lg shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      {step.id}
                    </div>

                    <div className="relative z-10 flex flex-col h-full">
                      <div
                        className={`flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-${step.color} rounded-2xl sm:rounded-3xl mb-4 sm:mb-5 md:mb-6 group-hover:scale-110 transition-transform shadow-xl group-hover:shadow-2xl`}
                      >
                        <IconComponent className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
                      </div>

                      <h3 className="text-lg sm:text-xl font-bold text-foreground mb-3 sm:mb-4 group-hover:scale-105 transition-transform">
                        {step.title}
                      </h3>

                      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-3 sm:mb-4 flex-grow">
                        {step.description}
                      </p>

                      <p className="text-xs sm:text-sm text-muted-foreground/80 leading-relaxed">
                        {step.details}
                      </p>
                    </div>
                  </div>

                  {/* Arrow Connector (except for last step) */}
                  {!isLastStep && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 sm:-right-4 transform -translate-y-1/2 z-20">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-primary/20">
                        <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-primary" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Call to Action */}
          <div
            className={`text-center mt-10 sm:mt-12 md:mt-16 transition-all duration-1000 delay-800 px-4 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="inline-flex flex-col sm:flex-row items-center gap-4 sm:gap-5 md:gap-6 bg-gradient-primary rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 text-white shadow-large">
              <div className="text-center sm:text-left">
                <h3 className="text-xl sm:text-2xl font-bold mb-1.5 sm:mb-2">
                  Ready to Start Your Mentoring Journey?
                </h3>
                <p className="text-sm sm:text-base text-white/90">
                  Join 15+ verified mentors helping students succeed
                </p>
              </div>
              <Link
                to="/auth"
                className="px-6 sm:px-7 md:px-8 py-3 sm:py-3.5 md:py-4 bg-white text-primary rounded-xl sm:rounded-2xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 whitespace-nowrap inline-block text-sm sm:text-base"
              >
                Start Application
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
