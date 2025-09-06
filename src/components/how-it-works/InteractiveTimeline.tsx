import { Calendar, Clock, CheckCircle, Star, Award } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import { useElementScrollProgress } from '@/hooks/use-scroll-progress';
import { useRef } from 'react';

const InteractiveTimeline = () => {
  const { ref: sectionRef, isVisible: sectionVisible } = useScrollAnimation({ threshold: 0.1 });
  const timelineRef = useRef<HTMLDivElement>(null);
  const progress = useElementScrollProgress(timelineRef);
  
  const timelineEvents = [
    {
      week: 'Week 1',
      title: 'Initial Assessment & Goal Setting',
      description: 'Complete comprehensive evaluation and create personalized learning plan',
      icon: Calendar,
      status: 'completed',
      details: ['Skills assessment', 'Goal identification', 'Mentor matching']
    },
    {
      week: 'Week 2-4',
      title: 'Foundation Building',
      description: 'Master fundamental concepts and begin NBDE preparation',
      icon: Clock,
      status: 'in-progress',
      details: ['Core concepts review', 'Study methodology', 'Practice questions']
    },
    {
      week: 'Week 5-8',
      title: 'Intensive Preparation',
      description: 'Deep dive into specialized topics and mock examinations',
      icon: CheckCircle,
      status: 'upcoming',
      details: ['Mock exams', 'Performance analysis', 'Weakness targeting']
    },
    {
      week: 'Week 9-12',
      title: 'Exam Readiness',
      description: 'Final preparations and confidence building',
      icon: Star,
      status: 'upcoming',
      details: ['Final review', 'Test strategies', 'Confidence building']
    },
    {
      week: 'Week 13+',
      title: 'Success & Beyond',
      description: 'Career guidance and ongoing support',
      icon: Award,
      status: 'future',
      details: ['Career planning', 'Residency applications', 'Ongoing mentorship']
    }
  ];

  const getStatusColor = (status: string, index: number) => {
    const progressThreshold = (index + 1) / timelineEvents.length * 100;
    
    if (progress >= progressThreshold) {
      return 'bg-gradient-primary text-white';
    } else if (progress >= progressThreshold - 20) {
      return 'bg-gradient-secondary text-white';
    } else {
      return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <section ref={sectionRef} className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">
            Your 12-Week Success Timeline
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Follow our proven structured approach that guides international dental graduates 
            from preparation to success, with milestone tracking every step of the way.
          </p>
        </div>

        {/* Interactive Timeline */}
        <div ref={timelineRef} className="relative max-w-4xl mx-auto">
          {/* Progress Line */}
          <div className="absolute left-8 top-0 bottom-0 w-1 bg-muted-foreground/20 hidden md:block">
            <div 
              className="w-full bg-gradient-primary transition-all duration-500 ease-out"
              style={{ height: `${Math.min(progress, 100)}%` }}
            />
          </div>

          {/* Timeline Events */}
          <div className="space-y-12">
            {timelineEvents.map((event, index) => {
              const Icon = event.icon;
              const progressThreshold = (index + 1) / timelineEvents.length * 100;
              const isActive = progress >= progressThreshold - 20;
              
              return (
                <div
                  key={index}
                  className={`relative flex items-start gap-6 md:gap-8 scroll-animate-left ${
                    sectionVisible ? 'animate-in' : ''
                  }`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  {/* Timeline Node */}
                  <div className={`flex-shrink-0 relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                    getStatusColor(event.status, index)
                  }`}>
                    <Icon className="w-8 h-8" />
                    
                    {/* Pulse Effect for Active Items */}
                    {isActive && (
                      <div className="absolute inset-0 rounded-2xl bg-primary/30 animate-ping"></div>
                    )}
                  </div>

                  {/* Content Card */}
                  <div className={`flex-1 p-6 card-hover rounded-3xl transition-all duration-500 ${
                    isActive ? 'ring-2 ring-primary/20 shadow-large' : ''
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                        {event.week}
                      </span>
                      
                      {/* Progress Indicator */}
                      <div className="flex items-center gap-2">
                        {progress >= progressThreshold ? (
                          <CheckCircle className="w-5 h-5 text-primary" />
                        ) : progress >= progressThreshold - 20 ? (
                          <Clock className="w-5 h-5 text-secondary animate-pulse" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30"></div>
                        )}
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-foreground mb-3">
                      {event.title}
                    </h3>
                    
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {event.description}
                    </p>

                    {/* Details List */}
                    <ul className="space-y-2">
                      {event.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-center gap-3 text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
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

        {/* Progress Stats */}
        <div className={`mt-16 scroll-animate ${sectionVisible ? 'animate-in' : ''}`} style={{ transitionDelay: '800ms' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="text-center p-6 card-hover rounded-2xl">
              <div className="text-3xl font-bold text-primary mb-2">12</div>
              <div className="text-muted-foreground">Weeks to Success</div>
            </div>
            <div className="text-center p-6 card-hover rounded-2xl">
              <div className="text-3xl font-bold text-secondary mb-2">85%</div>
              <div className="text-muted-foreground">Pass Rate</div>
            </div>
            <div className="text-center p-6 card-hover rounded-2xl">
              <div className="text-3xl font-bold text-accent mb-2">24/7</div>
              <div className="text-muted-foreground">Support Available</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveTimeline;