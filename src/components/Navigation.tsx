import { useState, useEffect } from "react";
import { GraduationCap, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ProfileDropdown } from "@/components/ProfileDropdown";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, userType } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Base navigation items
  const baseNavItems = [
    { label: "How It Works", href: "/how-it-works" },
    { label: "Find Mentors", href: "/mentors" },
    { label: "Success Stories", href: "#testimonials" },
  ];

  // Add "Become a Mentor" only if user is not a mentee
  const navItems =
    userType === "mentee"
      ? baseNavItems
      : [...baseNavItems, { label: "Become a Mentor", href: "/apply-mentor" }];

  const handleNavClick = (href: string) => {
    if (href.startsWith("#")) {
      // Handle anchor links
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
    // For regular links, React Router will handle navigation
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-lg shadow-soft border-b border-border/50"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        <div className="flex items-center justify-between h-16 sm:h-18 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3">
            <div
              className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-colors ${
                isScrolled
                  ? "bg-gradient-primary"
                  : "bg-white/10 backdrop-blur-sm"
              }`}
            >
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span
              className={`text-lg sm:text-xl font-bold transition-colors ${
                isScrolled ? "text-primary" : "text-white"
              }`}
            >
              DentMentor
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                onClick={() => handleNavClick(item.href)}
                className={`font-medium text-sm lg:text-base transition-colors hover:text-primary ${
                  isScrolled
                    ? "text-foreground"
                    : "text-white hover:text-accent-light"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA / Profile */}
          <div className="hidden md:flex items-center gap-2 lg:gap-4">
            {user ? (
              <ProfileDropdown isScrolled={isScrolled} />
            ) : (
              <>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className={
                    isScrolled
                      ? "text-foreground hover:text-primary"
                      : "text-white hover:text-accent-light hover:bg-white/10"
                  }
                >
                  <Link to="/auth?tab=signin" className="text-xs lg:text-sm">
                    Sign In
                  </Link>
                </Button>
                <Button
                  asChild
                  variant={isScrolled ? "hero" : "secondary-gradient"}
                  size="sm"
                  className="text-xs lg:text-sm"
                >
                  <Link to="/auth?tab=signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden p-2"
            onClick={handleMobileMenuToggle}
          >
            {isMobileMenuOpen ? (
              <X
                className={`w-6 h-6 ${
                  isScrolled ? "text-foreground" : "text-white"
                }`}
              />
            ) : (
              <Menu
                className={`w-6 h-6 ${
                  isScrolled ? "text-foreground" : "text-white"
                }`}
              />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-lg border-t border-border/50">
          <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
            <div className="flex flex-col gap-3 sm:gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => {
                    handleNavClick(item.href);
                    setIsMobileMenuOpen(false);
                  }}
                  className="font-medium text-foreground hover:text-primary py-2 text-sm sm:text-base"
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-border/50">
                {user ? (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs sm:text-sm text-muted-foreground truncate">
                      Signed in as {user.email}
                    </span>
                    <ProfileDropdown isScrolled={true} />
                  </div>
                ) : (
                  <>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full text-sm"
                    >
                      <Link to="/auth?tab=signin">Sign In</Link>
                    </Button>
                    <Button
                      asChild
                      variant="hero"
                      size="sm"
                      className="w-full text-sm"
                    >
                      <Link to="/auth?tab=signup">Get Started</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
