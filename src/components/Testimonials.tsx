import { Star, Quote } from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

const Testimonials = () => {
  const { ref: testimonialsRef, isVisible: testimonialsVisible } =
    useScrollAnimation();

  const testimonials = [
    {
      name: "Dr. Priya Patel",
      country: "India",
      program: "NYU College of Dentistry",
      image:
        "https://images.unsplash.com/photo-1594824804732-ca8db7045948?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      text: "DentMentor transformed my journey completely. My mentor helped me understand the NBDE format and guided me through every step of the residency application process. I matched into my dream orthodontics program!",
      result: "Matched into Orthodontics Residency",
    },
    {
      name: "Dr. Ahmed Hassan",
      country: "Egypt",
      program: "Harvard School of Dental Medicine",
      image:
        "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      text: "The personalized guidance I received was invaluable. My mentor not only helped me pass the boards but also prepared me for interviews and clinical scenarios I would face in practice.",
      result: "Passed NBDE Part I & II on First Attempt",
    },
    {
      name: "Dr. Maria Rodriguez",
      country: "Mexico",
      program: "UCLA School of Dentistry",
      image:
        "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      text: "The community support and structured mentorship made all the difference. I went from feeling overwhelmed to confident and prepared. The investment in DentMentor paid for itself many times over.",
      result: "Successfully Established Private Practice",
    },
  ];

  return (
    <section
      ref={testimonialsRef}
      className="py-12 sm:py-16 md:py-20 bg-background relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-24 h-24 sm:w-32 sm:h-32 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-36 h-36 sm:w-48 sm:h-48 bg-secondary rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 md:px-6 relative z-10">
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-3 sm:mb-4 px-4">
            Success Stories
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            Hear from international dental graduates who've achieved their
            dreams with DentMentor's guidance and support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`scroll-animate ${
                testimonialsVisible ? "animate-in" : ""
              } 
                card-hover rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 relative group`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              {/* Quote Icon */}
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 opacity-20 group-hover:opacity-30 transition-opacity">
                <Quote className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-primary" />
              </div>

              {/* Profile */}
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5 md:mb-6">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl object-cover ring-2 sm:ring-4 ring-primary/10"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-foreground text-base sm:text-lg truncate">
                    {testimonial.name}
                  </h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    From {testimonial.country}
                  </p>
                  <p className="text-xs sm:text-sm text-primary font-medium truncate">
                    {testimonial.program}
                  </p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-3 sm:mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 sm:w-5 sm:h-5 text-secondary fill-current"
                  />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4 sm:mb-5 md:mb-6 italic">
                "{testimonial.text}"
              </p>

              {/* Result Badge */}
              <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-gradient-primary text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium">
                <Star className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="line-clamp-1">{testimonial.result}</span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          className={`text-center mt-10 sm:mt-12 md:mt-16 scroll-animate ${
            testimonialsVisible ? "animate-in" : ""
          } px-4`}
        >
          <div className="inline-flex items-center gap-1.5 sm:gap-2 text-primary font-medium mb-4 text-sm sm:text-base">
            <Star className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Join 1,200+ Success Stories</span>
            <Star className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
