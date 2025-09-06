import { useState, useEffect } from 'react';
import { CheckCircle, Circle, Award, GraduationCap, Shield, Clock } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import { Button } from '@/components/ui/button';

const requirements = [
  {
    id: 1,
    icon: GraduationCap,
    title: 'U.S. Dental School Graduate',
    description: 'Must be a graduate from an accredited U.S. dental school',
    category: 'Education'
  },
  {
    id: 2,
    icon: Shield,
    title: 'Active U.S. Dental License',
    description: 'Current and valid dental license in the United States',
    category: 'Licensing'
  },
  {
    id: 3,
    icon: Clock,
    title: 'Minimum 3 Years Experience',
    description: 'At least 3 years of professional dental practice experience',
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

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {requirements.map((requirement, index) => {
              const IconComponent = requirement.icon;
              const isChecked = checkedItems.includes(requirement.id);
              
              return (
                <div
                  key={requirement.id}
                  className={`requirement-item cursor-pointer group transition-all duration-700 ${
                    isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                  onClick={() => handleItemClick(requirement.id)}
                >
                  <div className={`relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                    isChecked 
                      ? 'bg-green-50 border-green-200 shadow-lg scale-[1.02]' 
                      : 'bg-white border-border hover:border-primary/30 hover:shadow-md'
                  }`}>
                    {/* Check Animation */}
                    <div className="absolute top-4 right-4">
                      {isChecked ? (
                        <CheckCircle className="w-6 h-6 text-green-500 animate-scale-in" />
                      ) : (
                        <Circle className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="pr-10">
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          isChecked 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white'
                        }`}>
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className={`font-semibold text-lg transition-colors ${
                            isChecked ? 'text-green-700' : 'text-foreground'
                          }`}>
                            {requirement.title}
                          </h3>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full transition-colors ${
                            isChecked 
                              ? 'bg-green-100 text-green-600'
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {requirement.category}
                          </span>
                        </div>
                      </div>
                      
                      <p className={`text-sm leading-relaxed transition-colors ${
                        isChecked ? 'text-green-600' : 'text-muted-foreground'
                      }`}>
                        {requirement.description}
                      </p>
                    </div>

                    {/* Completion Effect */}
                    {isChecked && (
                      <div className="absolute inset-0 rounded-2xl bg-green-500/5 animate-pulse pointer-events-none" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Completion Message */}
          {completedCount === requirements.length && (
            <div className="text-center mt-12 p-8 bg-green-50 rounded-3xl border-2 border-green-200 animate-fade-in">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-green-700 mb-2">
                Great! You meet all requirements
              </h3>
              <p className="text-green-600 mb-6">
                You're ready to start your mentor application process.
              </p>
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                Start Application
              </Button>
            </div>
          )}

          {/* Partial Completion Encouragement */}
          {completedCount > 0 && completedCount < requirements.length && (
            <div className="text-center mt-12 p-6 bg-primary/5 rounded-2xl border border-primary/20">
              <h3 className="text-lg font-semibold text-primary mb-2">
                You're {Math.round(progressPercentage)}% there!
              </h3>
              <p className="text-muted-foreground">
                Keep going to see if you meet all our mentor requirements.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};