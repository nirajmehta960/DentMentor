import { Search, CalendarCheck, Video, Trophy, UserCheck, CreditCard, MessageCircle, Target } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import { useElementScrollProgress } from '@/hooks/use-scroll-progress';
import { useRef } from 'react';

const ProcessSteps = () => {
  const { ref: sectionRef, isVisible: sectionVisible } = useScrollAnimation({ threshold: 0.1 });
  const timelineRef = useRef<HTMLDivElement>(null);
  const timelineProgress = useElementScrollProgress(timelineRef);
  
  const steps = [
    {
      number: 1,
      icon: Search,
      title: 'Find Your Perfect Mentor',
      description: 'Browse verified mentors with dental school application expertise from top U.S. programs.',
      features: ['15+ verified mentors', 'Application specialists', 'Proven admission success'],
      delay: 100
    },
    {
      number: 2,
      icon: CalendarCheck,
      title: 'Book Your Session',
      description: 'Schedule flexible 1-on-1 sessions focused on your specific application needs and timeline.',
      features: ['Flexible scheduling', 'Multiple time zones', 'Application-focused'],
      delay: 200
    },
    {
      number: 3,
      icon: Video,
      title: 'Get Expert Guidance',
      description: 'Receive personalized mentorship across all aspects of your dental school application journey.',
      features: ['CV/Resume Review', 'Mock Interview Sessions', 'SOP Review & Feedback', 'Application Strategy Consultation'],
      delay: 300
    },
    {
      number: 4,
      icon: Trophy,
      title: 'Achieve Success',
      description: 'Land interviews, get accepted to dental school, and start your successful journey in U.S. dentistry.',
      features: ['Interview success', 'School acceptance', 'Career guidance'],
      delay: 400
    }
  ];

  const supportFeatures = [
    { icon: UserCheck, label: 'Verified Mentors' },
    { icon: CreditCard, label: 'Secure Payment' },
    { icon: MessageCircle, label: 'Direct Communication' },
    { icon: Target, label: 'Goal Tracking' }
  ];

  return (
    <section ref={sectionRef} className="py-20 bg-muted/30 relative overflow-hidden">

      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">
            Your Journey to Success
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A proven 4-step process that helps international dental graduates 
            successfully navigate U.S. dental school and residency applications.
          </p>
        </div>

        {/* Process Steps */}
        <div className="space-y-24 lg:space-y-32">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isEven = index % 2 === 0;
            
            return (
              <div
                key={step.number}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                  isEven ? '' : 'lg:grid-flow-col-dense'
                }`}
              >
                {/* Content */}
                <div className={`${isEven ? '' : 'lg:col-start-2'} 
                  scroll-animate-${isEven ? 'left' : 'right'} 
                  ${sectionVisible ? 'animate-in' : ''}`}
                  style={{ transitionDelay: `${step.delay}ms` }}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center justify-center w-16 h-16 bg-gradient-primary text-white rounded-2xl font-bold text-2xl">
                      {step.number}
                    </div>
                    <div className={`flex items-center justify-center w-16 h-16 bg-gradient-${index % 2 === 0 ? 'secondary' : 'accent'} rounded-2xl`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  
                  <h3 className="text-3xl font-bold text-foreground mb-4">
                    {step.title}
                  </h3>
                  
                  <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                    {step.description}
                  </p>

                  <ul className="space-y-2">
                    {step.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3 text-muted-foreground">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Visual Element */}
                <div className={`${isEven ? 'lg:order-2' : 'lg:col-start-1'} 
                  scroll-animate-scale 
                  ${sectionVisible ? 'animate-in' : ''}`}
                  style={{ transitionDelay: `${step.delay + 200}ms` }}
                >
                  <div className="relative">
                    <div className={`w-full h-80 bg-gradient-${index % 2 === 0 ? 'primary' : index % 3 === 1 ? 'secondary' : 'accent'} rounded-3xl flex items-center justify-center relative overflow-hidden group`}>
                      <Icon className="w-32 h-32 text-white/20 absolute" />
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                      
                      {/* Step Number Overlay */}
                      <div className="absolute top-6 right-6 w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                        <span className="text-white font-bold text-2xl">{step.number}</span>
                      </div>

                      {/* Floating Animation Elements */}
                      <div className="absolute top-8 left-8 w-4 h-4 bg-white/30 rounded-full animate-pulse"></div>
                      <div className="absolute bottom-12 left-12 w-6 h-6 bg-white/25 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                      <div className="absolute top-16 right-16 w-3 h-3 bg-white/35 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Support Features */}
        <div className={`mt-24 scroll-animate ${sectionVisible ? 'animate-in' : ''}`} style={{ transitionDelay: '600ms' }}>
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-primary mb-4">
              Comprehensive Support Throughout Your Journey
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {supportFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="text-center p-6 card-hover rounded-2xl group"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-semibold text-foreground">
                    {feature.label}
                  </h4>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSteps;