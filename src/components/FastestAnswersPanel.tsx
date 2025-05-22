
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Check, Clock, Award } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface FastestAnswersPanelProps {
  fastestAnswers?: {
    ytProfilePicUrl: string;
    ytChannelId: string;
    userName: string;
    responseTime: number;
    answerIndex?: number;
  }[];
  visible?: boolean;
}

const FastestAnswersPanel = ({ fastestAnswers = [], visible = true }: FastestAnswersPanelProps) => {
  const isMobile = useIsMobile();
  const QUESTION_TIMER_MS = parseInt(import.meta.env.VITE_QUESTION_TIMER || '30') * 1000;

  // Calculate score based on response time
  const calculateScore = (responseTime: number) => {
    return Math.round((1 + (QUESTION_TIMER_MS - responseTime) / QUESTION_TIMER_MS) * 1000);
  };

  if (!visible) return null;
  
  return (
    <div className="h-full overflow-hidden flex flex-col glass-card shadow-md rounded-lg">
      <div className={`${isMobile ? 'p-1' : 'pb-0 pt-3 px-4'}`}>
        <h3 className={`${isMobile ? 'text-sm' : 'text-2xl'} font-extrabold text-white`}>Fastest Correct</h3>
      </div>
      <div className={`flex-grow overflow-y-auto ${isMobile ? 'px-1 pt-1' : 'px-3 pt-2'}`}>
        {fastestAnswers.length === 0 ? (
          <div className="text-center py-2 text-sm font-bold text-white glass-card-dark rounded-md p-2">
            No correct answers yet
          </div>
        ) : (
          <div className={`${!isMobile ? 'grid grid-cols-2 gap-2' : 'flex flex-col'}`}>
            {fastestAnswers.map((answer, index) => {
              const score = calculateScore(answer.responseTime);
              return (
                <div 
                  key={index} 
                  className={`flex items-center ${isMobile ? 'p-2 mb-1' : 'p-2 mb-1'} rounded-lg bg-gradient-to-r from-[#0EA5E9]/20 to-[#8B5CF6]/20 border-2 border-[#8B5CF6]/30 shadow-md animate-fade-in`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center flex-1">
                    <div className={`${isMobile ? 'mr-1' : 'mr-3'}`}>
                      <div className={`w-${isMobile ? '5' : '6'} h-${isMobile ? '5' : '6'} rounded-full bg-gradient-to-r from-[#F97316] to-[#D946EF] flex items-center justify-center text-white font-bold`}>
                        {index + 1}
                      </div>
                    </div>
                    <Avatar className={`${isMobile ? 'w-7 h-7' : 'w-12 h-12'} border-2 border-[#0EA5E9] avatar-glow`}>
                      <AvatarImage 
                        src={answer.ytProfilePicUrl} 
                        alt={answer.userName}
                      />
                      <AvatarFallback className="bg-[#8B5CF6] text-white">{answer.userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow ml-2">
                      <div className={`${isMobile ? 'text-xs' : 'text-base'} font-bold truncate text-white`}>{answer.userName}</div>
                      <div className="flex flex-wrap gap-1 items-center">
                        <div className={`flex items-center ${isMobile ? 'text-xs' : 'text-sm'} text-white`}>
                          <Clock className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} mr-0.5 text-[#F97316]`} />
                          <span>{answer.responseTime}ms</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center">
                      <Award className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-yellow-500 mr-1`} />
                      <span className={`${isMobile ? 'text-xs' : 'text-base'} font-extrabold text-white`}>{score}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FastestAnswersPanel;
