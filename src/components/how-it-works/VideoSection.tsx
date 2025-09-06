import { Play, Volume2, Maximize, SkipForward, Pause } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const VideoSection = () => {
  const { ref: sectionRef, isVisible: sectionVisible } = useScrollAnimation({ threshold: 0.1 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(185); // 3:05
  const totalTime = 420; // 7:00

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = (currentTime / totalTime) * 100;

  const testimonials = [
    {
      name: 'Dr. Ahmed Hassan',
      role: 'Recent NBDE Graduate',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=80&h=80&fit=crop&crop=face',
      quote: 'DentMentor completely transformed my approach to studying.'
    },
    {
      name: 'Dr. Priya Patel',
      role: 'Orthodontics Resident',
      image: 'https://images.unsplash.com/photo-1594824804732-ca8db7045948?w=80&h=80&fit=crop&crop=face',
      quote: 'The mentorship was exactly what I needed to succeed.'
    },
    {
      name: 'Dr. Maria Rodriguez',
      role: 'Private Practice Owner',
      image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=80&h=80&fit=crop&crop=face',
      quote: 'I matched into my dream program thanks to DentMentor.'
    }
  ];

  return (
    <section ref={sectionRef} className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">
            See Success Stories in Action
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Watch real students share their transformation journey and learn how 
            DentMentor's mentorship program changed their careers forever.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            {/* Main Video Player */}
            <div className={`lg:col-span-2 scroll-animate-left ${sectionVisible ? 'animate-in' : ''}`}>
              <div className="relative bg-black rounded-3xl overflow-hidden shadow-large group">
                {/* Video Thumbnail/Preview */}
                <div className="relative aspect-video bg-gradient-to-br from-primary/90 to-accent/90 flex items-center justify-center">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-8 left-8 w-16 h-16 border-2 border-white rounded-full"></div>
                    <div className="absolute bottom-8 right-8 w-24 h-24 border-2 border-white rounded-full"></div>
                    <div className="absolute top-16 right-16 w-8 h-8 bg-white rounded-full"></div>
                  </div>

                  {/* Play Button */}
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="relative z-10 flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-300 group-hover:scale-110"
                  >
                    {isPlaying ? (
                      <Pause className="w-10 h-10 text-white ml-0" />
                    ) : (
                      <Play className="w-10 h-10 text-white ml-1" />
                    )}
                  </button>

                  {/* Video Title Overlay */}
                  <div className="absolute bottom-6 left-6 text-white">
                    <h3 className="text-2xl font-bold mb-2">Success Stories: From Dream to Reality</h3>
                    <p className="text-white/80">Watch how international graduates transformed their careers</p>
                  </div>

                  {/* Video Stats */}
                  <div className="absolute top-6 left-6 flex gap-4 text-white text-sm">
                    <span className="bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">
                      📹 HD Quality
                    </span>
                    <span className="bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">
                      🎯 Success Stories
                    </span>
                  </div>
                </div>

                {/* Video Controls */}
                <div className="bg-black/90 p-4">
                  {/* Progress Bar */}
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-white text-sm">{formatTime(currentTime)}</span>
                    <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-primary transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    <span className="text-white text-sm">{formatTime(totalTime)}</span>
                  </div>

                  {/* Control Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button className="text-white hover:text-accent transition-colors">
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                      </button>
                      <button className="text-white hover:text-accent transition-colors">
                        <SkipForward className="w-5 h-5" />
                      </button>
                      <button className="text-white hover:text-accent transition-colors">
                        <Volume2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-white text-sm">1080p</span>
                      <button className="text-white hover:text-accent transition-colors">
                        <Maximize className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Video Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="text-center p-4 card-hover rounded-2xl">
                  <div className="text-2xl font-bold text-primary mb-2">50+</div>
                  <div className="text-muted-foreground text-sm">Success Videos</div>
                </div>
                <div className="text-center p-4 card-hover rounded-2xl">
                  <div className="text-2xl font-bold text-secondary mb-2">10M+</div>
                  <div className="text-muted-foreground text-sm">Total Views</div>
                </div>
                <div className="text-center p-4 card-hover rounded-2xl">
                  <div className="text-2xl font-bold text-accent mb-2">4.9/5</div>
                  <div className="text-muted-foreground text-sm">Video Rating</div>
                </div>
              </div>
            </div>

            {/* Testimonial Sidebar */}
            <div className={`scroll-animate-right ${sectionVisible ? 'animate-in' : ''}`}>
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-foreground mb-6">
                  What Students Say
                </h3>

                {testimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className="p-6 card-hover rounded-3xl group cursor-pointer"
                    style={{ transitionDelay: `${(index + 1) * 200}ms` }}
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-xl object-cover ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-1">
                          {testimonial.name}
                        </h4>
                        <p className="text-sm text-primary mb-3">
                          {testimonial.role}
                        </p>
                        <blockquote className="text-sm text-muted-foreground italic leading-relaxed">
                          "{testimonial.quote}"
                        </blockquote>
                      </div>
                    </div>

                    {/* Play indicator for video testimonial */}
                    <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                      <Play className="w-3 h-3" />
                      <span>Watch full testimonial</span>
                    </div>
                  </div>
                ))}

                {/* CTA */}
                <div className="bg-gradient-primary rounded-2xl p-6 text-white text-center">
                  <h4 className="font-bold mb-2">Ready to Start?</h4>
                  <p className="text-white/90 text-sm mb-4">
                    Join thousands of successful dental graduates
                  </p>
                  <Button variant="secondary-gradient" className="w-full">
                    Watch More Stories
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Video Categories */}
        <div className={`mt-16 scroll-animate ${sectionVisible ? 'animate-in' : ''}`} style={{ transitionDelay: '600ms' }}>
          <h3 className="text-2xl font-bold text-center text-foreground mb-8">
            Explore More Success Stories
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { title: 'NBDE Preparation', count: 15, color: 'primary' },
              { title: 'Residency Match', count: 12, color: 'secondary' },
              { title: 'Career Guidance', count: 18, color: 'accent' },
              { title: 'Practice Setup', count: 8, color: 'primary' }
            ].map((category, index) => (
              <div
                key={index}
                className="text-center p-6 card-hover rounded-2xl group cursor-pointer"
              >
                <div className={`w-16 h-16 bg-gradient-${category.color} rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Play className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">{category.title}</h4>
                <p className="text-muted-foreground text-sm">{category.count} videos</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoSection;