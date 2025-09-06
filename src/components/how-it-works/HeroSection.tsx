import { Target, ArrowDown } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import { useScrollProgress } from '@/hooks/use-scroll-progress';

const HeroSection = () => {
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation({ threshold: 0.2 });
  const scrollProgress = useScrollProgress();
  
  return (
    <section 
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* Parallax Background Elements */}
      <div className="absolute inset-0">
        <div 
          className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl"
          style={{ 
            transform: `translateY(${scrollProgress * 0.3}px) rotate(${scrollProgress * 0.5}deg)` 
          }}
        ></div>
        <div 
          className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
          style={{ 
            transform: `translateY(-${scrollProgress * 0.5}px) rotate(-${scrollProgress * 0.3}deg)` 
          }}
        ></div>
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl"
          style={{ 
            transform: `translate(-50%, -50%) scale(${1 + scrollProgress * 0.001})` 
          }}
        ></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Animated Icon */}
          <div className={`inline-flex items-center justify-center w-24 h-24 bg-gradient-primary rounded-3xl mb-8 scroll-animate ${heroVisible ? 'animate-in' : ''}`}>
            <Target className="w-12 h-12 text-white animate-pulse" />
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-bold text-primary mb-6 leading-tight">
            <span className={`block scroll-animate stagger-1 ${heroVisible ? 'animate-in' : ''}`}>
              How DentMentor
            </span>
            <span className={`block scroll-animate stagger-2 ${heroVisible ? 'animate-in' : ''} bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent`}>
              Transforms
            </span>
            <span className={`block scroll-animate stagger-3 ${heroVisible ? 'animate-in' : ''}`}>
              Your Career
            </span>
          </h1>

          {/* Subtitle */}
          <p className={`text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed scroll-animate stagger-4 ${heroVisible ? 'animate-in' : ''}`}>
            From international dental graduate to successful U.S. practitioner in 4 simple steps.
            Join thousands who've transformed their careers with expert mentorship.
          </p>

          {/* Progress Indicator */}
          <div className={`flex items-center justify-center gap-4 scroll-animate stagger-5 ${heroVisible ? 'animate-in' : ''}`}>
            <div className="text-sm font-medium text-muted-foreground">Scroll to explore</div>
            <ArrowDown className="w-5 h-5 text-muted-foreground animate-bounce" />
          </div>
        </div>
      </div>

      {/* Scroll Progress Bar */}
      <div className="fixed top-20 left-0 right-0 z-50 h-1 bg-muted/30">
        <div 
          className="h-full bg-gradient-primary transition-all duration-100 ease-out"
          style={{ width: `${Math.min(scrollProgress, 100)}%` }}
        />
      </div>
    </section>
  );
};

export default HeroSection;