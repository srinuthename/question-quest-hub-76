
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface CountdownTimerProps {
  initialSeconds: number;
  onComplete?: () => void;
  gameState: string;
  className?: string;
}

const CountdownTimer = ({
  initialSeconds,
  onComplete,
  gameState,
  className = ""
}: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [progress, setProgress] = useState(100);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // Reset timer when initialSeconds changes
    setTimeLeft(initialSeconds);
    setProgress(100);
  }, [initialSeconds, gameState]);
  
  useEffect(() => {
    if (timeLeft <= 0) {
      if (onComplete) onComplete();
      return;
    }
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        // Calculate progress percentage
        const newProgress = (newTime / initialSeconds) * 100;
        setProgress(newProgress);
        return newTime;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft, initialSeconds, onComplete]);
  
  // Determine color based on time left and game state
  const getColorClass = () => {
    if (gameState === 'question') {
      if (timeLeft > initialSeconds * 0.75) return "bg-green-500";
      if (timeLeft > initialSeconds * 0.5) return "bg-yellow-500";
      return "bg-red-500";
    } else {
      return "bg-purple-500";
    }
  };
  
  // Determine text based on game state
  const getTimerText = () => {
    if (gameState === 'question') {
      return isMobile ? `${timeLeft}s` : `Question ends in ${timeLeft}s`;
    } else if (gameState === 'answer') {
      return isMobile ? `${timeLeft}s` : `Next in ${timeLeft}s`;
    } else if (gameState === 'leaderboard') {
      return isMobile ? `${timeLeft}s` : `Next question in ${timeLeft}s`;
    }
    return `${timeLeft}s`;
  };
  
  return (
    <div className={`w-full flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Clock className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-white`} />
          <Badge variant="outline" className="text-white border-white/40 bg-white/10 font-bold text-base px-3 py-1">
            {getTimerText()}
          </Badge>
        </div>
      </div>
      <Progress value={progress} className={`h-2 ${getColorClass()}`} />
    </div>
  );
};

export default CountdownTimer;
