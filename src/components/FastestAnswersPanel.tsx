
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Check } from "lucide-react";
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
          fastestAnswers.map((answer, index) => (
            <div 
              key={index} 
              className="answer-card bg-white/90 animate-fade-in" 
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Avatar className={`${isMobile ? 'w-5 h-5' : 'w-12 h-12'} border-2 border-[#0089ba] avatar-glow`}>
                <AvatarImage 
                  src={answer.ytProfilePicUrl} 
                  alt={answer.userName}
                />
                <AvatarFallback className="bg-[#0081cf] text-white">{answer.userName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-grow">
                <div className={`${isMobile ? 'text-xs' : 'text-xl'} font-bold truncate`}>{answer.userName}</div>
                <div className="flex gap-1 items-center">
                  {answer.answerIndex !== undefined && (
                    <span className={`${isMobile ? 'text-xs px-1 py-0' : 'text-base px-3 py-1'} font-bold bg-[#008f7a] text-white rounded-full shadow-sm`}>
                      {String.fromCharCode(65 + answer.answerIndex)}
                    </span>
                  )}
                  <span className={`${isMobile ? 'text-xs' : 'text-base'} font-semibold text-gray-700`}>
                    {answer.responseTime}ms
                  </span>
                </div>
              </div>
              <Check className={`${isMobile ? 'h-3 w-3' : 'h-8 w-8'} text-[#008f7a]`} />
            </div>
          ))
        )}
      </div>

      <style>{`
        .answer-card {
          display: flex;
          align-items: center;
          padding: ${isMobile ? '0.15rem' : '0.75rem'};
          border-radius: 0.5rem;
          gap: ${isMobile ? '0.25rem' : '0.75rem'};
          margin-bottom: ${isMobile ? '0.15rem' : '0.5rem'};
          animation: fade-in 0.3s ease-out forwards;
          border: 1px solid rgba(0, 137, 186, 0.2);
          box-shadow: 0 2px 8px rgba(0, 143, 155, 0.1);
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default FastestAnswersPanel;
