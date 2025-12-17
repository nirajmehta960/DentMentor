import { Star, CheckCircle, GraduationCap, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { Link } from "react-router-dom";

const Mentors = () => {
  const { ref: mentorsRef, isVisible: mentorsVisible } = useScrollAnimation();

  return (
    <section ref={mentorsRef} className="py-12 sm:py-16 md:py-20 bg-muted/30">
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-3 sm:mb-4 px-4">
            Connect with Your Future Self
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            Meet dental professionals who were once in your shoes -
            international graduates who successfully built thriving careers in
            the U.S. and are eager to guide you.
          </p>
        </div>

        <div className="text-center px-4">
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-6 sm:mb-8">
            Each mentor brings unique insights from their own journey - from
            application challenges to career triumphs. They understand your
            struggles because they've lived them.
          </p>
          <Button
            asChild
            size="lg"
            variant="hero"
            className="px-6 sm:px-8 py-3 sm:py-4 hover:shadow-lg hover:scale-105 transition-all duration-300 text-sm sm:text-base w-full sm:w-auto"
          >
            <Link to="/mentors">Find Your Perfect Mentor Match</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Mentors;
