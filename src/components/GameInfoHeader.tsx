
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Hourglass } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface GameInfoHeaderProps {
  timeLeft: number;
  timerProgress: string;
  gameState: string;
}

const GameInfoHeader = ({ 
  timeLeft,
  timerProgress,
  gameState
}: GameInfoHeaderProps) => {
  const isMobile = useIsMobile();
  
  // Calculate progress percentage for the progress bar
  const progressValue = parseInt(timerProgress.replace('%', ''));
  
  // Determine timer text based on game state
  const getTimerText = () => {
    if (gameState === 'question') {
      return `Revealing answer in ${timeLeft}s`;
    } else if (gameState === 'reveal' || gameState === 'fastest') {
      return `Next question in ${timeLeft}s`;
    }
    return `${timeLeft}s`;
  };
  
  // Determine color based on time left and game state
  const getTimerColor = () => {
    if (gameState === 'question') {
      if (timeLeft > 15) return "bg-green-500";
      if (timeLeft > 10) return "bg-yellow-500";
      return "bg-red-500";
    } else {
      return "bg-purple-500";
    }
  };
  
  return (
    <Card className="p-1.5 bg-gradient-to-r from-purple-100 to-green-100 shadow-sm w-full">
      <div className="flex items-center gap-1.5">
        <Hourglass className="h-4 w-4 text-purple-600" />
        <div className="flex-1">
          <div className="flex justify-between items-center text-xs mb-0.5">
            <span className="font-medium">{getTimerText()}</span>
          </div>
          <Progress 
            value={progressValue} 
            className={`h-1.5 bg-gray-200 ${getTimerColor()}`}
          />
        </div>
      </div>
    </Card>
  );
};

export default GameInfoHeader;
