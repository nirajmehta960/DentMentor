import { Target, Calendar, Package, Users, CheckCircle, Star, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import { Link } from 'react-router-dom';

const FlexibleMentorship = () => {
  const { ref: sectionRef, isVisible: sectionVisible } = useScrollAnimation({ threshold: 0.1 });
  
  const focusAreas = [
    {
      icon: Target,
      title: 'Application Strategy',
      description: 'Personalized guidance for your dental school application journey',
      details: ['School selection strategy', 'Timeline planning', 'Application optimization', 'Goal setting']
    },
    {
      icon: Users,
      title: 'Document Review',
      description: 'Professional feedback on your application materials',
      details: ['CV/Resume review', 'Personal statement feedback', 'Application essay guidance', 'Portfolio optimization']
    },
    {
      icon: Star,
      title: 'Interview Preparation',
      description: 'Build confidence for dental school interviews',
      details: ['Mock interview sessions', 'Question preparation', 'Communication skills', 'Confidence building']
    }
  ];

  const sessionTypes = [
    {
      icon: Clock,
      title: 'Single Sessions',
      subtitle: 'Target specific challenges',
      duration: '30 minutes - 1 hour',
      price: '$125-200',
      popular: false
    },
    {
      icon: Package,
      title: 'Premium Packages',
      subtitle: 'Comprehensive application support',
      duration: '5-10 sessions over 3 months',
      price: '$1,500-2,000',
      popular: true
    },
    {
      icon: Calendar,
      title: 'Extended Mentorship',
      subtitle: 'Complete application cycle support',
      duration: 'Throughout application season',
      price: '$2,500-3,500',
      popular: false
    }
  ];

  const successStories = [
    { timeframe: 'Week 1-2', story: '"Got my personal statement reviewed and completely transformed my application narrative"', type: 'Early Stage Success' },
    { timeframe: '1-2 Months', story: '"Landed 5 dental school interviews after optimizing my applications with my mentor"', type: 'Application Success' },
    { timeframe: '6 Months', story: '"Accepted to my top choice dental school with scholarship!"', type: 'Final Success' }
  ];

  const whyItWorks = [
    { wrong: 'Generic application advice that doesn\'t fit your background', right: 'Personalized guidance tailored to your unique dental journey' },
    { wrong: 'Expensive consulting firms with rigid 12-month contracts', right: 'Flexible mentorship packages that fit your timeline and budget' },
    { wrong: 'Outdated application strategies from non-dental professionals', right: 'Current insights from practicing dentists and recent graduates' }
  ];

  return (
    <section ref={sectionRef} className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">
            Flexible Mentorship That Fits Your Schedule
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get personalized guidance exactly when you need it. Choose your focus areas, 
            book sessions at your pace, and achieve success on your timeline.
          </p>
        </div>

        {/* Focus Areas */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-primary mb-4">🎯 Choose Your Focus Areas</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {focusAreas.map((area, index) => {
              const Icon = area.icon;
              return (
                <div
                  key={index}
                  className={`card-hover rounded-3xl p-8 scroll-animate ${sectionVisible ? 'animate-in' : ''} group relative overflow-hidden`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  {/* Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-primary opacity-5 group-hover:opacity-10 transition-opacity"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl mb-6 group-hover:scale-110 transition-transform">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <h4 className="text-xl font-bold text-foreground mb-4 group-hover:scale-105 transition-transform">
                      {area.title}
                    </h4>
                  
                  <p className="text-muted-foreground mb-6">
                    {area.description}
                  </p>
                  
                  <ul className="space-y-2">
                    {area.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-start gap-3 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
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
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-primary mb-4">📅 Book Sessions As You Need Them</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {sessionTypes.map((session, index) => {
              const Icon = session.icon;
              return (
                <div
                  key={index}
                  className={`card-hover rounded-3xl p-8 text-center relative overflow-hidden scroll-animate ${sectionVisible ? 'animate-in' : ''} group ${
                    session.popular ? 'ring-2 ring-primary/20 shadow-large' : ''
                  }`}
                  style={{ transitionDelay: `${(index + 3) * 150}ms` }}
                >
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-${index % 2 === 0 ? 'secondary' : 'accent'} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
                  
                  {session.popular && (
                    <div className="absolute top-4 right-4 bg-gradient-primary text-white px-3 py-1 rounded-full text-sm font-semibold z-20">
                      🔥 Most Popular
                    </div>
                  )}
                  
                  <div className="relative z-10">
                    <div className={`flex items-center justify-center w-16 h-16 bg-gradient-${index % 2 === 0 ? 'secondary' : 'accent'} rounded-2xl mb-6 mx-auto group-hover:scale-110 transition-transform`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <h4 className="text-xl font-bold text-foreground mb-2 group-hover:scale-105 transition-transform">
                      {session.title}
                    </h4>
                  
                  <p className="text-muted-foreground mb-4">
                    {session.subtitle}
                  </p>
                  
                    <div className="text-2xl font-bold text-primary mb-2">
                      {session.price}
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      {session.duration}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Success Journey */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-primary mb-4">🏆 Your Success Journey</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {successStories.map((story, index) => (
              <div
                key={index}
                className={`card-hover rounded-3xl p-8 text-center scroll-animate ${sectionVisible ? 'animate-in' : ''}`}
                style={{ transitionDelay: `${(index + 6) * 150}ms` }}
              >
                <div className="text-lg font-semibold text-primary mb-4">
                  {story.timeframe}
                </div>
                
                <blockquote className="text-muted-foreground italic text-lg">
                  {story.story}
                </blockquote>
              </div>
            ))}
          </div>
        </div>

        {/* Why Our Approach Works */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-primary mb-4">💡 Why Our Flexible Approach Works Better</h3>
          </div>
          
          <div className="space-y-6 max-w-4xl mx-auto">
            {whyItWorks.map((item, index) => (
              <div
                key={index}
                className={`flex items-center gap-6 p-6 card-hover rounded-2xl scroll-animate ${sectionVisible ? 'animate-in' : ''}`}
                style={{ transitionDelay: `${(index + 9) * 150}ms` }}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-red-500 font-semibold">❌ Not This:</span>
                    <span className="text-muted-foreground">{item.wrong}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-green-500 font-semibold">✅ But This:</span>
                    <span className="text-foreground font-medium">{item.right}</span>
                  </div>
                </div>
                
                <ArrowRight className="w-6 h-6 text-primary" />
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className={`text-center bg-gradient-primary rounded-3xl p-8 md:p-12 text-white scroll-animate ${sectionVisible ? 'animate-in' : ''}`} 
             style={{ transitionDelay: '1200ms' }}>
          <h3 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Applications?
          </h3>
          
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Book your first session today and get personalized guidance from verified mentors 
            who understand the dental school application process.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-3xl mx-auto text-left">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="font-semibold mb-2">Choose from 15+ verified mentors</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="font-semibold mb-2">Flexible scheduling that works with your timeline</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="font-semibold mb-2">Satisfaction guaranteed or your money back</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="px-8 py-4">
              <Link to="/mentors">Browse Mentors</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FlexibleMentorship;