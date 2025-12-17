import {
  DollarSign,
  Clock,
  Heart,
  TrendingUp,
  Users,
  Award,
} from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

const benefits = [
  {
    icon: DollarSign,
    title: "Earn Meaningful Income",
    description:
      "Average $120+ per hour with flexible scheduling that works around your practice.",
    value: "$120+/hr",
    color: "text-green-500",
  },
  {
    icon: Clock,
    title: "Flexible Schedule",
    description:
      "Set your own hours and availability. Work as much or as little as you want.",
    value: "Your Choice",
    color: "text-blue-500",
  },
  {
    icon: Heart,
    title: "Make a Difference",
    description:
      "Help international dental graduates navigate their career journey successfully.",
    value: "95% Rating",
    color: "text-red-500",
  },
  {
    icon: TrendingUp,
    title: "Growing Demand",
    description:
      "Join a rapidly expanding platform with increasing demand for quality mentors.",
    value: "50+ Students",
    color: "text-purple-500",
  },
  {
    icon: Users,
    title: "Build Network",
    description:
      "Connect with fellow professionals and expand your dental network globally.",
    value: "15+ Mentors",
    color: "text-orange-500",
  },
  {
    icon: Award,
    title: "Recognition",
    description:
      "Gain recognition as a thought leader and expert in your specialty area.",
    value: "Top Rated",
    color: "text-amber-500",
  },
];

export const BenefitCards = () => {
  const { ref: sectionRef, isVisible } = useScrollAnimation();

  return (
    <section ref={sectionRef} className="py-12 sm:py-16 md:py-20 bg-muted/30">
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h2
            className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-3 sm:mb-4 transition-all duration-1000 px-4 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            Why Become a DentMentor?
          </h2>
          <p
            className={`text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto transition-all duration-1000 delay-200 px-4 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            Join our community of dental professionals making a real impact
            while earning meaningful income.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;

            return (
              <div
                key={index}
                className={`card-hover rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 group relative overflow-hidden transition-all duration-700 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-12"
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 group-hover:from-primary/10 group-hover:to-accent/10 transition-colors" />

                <div className="relative z-10">
                  {/* Icon */}
                  <div className="mb-4 sm:mb-5 md:mb-6">
                    <div
                      className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-white shadow-medium flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                    >
                      <IconComponent
                        className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 ${benefit.color}`}
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="mb-4 sm:mb-5 md:mb-6">
                    <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 sm:mb-3 group-hover:text-primary transition-colors">
                      {benefit.title}
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>

                  {/* Value */}
                  <div className="flex items-center justify-between">
                    <div
                      className={`text-xl sm:text-2xl font-bold ${benefit.color}`}
                    >
                      {benefit.value}
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 rounded-full bg-primary" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 rounded-2xl sm:rounded-3xl border-2 border-primary/20 opacity-0 group-hover:opacity-100 scale-105 group-hover:scale-100 transition-all duration-300 pointer-events-none" />
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div
          className={`text-center mt-10 sm:mt-12 md:mt-16 transition-all duration-1000 delay-500 px-4 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="inline-flex items-center gap-3 sm:gap-4 bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-medium">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">
              15+
            </div>
            <div className="text-left">
              <div className="text-sm sm:text-base font-semibold text-foreground">
                Verified Mentors
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                Join our growing community
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
