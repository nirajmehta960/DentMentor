import { Star, CheckCircle, GraduationCap, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';

const Mentors = () => {
  const { ref: mentorsRef, isVisible: mentorsVisible } = useScrollAnimation();

  return (
    <section ref={mentorsRef} className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Meet Your Mentors
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Connect with experienced dental professionals who've walked the same path 
            and are committed to your success.
          </p>
        </div>

        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-8">
            Browse our network of verified dental professionals ready to guide you through your career journey.
          </p>
          <Button size="lg" variant="hero" className="px-8 py-4">
            Browse All Mentors
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Mentors;