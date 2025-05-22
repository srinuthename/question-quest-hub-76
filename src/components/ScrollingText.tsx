
import { useEffect, useState } from 'react';
import { useIsMobile } from "@/hooks/use-mobile";

interface ScrollingTextProps {
  text?: string;
  className?: string;
}

const ScrollingText = ({ className }: ScrollingTextProps) => {
  const messages = [
    "Type A, B, C, or D to participate!",
    "QuizCube Live",
    "Be quick to top the leaderboard!",
    "Answer fast for bonus points!"
  ];
  
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
        setIsVisible(true);
      }, 500); // Wait for fade out before changing message
    }, 4000); // Change message every 4 seconds

    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="overflow-hidden relative py-1 bg-black/10 rounded-md">
      <div
        className={`text-center transition-all duration-500 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        } ${isMobile ? 'text-sm' : 'text-2xl font-bold'} ${className}`}
      >
        {messages[currentMessageIndex]}
      </div>
    </div>
  );
};

export default ScrollingText;
