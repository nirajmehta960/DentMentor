import {
  Target,
  Calendar,
  Package,
  Users,
  CheckCircle,
  Star,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { Link } from "react-router-dom";

const FlexibleMentorship = () => {
  const { ref: sectionRef, isVisible: sectionVisible } = useScrollAnimation({
    threshold: 0.1,
  });

  const focusAreas = [
    {
      icon: Target,
      title: "Application Strategy",
      description:
        "Personalized guidance for your dental school application journey",
      details: [
        "School selection strategy",
        "Timeline planning",
        "Application optimization",
        "Goal setting",
      ],
    },
    {
      icon: Users,
      title: "Document Review",
      description: "Professional feedback on your application materials",
      details: [
        "CV/Resume review",
        "Personal statement feedback",
        "Application essay guidance",
        "Portfolio optimization",
      ],
    },
    {
      icon: Star,
      title: "Interview Preparation",
      description: "Build confidence for dental school interviews",
      details: [
        "Mock interview sessions",
        "Question preparation",
        "Communication skills",
        "Confidence building",
      ],
    },
  ];

  const sessionTypes = [
    {
      icon: Clock,
      title: "Single Sessions",
      subtitle: "Target specific challenges",
      duration: "30 minutes - 1 hour",
      price: "$125-200",
      popular: false,
    },
    {
      icon: Package,
      title: "Premium Packages",
      subtitle: "Comprehensive application support",
      duration: "5-10 sessions over 3 months",
      price: "$1,500-2,000",
      popular: true,
    },
    {
      icon: Calendar,
      title: "Extended Mentorship",
      subtitle: "Complete application cycle support",
      duration: "Throughout application season",
      price: "$2,500-3,500",
      popular: false,
    },
  ];

  return (
    <section ref={sectionRef} className="py-12 sm:py-16 md:py-20 bg-background">
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4 sm:mb-5 md:mb-6 px-4">
            Flexible Mentorship That Fits Your Schedule
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            Get personalized guidance exactly when you need it. Choose your
            focus areas, book sessions at your pace, and achieve success on your
            timeline.
          </p>
        </div>

        {/* Focus Areas */}
        <div className="mb-12 sm:mb-16 md:mb-20">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-3 sm:mb-4 px-4">
              🎯 Choose Your Focus Areas
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {focusAreas.map((area, index) => {
              const Icon = area.icon;
              return (
                <div
                  key={index}
                  className={`card-hover rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 scroll-animate ${
                    sectionVisible ? "animate-in" : ""
                  } group relative overflow-hidden`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  {/* Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-primary opacity-5 group-hover:opacity-10 transition-opacity"></div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-primary rounded-xl sm:rounded-2xl mb-4 sm:mb-5 md:mb-6 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                    </div>

                    <h4 className="text-lg sm:text-xl font-bold text-foreground mb-3 sm:mb-4 group-hover:scale-105 transition-transform">
                      {area.title}
                    </h4>

                    <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-5 md:mb-6">
                      {area.description}
                    </p>

                    <ul className="space-y-1.5 sm:space-y-2">
                      {area.details.map((detail, detailIndex) => (
                        <li
                          key={detailIndex}
                          className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground"
                        >
                          <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary mt-0.5 flex-shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Session Types */}
        <div className="mb-12 sm:mb-16 md:mb-20">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-3 sm:mb-4 px-4">
              Book Sessions As You Need Them
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {sessionTypes.map((session, index) => {
              const Icon = session.icon;
              return (
                <div
                  key={index}
                  className={`card-hover rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 text-center relative overflow-hidden scroll-animate ${
                    sectionVisible ? "animate-in" : ""
                  } group ${
                    session.popular ? "ring-2 ring-primary/20 shadow-large" : ""
                  }`}
                  style={{ transitionDelay: `${(index + 3) * 150}ms` }}
                >
                  {/* Background Gradient */}
                  <div
                    className={`absolute inset-0 bg-gradient-${
                      index % 2 === 0 ? "secondary" : "accent"
                    } opacity-5 group-hover:opacity-10 transition-opacity`}
                  ></div>

                  {session.popular && (
                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-gradient-primary text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-semibold z-20">
                      🔥 Most Popular
                    </div>
                  )}

                  <div className="relative z-10">
                    <div
                      className={`flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-${
                        index % 2 === 0 ? "secondary" : "accent"
                      } rounded-xl sm:rounded-2xl mb-4 sm:mb-5 md:mb-6 mx-auto group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                    </div>

                    <h4 className="text-lg sm:text-xl font-bold text-foreground mb-2 group-hover:scale-105 transition-transform">
                      {session.title}
                    </h4>

                    <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
                      {session.subtitle}
                    </p>

                    <div className="text-xl sm:text-2xl font-bold text-primary mb-1 sm:mb-2">
                      {session.price}
                    </div>

                    <div className="text-xs sm:text-sm text-muted-foreground">
                      {session.duration}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Call to Action */}
        <div
          className={`text-center bg-gradient-primary rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 text-white scroll-animate ${
            sectionVisible ? "animate-in" : ""
          }`}
          style={{ transitionDelay: "1200ms" }}
        >
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-5 md:mb-6 px-4">
            Ready to Transform Your Applications?
          </h3>

          <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-7 md:mb-8 max-w-2xl mx-auto px-4">
            Book your first session today and get personalized guidance from
            verified mentors who understand the dental school application
            process.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-7 md:mb-8 max-w-3xl mx-auto text-left px-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:bg-white/20 hover:scale-105 transition-all duration-300 cursor-pointer group">
              <div className="text-sm sm:text-base font-semibold mb-1 sm:mb-2 group-hover:scale-105 transition-transform">
                Choose from 15+ verified mentors
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:bg-white/20 hover:scale-105 transition-all duration-300 cursor-pointer group">
              <div className="text-sm sm:text-base font-semibold mb-1 sm:mb-2 group-hover:scale-105 transition-transform">
                Flexible scheduling that works with your timeline
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:bg-white/20 hover:scale-105 transition-all duration-300 cursor-pointer group">
              <div className="text-sm sm:text-base font-semibold mb-1 sm:mb-2 group-hover:scale-105 transition-transform">
                Satisfaction guaranteed or your money back
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base w-full sm:w-auto"
            >
              <Link to="/mentors">Browse Mentors</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FlexibleMentorship;
