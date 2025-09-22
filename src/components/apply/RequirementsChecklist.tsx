import { useState, useEffect } from 'react';
import { CheckCircle, Circle, Award, GraduationCap, Shield, Clock } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import { Button } from '@/components/ui/button';

const requirements = [
  {
    id: 1,
    icon: GraduationCap,
    title: 'U.S. Dental School Graduate or Current Student',
    description: 'Must be a graduate from or currently enrolled in an accredited U.S. dental school',
    category: 'Education'
  },
  {
    id: 2,
    icon: Shield,
    title: 'Active U.S. Dental License (or Current Student)',
    description: 'Current and valid dental license in the United States (or currently enrolled student)',
    category: 'Licensing'
  },
  {
    id: 3,
    icon: Clock,
    title: 'Professional Experience or Academic Standing',
    description: 'At least 3 years of professional dental practice experience or strong academic standing for current students',
    category: 'Experience'
  },
  {
    id: 4,
    icon: Award,
    title: 'Good Standing',
    description: 'No disciplinary actions or license suspensions',
    category: 'Professional'
  },
  {
    id: 5,
    icon: CheckCircle,
    title: 'Background Verification',
    description: 'Pass our comprehensive background check process',
    category: 'Verification'
  },
  {
    id: 6,
    icon: GraduationCap,
    title: 'Mentoring Interest',
    description: 'Genuine interest in helping international dental graduates',
    category: 'Commitment'
  }
];

export const RequirementsChecklist = () => {
  const { ref: sectionRef, isVisible } = useScrollAnimation();
  const [checkedItems, setCheckedItems] = useState<number[]>([]);
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    if (isVisible && !animationComplete) {
      // Animate checks in sequence
      requirements.forEach((_, index) => {
        setTimeout(() => {
          setCheckedItems(prev => [...prev, index + 1]);
          if (index === requirements.length - 1) {
            setAnimationComplete(true);
          }
        }, (index + 1) * 300);
      });
    }
  }, [isVisible, animationComplete]);

  const handleItemClick = (id: number) => {
    setCheckedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const completedCount = checkedItems.length;
  const progressPercentage = (completedCount / requirements.length) * 100;

  return (
    <section ref={sectionRef} className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className={`text-4xl md:text-5xl font-bold text-primary mb-4 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            Mentor Requirements
          </h2>
          <p className={`text-xl text-muted-foreground max-w-3xl mx-auto mb-8 transition-all duration-1000 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            We maintain high standards to ensure the best experience for our mentees. Here's what we look for:
          </p>
          
          {/* Progress Indicator */}
          <div className={`max-w-md mx-auto transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Requirements Met</span>
              <span className="text-sm font-medium text-primary">{completedCount}/{requirements.length}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div
                className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" style={{ gridTemplateRows: 'repeat(2, 1fr)' }}>
            {requirements.map((requirement, index) => {
              const IconComponent = requirement.icon;
              const isChecked = checkedItems.includes(requirement.id);
              
              return (
                <div
                  key={requirement.id}
                  className={`card-hover rounded-3xl p-8 scroll-animate ${isVisible ? 'animate-in' : ''} group relative overflow-hidden cursor-pointer border border-muted/30 hover:border-muted/50 transition-all duration-300 h-full flex flex-col`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                  onClick={() => handleItemClick(requirement.id)}
                >
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-${index % 2 === 0 ? 'primary' : index % 3 === 1 ? 'secondary' : 'accent'} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
                  
                  {/* Subtle Inner Border */}
                  <div className="absolute inset-4 rounded-2xl border border-white/20 group-hover:border-white/40 transition-colors duration-300"></div>
                  
                  {/* Check Animation */}
                  <div className="absolute top-6 right-6">
                    {isChecked ? (
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 border-2 border-muted-foreground/30 rounded-full flex items-center justify-center group-hover:border-primary group-hover:scale-110 transition-all duration-300">
                        <Circle className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    )}
                  </div>
                  
                  <div className="relative z-10 flex flex-col h-full">
                    <div className={`flex items-center justify-center w-16 h-16 bg-gradient-${index % 2 === 0 ? 'primary' : index % 3 === 1 ? 'secondary' : 'accent'} rounded-2xl mb-6 group-hover:scale-110 transition-transform`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-foreground mb-4 group-hover:scale-105 transition-transform">
                      {requirement.title}
                    </h3>
                    
                    <p className="text-muted-foreground leading-relaxed mb-4 flex-grow">
                      {requirement.description}
                    </p>
                    
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                      isChecked 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-primary/10 text-primary'
                    }`}>
                      {requirement.category}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
};