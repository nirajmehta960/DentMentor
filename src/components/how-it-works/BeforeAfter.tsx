import { ArrowRight, X, Check, AlertCircle, Target } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import { useState } from 'react';

const BeforeAfter = () => {
  const { ref: sectionRef, isVisible: sectionVisible } = useScrollAnimation({ threshold: 0.1 });
  const [activeTab, setActiveTab] = useState<'before' | 'after'>('before');

  const beforeScenarios = [
    {
      icon: X,
      title: 'Uncertain Path Forward',
      description: 'Overwhelmed by complex licensing requirements and unclear next steps',
      emotion: 'Confused & Stressed'
    },
    {
      icon: AlertCircle,
      title: 'Isolated Learning',
      description: 'Studying alone without guidance from experienced professionals',
      emotion: 'Lonely & Unmotivated'
    },
    {
      icon: X,
      title: 'Limited Network',
      description: 'No connections in the U.S. dental community or understanding of the system',
      emotion: 'Disconnected'
    },
    {
      icon: AlertCircle,
      title: 'Exam Anxiety',
      description: 'Multiple failed attempts at NBDE with decreasing confidence',
      emotion: 'Defeated & Anxious'
    }
  ];

  const afterScenarios = [
    {
      icon: Check,
      title: 'Clear Success Roadmap',
      description: 'Structured path with mentor guidance and milestone tracking',
      emotion: 'Confident & Focused'
    },
    {
      icon: Target,
      title: 'Expert Mentorship',
      description: 'Regular 1-on-1 sessions with verified U.S. dental professionals',
      emotion: 'Supported & Guided'
    },
    {
      icon: Check,
      title: 'Professional Network',
      description: 'Connected to a community of successful dentists and peers',
      emotion: 'Connected & Inspired'
    },
    {
      icon: Target,
      title: 'Exam Confidence',
      description: 'Prepared with proven strategies and practice materials',
      emotion: 'Ready & Confident'
    }
  ];

  return (
    <section ref={sectionRef} className="py-20 bg-muted/30 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">
            The Transformation Journey
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            See how DentMentor transforms the international dental graduate experience 
            from uncertainty to success.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex justify-center mb-12">
          <div className="bg-background rounded-2xl p-2 shadow-soft">
            <button
              onClick={() => setActiveTab('before')}
              className={`px-8 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'before'
                  ? 'bg-gradient-primary text-white shadow-medium'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Before DentMentor
            </button>
            <button
              onClick={() => setActiveTab('after')}
              className={`px-8 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'after'
                  ? 'bg-gradient-primary text-white shadow-medium'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              After DentMentor
            </button>
          </div>
        </div>

        {/* Content Cards */}
        <div className="relative max-w-6xl mx-auto">
          {/* Before Section */}
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 transition-all duration-700 ${
            activeTab === 'before' ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full absolute inset-0'
          }`}>
            {beforeScenarios.map((scenario, index) => {
              const Icon = scenario.icon;
              return (
                <div
                  key={index}
                  className={`scroll-animate-left ${sectionVisible ? 'animate-in' : ''} 
                    p-8 bg-background rounded-3xl border-2 border-destructive/20 relative group`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  {/* Negative Indicator */}
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-destructive rounded-full flex items-center justify-center">
                    <X className="w-4 h-4 text-white" />
                  </div>

                  <div className="flex items-start gap-4 mb-6">
                    <div className="flex-shrink-0 w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center">
                      <Icon className="w-6 h-6 text-destructive" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-2">
                        {scenario.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {scenario.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-destructive rounded-full"></div>
                    <span className="text-destructive font-medium">{scenario.emotion}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* After Section */}
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 transition-all duration-700 ${
            activeTab === 'after' ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full absolute inset-0'
          }`}>
            {afterScenarios.map((scenario, index) => {
              const Icon = scenario.icon;
              return (
                <div
                  key={index}
                  className={`scroll-animate-right ${sectionVisible ? 'animate-in' : ''} 
                    p-8 bg-background rounded-3xl border-2 border-primary/20 relative group hover:border-primary/40 transition-colors`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  {/* Positive Indicator */}
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>

                  <div className="flex items-start gap-4 mb-6">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-2">
                        {scenario.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {scenario.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-primary font-medium">{scenario.emotion}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Transformation Arrow */}
        <div className={`flex justify-center mt-12 scroll-animate ${sectionVisible ? 'animate-in' : ''}`} style={{ transitionDelay: '600ms' }}>
          <div className="flex items-center gap-4 p-4 bg-gradient-primary rounded-2xl text-white">
            <span className="font-semibold">Transform Your Journey</span>
            <ArrowRight className="w-6 h-6" />
          </div>
        </div>

        {/* Success Stats */}
        <div className={`mt-16 scroll-animate ${sectionVisible ? 'animate-in' : ''}`} style={{ transitionDelay: '800ms' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">85%</div>
              <div className="text-muted-foreground">Pass NBDE on First Attempt</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-secondary mb-2">12</div>
              <div className="text-muted-foreground">Average Weeks to Success</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-accent mb-2">95%</div>
              <div className="text-muted-foreground">Career Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BeforeAfter;