import { useState, useEffect } from 'react';

export const useScrollProgress = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateScrollProgress = () => {
      const currentScroll = window.pageYOffset;
      const scrollHeight = document.body.scrollHeight - window.innerHeight;
      const progress = scrollHeight > 0 ? (currentScroll / scrollHeight) * 100 : 0;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    updateScrollProgress();

    return () => window.removeEventListener('scroll', updateScrollProgress);
  }, []);

  return scrollProgress;
};

export const useElementScrollProgress = (elementRef: React.RefObject<HTMLElement>) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const element = elementRef.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate how much of the element has been scrolled past
      const elementTop = rect.top;
      const elementHeight = rect.height;
      
      if (elementTop > windowHeight) {
        setProgress(0);
      } else if (elementTop + elementHeight < 0) {
        setProgress(100);
      } else {
        const visibleHeight = Math.min(windowHeight - elementTop, elementHeight);
        const progressValue = (visibleHeight / elementHeight) * 100;
        setProgress(Math.max(0, Math.min(100, progressValue)));
      }
    };

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();

    return () => window.removeEventListener('scroll', updateProgress);
  }, [elementRef]);

  return progress;
};