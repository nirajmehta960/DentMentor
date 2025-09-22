import { UserPlus, FileText, Upload, CheckCircle, ArrowRight } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import { Link } from 'react-router-dom';

const steps = [
  {
    id: 1,
    icon: UserPlus,
    title: 'Sign Up as Mentor',
    description: 'Create your mentor account and provide basic information about yourself and your background.',
    details: 'Complete the initial registration with your contact details and professional information.',
    color: 'primary'
  },
  {
    id: 2,
    icon: FileText,
    title: 'Complete Onboarding',
    description: 'Fill out your detailed mentor profile including specialties, experience, and availability.',
    details: 'Tell us about your expertise, teaching style, and how you can help international students.',
    color: 'secondary'
  },
  {
    id: 3,
    icon: Upload,
    title: 'Submit Documents',
    description: 'Upload required documents including dental school diploma, license, and background verification.',
    details: 'Provide proof of your qualifications and complete our verification process.',
    color: 'accent'
  },
  {
    id: 4,
    icon: CheckCircle,
    title: 'Get Verified & Start',
    description: 'Once verified, your profile goes live and you can start receiving mentoring requests.',
    details: 'Begin helping students achieve their dreams while earning meaningful income.',
    color: 'primary'
  }
];

export const HowToBecomeMentor = () => {
  const { ref: sectionRef, isVisible } = useScrollAnimation();

  return (
    <section ref={sectionRef} className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className={`text-4xl md:text-5xl font-bold text-primary mb-4 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            How to Become a Mentor at DentMentor
          </h2>
          <p className={`text-xl text-muted-foreground max-w-3xl mx-auto transition-all duration-1000 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            Join our community of dental professionals in just a few simple steps. 
            Start making a difference while earning meaningful income.
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              const isLastStep = index === steps.length - 1;
              
              return (
                <div key={step.id} className="relative h-full">
                  {/* Step Card */}
                  <div
                    className={`card-hover rounded-3xl p-8 scroll-animate ${isVisible ? 'animate-in' : ''} group relative overflow-hidden h-full flex flex-col border-2 border-transparent hover:border-primary/20 transition-all duration-300`}
                    style={{ transitionDelay: `${index * 150}ms` }}
                  >
                    {/* Background Gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br from-${step.color}/5 via-${step.color}/3 to-transparent group-hover:from-${step.color}/10 group-hover:via-${step.color}/5 transition-all duration-300`}></div>
                    
                    {/* Subtle Pattern Overlay */}
                    <div className="absolute inset-0 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-300" style={{
                      backgroundImage: `radial-gradient(circle at 25% 25%, ${step.color === 'primary' ? '#059669' : step.color === 'secondary' ? '#dc2626' : '#7c3aed'} 2px, transparent 2px)`,
                      backgroundSize: '20px 20px'
                    }}></div>
                    
                    {/* Step Number */}
                    <div className={`absolute top-6 right-6 w-10 h-10 bg-gradient-${step.color} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {step.id}
                    </div>
                    
                    <div className="relative z-10 flex flex-col h-full">
                      <div className={`flex items-center justify-center w-20 h-20 bg-gradient-${step.color} rounded-3xl mb-6 group-hover:scale-110 transition-transform shadow-xl group-hover:shadow-2xl`}>
                        <IconComponent className="w-10 h-10 text-white" />
                      </div>
                      
                      <h3 className="text-xl font-bold text-foreground mb-4 group-hover:scale-105 transition-transform">
                        {step.title}
                      </h3>
                      
                      <p className="text-muted-foreground leading-relaxed mb-4 flex-grow">
                        {step.description}
                      </p>
                      
                      <p className="text-sm text-muted-foreground/80 leading-relaxed">
                        {step.details}
                      </p>
                    </div>
                  </div>

                  {/* Arrow Connector (except for last step) */}
                  {!isLastStep && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-20">
                      <div className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-primary/20">
                        <ArrowRight className="w-4 h-4 text-primary" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Call to Action */}
          <div className={`text-center mt-16 transition-all duration-1000 delay-800 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="inline-flex flex-col sm:flex-row items-center gap-6 bg-gradient-primary rounded-3xl p-8 text-white shadow-large">
              <div className="text-center sm:text-left">
                <h3 className="text-2xl font-bold mb-2">Ready to Start Your Mentoring Journey?</h3>
                <p className="text-white/90">Join 15+ verified mentors helping students succeed</p>
              </div>
              <Link 
                to="/auth"
                className="px-8 py-4 bg-white text-primary rounded-2xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 whitespace-nowrap inline-block"
              >
                Start Application
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
