import { Heart, Users, Globe } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';

export const HeroSection = () => {
  const { ref: heroRef, isVisible } = useScrollAnimation();

  return (
    <section ref={heroRef} className="pt-24 pb-20 bg-gradient-to-br from-primary/10 via-background to-accent/10 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
      <div className="absolute top-20 right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-48 h-48 bg-accent/5 rounded-full blur-2xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="p-3 bg-primary/10 rounded-2xl backdrop-blur-sm">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-foreground">
                Our <span className="text-primary">Story</span>
              </h1>
            </div>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              How a simple idea to help international dental graduates became a global movement 
              transforming careers and building bridges across continents.
            </p>
            
            {/* Key Values Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className={`transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="p-6 bg-white/50 rounded-2xl backdrop-blur-sm border border-border/50">
                  <Heart className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Driven by Passion</h3>
                  <p className="text-muted-foreground">Every story we create is fueled by genuine care for student success.</p>
                </div>
              </div>
              
              <div className={`transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="p-6 bg-white/50 rounded-2xl backdrop-blur-sm border border-border/50">
                  <Users className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Community First</h3>
                  <p className="text-muted-foreground">Building connections that last beyond mentorship sessions.</p>
                </div>
              </div>
              
              <div className={`transition-all duration-700 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="p-6 bg-white/50 rounded-2xl backdrop-blur-sm border border-border/50">
                  <Globe className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Global Impact</h3>
                  <p className="text-muted-foreground">Connecting mentors and students across 50+ countries worldwide.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};