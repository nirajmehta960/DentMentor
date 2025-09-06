import { Star, Quote } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';

const Testimonials = () => {
  const { ref: testimonialsRef, isVisible: testimonialsVisible } = useScrollAnimation();
  
  const testimonials = [
    {
      name: 'Dr. Priya Patel',
      country: 'India',
      program: 'NYU College of Dentistry',
      image: 'https://images.unsplash.com/photo-1594824804732-ca8db7045948?w=150&h=150&fit=crop&crop=face',
      rating: 5,
      text: 'DentMentor transformed my journey completely. My mentor helped me understand the NBDE format and guided me through every step of the residency application process. I matched into my dream orthodontics program!',
      result: 'Matched into Orthodontics Residency'
    },
    {
      name: 'Dr. Ahmed Hassan',
      country: 'Egypt',
      program: 'Harvard School of Dental Medicine',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
      rating: 5,
      text: 'The personalized guidance I received was invaluable. My mentor not only helped me pass the boards but also prepared me for interviews and clinical scenarios I would face in practice.',
      result: 'Passed NBDE Part I & II on First Attempt'
    },
    {
      name: 'Dr. Maria Rodriguez',
      country: 'Mexico',
      program: 'UCLA School of Dentistry',
      image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face',
      rating: 5,
      text: 'The community support and structured mentorship made all the difference. I went from feeling overwhelmed to confident and prepared. The investment in DentMentor paid for itself many times over.',
      result: 'Successfully Established Private Practice'
    }
  ];

  return (
    <section ref={testimonialsRef} className="py-20 bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-secondary rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Success Stories
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Hear from international dental graduates who've achieved their dreams 
            with DentMentor's guidance and support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`scroll-animate ${testimonialsVisible ? 'animate-in' : ''} 
                card-hover rounded-3xl p-8 relative group`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 opacity-20 group-hover:opacity-30 transition-opacity">
                <Quote className="w-12 h-12 text-primary" />
              </div>

              {/* Profile */}
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-4 ring-primary/10"
                />
                <div>
                  <h4 className="font-bold text-foreground text-lg">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    From {testimonial.country}
                  </p>
                  <p className="text-sm text-primary font-medium">
                    {testimonial.program}
                  </p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-secondary fill-current" />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-muted-foreground leading-relaxed mb-6 italic">
                "{testimonial.text}"
              </p>

              {/* Result Badge */}
              <div className="inline-flex items-center gap-2 bg-gradient-primary text-white px-4 py-2 rounded-full text-sm font-medium">
                <Star className="w-4 h-4" />
                {testimonial.result}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className={`text-center mt-16 scroll-animate ${testimonialsVisible ? 'animate-in' : ''}`}>
          <div className="inline-flex items-center gap-2 text-primary font-medium mb-4">
            <Star className="w-5 h-5" />
            <span>Join 1,200+ Success Stories</span>
            <Star className="w-5 h-5" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;