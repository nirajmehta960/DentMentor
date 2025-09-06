import { Mail, MapPin, Globe, Heart } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import { Button } from '@/components/ui/button';

export const ContactSection = () => {
  const { ref: sectionRef, isVisible } = useScrollAnimation();

  return (
    <section ref={sectionRef} className="py-20 bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className={`text-4xl md:text-5xl font-bold text-primary mb-4 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            Get in Touch
          </h2>
          <p className={`text-xl text-muted-foreground max-w-3xl mx-auto transition-all duration-1000 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            We'd love to hear from you. Whether you have questions, feedback, or just want to say hello.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className={`space-y-8 transition-all duration-1000 delay-300 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            }`}>
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-6">Let's Connect</h3>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  Our team is always here to help. Reach out through any of these channels, 
                  and we'll get back to you as soon as possible.
                </p>
              </div>

              {/* Contact Methods */}
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-6 bg-white rounded-2xl shadow-soft hover:shadow-medium transition-shadow">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Email Us</h4>
                    <p className="text-muted-foreground mb-2">
                      We typically respond within 24 hours
                    </p>
                    <a 
                      href="mailto:hello@dentmentor.com" 
                      className="text-primary font-medium hover:underline"
                    >
                      hello@dentmentor.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-white rounded-2xl shadow-soft hover:shadow-medium transition-shadow">
                  <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Visit Our Office</h4>
                    <p className="text-muted-foreground mb-2">
                      Come say hello at our headquarters
                    </p>
                    <address className="text-foreground not-italic">
                      123 Innovation Drive<br />
                      Boston, MA 02215<br />
                      United States
                    </address>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-white rounded-2xl shadow-soft hover:shadow-medium transition-shadow">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Globe className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Global Presence</h4>
                    <p className="text-muted-foreground mb-2">
                      Supporting students worldwide
                    </p>
                    <p className="text-foreground">
                      50+ countries served<br />
                      24/7 platform availability
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Message Form */}
            <div className={`transition-all duration-1000 delay-500 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
            }`}>
              <div className="bg-white rounded-3xl p-8 shadow-soft">
                <h3 className="text-2xl font-bold text-foreground mb-6">Send Us a Message</h3>
                
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                      placeholder="How can we help you?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Message *
                    </label>
                    <textarea
                      rows={5}
                      className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                      placeholder="Tell us about your question or feedback..."
                    />
                  </div>

                  <Button size="lg" className="w-full">
                    Send Message
                  </Button>
                </form>

                {/* Additional Info */}
                <div className="mt-8 p-6 bg-muted/30 rounded-2xl">
                  <div className="flex items-center gap-3 mb-3">
                    <Heart className="w-5 h-5 text-red-500" />
                    <span className="font-medium text-foreground">We care about you</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Every message is read by a real person on our team. We're committed to providing 
                    thoughtful, helpful responses to every inquiry.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className={`text-center mt-16 transition-all duration-1000 delay-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="p-6 bg-white rounded-2xl shadow-soft">
                <h4 className="font-semibold text-foreground mb-2">Need Help?</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Check our comprehensive help center
                </p>
                <Button variant="outline" size="sm">
                  Help Center
                </Button>
              </div>
              
              <div className="p-6 bg-white rounded-2xl shadow-soft">
                <h4 className="font-semibold text-foreground mb-2">Media Inquiries</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Press and partnership opportunities
                </p>
                <Button variant="outline" size="sm">
                  Media Kit
                </Button>
              </div>
              
              <div className="p-6 bg-white rounded-2xl shadow-soft">
                <h4 className="font-semibold text-foreground mb-2">Careers</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Join our mission-driven team
                </p>
                <Button variant="outline" size="sm">
                  View Jobs
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};