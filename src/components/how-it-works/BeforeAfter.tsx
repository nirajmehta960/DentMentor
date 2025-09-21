import { ArrowRight, X, Check, AlertCircle, Target } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const BeforeAfter = () => {
  const { ref: sectionRef, isVisible: sectionVisible } = useScrollAnimation({ threshold: 0.1 });
  const [activeTab, setActiveTab] = useState<'before' | 'after'>('before');

  const beforeScenarios = [
    {
      icon: X,
      title: 'Overwhelming Application Process',
      description: 'Confused by complex dental school requirements and application timelines',
      emotion: 'Confused & Stressed'
    },
    {
      icon: AlertCircle,
      title: 'Generic Application Materials',
      description: 'Personal statements and resumes that fail to stand out from thousands of applicants',
      emotion: 'Uncertain & Generic'
    },
    {
      icon: X,
      title: 'Limited Dental School Insights',
      description: 'No connections to dental schools or understanding of what admissions committees want',
      emotion: 'Disconnected'
    },
    {
      icon: AlertCircle,
      title: 'Interview Anxiety',
      description: 'Unprepared for dental school interviews with no feedback or practice',
      emotion: 'Nervous & Unprepared'
    }
  ];

  const afterScenarios = [
    {
      icon: Check,
      title: 'Strategic Application Plan',
      description: 'Clear roadmap with personalized timeline and school selection strategy',
      emotion: 'Confident & Organized'
    },
    {
      icon: Target,
      title: 'Compelling Application Materials',
      description: 'Standout personal statements and resumes crafted with professional guidance',
      emotion: 'Distinctive & Polished'
    },
    {
      icon: Check,
      title: 'Insider Dental School Knowledge',
      description: 'Direct insights from dental professionals and recent graduates',
      emotion: 'Informed & Strategic'
    },
    {
      icon: Target,
      title: 'Interview Mastery',
      description: 'Confident interview performance with extensive practice and feedback',
      emotion: 'Prepared & Confident'
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
            See how DentMentor transforms your dental school application journey 
            from overwhelming to organized, generic to compelling.
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
                    p-8 bg-background rounded-3xl border-2 border-destructive/20 relative group hover:border-destructive/40 hover:shadow-lg transition-all duration-300`}
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
                    p-8 bg-background rounded-3xl border-2 border-primary/20 relative group hover:border-primary/40 hover:shadow-lg transition-all duration-300`}
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
          <Link to="/auth" className="flex items-center gap-4 p-4 bg-gradient-primary rounded-2xl text-white hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
            <span className="font-semibold">Transform Your Journey</span>
            <ArrowRight className="w-6 h-6" />
          </Link>
        </div>

        {/* Key Benefits */}
        <div className={`mt-16 scroll-animate ${sectionVisible ? 'animate-in' : ''}`} style={{ transitionDelay: '800ms' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">4</div>
              <div className="text-muted-foreground">Core Services</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-secondary mb-2">15+</div>
              <div className="text-muted-foreground">Verified Mentors</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-accent mb-2">1:1</div>
              <div className="text-muted-foreground">Personalized Guidance</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BeforeAfter;