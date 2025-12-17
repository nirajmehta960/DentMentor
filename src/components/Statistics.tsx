import { Users, TrendingUp, Award, CheckCircle } from "lucide-react";
import { useCounterAnimation } from "@/hooks/use-scroll-animation";

const Statistics = () => {
  const mentorsData = useCounterAnimation(15, 2000);
  const successData = useCounterAnimation(95, 1500);
  const graduatesData = useCounterAnimation(10, 2500);
  const programsData = useCounterAnimation(8, 1000);

  const stats = [
    {
      ref: mentorsData.ref,
      icon: Users,
      value: mentorsData.count,
      suffix: "+",
      label: "Verified Mentors",
      description: "Application experts ready to help",
    },
    {
      ref: successData.ref,
      icon: TrendingUp,
      value: successData.count,
      suffix: "%",
      label: "Platform Rating",
      description: "User satisfaction score",
    },
    {
      ref: graduatesData.ref,
      icon: Award,
      value: graduatesData.count,
      suffix: "+",
      label: "Students Helped",
      description: "Total mentored successfully",
    },
    {
      ref: programsData.ref,
      icon: CheckCircle,
      value: programsData.count,
      suffix: "+",
      label: "Countries",
      description: "Students from worldwide",
    },
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-muted/30">
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-3 sm:mb-4 px-4">
            Start Your Success Story Today
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Join our growing community of international dental graduates who are
            successfully navigating their path to practicing dentistry in the
            United States.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                ref={stat.ref}
                className="text-center p-6 sm:p-7 md:p-8 card-hover rounded-xl sm:rounded-2xl group"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-primary rounded-xl sm:rounded-2xl mb-4 sm:mb-5 md:mb-6 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                </div>

                <div className="counter-number text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-2">
                  {stat.value}
                  {stat.suffix}
                </div>

                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                  {stat.label}
                </h3>

                <p className="text-sm sm:text-base text-muted-foreground">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Statistics;
