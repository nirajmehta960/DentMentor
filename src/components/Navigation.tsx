import { useState, useEffect } from 'react';
import { GraduationCap, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ProfileDropdown } from '@/components/ProfileDropdown';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, userType } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Base navigation items
  const baseNavItems = [
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Find Mentors', href: '/mentors' },
    { label: 'Success Stories', href: '#testimonials' },
  ];

  // Add "Become a Mentor" only if user is not a mentee
  const navItems = userType === 'mentee' 
    ? baseNavItems 
    : [...baseNavItems, { label: 'Become a Mentor', href: '/apply-mentor' }];

  const handleNavClick = (href: string) => {
    if (href.startsWith('#')) {
      // Handle anchor links
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    // For regular links, React Router will handle navigation
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-lg shadow-soft border-b border-border/50' 
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className={`p-2 rounded-xl transition-colors ${
              isScrolled ? 'bg-gradient-primary' : 'bg-white/10 backdrop-blur-sm'
            }`}>
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className={`text-xl font-bold transition-colors ${
              isScrolled ? 'text-primary' : 'text-white'
            }`}>
              DentMentor
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                onClick={() => handleNavClick(item.href)}
                className={`font-medium transition-colors hover:text-primary ${
                  isScrolled ? 'text-foreground' : 'text-white hover:text-accent-light'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA / Profile */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <ProfileDropdown isScrolled={isScrolled} />
            ) : (
              <>
                <Button 
                  asChild
                  variant="ghost" 
                  className={isScrolled ? 'text-foreground hover:text-primary' : 'text-white hover:text-accent-light hover:bg-white/10'}
                >
                  <Link to="/auth?tab=signin">Sign In</Link>
                </Button>
                <Button 
                  asChild
                  variant={isScrolled ? 'hero' : 'secondary-gradient'}
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
              <X className={`w-6 h-6 ${isScrolled ? 'text-foreground' : 'text-white'}`} />
            ) : (
              <Menu className={`w-6 h-6 ${isScrolled ? 'text-foreground' : 'text-white'}`} />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-lg border-t border-border/50">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => {
                    handleNavClick(item.href);
                    setIsMobileMenuOpen(false);
                  }}
                  className="font-medium text-foreground hover:text-primary py-2"
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex flex-col gap-3 pt-4 border-t border-border/50">
                {user ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Signed in as {user.email}</span>
                    <ProfileDropdown isScrolled={true} />
                  </div>
                ) : (
                  <>
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/auth?tab=signin">Sign In</Link>
                    </Button>
                    <Button asChild variant="hero" className="w-full">
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
