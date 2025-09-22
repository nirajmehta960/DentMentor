import { ArrowRight, GraduationCap, Play, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import { Link } from 'react-router-dom';
import heroBackground from '@/assets/hero-background.jpg';

const Hero = () => {
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation({ threshold: 0.2 });
  
  return (
    <section 
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        background: `linear-gradient(135deg, rgba(15, 118, 110, 0.9), rgba(14, 165, 233, 0.9)), url(${heroBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-32 h-32 bg-accent-light rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-secondary-light rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-light rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo */}
          <div className={`inline-flex items-center gap-3 mb-8 scroll-animate ${heroVisible ? 'animate-in' : ''}`}>
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">DentMentor</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            <span className={`block scroll-animate stagger-1 ${heroVisible ? 'animate-in' : ''}`}>
              Connect with
            </span>
            <span className={`block scroll-animate stagger-2 ${heroVisible ? 'animate-in' : ''} bg-gradient-to-r from-white to-accent-light bg-clip-text text-transparent`}>
              Expert Mentors
            </span>
            <span className={`block scroll-animate stagger-3 ${heroVisible ? 'animate-in' : ''}`}>
              Transform Your Career
            </span>
          </h1>

          {/* Subtitle */}
          <p className={`text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed scroll-animate stagger-4 ${heroVisible ? 'animate-in' : ''}`}>
            Join 50+ international dental graduates who've successfully navigated 
            the U.S. dental licensing process with personalized mentorship from verified experts.
          </p>

          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row gap-6 justify-center items-center scroll-animate stagger-5 ${heroVisible ? 'animate-in' : ''}`}>
            <Button asChild variant="secondary-gradient" size="xl" className="group">
              <Link to="/auth">
                Start Your Journey
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            
            <Button 
              asChild
              variant="outline" 
              size="xl" 
              className="text-white border-white/30 hover:bg-white/10 group backdrop-blur-sm"
            >
              <Link to="/mentors">
                <Users className="mr-2 w-5 h-5" />
                Browse Mentors
              </Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className={`mt-16 scroll-animate stagger-6 ${heroVisible ? 'animate-in' : ''}`}>
            <p className="text-white/70 mb-6">Trusted by graduates from</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              {['Harvard', 'NYU', 'UCLA', 'Columbia', 'UCSF', 'BU', 'Tufts', 'Penn', 'Michigan'].map((school, index) => (
                <div key={school} className="text-white font-semibold text-lg">
                  {school}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;