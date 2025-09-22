import { ArrowRight, CheckCircle, GraduationCap, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import { Link } from 'react-router-dom';

const CallToAction = () => {
  const { ref: ctaRef, isVisible: ctaVisible } = useScrollAnimation();
  
  const benefits = [
    'Connect with verified mentors within 24 hours',
    'Personalized application strategy consultation',
    'Interview preparation and mock sessions',
    'Ongoing support throughout your journey'
  ];

  return (
    <section ref={ctaRef} className="py-20 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-hero">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-accent/90"></div>
        
        {/* Floating Elements */}
        <div className={`absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse ${ctaVisible ? 'pulse-glow' : ''}`}></div>
        <div className={`absolute bottom-20 right-20 w-48 h-48 bg-white/10 rounded-full blur-2xl animate-pulse ${ctaVisible ? 'pulse-glow' : ''}`} style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main CTA Content */}
          <div className={`scroll-animate ${ctaVisible ? 'animate-in' : ''}`}>
            <div className="inline-flex items-center gap-3 mb-8 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-3 hover:bg-white/20 hover:scale-105 transition-all duration-300 cursor-pointer group">
              <GraduationCap className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
              <span className="text-white font-medium group-hover:scale-105 transition-transform">Ready to Transform Your Career?</span>
            </div>

            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Start Your Success Story Today
            </h2>

            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join thousands of international dental graduates who've successfully 
              navigated their path to practicing dentistry in the United States.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className={`scroll-animate stagger-${index + 1} ${ctaVisible ? 'animate-in' : ''} 
                  flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-6 group hover:bg-white/20 transition-colors`}
              >
                <div className="flex-shrink-0 w-8 h-8 bg-secondary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-medium text-left">{benefit}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className={`scroll-animate stagger-5 ${ctaVisible ? 'animate-in' : ''} flex flex-col sm:flex-row gap-6 justify-center items-center`}>
            <Button asChild variant="secondary-gradient" size="xl" className="group shadow-orange-glow hover:shadow-orange-glow">
              <Link to="/auth">
                Get Started Now
                <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            
            <Button 
              asChild
              variant="outline" 
              size="xl" 
              className="text-white border-white/30 hover:bg-white/10 group backdrop-blur-sm"
            >
              <Link to="/mentors">
                <Users className="mr-3 w-6 h-6" />
                Browse Mentors
              </Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className={`mt-16 scroll-animate stagger-6 ${ctaVisible ? 'animate-in' : ''}`}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-80">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">15+</div>
                <div className="text-white/70 text-sm">Verified Mentors</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">95%</div>
                <div className="text-white/70 text-sm">Platform Rating</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">10+</div>
                <div className="text-white/70 text-sm">Students Helped</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">8+</div>
                <div className="text-white/70 text-sm">Countries</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;