import { Play, Volume2, Maximize, SkipForward, Pause } from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const VideoSection = () => {
  const { ref: sectionRef, isVisible: sectionVisible } = useScrollAnimation({
    threshold: 0.1,
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(185); // 3:05
  const totalTime = 420; // 7:00

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercentage = (currentTime / totalTime) * 100;

  const testimonials = [
    {
      name: "Dr. Ahmed Hassan",
      role: "Dental School Graduate",
      image:
        "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=80&h=80&fit=crop&crop=face",
      quote: "DentMentor completely transformed my application strategy.",
    },
    {
      name: "Dr. Priya Patel",
      role: "Orthodontics Resident",
      image:
        "https://images.unsplash.com/photo-1594824804732-ca8db7045948?w=80&h=80&fit=crop&crop=face",
      quote:
        "The CV review and mock interviews were exactly what I needed to succeed.",
    },
    {
      name: "Dr. Maria Rodriguez",
      role: "Private Practice Owner",
      image:
        "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=80&h=80&fit=crop&crop=face",
      quote: "I matched into my dream program thanks to DentMentor.",
    },
  ];

  return (
    <section ref={sectionRef} className="py-12 sm:py-16 md:py-20 bg-background">
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4 sm:mb-5 md:mb-6 px-4">
            See Success Stories in Action
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            Watch real students share their transformation journey and learn how
            DentMentor's mentorship program changed their careers forever.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-12 items-start">
            {/* Main Video Player */}
            <div
              className={`lg:col-span-2 scroll-animate-left ${
                sectionVisible ? "animate-in" : ""
              } px-4 sm:px-0`}
            >
              <div className="relative bg-black rounded-2xl sm:rounded-3xl overflow-hidden shadow-large group">
                {/* Video Thumbnail/Preview */}
                <div className="relative aspect-video bg-gradient-to-br from-primary/90 to-accent/90 flex items-center justify-center">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-4 left-4 sm:top-6 sm:left-6 md:top-8 md:left-8 w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 border-2 border-white rounded-full"></div>
                    <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 border-2 border-white rounded-full"></div>
                    <div className="absolute top-8 right-8 sm:top-12 sm:right-12 md:top-16 md:right-16 w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full"></div>
                  </div>

                  {/* Play Button */}
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="relative z-10 flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-300 group-hover:scale-110"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white ml-0" />
                    ) : (
                      <Play className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white ml-0.5 sm:ml-1" />
                    )}
                  </button>

                  {/* Video Title Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 text-white">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2">
                      Success Stories: From Dream to Reality
                    </h3>
                    <p className="text-xs sm:text-sm md:text-base text-white/80">
                      Watch how international graduates transformed their
                      careers
                    </p>
                  </div>

                  {/* Video Stats */}
                  <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex flex-wrap gap-2 sm:gap-3 md:gap-4 text-white text-xs sm:text-sm">
                    <span className="bg-black/30 backdrop-blur-sm px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                      📹 HD Quality
                    </span>
                    <span className="bg-black/30 backdrop-blur-sm px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                      🎯 Success Stories
                    </span>
                  </div>
                </div>

                {/* Video Controls */}
                <div className="bg-black/90 p-3 sm:p-4">
                  {/* Progress Bar */}
                  <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
                    <span className="text-white text-xs sm:text-sm">
                      {formatTime(currentTime)}
                    </span>
                    <div className="flex-1 h-1.5 sm:h-2 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-primary transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    <span className="text-white text-xs sm:text-sm">
                      {formatTime(totalTime)}
                    </span>
                  </div>

                  {/* Control Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <button className="text-white hover:text-accent transition-colors">
                        {isPlaying ? (
                          <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
                        ) : (
                          <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                      </button>
                      <button className="text-white hover:text-accent transition-colors">
                        <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <button className="text-white hover:text-accent transition-colors">
                        <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="text-white text-xs sm:text-sm">
                        1080p
                      </span>
                      <button className="text-white hover:text-accent transition-colors">
                        <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Video Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-6 sm:mt-8">
                <div className="text-center p-3 sm:p-4 card-hover rounded-xl sm:rounded-2xl">
                  <div className="text-xl sm:text-2xl font-bold text-primary mb-1 sm:mb-2">
                    50+
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    Success Videos
                  </div>
                </div>
                <div className="text-center p-3 sm:p-4 card-hover rounded-xl sm:rounded-2xl">
                  <div className="text-xl sm:text-2xl font-bold text-secondary mb-1 sm:mb-2">
                    10M+
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    Total Views
                  </div>
                </div>
                <div className="text-center p-3 sm:p-4 card-hover rounded-xl sm:rounded-2xl">
                  <div className="text-xl sm:text-2xl font-bold text-accent mb-1 sm:mb-2">
                    4.9/5
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    Video Rating
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial Sidebar */}
            <div
              className={`scroll-animate-right ${
                sectionVisible ? "animate-in" : ""
              } px-4 sm:px-0 mt-8 lg:mt-0`}
            >
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-5 md:mb-6">
                  What Students Say
                </h3>

                {testimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className="p-4 sm:p-5 md:p-6 card-hover rounded-2xl sm:rounded-3xl group cursor-pointer"
                    style={{ transitionDelay: `${(index + 1) * 200}ms` }}
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl object-cover ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm sm:text-base font-semibold text-foreground mb-1">
                          {testimonial.name}
                        </h4>
                        <p className="text-xs sm:text-sm text-primary mb-2 sm:mb-3">
                          {testimonial.role}
                        </p>
                        <blockquote className="text-xs sm:text-sm text-muted-foreground italic leading-relaxed">
                          "{testimonial.quote}"
                        </blockquote>
                      </div>
                    </div>

                    {/* Play indicator for video testimonial */}
                    <div className="flex items-center gap-1.5 sm:gap-2 mt-3 sm:mt-4 text-[10px] sm:text-xs text-muted-foreground">
                      <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      <span>Watch full testimonial</span>
                    </div>
                  </div>
                ))}

                {/* CTA */}
                <div className="bg-gradient-primary rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 text-white text-center">
                  <h4 className="text-sm sm:text-base font-bold mb-1 sm:mb-2">
                    Ready to Start?
                  </h4>
                  <p className="text-white/90 text-xs sm:text-sm mb-3 sm:mb-4">
                    Join thousands of successful dental graduates
                  </p>
                  <Button
                    variant="secondary-gradient"
                    size="sm"
                    className="w-full text-xs sm:text-sm"
                  >
                    Watch More Stories
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Video Categories */}
        <div
          className={`mt-10 sm:mt-12 md:mt-16 scroll-animate ${
            sectionVisible ? "animate-in" : ""
          } px-4 sm:px-0`}
          style={{ transitionDelay: "600ms" }}
        >
          <h3 className="text-xl sm:text-2xl font-bold text-center text-foreground mb-6 sm:mb-7 md:mb-8">
            Explore More Success Stories
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {[
              { title: "CV Review", count: 15, color: "primary" },
              { title: "Mock Interviews", count: 12, color: "secondary" },
              { title: "SOP Review", count: 18, color: "accent" },
              { title: "Application Strategy", count: 8, color: "primary" },
            ].map((category, index) => (
              <div
                key={index}
                className="text-center p-4 sm:p-5 md:p-6 card-hover rounded-xl sm:rounded-2xl group cursor-pointer"
              >
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-${category.color} rounded-xl sm:rounded-2xl mx-auto mb-3 sm:mb-4 flex items-center justify-center group-hover:scale-110 transition-transform`}
                >
                  <Play className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                </div>
                <h4 className="text-sm sm:text-base font-semibold text-foreground mb-1 sm:mb-2">
                  {category.title}
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {category.count} videos
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoSection;
