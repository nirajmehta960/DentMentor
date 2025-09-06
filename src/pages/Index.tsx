import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import Statistics from '@/components/Statistics';
import Features from '@/components/Features';
import Mentors from '@/components/Mentors';
import Testimonials from '@/components/Testimonials';
import CallToAction from '@/components/CallToAction';
import FloatingActionButton from '@/components/FloatingActionButton';

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <Hero />

      {/* Statistics Section */}
      <Statistics />

      {/* Features Section */}
      <Features />

      {/* Mentors Section */}
      <div data-section="mentors">
        <Mentors />
      </div>

      {/* Testimonials Section */}
      <Testimonials />

      {/* Call to Action Section */}
      <CallToAction />

      {/* Floating Action Button */}
      <FloatingActionButton />
    </div>
  );
};

export default Index;
