
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Hourglass } from "lucide-react";

interface GameInfoHeaderProps {
  questionIndex: number;
  totalQuestions: number;
  timeLeft: number;
  timerProgress: string;
  gameState: string;
}

const GameInfoHeader = ({ 
  questionIndex, 
  totalQuestions, 
  timeLeft,
  timerProgress,
  gameState
}: GameInfoHeaderProps) => {
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
  
  // Determine color based on time left
  const getTimerColor = () => {
    if (timeLeft > 15) return "bg-green-500";
    if (timeLeft > 10) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
      <Card className="p-2 flex items-center justify-center bg-gradient-to-r from-green-100 to-purple-100 shadow-sm">
        <h2 className="text-lg font-semibold">
          Question {questionIndex} of {totalQuestions}
        </h2>
      </Card>
      
      <Card className="p-2 bg-gradient-to-r from-purple-100 to-green-100 shadow-sm">
        <div className="flex items-center gap-2">
          <Hourglass className="h-5 w-5 text-purple-600" />
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
    </div>
  );
};

export default GameInfoHeader;
