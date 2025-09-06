import { TrendingUp, Users, Award, Clock, Globe, Star } from 'lucide-react';
import { useScrollAnimation, useCounterAnimation } from '@/hooks/use-scroll-animation';

const SuccessMetrics = () => {
  const { ref: sectionRef, isVisible: sectionVisible } = useScrollAnimation({ threshold: 0.1 });
  
  // Counter animations for key metrics
  const successRate = useCounterAnimation(85, 2500);
  const totalStudents = useCounterAnimation(1200, 3000);
  const mentors = useCounterAnimation(500, 2000);
  const avgWeeks = useCounterAnimation(12, 1500);
  const countries = useCounterAnimation(45, 2800);
  const satisfaction = useCounterAnimation(98, 2200);

  const metrics = [
    {
      ref: successRate.ref,
      value: successRate.count,
      suffix: '%',
      title: 'NBDE Pass Rate',
      description: 'First-time pass rate',
      icon: TrendingUp,
      color: 'primary'
    },
    {
      ref: totalStudents.ref,
      value: totalStudents.count,
      suffix: '+',
      title: 'Success Stories',
      description: 'Graduates helped',
      icon: Users,
      color: 'secondary'
    },
    {
      ref: mentors.ref,
      value: mentors.count,
      suffix: '+',
      title: 'Expert Mentors',
      description: 'Verified professionals',
      icon: Award,
      color: 'accent'
    },
    {
      ref: avgWeeks.ref,
      value: avgWeeks.count,
      suffix: '',
      title: 'Average Weeks',
      description: 'To achieve goals',
      icon: Clock,
      color: 'primary'
    },
    {
      ref: countries.ref,
      value: countries.count,
      suffix: '+',
      title: 'Countries',
      description: 'Students served',
      icon: Globe,
      color: 'secondary'
    },
    {
      ref: satisfaction.ref,
      value: satisfaction.count,
      suffix: '%',
      title: 'Satisfaction',
      description: 'Student rating',
      icon: Star,
      color: 'accent'
    }
  ];

  return (
    <section ref={sectionRef} className="py-20 bg-background relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-64 h-64 bg-primary rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-secondary rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">
            Proven Results That Speak
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Real numbers from real students who've transformed their careers through 
            DentMentor's comprehensive mentorship program.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div
                key={index}
                ref={metric.ref}
                className={`scroll-animate-scale ${sectionVisible ? 'animate-in' : ''} 
                  card-hover rounded-3xl p-8 text-center group relative overflow-hidden`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-${metric.color} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
                
                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-${metric.color} rounded-3xl mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-10 h-10 text-white" />
                  </div>

                  {/* Counter */}
                  <div className="counter-number text-5xl md:text-6xl font-bold text-foreground mb-2 group-hover:scale-105 transition-transform">
                    {metric.value}{metric.suffix}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {metric.title}
                  </h3>

                  {/* Description */}
                  <p className="text-muted-foreground">
                    {metric.description}
                  </p>

                  {/* Animated Progress Ring */}
                  <div className="absolute top-4 right-4 w-8 h-8">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 32 32">
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
                        strokeDashoffset={87.96 * (1 - (sectionVisible ? 0.75 : 0))}
                        style={{
                          transition: 'stroke-dashoffset 2s ease-out',
                          transitionDelay: `${index * 200}ms`
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
        <div className={`mt-20 scroll-animate ${sectionVisible ? 'animate-in' : ''}`} style={{ transitionDelay: '900ms' }}>
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
                🏆 Industry-Leading Success Rate
              </h3>
              <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
                Our comprehensive mentorship approach has achieved the highest success rates 
                in the industry, with most students passing their exams on the first attempt.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <div className="text-2xl font-bold mb-2">85%</div>
                  <div className="text-white/80">First-Time Pass Rate</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <div className="text-2xl font-bold mb-2">95%</div>
                  <div className="text-white/80">Career Placement</div>
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