import Navigation from '@/components/Navigation';
import HeroSection from '@/components/how-it-works/HeroSection';
import ProcessSteps from '@/components/how-it-works/ProcessSteps';
import FlexibleMentorship from '@/components/how-it-works/FlexibleMentorship';
import BeforeAfter from '@/components/how-it-works/BeforeAfter';
import RealMentorshipAction from '@/components/how-it-works/RealMentorshipAction';
import ConversationMockup from '@/components/how-it-works/ConversationMockup';
import SuccessMetrics from '@/components/how-it-works/SuccessMetrics';
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

      {/* Success Metrics */}
      <SuccessMetrics />

      {/* Conversation Mockup */}
      <ConversationMockup />

      {/* Call to Action */}
      <CallToAction />
    </div>
  );
};

export default HowItWorks;