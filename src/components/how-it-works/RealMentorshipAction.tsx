import {
  FileText,
  MessageSquare,
  Calendar,
  Users,
  Award,
  Target,
  CheckCircle,
  GraduationCap,
} from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

const RealMentorshipAction = () => {
  const { ref: sectionRef, isVisible: sectionVisible } = useScrollAnimation({
    threshold: 0.1,
  });

  const mentorshipAreas = [
    {
      icon: FileText,
      title: "Personal Statement Review",
      description:
        "Professional feedback on your application essays and personal statements",
      features: [
        "One-on-one writing guidance",
        "Multiple draft reviews",
        "Storytelling techniques",
        "School-specific customization",
      ],
      color: "primary",
    },
    {
      icon: MessageSquare,
      title: "Interview Preparation",
      description:
        "Mock interviews and confidence building for dental school interviews",
      features: [
        "Mock interview sessions",
        "Real-time feedback",
        "Question preparation",
        "Communication coaching",
      ],
      color: "secondary",
    },
    {
      icon: Target,
      title: "Application Strategy",
      description:
        "Strategic guidance for school selection and application planning",
      features: [
        "School requirement analysis",
        "Application timeline planning",
        "Goal setting and optimization",
        "Deadline management",
      ],
      color: "accent",
    },
    {
      icon: Award,
      title: "CV/Resume Enhancement",
      description:
        "Professional review and optimization of your application materials",
      features: [
        "Document structure review",
        "Experience highlighting",
        "Skills optimization",
        "Professional presentation",
      ],
      color: "primary",
    },
  ];

  const platformFeatures = [
    {
      metric: "15+",
      label: "Verified dental professionals ready to mentor you",
    },
    {
      metric: "4+",
      label: "Core services covering your entire application journey",
    },
    {
      metric: "1:1",
      label: "Personalized mentorship sessions tailored to your needs",
    },
    {
      metric: "24/7",
      label: "Access to platform resources and mentor communication",
    },
  ];

  return (
    <section ref={sectionRef} className="py-12 sm:py-16 md:py-20 bg-background">
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5 md:mb-6 bg-gradient-primary rounded-xl sm:rounded-2xl px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 hover:shadow-lg hover:scale-105 transition-all duration-300">
            <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            <span className="text-white font-semibold text-sm sm:text-base">
              Admission Guidance Services
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4 sm:mb-5 md:mb-6 px-4">
            Dental School Admission Guidance That Works
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            Get personalized, actionable guidance from dental professionals who
            understand the modern admissions landscape and what it takes to
            succeed.
          </p>
        </div>

        {/* Mentorship Areas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-12 sm:mb-16 md:mb-20">
          {mentorshipAreas.map((area, index) => {
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
                <div
                  className={`absolute inset-0 bg-gradient-${area.color} opacity-5 group-hover:opacity-10 transition-opacity`}
                ></div>

                <div className="relative z-10">
                  <div
                    className={`flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-${area.color} rounded-xl sm:rounded-2xl mb-4 sm:mb-5 md:mb-6 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4 group-hover:scale-105 transition-transform">
                    {area.title}
                  </h3>

                  <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-4 sm:mb-5 md:mb-6 leading-relaxed">
                    {area.description}
                  </p>

                  <ul className="space-y-2 sm:space-y-3">
                    {area.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-start gap-2 sm:gap-3"
                      >
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-xs sm:text-sm md:text-base text-muted-foreground">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Platform Features */}
        <div
          className={`scroll-animate ${
            sectionVisible ? "animate-in" : ""
          } px-4 sm:px-0`}
          style={{ transitionDelay: "600ms" }}
        >
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-3 sm:mb-4">
              Why Choose DentMentor
            </h3>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform connects you with experienced dental professionals
              who understand the application process and are committed to your
              success.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {platformFeatures.map((item, index) => (
              <div
                key={index}
                className="text-center p-4 sm:p-5 md:p-6 card-hover rounded-xl sm:rounded-2xl group"
              >
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
                  {item.metric}
                </div>
                <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-snug">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Building Element */}
        <div
          className={`mt-10 sm:mt-12 md:mt-16 bg-gradient-primary rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 lg:p-12 text-center text-white scroll-animate ${
            sectionVisible ? "animate-in" : ""
          } px-4 sm:px-0`}
          style={{ transitionDelay: "800ms" }}
        >
          <div className="max-w-3xl mx-auto">
            <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-4 sm:mb-5 md:mb-6">
              "The difference between a good application and a great one is
              guidance from someone who's been there."
            </h3>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90">
              — Dr. Sarah Martinez, Harvard School of Dental Medicine, Class of
              2019
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RealMentorshipAction;
