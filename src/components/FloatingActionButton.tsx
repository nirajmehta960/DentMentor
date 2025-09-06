import { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FloatingActionButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
        setIsOpen(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      {/* Main FAB */}
      <div className={`fab ${isVisible ? 'show' : ''}`}>
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="accent"
          className="w-16 h-16 rounded-full shadow-glow hover:shadow-glow group"
          size="lg"
        >
          {isOpen ? (
            <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
          ) : (
            <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
          )}
        </Button>
      </div>

      {/* Quick Actions Menu */}
      {isOpen && isVisible && (
        <div className="fixed bottom-24 right-8 z-40 flex flex-col gap-3">
          <Button
            onClick={() => {
              // Scroll to hero section
              document.querySelector('section')?.scrollIntoView({ behavior: 'smooth' });
              setIsOpen(false);
            }}
            variant="hero"
            className="w-14 h-14 rounded-full group"
            title="Get Started"
          >
            <span className="text-sm font-bold">Go</span>
          </Button>
          
          <Button
            onClick={() => {
              // Scroll to mentors section
              const mentorsSection = document.querySelector('[data-section="mentors"]');
              if (mentorsSection) {
                mentorsSection.scrollIntoView({ behavior: 'smooth' });
              }
              setIsOpen(false);
            }}
            variant="secondary-gradient"
            className="w-14 h-14 rounded-full group"
            title="View Mentors"
          >
            <span className="text-xs font-bold">👥</span>
          </Button>
          
          <Button
            onClick={scrollToTop}
            variant="outline"
            className="w-14 h-14 rounded-full border-primary/30 hover:bg-primary/10 group backdrop-blur-sm"
            title="Back to Top"
          >
            <span className="text-lg">↑</span>
          </Button>
        </div>
      )}

      {/* Chat Widget Simulation */}
      {isOpen && isVisible && (
        <div className="fixed bottom-32 right-20 z-30 bg-white rounded-2xl shadow-large p-4 max-w-sm animate-scale-in">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Need Help?</h4>
              <p className="text-sm text-muted-foreground">We're here to guide you</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Connect with a DentMentor advisor to learn more about our mentorship programs.
          </p>
          <div className="flex gap-2">
            <Button variant="hero" size="sm" className="flex-1">
              Chat Now
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
            >
              Later
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingActionButton;