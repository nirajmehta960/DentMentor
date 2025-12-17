import {
  Video,
  Calendar,
  ShieldCheck,
  Users,
  Star,
  TrendingUp,
} from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

const Features = () => {
  const { ref: featuresRef, isVisible: featuresVisible } = useScrollAnimation();

  const features = [
    {
      icon: Video,
      title: "1-on-1 Video Sessions",
      description:
        "Personalized mentorship through high-quality video calls with experienced dental professionals.",
      gradient: "bg-gradient-primary",
      side: "left",
    },
    {
      icon: Calendar,
      title: "Flexible Scheduling",
      description:
        "Book sessions at your convenience with mentors across different time zones.",
      gradient: "bg-gradient-secondary",
      side: "right",
    },
    {
      icon: ShieldCheck,
      title: "Verified Mentors",
      description:
        "All mentors are thoroughly vetted U.S. dental school graduates with active licenses.",
      gradient: "bg-gradient-accent",
      side: "left",
    },
    {
      icon: Users,
      title: "Peer Community",
      description:
        "Connect with fellow international graduates in supportive community groups.",
      gradient: "bg-gradient-primary",
      side: "right",
    },
    {
      icon: Star,
      title: "Success Tracking",
      description:
        "Monitor your progress with personalized learning plans and milestone tracking.",
      gradient: "bg-gradient-secondary",
      side: "left",
    },
    {
      icon: TrendingUp,
      title: "Career Guidance",
      description:
        "Get insights on residency applications, job market trends, and career advancement.",
      gradient: "bg-gradient-accent",
      side: "right",
    },
  ];

  return (
    <section
      ref={featuresRef}
      className="py-12 sm:py-16 md:py-20 bg-background"
    >
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-3 sm:mb-4 px-4">
            How We Support Your Journey
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            From application strategy to interview preparation, we provide
            comprehensive support for every step of your dental career journey
            in the United States.
          </p>
        </div>

        <div className="space-y-10 sm:space-y-12 md:space-y-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isLeft = feature.side === "left";

            return (
              <div
                key={index}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center ${
                  isLeft ? "" : "lg:grid-flow-col-dense"
                }`}
              >
                {/* Content */}
                <div
                  className={`${isLeft ? "" : "lg:col-start-2"} 
                  scroll-animate-${isLeft ? "left" : "right"} 
                  ${featuresVisible ? "animate-in" : ""} group px-4 sm:px-0`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 ${feature.gradient} rounded-xl sm:rounded-2xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                  </div>

                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-3 sm:mb-4">
                    {feature.title}
                  </h3>

                  <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Visual Element */}
                <div
                  className={`${isLeft ? "lg:order-2" : "lg:col-start-1"} 
                  scroll-animate-${isLeft ? "right" : "left"} 
                  ${featuresVisible ? "animate-in" : ""} group px-4 sm:px-0`}
                  style={{ transitionDelay: `${index * 100 + 200}ms` }}
                >
                  <div className="relative">
                    <div
                      className={`w-full h-48 sm:h-56 md:h-64 ${feature.gradient} rounded-2xl sm:rounded-3xl flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-white/20 absolute group-hover:scale-110 transition-transform" />
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>

                      {/* Floating Elements */}
                      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-full animate-pulse"></div>
                      <div
                        className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 w-8 h-8 sm:w-12 sm:h-12 bg-white/15 rounded-full animate-pulse"
                        style={{ animationDelay: "1s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
