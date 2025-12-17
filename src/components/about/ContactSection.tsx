import { Mail, MapPin, Globe, Heart } from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { Button } from "@/components/ui/button";

export const ContactSection = () => {
  const { ref: sectionRef, isVisible } = useScrollAnimation();

  return (
    <section
      ref={sectionRef}
      className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-primary/10 via-background to-accent/10"
    >
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h2
            className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-3 sm:mb-4 transition-all duration-1000 px-4 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            Get in Touch
          </h2>
          <p
            className={`text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto transition-all duration-1000 delay-200 px-4 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            We'd love to hear from you. Whether you have questions, feedback, or
            just want to say hello.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
            {/* Contact Information */}
            <div
              className={`space-y-6 sm:space-y-8 transition-all duration-1000 delay-300 px-4 sm:px-0 ${
                isVisible
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-8"
              }`}
            >
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-5 md:mb-6">
                  Let's Connect
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-6 sm:mb-7 md:mb-8">
                  Our team is always here to help. Reach out through any of
                  these channels, and we'll get back to you as soon as possible.
                </p>
              </div>

              {/* Contact Methods */}
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-5 md:p-6 bg-white rounded-xl sm:rounded-2xl shadow-soft hover:shadow-medium transition-shadow">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm sm:text-base font-semibold text-foreground mb-1 sm:mb-2">
                      Email Us
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">
                      We typically respond within 24 hours
                    </p>
                    <a
                      href="mailto:hello@dentmentor.com"
                      className="text-xs sm:text-sm md:text-base text-primary font-medium hover:underline break-all"
                    >
                      hello@dentmentor.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-5 md:p-6 bg-white rounded-xl sm:rounded-2xl shadow-soft hover:shadow-medium transition-shadow">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent/10 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm sm:text-base font-semibold text-foreground mb-1 sm:mb-2">
                      Visit Our Office
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">
                      Come say hello at our headquarters
                    </p>
                    <address className="text-xs sm:text-sm text-foreground not-italic">
                      123 Innovation Drive
                      <br />
                      Boston, MA 02215
                      <br />
                      United States
                    </address>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-5 md:p-6 bg-white rounded-xl sm:rounded-2xl shadow-soft hover:shadow-medium transition-shadow">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                    <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm sm:text-base font-semibold text-foreground mb-1 sm:mb-2">
                      Global Presence
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">
                      Supporting students worldwide
                    </p>
                    <p className="text-xs sm:text-sm text-foreground">
                      50+ countries served
                      <br />
                      24/7 platform availability
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Message Form */}
            <div
              className={`transition-all duration-1000 delay-500 px-4 sm:px-0 ${
                isVisible
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-8"
              }`}
            >
              <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 shadow-soft">
                <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-5 md:mb-6">
                  Send Us a Message
                </h3>

                <form className="space-y-4 sm:space-y-5 md:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 border border-border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm sm:text-base"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 border border-border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm sm:text-base"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 border border-border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm sm:text-base"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 border border-border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm sm:text-base"
                      placeholder="How can we help you?"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                      Message *
                    </label>
                    <textarea
                      rows={4}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 border border-border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none text-sm sm:text-base"
                      placeholder="Tell us about your question or feedback..."
                    />
                  </div>

                  <Button size="lg" className="w-full text-sm sm:text-base">
                    Send Message
                  </Button>
                </form>

                {/* Additional Info */}
                <div className="mt-6 sm:mt-7 md:mt-8 p-4 sm:p-5 md:p-6 bg-muted/30 rounded-xl sm:rounded-2xl">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />
                    <span className="text-sm sm:text-base font-medium text-foreground">
                      We care about you
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Every message is read by a real person on our team. We're
                    committed to providing thoughtful, helpful responses to
                    every inquiry.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div
            className={`text-center mt-10 sm:mt-12 md:mt-16 transition-all duration-1000 delay-700 px-4 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 md:gap-6 max-w-3xl mx-auto">
              <div className="p-4 sm:p-5 md:p-6 bg-white rounded-xl sm:rounded-2xl shadow-soft">
                <h4 className="text-sm sm:text-base font-semibold text-foreground mb-1.5 sm:mb-2">
                  Need Help?
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                  Check our comprehensive help center
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs sm:text-sm w-full sm:w-auto"
                >
                  Help Center
                </Button>
              </div>

              <div className="p-4 sm:p-5 md:p-6 bg-white rounded-xl sm:rounded-2xl shadow-soft">
                <h4 className="text-sm sm:text-base font-semibold text-foreground mb-1.5 sm:mb-2">
                  Media Inquiries
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                  Press and partnership opportunities
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs sm:text-sm w-full sm:w-auto"
                >
                  Media Kit
                </Button>
              </div>

              <div className="p-4 sm:p-5 md:p-6 bg-white rounded-xl sm:rounded-2xl shadow-soft">
                <h4 className="text-sm sm:text-base font-semibold text-foreground mb-1.5 sm:mb-2">
                  Careers
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                  Join our mission-driven team
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs sm:text-sm w-full sm:w-auto"
                >
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
