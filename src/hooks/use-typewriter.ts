import { useState, useEffect } from 'react';

interface UseTypewriterOptions {
  text: string;
  speed?: number;
  delay?: number;
  trigger?: boolean;
}

export const useTypewriter = ({ 
  text, 
  speed = 50, 
  delay = 0,
  trigger = true 
}: UseTypewriterOptions) => {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!trigger) {
      setDisplayText('');
      setIsComplete(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      let currentIndex = 0;
      setDisplayText('');
      setIsComplete(false);

      const intervalId = setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayText(text.slice(0, currentIndex));
          currentIndex++;
        } else {
          setIsComplete(true);
          clearInterval(intervalId);
        }
      }, speed);

      return () => clearInterval(intervalId);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [text, speed, delay, trigger]);

  return { displayText, isComplete };
};