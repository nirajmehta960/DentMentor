import { TrendingUp, Users, Globe, Award } from "lucide-react";
import {
  useScrollAnimation,
  useCounterAnimation,
} from "@/hooks/use-scroll-animation";

const metrics = [
  {
    icon: Users,
    value: 2847,
    label: "Students Helped",
    suffix: "+",
    description:
      "International dental graduates successfully guided through the US licensing process",
    color: "text-blue-500",
    bgColor: "bg-blue-50",
  },
  {
    icon: TrendingUp,
    value: 94,
    label: "Success Rate",
    suffix: "%",
    description:
      "Board exam pass rate for students who completed our mentorship program",
    color: "text-green-500",
    bgColor: "bg-green-50",
  },
  {
    icon: Globe,
    value: 52,
    label: "Countries",
    suffix: "+",
    description:
      "Countries represented by our diverse community of students and mentors",
    color: "text-purple-500",
    bgColor: "bg-purple-50",
  },
  {
    icon: Award,
    value: 500,
    label: "Expert Mentors",
    suffix: "+",
    description:
      "Verified US dental professionals providing personalized guidance",
    color: "text-orange-500",
    bgColor: "bg-orange-50",
  },
];

export const ImpactMetrics = () => {
  const { ref: sectionRef, isVisible } = useScrollAnimation();

  return (
    <section
      ref={sectionRef}
      className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-muted/30 to-background"
    >
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h2
            className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-3 sm:mb-4 transition-all duration-1000 px-4 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            Our Global Impact
          </h2>
          <p
            className={`text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto transition-all duration-1000 delay-200 px-4 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            Numbers that tell the story of lives transformed and dreams realized
            through mentorship.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {metrics.map((metric, index) => {
            const IconComponent = metric.icon;
            const counter = useCounterAnimation(metric.value, 2000);

            return (
              <MetricCard
                key={index}
                metric={metric}
                counter={counter}
                IconComponent={IconComponent}
                index={index}
                isVisible={isVisible}
              />
            );
          })}
        </div>

        {/* Additional Context */}
        <div
          className={`text-center mt-10 sm:mt-12 md:mt-16 transition-all duration-1000 delay-700 px-4 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="max-w-4xl mx-auto p-5 sm:p-6 md:p-8 bg-white rounded-2xl sm:rounded-3xl shadow-soft">
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">
              More Than Just Numbers
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4 sm:mb-6">
              Behind every statistic is a personal story of growth,
              perseverance, and achievement. Our impact extends beyond
              numbers—we're building bridges between cultures, creating lasting
              professional relationships, and enriching the global dental
              community.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-center">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-1 sm:mb-2">
                  98%
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Would recommend us to a friend
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-1 sm:mb-2">
                  4.9/5
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Average mentor rating
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-1 sm:mb-2">
                  6 months
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Average time to success
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

interface MetricCardProps {
  metric: (typeof metrics)[0];
  counter: { count: number };
  IconComponent: React.ComponentType<any>;
  index: number;
  isVisible: boolean;
}

const MetricCard = ({
  metric,
  counter,
  IconComponent,
  index,
  isVisible,
}: MetricCardProps) => {
  return (
    <div
      className={`metric-card group transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <div className="relative p-5 sm:p-6 md:p-8 bg-white rounded-2xl sm:rounded-3xl shadow-soft hover:shadow-large transition-all duration-300 overflow-hidden">
        {/* Background Pattern */}
        <div
          className={`absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 ${metric.bgColor} rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity duration-300`}
        />

        {/* Icon */}
        <div className="relative z-10 mb-4 sm:mb-5 md:mb-6">
          <div
            className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl ${metric.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
          >
            <IconComponent
              className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 ${metric.color}`}
            />
          </div>
        </div>

        {/* Counter */}
        <div className="relative z-10 mb-3 sm:mb-4">
          <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground counter-number flex items-baseline">
            {counter.count.toLocaleString()}
            <span className={`text-xl sm:text-2xl ${metric.color} ml-1`}>
              {metric.suffix}
            </span>
          </div>
          <div className="text-base sm:text-lg font-semibold text-foreground mt-1">
            {metric.label}
          </div>
        </div>

        {/* Description */}
        <div className="relative z-10">
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {metric.description}
          </p>
        </div>

        {/* Odometer Effect Overlay */}
        <div
          className={`absolute inset-0 ${metric.bgColor} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
        />

        {/* Hover Glow */}
        <div
          className={`absolute inset-0 rounded-3xl border-2 ${metric.color.replace(
            "text-",
            "border-"
          )}/20 opacity-0 group-hover:opacity-100 scale-105 group-hover:scale-100 transition-all duration-300 pointer-events-none`}
        />

        {/* Achievement Unlock Animation */}
        <div
          className={`absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform rotate-12 group-hover:rotate-0`}
        >
          <Award className={`w-6 h-6 ${metric.color}`} />
        </div>
      </div>
    </div>
  );
};
