import Navigation from '@/components/Navigation';
import HeroSection from '@/components/how-it-works/HeroSection';
import ProcessSteps from '@/components/how-it-works/ProcessSteps';
import BeforeAfter from '@/components/how-it-works/BeforeAfter';
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

      {/* Before/After Comparison */}
      <BeforeAfter />

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