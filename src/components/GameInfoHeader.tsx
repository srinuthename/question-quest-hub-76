
import { Card } from "@/components/ui/card";

interface GameInfoHeaderProps {
  questionIndex: number;
  totalQuestions: number;
  timeLeft: number;
  timerProgress: string;
}

const GameInfoHeader = ({ 
  questionIndex, 
  totalQuestions, 
  timeLeft,
  timerProgress 
}: GameInfoHeaderProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="p-4 flex items-center justify-center bg-gradient-to-r from-green-600/20 to-purple-600/20">
        <h2 className="text-xl font-semibold">
          Question {questionIndex} of {totalQuestions}
        </h2>
      </Card>
      
      <Card className="p-4 bg-gradient-to-r from-purple-600/20 to-green-600/20">
        <div className="timer">
          <div 
            className="timer-ring" 
            style={{ "--progress": timerProgress } as any} 
          />
          <span className="relative z-10">{timeLeft}s</span>
        </div>
      </Card>
    </div>
  );
};

export default GameInfoHeader;
