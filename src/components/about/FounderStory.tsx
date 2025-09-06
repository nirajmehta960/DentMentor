import { useState, useEffect } from 'react';
import { Lightbulb, Heart, TrendingUp, Users } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';

const timelineEvents = [
  {
    year: '2019',
    title: 'The Spark',
    description: 'Dr. Sarah founded DentMentor after witnessing countless talented international graduates struggle alone with the U.S. licensing process.',
    icon: Lightbulb,
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop',
    details: 'Working as a clinical instructor, I saw brilliant dentists from around the world facing unnecessary barriers. Their clinical skills were exceptional, but they lacked guidance on navigating the complex U.S. system.'
  },
  {
    year: '2020',
    title: 'First Mentor',
    description: 'Started with just 5 mentors helping 20 students. The results were immediate - 95% board pass rate in the first cohort.',
    icon: Heart,
    image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=300&fit=crop',
    details: 'Our first group of mentors volunteered their time because they believed in the mission. Seeing those first students succeed validated everything we hoped to achieve.'
  },
  {
    year: '2021',
    title: 'Rapid Growth',
    description: 'Word spread quickly. We grew to 50 mentors and helped 500+ students pass their boards and secure residencies.',
    icon: TrendingUp,
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=300&fit=crop',
    details: 'The dental community is tight-knit. Success stories traveled fast, and soon we had mentors reaching out from top dental schools across the country.'
  },
  {
    year: '2023',
    title: 'Global Community',
    description: 'Today, we\'re a thriving community of 500+ verified mentors helping students from 50+ countries achieve their American dream.',
    icon: Users,
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=300&fit=crop',
    details: 'What started as a solution to a local problem has become a global movement. We\'re not just changing individual lives - we\'re transforming how dental education and mentorship work worldwide.'
  }
];

export const FounderStory = () => {
  const { ref: sectionRef, isVisible } = useScrollAnimation();
  const [activeEvent, setActiveEvent] = useState(0);
  const [timelineProgress, setTimelineProgress] = useState(0);

  useEffect(() => {
    if (isVisible) {
      const timer = setInterval(() => {
        setTimelineProgress(prev => {
          if (prev < 100) {
            return prev + 1;
          }
          return prev;
        });
      }, 50);

      return () => clearInterval(timer);
    }
  }, [isVisible]);

  return (
    <section ref={sectionRef} className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className={`text-4xl md:text-5xl font-bold text-primary mb-4 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            The Journey Begins
          </h2>
          <p className={`text-xl text-muted-foreground max-w-3xl mx-auto transition-all duration-1000 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            Every great company starts with a personal story. Here's ours.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Timeline */}
            <div className={`space-y-8 transition-all duration-1000 delay-300 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            }`}>
              {/* Progress Line */}
              <div className="relative">
                <div className="absolute left-8 top-0 bottom-0 w-1 bg-muted">
                  <div 
                    className="w-full bg-gradient-to-b from-primary to-accent transition-all duration-2000 ease-out"
                    style={{ height: `${timelineProgress}%` }}
                  />
                </div>

                {timelineEvents.map((event, index) => {
                  const IconComponent = event.icon;
                  const isActive = activeEvent === index;
                  const isPassed = timelineProgress > (index / timelineEvents.length) * 100;

                  return (
                    <div
                      key={index}
                      className={`relative flex items-start gap-6 pb-12 cursor-pointer group transition-all duration-500 ${
                        isActive ? 'scale-105' : ''
                      }`}
                      onClick={() => setActiveEvent(index)}
                    >
                      {/* Timeline Dot */}
                      <div className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${
                        isPassed 
                          ? 'bg-primary text-white shadow-lg scale-110' 
                          : 'bg-muted text-muted-foreground group-hover:bg-primary/20'
                      }`}>
                        <IconComponent className="w-8 h-8" />
                        {isPassed && (
                          <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pt-2">
                        <div className={`text-2xl font-bold mb-2 transition-colors ${
                          isPassed ? 'text-primary' : 'text-muted-foreground'
                        }`}>
                          {event.year}
                        </div>
                        <h3 className={`text-xl font-semibold mb-3 transition-colors ${
                          isActive ? 'text-primary' : 'text-foreground'
                        }`}>
                          {event.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {event.description}
                        </p>
                        
                        {/* Expandable Details */}
                        <div className={`overflow-hidden transition-all duration-500 ${
                          isActive ? 'max-h-40 opacity-100 mt-4' : 'max-h-0 opacity-0'
                        }`}>
                          <div className="p-4 bg-muted/30 rounded-xl border-l-4 border-primary">
                            <p className="text-sm text-muted-foreground italic">
                              "{event.details}"
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active Event Image & Details */}
            <div className={`transition-all duration-1000 delay-500 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
            }`}>
              <div className="relative">
                <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    src={timelineEvents[activeEvent].image}
                    alt={timelineEvents[activeEvent].title}
                    className="w-full h-full object-cover transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  
                  {/* Overlay Content */}
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <div className="text-3xl font-bold mb-2">
                      {timelineEvents[activeEvent].year}
                    </div>
                    <div className="text-xl font-semibold">
                      {timelineEvents[activeEvent].title}
                    </div>
                  </div>
                </div>

                {/* Founder Quote */}
                <div className="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
                  <div className="flex items-start gap-4">
                    <img
                      src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&h=80&fit=crop&crop=face"
                      alt="Dr. Sarah Chen"
                      className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/20"
                    />
                    <div>
                      <blockquote className="text-foreground italic mb-2">
                        "Building DentMentor has been the most rewarding journey of my career. 
                        Every success story reminds me why we started this mission."
                      </blockquote>
                      <cite className="text-sm font-medium text-primary not-italic">
                        Dr. Sarah Chen, Founder & CEO
                      </cite>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};