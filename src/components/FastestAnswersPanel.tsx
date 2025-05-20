
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Check, Clock } from "lucide-react";
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

  if (!visible) return null;
  
  return (
    <div className="h-full overflow-hidden flex flex-col glass-card shadow-md rounded-lg">
      <div className={`${isMobile ? 'p-1' : 'pb-0 pt-3 px-4'}`}>
        <h3 className={`${isMobile ? 'text-sm' : 'text-2xl'} font-extrabold text-white drop-shadow-md`}>Fastest Correct</h3>
      </div>
      <div className={`flex-grow overflow-y-auto ${isMobile ? 'px-1 pt-1' : 'px-3 pt-2'}`}>
        {fastestAnswers.length === 0 ? (
          <div className="text-center py-2 text-sm font-bold text-white glass-card-dark rounded-md p-2">
            No correct answers yet
          </div>
        ) : (
          <div className={isMobile ? "flex flex-col" : "grid grid-cols-2 gap-2"}>
            {fastestAnswers.map((answer, index) => (
              <div 
                key={index} 
                className="answer-card" 
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Avatar className={`${isMobile ? 'w-5 h-5' : 'w-12 h-12'} border-2 border-[#b0a8b9] avatar-glow`}>
                  <AvatarImage 
                    src={answer.ytProfilePicUrl} 
                    alt={answer.userName}
                  />
                  <AvatarFallback className="bg-[#845ec2] text-white">{answer.userName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                  <div className={`${isMobile ? 'text-xs' : 'text-xl'} font-bold truncate`}>{answer.userName}</div>
                  <div className="flex gap-1 items-center">
                    {answer.answerIndex !== undefined && (
                      <span className={`${isMobile ? 'text-xs px-1 py-0' : 'text-base px-3 py-1'} font-bold bg-[#c34a36] text-white rounded-full shadow-sm`}>
                        {String.fromCharCode(65 + answer.answerIndex)}
                      </span>
                    )}
                    <Clock className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-gray-400 mr-1`} />
                    <span className={`${isMobile ? 'text-xs' : 'text-base'} font-semibold text-gray-700`}>
                      {answer.responseTime}ms
                    </span>
                  </div>
                </div>
                <Check className={`${isMobile ? 'h-3 w-3' : 'h-8 w-8'} text-green-500`} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FastestAnswersPanel;
