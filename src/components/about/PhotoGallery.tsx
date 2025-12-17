import { useState } from "react";
import { X } from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

const galleryImages = [
  {
    src: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=600&fit=crop",
    alt: "Team collaboration meeting",
    caption: "Our team collaborating on new mentorship programs",
  },
  {
    src: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=600&fit=crop",
    alt: "Mentor training session",
    caption: "Training session for new mentors joining our platform",
  },
  {
    src: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&h=600&fit=crop",
    alt: "Student success celebration",
    caption: "Celebrating student achievements at our annual conference",
  },
  {
    src: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=800&h=600&fit=crop",
    alt: "Dental school partnership",
    caption: "Partnership signing with leading dental schools",
  },
  {
    src: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&h=600&fit=crop",
    alt: "International conference",
    caption: "Speaking at international dental education conference",
  },
  {
    src: "https://images.unsplash.com/photo-1594824375664-a8e530fd2b13?w=800&h=600&fit=crop",
    alt: "Mentorship session",
    caption: "One-on-one mentorship session in progress",
  },
  {
    src: "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=800&h=600&fit=crop",
    alt: "Tech development",
    caption: "Developing new features for our platform",
  },
  {
    src: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=800&h=600&fit=crop",
    alt: "Office culture",
    caption: "Our diverse and inclusive office culture",
  },
  {
    src: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
    alt: "Team building",
    caption: "Team building activities and workshops",
  },
];

export const PhotoGallery = () => {
  const { ref: sectionRef, isVisible } = useScrollAnimation();
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  return (
    <section ref={sectionRef} className="py-12 sm:py-16 md:py-20 bg-muted/20">
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h2
            className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-3 sm:mb-4 transition-all duration-1000 px-4 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            Behind the Scenes
          </h2>
          <p
            className={`text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto transition-all duration-1000 delay-200 px-4 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            A glimpse into our journey, from team moments to milestone
            celebrations and everything in between.
          </p>
        </div>

        {/* Masonry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {galleryImages.map((image, index) => (
            <div
              key={index}
              className={`gallery-item group cursor-pointer transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-12"
              }`}
              style={{
                transitionDelay: `${index * 100}ms`,
                gridRowEnd: index % 3 === 0 ? "span 2" : "span 1",
              }}
              onClick={() => setSelectedImage(index)}
            >
              <div className="relative overflow-hidden rounded-xl sm:rounded-2xl shadow-soft hover:shadow-large transition-all duration-300">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Caption */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 md:p-6 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-xs sm:text-sm font-medium leading-relaxed">
                    {image.caption}
                  </p>
                </div>

                {/* Hover Effect Border */}
                <div className="absolute inset-0 rounded-xl sm:rounded-2xl border-2 border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox Modal */}
        {selectedImage !== null && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
            <div className="relative max-w-5xl w-full mx-4">
              {/* Close Button */}
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {/* Image */}
              <div className="relative">
                <img
                  src={galleryImages[selectedImage].src}
                  alt={galleryImages[selectedImage].alt}
                  className="w-full h-auto max-h-[80vh] object-contain rounded-xl sm:rounded-2xl animate-scale-in"
                />

                {/* Caption */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 md:p-6 bg-gradient-to-t from-black/80 to-transparent rounded-b-xl sm:rounded-b-2xl">
                  <p className="text-white text-sm sm:text-base md:text-lg font-medium text-center">
                    {galleryImages[selectedImage].caption}
                  </p>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-4 sm:mt-5 md:mt-6 gap-2 sm:gap-4">
                <button
                  onClick={() =>
                    setSelectedImage(
                      selectedImage > 0
                        ? selectedImage - 1
                        : galleryImages.length - 1
                    )
                  }
                  className="px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 bg-white/10 hover:bg-white/20 rounded-lg sm:rounded-xl text-white transition-colors text-xs sm:text-sm md:text-base"
                >
                  Previous
                </button>

                <div className="text-white/70 text-xs sm:text-sm md:text-base">
                  {selectedImage + 1} of {galleryImages.length}
                </div>

                <button
                  onClick={() =>
                    setSelectedImage(
                      selectedImage < galleryImages.length - 1
                        ? selectedImage + 1
                        : 0
                    )
                  }
                  className="px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 bg-white/10 hover:bg-white/20 rounded-lg sm:rounded-xl text-white transition-colors text-xs sm:text-sm md:text-base"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Gallery Stats */}
        <div
          className={`text-center mt-16 transition-all duration-1000 delay-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            <div className="p-6 bg-white rounded-2xl shadow-soft">
              <div className="text-2xl font-bold text-primary mb-2">5+</div>
              <div className="text-sm text-muted-foreground">
                Years of memories
              </div>
            </div>
            <div className="p-6 bg-white rounded-2xl shadow-soft">
              <div className="text-2xl font-bold text-primary mb-2">100+</div>
              <div className="text-sm text-muted-foreground">Team events</div>
            </div>
            <div className="p-6 bg-white rounded-2xl shadow-soft">
              <div className="text-2xl font-bold text-primary mb-2">50+</div>
              <div className="text-sm text-muted-foreground">
                Conferences attended
              </div>
            </div>
            <div className="p-6 bg-white rounded-2xl shadow-soft">
              <div className="text-2xl font-bold text-primary mb-2">1000+</div>
              <div className="text-sm text-muted-foreground">
                Moments captured
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
