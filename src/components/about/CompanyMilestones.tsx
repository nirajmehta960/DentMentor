import { useState, useEffect } from 'react';
import { Award, TrendingUp, Users, Globe, Lightbulb, Handshake } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';

const milestones = [
  {
    year: '2019',
    quarter: 'Q3',
    title: 'DentMentor Founded',
    description: 'Dr. Sarah Chen launches DentMentor with a simple mission: help international dental graduates succeed in the US.',
    icon: Lightbulb,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    achievement: 'Company Launch',
    impact: '5 founding mentors, 20 initial students'
  },
  {
    year: '2020',
    quarter: 'Q1',
    title: 'First Success Stories',
    description: 'Our first cohort achieves 95% board pass rate, establishing our reputation for quality mentorship.',
    icon: Award,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    achievement: '95% Pass Rate',
    impact: '50 students successfully licensed'
  },
  {
    year: '2020',
    quarter: 'Q4',
    title: 'Platform Launch',
    description: 'Launched our custom mentorship platform, making it easier to connect mentors and students globally.',
    icon: TrendingUp,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    achievement: 'Tech Innovation',
    impact: 'Digital transformation complete'
  },
  {
    year: '2021',
    quarter: 'Q2',
    title: '100 Mentors Milestone',
    description: 'Reached 100 verified mentors across all dental specialties, expanding our expertise network.',
    icon: Users,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    achievement: '100 Mentors',
    impact: '500+ students served'
  },
  {
    year: '2022',
    quarter: 'Q1',
    title: 'Global Expansion',
    description: 'Officially expanded to serve students from 25+ countries, becoming truly international.',
    icon: Globe,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-50',
    achievement: 'Global Reach',
    impact: '25 countries represented'
  },
  {
    year: '2022',
    quarter: 'Q4',
    title: 'Strategic Partnerships',
    description: 'Formed partnerships with major dental schools and organizations to enhance our program.',
    icon: Handshake,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    achievement: 'Partnership Program',
    impact: '10 institutional partners'
  },
  {
    year: '2023',
    quarter: 'Q2',
    title: '500 Mentors Achievement',
    description: 'Celebrated reaching 500 verified mentors, creating the world\'s largest dental mentorship network.',
    icon: Award,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    achievement: '500 Mentors',
    impact: '2,000+ successful placements'
  },
  {
    year: '2024',
    quarter: 'Q1',
    title: 'AI Integration',
    description: 'Introduced AI-powered matching system to connect students with the most suitable mentors.',
    icon: Lightbulb,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-50',
    achievement: 'AI Innovation',
    impact: '99% match satisfaction'
  }
];

export const CompanyMilestones = () => {
  const { ref: sectionRef, isVisible } = useScrollAnimation();
  const [unlockedMilestones, setUnlockedMilestones] = useState<number[]>([]);
  const [celebrating, setCelebrating] = useState<number | null>(null);

  useEffect(() => {
    if (isVisible) {
      // Unlock milestones in sequence
      milestones.forEach((_, index) => {
        setTimeout(() => {
          setUnlockedMilestones(prev => [...prev, index]);
          
          // Trigger celebration effect
          setCelebrating(index);
          setTimeout(() => setCelebrating(null), 1000);
        }, index * 300);
      });
    }
  }, [isVisible]);

  return (
    <section ref={sectionRef} className="py-20 bg-gradient-to-br from-muted/20 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className={`text-4xl md:text-5xl font-bold text-primary mb-4 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            Our Journey of Achievement
          </h2>
          <p className={`text-xl text-muted-foreground max-w-3xl mx-auto transition-all duration-1000 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            From a simple idea to a global movement—celebrating the milestones that shaped our story.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Timeline */}
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-0.5 top-0 bottom-0 w-1 bg-muted">
              {/* Progress Line */}
              <div 
                className="w-full bg-gradient-to-b from-primary to-accent transition-all duration-2000 ease-out"
                style={{ height: `${(unlockedMilestones.length / milestones.length) * 100}%` }}
              />
            </div>

            {/* Milestones */}
            <div className="space-y-16">
              {milestones.map((milestone, index) => {
                const IconComponent = milestone.icon;
                const isUnlocked = unlockedMilestones.includes(index);
                const isCelebrating = celebrating === index;
                const isLeft = index % 2 === 0;

                return (
                  <div
                    key={index}
                    className={`relative flex items-center ${
                      isLeft ? 'flex-row' : 'flex-row-reverse'
                    }`}
                  >
                    {/* Content Card */}
                    <div className={`w-5/12 ${isLeft ? 'pr-8' : 'pl-8'}`}>
                      <div className={`milestone-card p-8 bg-white rounded-3xl shadow-soft border-2 transition-all duration-700 ${
                        isUnlocked 
                          ? `${milestone.color.replace('text-', 'border-')}/20 shadow-large scale-105` 
                          : 'border-muted/20 opacity-60'
                      } ${isCelebrating ? 'animate-pulse' : ''}`}>
                        {/* Achievement Badge */}
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4 ${
                          isUnlocked 
                            ? `${milestone.bgColor} ${milestone.color}` 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          <Award className="w-3 h-3" />
                          {milestone.achievement}
                        </div>

                        {/* Date */}
                        <div className={`text-sm font-medium mb-2 ${
                          isUnlocked ? milestone.color : 'text-muted-foreground'
                        }`}>
                          {milestone.year} {milestone.quarter}
                        </div>

                        {/* Title */}
                        <h3 className={`text-xl font-bold mb-3 transition-colors ${
                          isUnlocked ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {milestone.title}
                        </h3>

                        {/* Description */}
                        <p className={`text-muted-foreground leading-relaxed mb-4 ${
                          isUnlocked ? 'text-muted-foreground' : 'text-muted-foreground/60'
                        }`}>
                          {milestone.description}
                        </p>

                        {/* Impact */}
                        <div className={`text-sm font-medium ${
                          isUnlocked ? milestone.color : 'text-muted-foreground'
                        }`}>
                          Impact: {milestone.impact}
                        </div>

                        {/* Celebration Confetti */}
                        {isCelebrating && (
                          <div className="absolute inset-0 pointer-events-none">
                            {[...Array(6)].map((_, i) => (
                              <div
                                key={i}
                                className={`absolute w-2 h-2 ${milestone.color.replace('text-', 'bg-')} rounded-full animate-bounce`}
                                style={{
                                  top: `${20 + Math.random() * 60}%`,
                                  left: `${20 + Math.random() * 60}%`,
                                  animationDelay: `${i * 0.1}s`,
                                  animationDuration: '1s'
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Timeline Icon */}
                    <div className="relative z-10 w-2/12 flex justify-center">
                      <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 ${
                        isUnlocked 
                          ? `${milestone.bgColor} ${milestone.color} shadow-lg scale-110` 
                          : 'bg-muted text-muted-foreground'
                      } ${isCelebrating ? 'animate-bounce' : ''}`}>
                        <IconComponent className="w-10 h-10" />
                        
                        {/* Achievement Unlock Ring */}
                        {isUnlocked && (
                          <div className={`absolute inset-0 rounded-full border-4 ${milestone.color.replace('text-', 'border-')}/30 animate-ping`} />
                        )}
                      </div>
                    </div>

                    {/* Spacer */}
                    <div className="w-5/12" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Achievement Summary */}
          <div className={`text-center mt-20 transition-all duration-1000 delay-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="p-8 bg-gradient-to-r from-primary/10 to-accent/10 rounded-3xl border border-primary/20">
              <h3 className="text-3xl font-bold text-foreground mb-4">
                🎉 The Journey Continues
              </h3>
              <p className="text-lg text-muted-foreground mb-6">
                Each milestone represents countless hours of dedication, innovation, and most importantly, 
                the success stories of students who achieved their dreams with our help.
              </p>
              
              {/* Next Milestone Preview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-white rounded-2xl">
                  <div className="text-2xl font-bold text-primary mb-2">2024</div>
                  <div className="text-sm text-muted-foreground">1,000 mentors goal</div>
                </div>
                <div className="p-6 bg-white rounded-2xl">
                  <div className="text-2xl font-bold text-primary mb-2">2025</div>
                  <div className="text-sm text-muted-foreground">Global accreditation</div>
                </div>
                <div className="p-6 bg-white rounded-2xl">
                  <div className="text-2xl font-bold text-primary mb-2">Beyond</div>
                  <div className="text-sm text-muted-foreground">Healthcare expansion</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};