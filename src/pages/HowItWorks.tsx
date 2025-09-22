import Navigation from '@/components/Navigation';
import HeroSection from '@/components/how-it-works/HeroSection';
import ProcessSteps from '@/components/how-it-works/ProcessSteps';
import FlexibleMentorship from '@/components/how-it-works/FlexibleMentorship';
import BeforeAfter from '@/components/how-it-works/BeforeAfter';
import RealMentorshipAction from '@/components/how-it-works/RealMentorshipAction';
import CallToAction from '@/components/CallToAction';

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <HeroSection />

      {/* Main Process Steps */}
      <ProcessSteps />

      {/* Flexible Mentorship */}
      <FlexibleMentorship />

      {/* Before/After Comparison */}
      <BeforeAfter />

      {/* Real Mentorship in Action */}
      <RealMentorshipAction />

      {/* Call to Action */}
      <CallToAction />
    </div>
  );
};

export default HowItWorks;