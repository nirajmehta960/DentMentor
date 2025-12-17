import { ArrowRight, X, Check, AlertCircle, Target } from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { useState } from "react";
import { Link } from "react-router-dom";

const BeforeAfter = () => {
  const { ref: sectionRef, isVisible: sectionVisible } = useScrollAnimation({
    threshold: 0.1,
  });
  const [activeTab, setActiveTab] = useState<"before" | "after">("before");

  const beforeScenarios = [
    {
      icon: X,
      title: "Overwhelming Application Process",
      description:
        "Confused by complex dental school requirements and application timelines",
      emotion: "Confused & Stressed",
    },
    {
      icon: AlertCircle,
      title: "Generic Application Materials",
      description:
        "Personal statements and resumes that fail to stand out from thousands of applicants",
      emotion: "Uncertain & Generic",
    },
    {
      icon: X,
      title: "Limited Dental School Insights",
      description:
        "No connections to dental schools or understanding of what admissions committees want",
      emotion: "Disconnected",
    },
    {
      icon: AlertCircle,
      title: "Interview Anxiety",
      description:
        "Unprepared for dental school interviews with no feedback or practice",
      emotion: "Nervous & Unprepared",
    },
  ];

  const afterScenarios = [
    {
      icon: Check,
      title: "Strategic Application Plan",
      description:
        "Clear roadmap with personalized timeline and school selection strategy",
      emotion: "Confident & Organized",
    },
    {
      icon: Target,
      title: "Compelling Application Materials",
      description:
        "Standout personal statements and resumes crafted with professional guidance",
      emotion: "Distinctive & Polished",
    },
    {
      icon: Check,
      title: "Insider Dental School Knowledge",
      description:
        "Direct insights from dental professionals and recent graduates",
      emotion: "Informed & Strategic",
    },
    {
      icon: Target,
      title: "Interview Mastery",
      description:
        "Confident interview performance with extensive practice and feedback",
      emotion: "Prepared & Confident",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="py-12 sm:py-16 md:py-20 bg-muted/30 overflow-hidden"
    >
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4 sm:mb-5 md:mb-6 px-4">
            The Transformation Journey
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            See how DentMentor transforms your dental school application journey
            from overwhelming to organized, generic to compelling.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex justify-center mb-8 sm:mb-10 md:mb-12 px-4">
          <div className="bg-background rounded-xl sm:rounded-2xl p-1.5 sm:p-2 shadow-soft">
            <button
              onClick={() => setActiveTab("before")}
              className={`px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm md:text-base font-semibold transition-all ${
                activeTab === "before"
                  ? "bg-gradient-primary text-white shadow-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Before DentMentor
            </button>
            <button
              onClick={() => setActiveTab("after")}
              className={`px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm md:text-base font-semibold transition-all ${
                activeTab === "after"
                  ? "bg-gradient-primary text-white shadow-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              After DentMentor
            </button>
          </div>
        </div>

        {/* Content Cards */}
        <div className="relative max-w-6xl mx-auto">
          {/* Before Section */}
          <div
            className={`grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 transition-all duration-700 ${
              activeTab === "before"
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-full absolute inset-0"
            }`}
          >
            {beforeScenarios.map((scenario, index) => {
              const Icon = scenario.icon;
              return (
                <div
                  key={index}
                  className={`scroll-animate-left ${
                    sectionVisible ? "animate-in" : ""
                  } 
                    p-5 sm:p-6 md:p-8 bg-background rounded-2xl sm:rounded-3xl border-2 border-destructive/20 relative group hover:border-destructive/40 hover:shadow-lg transition-all duration-300`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  {/* Negative Indicator */}
                  <div className="absolute -top-2 -left-2 sm:-top-3 sm:-left-3 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-destructive rounded-full flex items-center justify-center">
                    <X className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-white" />
                  </div>

                  <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-5 md:mb-6">
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-destructive/10 rounded-lg sm:rounded-xl flex items-center justify-center">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-destructive" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-foreground mb-1.5 sm:mb-2">
                        {scenario.title}
                      </h3>
                      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                        {scenario.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-destructive rounded-full"></div>
                    <span className="text-destructive font-medium">
                      {scenario.emotion}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* After Section */}
          <div
            className={`grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 transition-all duration-700 ${
              activeTab === "after"
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-full absolute inset-0"
            }`}
          >
            {afterScenarios.map((scenario, index) => {
              const Icon = scenario.icon;
              return (
                <div
                  key={index}
                  className={`scroll-animate-right ${
                    sectionVisible ? "animate-in" : ""
                  } 
                    p-5 sm:p-6 md:p-8 bg-background rounded-2xl sm:rounded-3xl border-2 border-primary/20 relative group hover:border-primary/40 hover:shadow-lg transition-all duration-300`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  {/* Positive Indicator */}
                  <div className="absolute -top-2 -left-2 sm:-top-3 sm:-left-3 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-white" />
                  </div>

                  <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-5 md:mb-6">
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg sm:rounded-xl flex items-center justify-center">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-foreground mb-1.5 sm:mb-2">
                        {scenario.title}
                      </h3>
                      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                        {scenario.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full"></div>
                    <span className="text-primary font-medium">
                      {scenario.emotion}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Transformation Arrow */}
        <div
          className={`flex justify-center mt-8 sm:mt-10 md:mt-12 scroll-animate ${
            sectionVisible ? "animate-in" : ""
          } px-4`}
          style={{ transitionDelay: "600ms" }}
        >
          <Link
            to="/auth"
            className="flex items-center gap-2 sm:gap-3 md:gap-4 p-3 sm:p-3.5 md:p-4 bg-gradient-primary rounded-xl sm:rounded-2xl text-white hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            <span className="text-sm sm:text-base font-semibold">
              Transform Your Journey
            </span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BeforeAfter;
