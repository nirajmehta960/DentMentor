import { TrendingUp, Users, Award, Clock, Globe, Star } from "lucide-react";
import {
  useScrollAnimation,
  useCounterAnimation,
} from "@/hooks/use-scroll-animation";

const SuccessMetrics = () => {
  const { ref: sectionRef, isVisible: sectionVisible } = useScrollAnimation({
    threshold: 0.1,
  });

  // Counter animations for key metrics
  const successRate = useCounterAnimation(15, 2500);
  const totalStudents = useCounterAnimation(50, 3000);
  const mentors = useCounterAnimation(15, 2000);
  const avgWeeks = useCounterAnimation(4, 1500);
  const countries = useCounterAnimation(8, 2800);
  const satisfaction = useCounterAnimation(95, 2200);

  const metrics = [
    {
      ref: successRate.ref,
      value: successRate.count,
      suffix: "+",
      title: "Active Students",
      description: "Currently mentoring",
      icon: TrendingUp,
      color: "primary",
    },
    {
      ref: totalStudents.ref,
      value: totalStudents.count,
      suffix: "+",
      title: "Students Helped",
      description: "Total mentored",
      icon: Users,
      color: "secondary",
    },
    {
      ref: mentors.ref,
      value: 15,
      suffix: "+",
      title: "Verified Mentors",
      description: "Application experts",
      icon: Award,
      color: "accent",
    },
    {
      ref: avgWeeks.ref,
      value: avgWeeks.count,
      suffix: "",
      title: "4+ Core Services",
      description: "CV, Interview, SOP, Strategy",
      icon: Clock,
      color: "primary",
    },
    {
      ref: countries.ref,
      value: countries.count,
      suffix: "+",
      title: "Countries",
      description: "Students from",
      icon: Globe,
      color: "secondary",
    },
    {
      ref: satisfaction.ref,
      value: satisfaction.count,
      suffix: "%",
      title: "Platform Rating",
      description: "User satisfaction",
      icon: Star,
      color: "accent",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="py-12 sm:py-16 md:py-20 bg-background relative overflow-hidden"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-primary rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-10 right-10 w-48 h-48 sm:w-72 sm:h-72 md:w-96 md:h-96 bg-accent rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px] bg-secondary rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 md:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4 sm:mb-5 md:mb-6 px-4">
            Our Platform at a Glance
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            Building a community of dental professionals dedicated to helping
            international students achieve their dreams in U.S. dental programs.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div
                key={index}
                ref={metric.ref}
                className={`scroll-animate-scale ${
                  sectionVisible ? "animate-in" : ""
                } 
                  card-hover rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 text-center group relative overflow-hidden`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                {/* Background Gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-${metric.color} opacity-5 group-hover:opacity-10 transition-opacity`}
                ></div>

                <div className="relative z-10">
                  {/* Icon */}
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-gradient-${metric.color} rounded-2xl sm:rounded-3xl mb-4 sm:mb-5 md:mb-6 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 text-white" />
                  </div>

                  {/* Counter */}
                  <div className="counter-number text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-1 sm:mb-2 group-hover:scale-105 transition-transform">
                    {metric.value}
                    {metric.suffix}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg sm:text-xl font-bold text-foreground mb-1 sm:mb-2">
                    {metric.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm sm:text-base text-muted-foreground">
                    {metric.description}
                  </p>

                  {/* Animated Progress Ring */}
                  <div className="absolute top-4 right-4 w-8 h-8">
                    <svg
                      className="w-full h-full transform -rotate-90"
                      viewBox="0 0 32 32"
                    >
                      <circle
                        cx="16"
                        cy="16"
                        r="14"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        className="text-muted-foreground/20"
                      />
                      <circle
                        cx="16"
                        cy="16"
                        r="14"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        className={`text-${metric.color}`}
                        strokeDasharray="87.96"
                        strokeDashoffset={
                          87.96 * (1 - (sectionVisible ? 0.75 : 0))
                        }
                        style={{
                          transition: "stroke-dashoffset 2s ease-out",
                          transitionDelay: `${index * 200}ms`,
                        }}
                      />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Achievement Highlights */}
        <div
          className={`mt-20 scroll-animate ${
            sectionVisible ? "animate-in" : ""
          }`}
          style={{ transitionDelay: "900ms" }}
        >
          <div className="bg-gradient-primary rounded-3xl p-8 md:p-12 text-white text-center relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-8 left-8 w-16 h-16 border-2 border-white rounded-full"></div>
              <div className="absolute bottom-8 right-8 w-24 h-24 border-2 border-white rounded-full"></div>
              <div className="absolute top-16 right-16 w-8 h-8 bg-white rounded-full"></div>
              <div className="absolute bottom-16 left-16 w-12 h-12 bg-white rounded-full"></div>
            </div>

            <div className="relative z-10">
              <h3 className="text-3xl md:text-4xl font-bold mb-6">
                🏆 Industry-Leading Application Success Rate
              </h3>
              <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
                Our personalized mentorship approach has helped students achieve
                outstanding application success rates, landing interviews and
                acceptances at top programs.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <div className="text-2xl font-bold mb-2">85%</div>
                  <div className="text-white/80">Application Success Rate</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <div className="text-2xl font-bold mb-2">95%</div>
                  <div className="text-white/80">Interview Acceptance Rate</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <div className="text-2xl font-bold mb-2">98%</div>
                  <div className="text-white/80">Would Recommend</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SuccessMetrics;
