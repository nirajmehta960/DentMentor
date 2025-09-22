import { Star, Quote, DollarSign, Users, TrendingUp } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';

const successStories = [
  {
    name: 'Dr. Sarah Chen',
    specialty: 'Orthodontics',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face',
    quote: "Mentoring has been incredibly rewarding. I've helped 15+ students with their applications while earning meaningful supplemental income. The flexibility allows me to maintain my practice schedule.",
    metrics: {
      students: 15,
      earnings: '$8,400',
      rating: 4.9,
      duration: '12 months'
    },
    highlight: 'Top Performer'
  },
  {
    name: 'Dr. Michael Rodriguez',
    specialty: 'Oral Surgery',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=face',
    quote: "The platform connected me with motivated international graduates. It's fulfilling to guide them through the application process. The earning potential has been great for my schedule.",
    metrics: {
      students: 12,
      earnings: '$6,720',
      rating: 5.0,
      duration: '10 months'
    },
    highlight: 'Perfect Rating'
  },
  {
    name: 'Dr. Emily Johnson',
    specialty: 'General Dentistry',
    avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&h=300&fit=crop&crop=face',
    quote: "What started as wanting to help others became a nice income stream. I love the one-on-one interactions and seeing my mentees succeed in their applications.",
    metrics: {
      students: 18,
      earnings: '$10,080',
      rating: 4.8,
      duration: '14 months'
    },
    highlight: 'Most Students'
  }
];

const platformStats = [
  {
    icon: DollarSign,
    value: '$85K+',
    label: 'Total Mentor Earnings',
    color: 'text-green-500'
  },
  {
    icon: Users,
    value: '50+',
    label: 'Students Helped',
    color: 'text-blue-500'
  },
  {
    icon: TrendingUp,
    value: '95%',
    label: 'Platform Rating',
    color: 'text-purple-500'
  },
  {
    icon: Star,
    value: '4.9/5',
    label: 'Average Rating',
    color: 'text-yellow-500'
  }
];

export const SuccessStories = () => {
  const { ref: sectionRef, isVisible } = useScrollAnimation();

  return (
    <section ref={sectionRef} className="py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className={`text-4xl md:text-5xl font-bold text-primary mb-4 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            Mentor Success Stories
          </h2>
          <p className={`text-xl text-muted-foreground max-w-3xl mx-auto transition-all duration-1000 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            Real mentors sharing their experiences and achievements on our platform.
          </p>
        </div>

        {/* Platform Stats */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 transition-all duration-1000 delay-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          {platformStats.map((stat, index) => {
            const IconComponent = stat.icon;
            
            return (
              <div
                key={index}
                className="text-center p-6 bg-white rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300 group"
              >
                <div className={`w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <IconComponent className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="text-2xl font-bold text-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Success Stories */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {successStories.map((story, index) => (
            <div
              key={index}
              className={`story-card group relative bg-white rounded-3xl p-8 shadow-soft hover:shadow-large transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
              style={{ transitionDelay: `${index * 200 + 400}ms` }}
            >
              {/* Highlight Badge */}
              <div className="absolute top-6 right-6">
                <span className="px-3 py-1 bg-primary text-white text-xs font-medium rounded-full">
                  {story.highlight}
                </span>
              </div>

              {/* Quote Icon */}
              <div className="mb-6">
                <Quote className="w-8 h-8 text-primary/60" />
              </div>

              {/* Quote */}
              <blockquote className="text-muted-foreground leading-relaxed mb-8 italic">
                "{story.quote}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={story.avatar}
                  alt={story.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white shadow-medium"
                />
                <div>
                  <h4 className="font-semibold text-foreground">{story.name}</h4>
                  <p className="text-primary font-medium">{story.specialty}</p>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-xl">
                  <div className="text-lg font-bold text-foreground">{story.metrics.students}</div>
                  <div className="text-xs text-muted-foreground">Students</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-xl">
                  <div className="text-lg font-bold text-green-600">{story.metrics.earnings}</div>
                  <div className="text-xs text-muted-foreground">Earned</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-xl">
                  <div className="flex items-center justify-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-lg font-bold text-foreground">{story.metrics.rating}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Rating</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-xl">
                  <div className="text-lg font-bold text-foreground">{story.metrics.duration}</div>
                  <div className="text-xs text-muted-foreground">Active</div>
                </div>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 rounded-3xl border-2 border-primary/20 opacity-0 group-hover:opacity-100 scale-105 group-hover:scale-100 transition-all duration-300 pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className={`text-center mt-16 transition-all duration-1000 delay-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="bg-white rounded-3xl p-8 shadow-soft max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Ready to Start Your Success Story?
            </h3>
            <p className="text-muted-foreground mb-6">
              Join our community of successful mentors and start making a difference while earning meaningful income.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">Average</div>
                <div className="text-lg font-semibold text-foreground">$120/hour</div>
                <div className="text-sm text-muted-foreground">Starting rate</div>
              </div>
              <div className="hidden sm:block w-px bg-border" />
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">Flexible</div>
                <div className="text-lg font-semibold text-foreground">Schedule</div>
                <div className="text-sm text-muted-foreground">Work when you want</div>
              </div>
              <div className="hidden sm:block w-px bg-border" />
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">Global</div>
                <div className="text-lg font-semibold text-foreground">Impact</div>
                <div className="text-sm text-muted-foreground">Help students worldwide</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};