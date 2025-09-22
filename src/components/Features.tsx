import { Video, Calendar, ShieldCheck, Users, Star, TrendingUp } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';

const Features = () => {
  const { ref: featuresRef, isVisible: featuresVisible } = useScrollAnimation();
  
  const features = [
    {
      icon: Video,
      title: '1-on-1 Video Sessions',
      description: 'Personalized mentorship through high-quality video calls with experienced dental professionals.',
      gradient: 'bg-gradient-primary',
      side: 'left'
    },
    {
      icon: Calendar,
      title: 'Flexible Scheduling',
      description: 'Book sessions at your convenience with mentors across different time zones.',
      gradient: 'bg-gradient-secondary',
      side: 'right'
    },
    {
      icon: ShieldCheck,
      title: 'Verified Mentors',
      description: 'All mentors are thoroughly vetted U.S. dental school graduates with active licenses.',
      gradient: 'bg-gradient-accent',
      side: 'left'
    },
    {
      icon: Users,
      title: 'Peer Community',
      description: 'Connect with fellow international graduates in supportive community groups.',
      gradient: 'bg-gradient-primary',
      side: 'right'
    },
    {
      icon: Star,
      title: 'Success Tracking',
      description: 'Monitor your progress with personalized learning plans and milestone tracking.',
      gradient: 'bg-gradient-secondary',
      side: 'left'
    },
    {
      icon: TrendingUp,
      title: 'Career Guidance',
      description: 'Get insights on residency applications, job market trends, and career advancement.',
      gradient: 'bg-gradient-accent',
      side: 'right'
    }
  ];

  return (
    <section ref={featuresRef} className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            How We Support Your Journey
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From application strategy to interview preparation, we provide comprehensive 
            support for every step of your dental career journey in the United States.
          </p>
        </div>

        <div className="space-y-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isLeft = feature.side === 'left';
            
            return (
              <div
                key={index}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                  isLeft ? '' : 'lg:grid-flow-col-dense'
                }`}
              >
                {/* Content */}
                <div className={`${isLeft ? '' : 'lg:col-start-2'} 
                  scroll-animate-${isLeft ? 'left' : 'right'} 
                  ${featuresVisible ? 'animate-in' : ''} group`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className={`inline-flex items-center justify-center w-16 h-16 ${feature.gradient} rounded-2xl mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-3xl font-bold text-foreground mb-4">
                    {feature.title}
                  </h3>
                  
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Visual Element */}
                <div className={`${isLeft ? 'lg:order-2' : 'lg:col-start-1'} 
                  scroll-animate-${isLeft ? 'right' : 'left'} 
                  ${featuresVisible ? 'animate-in' : ''} group`}
                  style={{ transitionDelay: `${index * 100 + 200}ms` }}
                >
                  <div className="relative">
                    <div className={`w-full h-64 ${feature.gradient} rounded-3xl flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform`}>
                      <Icon className="w-24 h-24 text-white/20 absolute group-hover:scale-110 transition-transform" />
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                      
                      {/* Floating Elements */}
                      <div className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full animate-pulse"></div>
                      <div className="absolute bottom-6 left-6 w-12 h-12 bg-white/15 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
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