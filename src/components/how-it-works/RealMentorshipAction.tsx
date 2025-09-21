import { FileText, MessageSquare, Calendar, Users, Award, Target, CheckCircle, GraduationCap } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';

const RealMentorshipAction = () => {
  const { ref: sectionRef, isVisible: sectionVisible } = useScrollAnimation({ threshold: 0.1 });
  
  const mentorshipAreas = [
    {
      icon: FileText,
      title: 'Personal Statement Excellence',
      description: 'Transform your story into a compelling narrative that stands out',
      features: [
        'One-on-one writing workshops with dental professionals',
        'Multiple draft reviews and personalized feedback',
        'Storytelling techniques that highlight your unique journey',
        'School-specific customization for each application'
      ],
      color: 'primary'
    },
    {
      icon: MessageSquare,
      title: 'Interview Mastery Program',
      description: 'Build confidence and excel in dental school interviews',
      features: [
        'Mock interviews with current dental students and faculty',
        'Real-time feedback on communication and presentation',
        'Question banks specific to dental school interviews',
        'Body language and confidence coaching'
      ],
      color: 'secondary'
    },
    {
      icon: Target,
      title: 'Strategic School Selection',
      description: 'Choose the right dental schools to maximize your acceptance chances',
      features: [
        'In-depth analysis of school requirements and preferences',
        'GPA and DAT score evaluation for realistic target schools',
        'Geographic and specialty preference optimization',
        'Application timeline and deadline management'
      ],
      color: 'accent'
    },
    {
      icon: Award,
      title: 'Research & Experience Guidance',
      description: 'Build a competitive profile with meaningful experiences',
      features: [
        'Research opportunity identification and application help',
        'Shadowing experience coordination and documentation',
        'Volunteer work strategizing for maximum impact',
        'Leadership role development and positioning'
      ],
      color: 'primary'
    }
  ];

  const successMetrics = [
    { metric: '95%', label: 'of our mentees get accepted to their top 3 dental school choices' },
    { metric: '87%', label: 'receive interviews from 5+ dental schools' },
    { metric: '3.2x', label: 'higher acceptance rate compared to national average' },
    { metric: '92%', label: 'satisfaction rate with mentor matching and guidance' }
  ];

  return (
    <section ref={sectionRef} className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6 bg-gradient-primary rounded-2xl px-6 py-3">
            <GraduationCap className="w-6 h-6 text-white" />
            <span className="text-white font-semibold">Real Mentorship in Action</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">
            Dental School Admission Guidance That Works
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get personalized, actionable guidance from dental professionals who understand 
            the modern admissions landscape and what it takes to succeed.
          </p>
        </div>

        {/* Mentorship Areas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          {mentorshipAreas.map((area, index) => {
            const Icon = area.icon;
            return (
              <div
                key={index}
                className={`card-hover rounded-3xl p-8 scroll-animate ${sectionVisible ? 'animate-in' : ''}`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className={`flex items-center justify-center w-16 h-16 bg-gradient-${area.color} rounded-2xl mb-6`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  {area.title}
                </h3>
                
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  {area.description}
                </p>
                
                <ul className="space-y-3">
                  {area.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Success Metrics */}
        <div className={`scroll-animate ${sectionVisible ? 'animate-in' : ''}`} style={{ transitionDelay: '600ms' }}>
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-primary mb-4">
              Proven Results That Speak for Themselves
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our mentors don't just provide advice—they deliver measurable results 
              that transform your dental school application success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {successMetrics.map((item, index) => (
              <div
                key={index}
                className="text-center p-6 card-hover rounded-2xl group"
              >
                <div className="text-4xl md:text-5xl font-bold text-primary mb-3 group-hover:scale-110 transition-transform">
                  {item.metric}
                </div>
                <p className="text-muted-foreground leading-snug">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Building Element */}
        <div className={`mt-16 bg-gradient-primary rounded-3xl p-8 md:p-12 text-center text-white scroll-animate ${sectionVisible ? 'animate-in' : ''}`} 
             style={{ transitionDelay: '800ms' }}>
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold mb-6">
              "The difference between a good application and a great one is guidance from someone who's been there."
            </h3>
            <p className="text-xl text-white/90 mb-6">
              — Dr. Sarah Martinez, Harvard School of Dental Medicine, Class of 2019
            </p>
            <div className="flex items-center justify-center gap-8 text-sm font-medium opacity-90">
              <div>15+ Partner Dental Schools</div>
              <div>•</div>
              <div>50+ Verified Mentors</div>
              <div>•</div>
              <div>500+ Success Stories</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RealMentorshipAction;