import { Star, CheckCircle, GraduationCap, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import { Link } from 'react-router-dom';

const Mentors = () => {
  const { ref: mentorsRef, isVisible: mentorsVisible } = useScrollAnimation();

  return (
    <section ref={mentorsRef} className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Connect with Your Future Self
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Meet dental professionals who were once in your shoes - international graduates 
            who successfully built thriving careers in the U.S. and are eager to guide you.
          </p>
        </div>

        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-8">
            Each mentor brings unique insights from their own journey - from application challenges 
            to career triumphs. They understand your struggles because they've lived them.
          </p>
          <Button asChild size="lg" variant="hero" className="px-8 py-4 hover:shadow-lg hover:scale-105 transition-all duration-300">
            <Link to="/mentors">
              Find Your Perfect Mentor Match
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Mentors;