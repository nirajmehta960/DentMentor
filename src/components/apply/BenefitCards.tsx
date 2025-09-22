import { DollarSign, Clock, Heart, TrendingUp, Users, Award } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';

const benefits = [
  {
    icon: DollarSign,
    title: 'Earn Meaningful Income',
    description: 'Average $120+ per hour with flexible scheduling that works around your practice.',
    value: '$120+/hr',
    color: 'text-green-500'
  },
  {
    icon: Clock,
    title: 'Flexible Schedule',
    description: 'Set your own hours and availability. Work as much or as little as you want.',
    value: 'Your Choice',
    color: 'text-blue-500'
  },
  {
    icon: Heart,
    title: 'Make a Difference',
    description: 'Help international dental graduates navigate their career journey successfully.',
    value: '95% Rating',
    color: 'text-red-500'
  },
  {
    icon: TrendingUp,
    title: 'Growing Demand',
    description: 'Join a rapidly expanding platform with increasing demand for quality mentors.',
    value: '50+ Students',
    color: 'text-purple-500'
  },
  {
    icon: Users,
    title: 'Build Network',
    description: 'Connect with fellow professionals and expand your dental network globally.',
    value: '15+ Mentors',
    color: 'text-orange-500'
  },
  {
    icon: Award,
    title: 'Recognition',
    description: 'Gain recognition as a thought leader and expert in your specialty area.',
    value: 'Top Rated',
    color: 'text-amber-500'
  }
];

export const BenefitCards = () => {
  const { ref: sectionRef, isVisible } = useScrollAnimation();

  return (
    <section ref={sectionRef} className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className={`text-4xl md:text-5xl font-bold text-primary mb-4 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            Why Become a DentMentor?
          </h2>
          <p className={`text-xl text-muted-foreground max-w-3xl mx-auto transition-all duration-1000 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            Join our community of dental professionals making a real impact while earning meaningful income.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            
            return (
              <div
                key={index}
                className={`card-hover rounded-3xl p-8 group relative overflow-hidden transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 group-hover:from-primary/10 group-hover:to-accent/10 transition-colors" />
                
                <div className="relative z-10">
                  {/* Icon */}
                  <div className="mb-6">
                    <div className={`w-16 h-16 rounded-2xl bg-white shadow-medium flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className={`w-8 h-8 ${benefit.color}`} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                      {benefit.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>

                  {/* Value */}
                  <div className="flex items-center justify-between">
                    <div className={`text-2xl font-bold ${benefit.color}`}>
                      {benefit.value}
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-primary" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 rounded-3xl border-2 border-primary/20 opacity-0 group-hover:opacity-100 scale-105 group-hover:scale-100 transition-all duration-300 pointer-events-none" />
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className={`text-center mt-16 transition-all duration-1000 delay-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="inline-flex items-center gap-4 bg-white rounded-2xl p-6 shadow-medium">
            <div className="text-4xl font-bold text-primary">15+</div>
            <div className="text-left">
              <div className="font-semibold text-foreground">Verified Mentors</div>
              <div className="text-sm text-muted-foreground">Join our growing community</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};