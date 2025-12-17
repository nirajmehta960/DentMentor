import {
  Search,
  CalendarCheck,
  Video,
  Trophy,
  UserCheck,
  CreditCard,
  MessageCircle,
  Target,
} from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { useElementScrollProgress } from "@/hooks/use-scroll-progress";
import { useRef } from "react";

const ProcessSteps = () => {
  const { ref: sectionRef, isVisible: sectionVisible } = useScrollAnimation({
    threshold: 0.1,
  });
  const timelineRef = useRef<HTMLDivElement>(null);
  const timelineProgress = useElementScrollProgress(timelineRef);

  const steps = [
    {
      number: 1,
      icon: Search,
      title: "Find Your Perfect Mentor",
      description:
        "Browse verified mentors with dental school application expertise from top U.S. programs.",
      features: [
        "15+ verified mentors",
        "Application specialists",
        "Proven admission success",
      ],
      delay: 100,
    },
    {
      number: 2,
      icon: CalendarCheck,
      title: "Book Your Session",
      description:
        "Schedule flexible 1-on-1 sessions focused on your specific application needs and timeline.",
      features: [
        "Flexible scheduling",
        "Multiple time zones",
        "Application-focused",
      ],
      delay: 200,
    },
    {
      number: 3,
      icon: Video,
      title: "Get Expert Guidance",
      description:
        "Receive personalized mentorship across all aspects of your dental school application journey.",
      features: [
        "Personalized mentorship",
        "Application strategy",
        "Interview preparation",
        "Document review",
      ],
      delay: 300,
    },
    {
      number: 4,
      icon: Trophy,
      title: "Achieve Success",
      description:
        "Land interviews, get accepted to dental school, and start your successful journey in U.S. dentistry.",
      features: ["Interview success", "School acceptance", "Career guidance"],
      delay: 400,
    },
  ];

  const supportFeatures = [
    { icon: UserCheck, label: "Verified Mentors" },
    { icon: CreditCard, label: "Secure Payment" },
    { icon: MessageCircle, label: "Direct Communication" },
    { icon: Target, label: "Goal Tracking" },
  ];

  return (
    <section
      ref={sectionRef}
      className="py-12 sm:py-16 md:py-20 bg-muted/30 relative overflow-hidden"
    >
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16 md:mb-20">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4 sm:mb-6 px-4">
            Your Journey to Success
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            A proven 4-step process that helps international dental graduates
            successfully navigate U.S. dental school and residency applications.
          </p>
        </div>

        {/* Process Steps */}
        <div className="space-y-12 sm:space-y-16 md:space-y-20 lg:space-y-24 xl:space-y-32">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isEven = index % 2 === 0;

            return (
              <div
                key={step.number}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center ${
                  isEven ? "" : "lg:grid-flow-col-dense"
                }`}
              >
                {/* Content */}
                <div
                  className={`${isEven ? "" : "lg:col-start-2"} 
                  scroll-animate-${isEven ? "left" : "right"} 
                  ${sectionVisible ? "animate-in" : ""} px-4 sm:px-0`}
                  style={{ transitionDelay: `${step.delay}ms` }}
                >
                  <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5 md:mb-6 group">
                    <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-primary text-white rounded-xl sm:rounded-2xl font-bold text-xl sm:text-2xl group-hover:scale-110 transition-transform">
                      {step.number}
                    </div>
                    <div
                      className={`flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-${
                        index % 2 === 0 ? "secondary" : "accent"
                      } rounded-xl sm:rounded-2xl group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                    </div>
                  </div>

                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-3 sm:mb-4">
                    {step.title}
                  </h3>

                  <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed mb-4 sm:mb-5 md:mb-6">
                    {step.description}
                  </p>

                  <ul className="space-y-1.5 sm:space-y-2">
                    {step.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base text-muted-foreground hover:text-primary hover:scale-105 transition-all duration-300 cursor-pointer group"
                      >
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full group-hover:scale-110 transition-transform flex-shrink-0"></div>
                        <span className="group-hover:scale-105 transition-transform">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Visual Element */}
                <div
                  className={`${isEven ? "lg:order-2" : "lg:col-start-1"} 
                  scroll-animate-scale 
                  ${sectionVisible ? "animate-in" : ""} px-4 sm:px-0`}
                  style={{ transitionDelay: `${step.delay + 200}ms` }}
                >
                  <div className="relative">
                    <div
                      className={`w-full h-56 sm:h-64 md:h-72 lg:h-80 bg-gradient-${
                        index % 2 === 0
                          ? "primary"
                          : index % 3 === 1
                          ? "secondary"
                          : "accent"
                      } rounded-2xl sm:rounded-3xl flex items-center justify-center relative overflow-hidden group hover:scale-105 hover:shadow-2xl transition-all duration-300`}
                    >
                      <Icon className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 text-white/20 absolute group-hover:scale-110 transition-transform" />
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>

                      {/* Step Number Overlay */}
                      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center">
                        <span className="text-white font-bold text-lg sm:text-xl md:text-2xl">
                          {step.number}
                        </span>
                      </div>

                      {/* Floating Animation Elements */}
                      <div className="absolute top-6 left-6 sm:top-8 sm:left-8 w-3 h-3 sm:w-4 sm:h-4 bg-white/30 rounded-full animate-pulse"></div>
                      <div
                        className="absolute bottom-8 left-8 sm:bottom-12 sm:left-12 w-4 h-4 sm:w-6 sm:h-6 bg-white/25 rounded-full animate-pulse"
                        style={{ animationDelay: "1s" }}
                      ></div>
                      <div
                        className="absolute top-12 right-12 sm:top-16 sm:right-16 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white/35 rounded-full animate-pulse"
                        style={{ animationDelay: "2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Support Features */}
        <div
          className={`mt-12 sm:mt-16 md:mt-20 lg:mt-24 scroll-animate ${
            sectionVisible ? "animate-in" : ""
          } px-4 sm:px-0`}
          style={{ transitionDelay: "600ms" }}
        >
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h3 className="text-xl sm:text-2xl font-bold text-primary mb-3 sm:mb-4">
              Comprehensive Support Throughout Your Journey
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {supportFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="text-center p-4 sm:p-5 md:p-6 card-hover rounded-xl sm:rounded-2xl group"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-primary rounded-xl sm:rounded-2xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  <h4 className="font-semibold text-foreground text-sm sm:text-base">
                    {feature.label}
                  </h4>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSteps;
