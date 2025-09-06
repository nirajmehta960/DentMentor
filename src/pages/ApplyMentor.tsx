import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { MultiStepForm } from '@/components/apply/MultiStepForm';
import { BenefitCards } from '@/components/apply/BenefitCards';
import { RequirementsChecklist } from '@/components/apply/RequirementsChecklist';
import { SuccessStories } from '@/components/apply/SuccessStories';
import { EarningsCalculator } from '@/components/apply/EarningsCalculator';
import { Button } from '@/components/ui/button';
import { UserPlus, ArrowRight, Shield, Award } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';

const ApplyMentor = () => {
  const [showApplication, setShowApplication] = useState(false);
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section ref={heroRef} className="pt-24 pb-16 bg-gradient-to-br from-primary via-primary/95 to-accent relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center text-white max-w-4xl mx-auto">
            <div className={`transition-all duration-1000 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                  <UserPlus className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl md:text-6xl font-bold">
                  Become a <span className="text-secondary">DentMentor</span>
                </h1>
              </div>
              
              <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
                Share your expertise, transform careers, and earn meaningful income while making a difference in the dental community.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="px-8 py-4 text-lg group"
                  onClick={() => setShowApplication(true)}
                >
                  Start Application
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="px-8 py-4 text-lg bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Learn More
                </Button>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                <div className="text-center p-6 bg-white/10 rounded-2xl backdrop-blur-sm">
                  <div className="text-3xl font-bold text-secondary mb-2">$150+</div>
                  <div className="text-white/80">Average per hour</div>
                </div>
                <div className="text-center p-6 bg-white/10 rounded-2xl backdrop-blur-sm">
                  <div className="text-3xl font-bold text-secondary mb-2">500+</div>
                  <div className="text-white/80">Active mentors</div>
                </div>
                <div className="text-center p-6 bg-white/10 rounded-2xl backdrop-blur-sm">
                  <div className="text-3xl font-bold text-secondary mb-2">98%</div>
                  <div className="text-white/80">Satisfaction rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Trust Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center gap-6 text-white/70">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span className="text-sm">Secure Process</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              <span className="text-sm">Verified Mentors</span>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <BenefitCards />

      {/* Earnings Calculator */}
      <EarningsCalculator />

      {/* Requirements */}
      <RequirementsChecklist />

      {/* Success Stories */}
      <SuccessStories />

      {/* Application Form Modal/Section */}
      {showApplication && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slide-in-bottom">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Mentor Application</h2>
              <Button 
                variant="ghost" 
                onClick={() => setShowApplication(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </Button>
            </div>
            <div className="p-6">
              <MultiStepForm onComplete={() => setShowApplication(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplyMentor;