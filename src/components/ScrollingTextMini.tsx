
import { useEffect, useState } from 'react';
import { useIsMobile } from "@/hooks/use-mobile";
import { Star, PartyPopper } from 'lucide-react';

interface ScrollingTextProps {
  text?: string;
  className?: string;
  gameTitle?: string;
  gameState?: string;
  isGameEnded?: boolean;
}

const ScrollingText = ({ className, gameTitle, gameState = "waiting", isGameEnded = false }: ScrollingTextProps) => {
  // Different message sets based on game state
  const waitingMessages = [
    "Type A, B, C, or D to participate!",
    gameTitle || "QuizCube Live",
    "Stay tuned, the game will start soon!"
  ];
  
  const endedMessages = [
    "Thanks for participating in our quiz!",
    "Go to channel home page for more live quizzes!",
    "Please share your feedback in the comments!",
    gameTitle ? `Hope you enjoyed ${gameTitle}!` : "Hope you enjoyed the quiz!"
  ];

  // Select message set based on game state
  const messages = isGameEnded ? endedMessages : waitingMessages;
  
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
    <div className="overflow-hidden relative py-1 bg-slate-900/70 rounded-md shadow-inner">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-slate-800/10 to-transparent animate-[slide-in-right_4s_ease-in-out_infinite]"></div>
      <div
        className={`text-center transition-all duration-500 flex items-center justify-center ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        } ${isMobile ? 'text-sm' : 'text-3xl font-bold'} text-white ${className}`}
      >
        <Star className={`${isMobile ? 'h-3 w-3' : 'h-5 w-5'} text-slate-200 mr-2 animate-pulse`} />
        {messages[currentMessageIndex]}
        <PartyPopper className={`${isMobile ? 'h-3 w-3' : 'h-5 w-5'} text-slate-200 ml-2 animate-bounce`} />
      </div>
    </div>
  );
};

export default ScrollingText;
