import { useState } from "react";
import { Users, Mail, MapPin, Award } from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

const teamMembers = [
  {
    name: "Dr. Sarah Chen",
    role: "Founder & CEO",
    bio: "Harvard-trained orthodontist with 10+ years of experience helping international graduates. Passionate about bridging cultural gaps in dental education.",
    longBio:
      "After completing her orthodontic residency at Harvard, Dr. Chen noticed the struggles faced by her international colleagues. She founded DentMentor to create a supportive ecosystem where experienced professionals could guide the next generation of global dental talent.",
    image:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face",
    email: "sarah@dentmentor.com",
    location: "Boston, MA",
    achievements: [
      "Harvard Dental School Alumni",
      "Top 40 Under 40 Dentist",
      "Published Researcher",
    ],
  },
  {
    name: "Dr. Michael Rodriguez",
    role: "Head of Mentor Relations",
    bio: "NYU-trained oral surgeon who oversees our mentor network. Ensures quality and maintains the high standards our students deserve.",
    longBio:
      "With over 12 years in oral surgery and a passion for mentorship, Dr. Rodriguez built our mentor vetting process from the ground up. He personally interviews every mentor to ensure they meet our standards of excellence and genuine care for student success.",
    image:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face",
    email: "michael@dentmentor.com",
    location: "New York, NY",
    achievements: [
      "Board Certified Oral Surgeon",
      "Mentor Excellence Award",
      "Speaker at 20+ Conferences",
    ],
  },
  {
    name: "Emily Johnson",
    role: "Director of Student Success",
    bio: "Former international student herself, Emily understands the challenges firsthand. She ensures every student receives personalized support.",
    longBio:
      "Having navigated the complex process of studying dentistry in the US as an international student from Canada, Emily brings unique insight to our student support programs. Her empathetic approach and strategic thinking have helped thousands of students succeed.",
    image:
      "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face",
    email: "emily@dentmentor.com",
    location: "San Francisco, CA",
    achievements: [
      "International Student Advocate",
      "Student Success Specialist",
      "Multilingual Communicator",
    ],
  },
  {
    name: "Dr. James Park",
    role: "Chief Technology Officer",
    bio: "Tech-savvy periodontist who built our platform from scratch. Combines dental expertise with cutting-edge technology.",
    longBio:
      "Dr. Park bridges the gap between healthcare and technology. After completing his periodontics residency, he taught himself programming and built the DentMentor platform. His vision of seamless digital mentorship has revolutionized how dental education happens online.",
    image:
      "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=400&h=400&fit=crop&crop=face",
    email: "james@dentmentor.com",
    location: "Seattle, WA",
    achievements: [
      "Full-Stack Developer",
      "Periodontics Specialist",
      "Innovation Award Winner",
    ],
  },
  {
    name: "Dr. Priya Patel",
    role: "Global Outreach Director",
    bio: "Pediatric dentist managing our international partnerships. Connects with dental schools and organizations worldwide.",
    longBio:
      "Dr. Patel coordinates our global initiatives, building relationships with dental schools, professional organizations, and governments across six continents. Her multicultural background and language skills have been instrumental in making DentMentor truly global.",
    image:
      "https://images.unsplash.com/photo-1594824375664-a8e530fd2b13?w=400&h=400&fit=crop&crop=face",
    email: "priya@dentmentor.com",
    location: "Philadelphia, PA",
    achievements: [
      "Global Health Advocate",
      "Speaks 5 Languages",
      "International Relations Expert",
    ],
  },
  {
    name: "Dr. Ahmed Hassan",
    role: "Quality Assurance Lead",
    bio: "Endodontist ensuring our educational content meets the highest standards. Reviews all materials and mentor qualifications.",
    longBio:
      "Dr. Hassan oversees all educational content and mentor qualifications. His meticulous attention to detail and deep understanding of dental education standards ensure that every student receives accurate, up-to-date, and comprehensive guidance.",
    image:
      "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=face",
    email: "ahmed@dentmentor.com",
    location: "Detroit, MI",
    achievements: [
      "Endodontic Excellence",
      "Education Quality Expert",
      "Research Publications",
    ],
  },
];

export const TeamSection = () => {
  const { ref: sectionRef, isVisible } = useScrollAnimation();
  const [selectedMember, setSelectedMember] = useState<number | null>(null);

  return (
    <section ref={sectionRef} className="py-12 sm:py-16 md:py-20 bg-background">
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h2
            className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-3 sm:mb-4 transition-all duration-1000 px-4 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            Meet Our Team
          </h2>
          <p
            className={`text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto transition-all duration-1000 delay-200 px-4 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            The passionate professionals behind DentMentor's success, each
            bringing unique expertise and shared commitment to your journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-10 sm:mb-12 md:mb-16">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className={`team-card group cursor-pointer transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-12"
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
              onClick={() =>
                setSelectedMember(selectedMember === index ? null : index)
              }
            >
              <div className="relative bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 shadow-soft hover:shadow-large transition-all duration-300 overflow-hidden">
                {/* Photo Reveal Effect */}
                <div className="relative mb-4 sm:mb-5 md:mb-6 overflow-hidden rounded-xl sm:rounded-2xl">
                  <div className="aspect-square relative">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                    />
                    {/* Overlay that slides away on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Contact Icons that appear on hover */}
                    <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 flex gap-1.5 sm:gap-2 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                      <div className="bg-white/90 rounded-full p-1.5 sm:p-2">
                        <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                      </div>
                      <div className="bg-white/90 rounded-full p-1.5 sm:p-2">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Member Info */}
                <div className="text-center mb-3 sm:mb-4">
                  <h3 className="text-lg sm:text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-sm sm:text-base text-primary font-medium mb-2 sm:mb-3">
                    {member.role}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {member.bio}
                  </p>
                </div>

                {/* Achievements */}
                <div className="flex flex-wrap gap-1 justify-center">
                  {member.achievements.slice(0, 2).map((achievement, i) => (
                    <span
                      key={i}
                      className="text-[10px] sm:text-xs bg-muted px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-muted-foreground"
                    >
                      {achievement}
                    </span>
                  ))}
                </div>

                {/* Expand Indicator */}
                <div className="text-center mt-3 sm:mt-4">
                  <div
                    className={`inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-primary transition-all duration-300 ${
                      selectedMember === index
                        ? "opacity-100"
                        : "opacity-60 group-hover:opacity-100"
                    }`}
                  >
                    <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    {selectedMember === index ? "Less Info" : "More Info"}
                  </div>
                </div>

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 rounded-2xl sm:rounded-3xl border-2 border-primary/20 opacity-0 group-hover:opacity-100 scale-105 group-hover:scale-100 transition-all duration-300 pointer-events-none" />
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Bio Modal */}
        {selectedMember !== null && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-in-bottom mx-4">
              <div className="p-4 sm:p-6 md:p-8">
                {/* Header */}
                <div className="flex items-center gap-4 sm:gap-6 mb-4 sm:mb-5 md:mb-6">
                  <img
                    src={teamMembers[selectedMember].image}
                    alt={teamMembers[selectedMember].name}
                    className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl sm:rounded-2xl object-cover ring-2 sm:ring-4 ring-primary/20 flex-shrink-0"
                  />
                  <div>
                    <h3 className="text-3xl font-bold text-foreground mb-2">
                      {teamMembers[selectedMember].name}
                    </h3>
                    <p className="text-primary font-semibold text-lg mb-2">
                      {teamMembers[selectedMember].role}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {teamMembers[selectedMember].location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {teamMembers[selectedMember].email}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="mb-6">
                  <h4 className="font-semibold text-lg mb-3">About</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {teamMembers[selectedMember].longBio}
                  </p>
                </div>

                {/* Achievements */}
                <div className="mb-8">
                  <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" />
                    Achievements
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {teamMembers[selectedMember].achievements.map(
                      (achievement, i) => (
                        <span
                          key={i}
                          className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {achievement}
                        </span>
                      )
                    )}
                  </div>
                </div>

                {/* Close Button */}
                <div className="text-center">
                  <button
                    onClick={() => setSelectedMember(null)}
                    className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
