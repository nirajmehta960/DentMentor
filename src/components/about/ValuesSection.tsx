import { useState, useEffect } from 'react';
import { Heart, Users, Target, Lightbulb, Handshake, Globe } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';

const values = [
  {
    icon: Heart,
    title: 'Compassion First',
    description: 'We lead with empathy and understanding, recognizing that behind every application is a person with dreams, fears, and aspirations.',
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  {
    icon: Users,
    title: 'Community Strength',
    description: 'Together we achieve more. Our network of mentors and students creates a supportive ecosystem where everyone succeeds.',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  {
    icon: Target,
    title: 'Excellence Driven',
    description: 'We maintain the highest standards in everything we do, from mentor selection to educational content and student support.',
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  {
    icon: Lightbulb,
    title: 'Innovation Mindset',
    description: 'We continuously evolve, embracing new technologies and methods to better serve our global community.',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200'
  },
  {
    icon: Handshake,
    title: 'Trust & Integrity',
    description: 'Honesty and transparency guide every interaction. We build lasting relationships based on mutual respect and reliability.',
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  {
    icon: Globe,
    title: 'Global Perspective',
    description: 'We celebrate diversity and embrace different perspectives, creating an inclusive environment for all backgrounds.',
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200'
  }
];

export const ValuesSection = () => {
  const { ref: sectionRef, isVisible } = useScrollAnimation();
  const [revealedIcons, setRevealedIcons] = useState<number[]>([]);

  useEffect(() => {
    if (isVisible) {
      // Reveal icons in sequence
      values.forEach((_, index) => {
        setTimeout(() => {
          setRevealedIcons(prev => [...prev, index]);
        }, index * 200);
      });
    }
  }, [isVisible]);

  return (
    <section ref={sectionRef} className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className={`text-4xl md:text-5xl font-bold text-primary mb-4 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            Our Core Values
          </h2>
          <p className={`text-xl text-muted-foreground max-w-3xl mx-auto transition-all duration-1000 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            The principles that guide our decisions, shape our culture, and define who we are as a company.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {values.map((value, index) => {
            const IconComponent = value.icon;
            const isRevealed = revealedIcons.includes(index);
            
            return (
              <div
                key={index}
                className={`value-card group transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                style={{ transitionDelay: `${index * 100 + 300}ms` }}
              >
                <div className={`relative p-8 bg-white rounded-3xl border-2 ${value.borderColor} hover:shadow-large transition-all duration-500 overflow-hidden`}>
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 ${value.bgColor} opacity-0 group-hover:opacity-50 transition-opacity duration-300`} />
                  
                  {/* Icon with Reveal Animation */}
                  <div className="relative z-10 mb-6">
                    <div className={`relative w-20 h-20 rounded-2xl ${value.bgColor} flex items-center justify-center group-hover:scale-110 transition-all duration-500`}>
                      {/* Icon Reveal Animation */}
                      <div className={`transition-all duration-700 ${
                        isRevealed 
                          ? 'opacity-100 scale-100 rotate-0' 
                          : 'opacity-0 scale-0 rotate-180'
                      }`}>
                        <IconComponent className={`w-10 h-10 ${value.color}`} />
                      </div>
                      
                      {/* Ripple Effect */}
                      {isRevealed && (
                        <div className={`absolute inset-0 rounded-2xl border-4 ${value.borderColor} animate-ping opacity-75`} />
                      )}
                    </div>
                    
                    {/* Floating Particles */}
                    {isRevealed && (
                      <>
                        <div className={`absolute top-2 right-2 w-2 h-2 ${value.color.replace('text-', 'bg-')} rounded-full animate-float`} />
                        <div className={`absolute bottom-2 left-2 w-1 h-1 ${value.color.replace('text-', 'bg-')} rounded-full animate-float`} style={{ animationDelay: '0.5s' }} />
                      </>
                    )}
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    <h3 className={`text-xl font-bold mb-4 transition-colors duration-300 ${
                      isRevealed ? value.color : 'text-foreground'
                    } group-hover:${value.color}`}>
                      {value.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300">
                      {value.description}
                    </p>
                  </div>

                  {/* Decorative Elements */}
                  <div className={`absolute top-0 right-0 w-16 h-16 ${value.bgColor} rounded-full blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-300`} />
                  <div className={`absolute bottom-0 left-0 w-12 h-12 ${value.bgColor} rounded-full blur-lg opacity-0 group-hover:opacity-40 transition-opacity duration-300`} />
                  
                  {/* Achievement Badge */}
                  {isRevealed && (
                    <div className={`absolute top-4 right-4 w-8 h-8 ${value.bgColor} rounded-full flex items-center justify-center animate-bounce-in`}>
                      <div className={`w-3 h-3 ${value.color.replace('text-', 'bg-')} rounded-full`} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Values Summary */}
        <div className={`text-center mt-16 transition-all duration-1000 delay-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="max-w-4xl mx-auto p-8 bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl border border-primary/20">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Living Our Values Every Day
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-6">
              These values aren't just words on our website—they're the foundation of every decision we make, 
              every interaction we have, and every solution we create. They guide us in building a platform 
              that truly serves the global dental community with integrity and purpose.
            </p>
            
            {/* Values Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-white rounded-2xl">
                <div className="text-2xl font-bold text-primary mb-2">100%</div>
                <div className="text-sm text-muted-foreground">Mentors aligned with our values</div>
              </div>
              <div className="p-6 bg-white rounded-2xl">
                <div className="text-2xl font-bold text-primary mb-2">4.9/5</div>
                <div className="text-sm text-muted-foreground">Values-based satisfaction rating</div>
              </div>
              <div className="p-6 bg-white rounded-2xl">
                <div className="text-2xl font-bold text-primary mb-2">365 days</div>
                <div className="text-sm text-muted-foreground">Commitment to excellence</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};