
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Hourglass, Clock } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface GameInfoHeaderProps {
  gameTitle?: string;
  gameStartedAt?: Date | string;
  isGameOpen?: boolean;
  questionIndex?: number;
  totalQuestions?: number;
  timeLeft?: number;
  timerProgress?: string;
  gameState?: string;
}

const GameInfoHeader = ({ 
  gameTitle,
  gameStartedAt,
  isGameOpen,
  questionIndex,
  totalQuestions,
  timeLeft = 0,
  timerProgress = "0%",
  gameState = "waiting"
}: GameInfoHeaderProps) => {
  const isMobile = useIsMobile();
  
  // Calculate progress percentage for the progress bar
  const progressValue = timerProgress ? parseInt(timerProgress.replace('%', '')) : 0;
  
  // Determine timer text based on game state
  const getTimerText = () => {
    if (gameState === 'question') {
      return isMobile ? `${timeLeft}s` : `Revealing answer in ${timeLeft}s`;
    } else if (gameState === 'reveal' || gameState === 'fastest') {
      return isMobile ? `${timeLeft}s` : `Next question in ${timeLeft}s`;
    }
    return `${timeLeft}s`;
  };
  
  // Determine color based on time left and game state
  const getTimerColor = () => {
    if (timeLeft > 15) return "bg-green-500";
    if (timeLeft > 10) return "bg-orange-500";
    return "bg-red-500";
  };

  // If we're displaying game info rather than timer
  if (gameTitle || questionIndex !== undefined) {
    return (
      <Card className={`p-${isMobile ? '2' : '3'} bg-gradient-to-r from-[#845ec2]/10 to-[#b0a8b9]/10 shadow-sm w-full`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#845ec2]">{gameTitle || "Game"}</h2>
            <div className="text-sm text-[#4b4453]">
              {isGameOpen ? "Active" : "Inactive"} • 
              {questionIndex !== undefined && totalQuestions !== undefined 
                ? ` Question ${questionIndex} of ${totalQuestions}`
                : " Not started"}
            </div>
          </div>
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-[#c34a36] mr-2" />
            <span className="text-sm text-[#4b4453]">
              {gameStartedAt 
                ? `Started: ${new Date(gameStartedAt).toLocaleTimeString()}` 
                : "Not started yet"}
            </span>
          </div>
        </div>
      </Card>
    );
  }
  
  // Default timer display
  return (
    <Card className={`p-${isMobile ? '1' : '2'} bg-gradient-to-r from-[#845ec2]/10 to-[#b0a8b9]/10 shadow-sm w-full`}>
      <div className="flex items-center gap-2">
        <Hourglass className={`h-${isMobile ? '4' : '5'} w-${isMobile ? '4' : '5'} text-[#845ec2]`} />
        <div className="flex-1">
          <div className="flex justify-between items-center text-sm mb-1">
            <span className="font-medium">{getTimerText()}</span>
          </div>
          <Progress 
            value={progressValue} 
            className={`h-2 bg-gray-200 ${getTimerColor()}`}
          />
        </div>
      </div>
    </Card>
  );
};

export default GameInfoHeader;
