import Navigation from '@/components/Navigation';
import { HeroSection } from '@/components/about/HeroSection';
import { FounderStory } from '@/components/about/FounderStory';
import { MissionStatement } from '@/components/about/MissionStatement';
import { TeamSection } from '@/components/about/TeamSection';
import { CompanyMilestones } from '@/components/about/CompanyMilestones';
import { ValuesSection } from '@/components/about/ValuesSection';
import { ImpactMetrics } from '@/components/about/ImpactMetrics';
import { PhotoGallery } from '@/components/about/PhotoGallery';
import { ContactSection } from '@/components/about/ContactSection';

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Founder Story */}
      <FounderStory />
      
      {/* Mission Statement */}
      <MissionStatement />
      
      {/* Impact Metrics */}
      <ImpactMetrics />
      
      {/* Values Section */}
      <ValuesSection />
      
      {/* Company Milestones */}
      <CompanyMilestones />
      
      {/* Team Section */}
      <TeamSection />
      
      {/* Photo Gallery */}
      <PhotoGallery />
      
      {/* Contact Section */}
      <ContactSection />
    </div>
  );
};

export default About;