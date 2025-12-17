import { Calendar, Clock, CheckCircle, Star, Award } from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { useElementScrollProgress } from "@/hooks/use-scroll-progress";
import { useRef } from "react";

const InteractiveTimeline = () => {
  const { ref: sectionRef, isVisible: sectionVisible } = useScrollAnimation({
    threshold: 0.1,
  });
  const timelineRef = useRef<HTMLDivElement>(null);
  const progress = useElementScrollProgress(timelineRef);

  const timelineEvents = [
    {
      week: "Week 1",
      title: "Initial Assessment & Goal Setting",
      description:
        "Complete comprehensive evaluation and create personalized learning plan",
      icon: Calendar,
      status: "completed",
      details: ["Skills assessment", "Goal identification", "Mentor matching"],
    },
    {
      week: "Week 2-4",
      title: "Foundation Building",
      description: "Master fundamental concepts and begin NBDE preparation",
      icon: Clock,
      status: "in-progress",
      details: [
        "Core concepts review",
        "Study methodology",
        "Practice questions",
      ],
    },
    {
      week: "Week 5-8",
      title: "Intensive Preparation",
      description: "Deep dive into specialized topics and mock examinations",
      icon: CheckCircle,
      status: "upcoming",
      details: ["Mock exams", "Performance analysis", "Weakness targeting"],
    },
    {
      week: "Week 9-12",
      title: "Exam Readiness",
      description: "Final preparations and confidence building",
      icon: Star,
      status: "upcoming",
      details: ["Final review", "Test strategies", "Confidence building"],
    },
    {
      week: "Week 13+",
      title: "Success & Beyond",
      description: "Career guidance and ongoing support",
      icon: Award,
      status: "future",
      details: [
        "Career planning",
        "Residency applications",
        "Ongoing mentorship",
      ],
    },
  ];

  const getStatusColor = (status: string, index: number) => {
    const progressThreshold = ((index + 1) / timelineEvents.length) * 100;

    if (progress >= progressThreshold) {
      return "bg-gradient-primary text-white";
    } else if (progress >= progressThreshold - 20) {
      return "bg-gradient-secondary text-white";
    } else {
      return "bg-muted text-muted-foreground";
    }
  };

  return (
    <section ref={sectionRef} className="py-12 sm:py-16 md:py-20 bg-background">
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4 sm:mb-5 md:mb-6 px-4">
            Your 12-Week Success Timeline
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            Follow our proven structured approach that guides international
            dental graduates from preparation to success, with milestone
            tracking every step of the way.
          </p>
        </div>

        {/* Interactive Timeline */}
        <div ref={timelineRef} className="relative max-w-4xl mx-auto">
          {/* Progress Line */}
          <div className="absolute left-4 sm:left-6 md:left-8 top-0 bottom-0 w-0.5 sm:w-1 bg-muted-foreground/20 hidden md:block">
            <div
              className="w-full bg-gradient-primary transition-all duration-500 ease-out"
              style={{ height: `${Math.min(progress, 100)}%` }}
            />
          </div>

          {/* Timeline Events */}
          <div className="space-y-8 sm:space-y-10 md:space-y-12">
            {timelineEvents.map((event, index) => {
              const Icon = event.icon;
              const progressThreshold =
                ((index + 1) / timelineEvents.length) * 100;
              const isActive = progress >= progressThreshold - 20;

              return (
                <div
                  key={index}
                  className={`relative flex items-start gap-4 sm:gap-5 md:gap-6 lg:gap-8 scroll-animate-left ${
                    sectionVisible ? "animate-in" : ""
                  } pl-8 sm:pl-0`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  {/* Timeline Node */}
                  <div
                    className={`flex-shrink-0 relative z-10 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-500 ${getStatusColor(
                      event.status,
                      index
                    )}`}
                  >
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />

                    {/* Pulse Effect for Active Items */}
                    {isActive && (
                      <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-primary/30 animate-ping"></div>
                    )}
                  </div>

                  {/* Content Card */}
                  <div
                    className={`flex-1 p-4 sm:p-5 md:p-6 card-hover rounded-2xl sm:rounded-3xl transition-all duration-500 ${
                      isActive ? "ring-2 ring-primary/20 shadow-large" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <span className="text-xs sm:text-sm font-semibold text-primary bg-primary/10 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                        {event.week}
                      </span>

                      {/* Progress Indicator */}
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        {progress >= progressThreshold ? (
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        ) : progress >= progressThreshold - 20 ? (
                          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-secondary animate-pulse" />
                        ) : (
                          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-muted-foreground/30"></div>
                        )}
                      </div>
                    </div>

                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-2 sm:mb-3">
                      {event.title}
                    </h3>

                    <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 leading-relaxed">
                      {event.description}
                    </p>

                    {/* Details List */}
                    <ul className="space-y-1.5 sm:space-y-2">
                      {event.details.map((detail, detailIndex) => (
                        <li
                          key={detailIndex}
                          className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground"
                        >
                          <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-primary rounded-full flex-shrink-0"></div>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress Stats */}
        <div
          className={`mt-10 sm:mt-12 md:mt-16 scroll-animate ${
            sectionVisible ? "animate-in" : ""
          } px-4 sm:px-0`}
          style={{ transitionDelay: "800ms" }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 md:gap-6 max-w-3xl mx-auto">
            <div className="text-center p-4 sm:p-5 md:p-6 card-hover rounded-xl sm:rounded-2xl">
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-1 sm:mb-2">
                12
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                Weeks to Success
              </div>
            </div>
            <div className="text-center p-4 sm:p-5 md:p-6 card-hover rounded-xl sm:rounded-2xl">
              <div className="text-2xl sm:text-3xl font-bold text-secondary mb-1 sm:mb-2">
                85%
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                Pass Rate
              </div>
            </div>
            <div className="text-center p-4 sm:p-5 md:p-6 card-hover rounded-xl sm:rounded-2xl">
              <div className="text-2xl sm:text-3xl font-bold text-accent mb-1 sm:mb-2">
                24/7
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                Support Available
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveTimeline;
