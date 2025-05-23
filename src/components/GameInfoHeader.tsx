
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
    if (timeLeft > 15) return "bg-emerald-500";
    if (timeLeft > 10) return "bg-amber-500";
    return "bg-rose-500";
  };

  // If we're displaying game info rather than timer
  if (gameTitle || questionIndex !== undefined) {
    return (
      <Card className={`p-${isMobile ? '2' : '3'} bg-slate-800 shadow-md w-full border-slate-700`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">{gameTitle || "Game"}</h2>
            <div className="text-sm text-slate-200">
              {isGameOpen ? "Active" : "Inactive"} • 
              {questionIndex !== undefined && totalQuestions !== undefined 
                ? ` Question ${questionIndex} of ${totalQuestions}`
                : " Not started"}
            </div>
          </div>
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-slate-300 mr-2" />
            <span className="text-sm text-slate-200">
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
    <Card className={`p-${isMobile ? '1' : '2'} bg-slate-800 shadow-md w-full border-slate-700`}>
      <div className="flex items-center gap-2">
        <Hourglass className={`h-${isMobile ? '4' : '5'} w-${isMobile ? '4' : '5'} text-white`} />
        <div className="flex-1">
          <div className="flex justify-between items-center text-sm mb-1">
            <span className="font-medium text-white">{getTimerText()}</span>
          </div>
          <Progress 
            value={progressValue} 
            className={`h-2 bg-slate-700 ${getTimerColor()}`}
          />
        </div>
      </div>
    </Card>
  );
};

export default GameInfoHeader;
