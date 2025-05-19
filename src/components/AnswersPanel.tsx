
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface AnswersPanelProps {
  answers: {
    ytChannelId: string;
    ytProfilePicUrl: string;
    userName: string;
    responseTime: number;
    answerIndex?: number;
  }[];
}

const AnswersPanel = ({ answers = [] }: AnswersPanelProps) => {
  const prevAnswersCountRef = useRef(0);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // This will track if the answers array was reset (new question)
    if (answers.length < prevAnswersCountRef.current) {
      console.log("Answers were reset for new question");
    }
    prevAnswersCountRef.current = answers.length;
  }, [answers]);
  
  return (
    <div className="h-full overflow-y-auto bg-white/20 rounded-lg p-1">
      {answers.length === 0 ? (
        <div className="text-center py-4 text-white font-bold text-lg">
          Waiting for answers...
        </div>
      ) : (
        <div className={`space-y-${isMobile ? '1' : '2'}`}>
          {answers.map((answer, index) => (
            <div 
              key={index} 
              className="answer-card bg-white/80 animate-fade-in" 
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <Avatar className={`${isMobile ? 'w-7 h-7' : 'w-12 h-12'}`}>
                <AvatarImage 
                  src={answer.ytProfilePicUrl} 
                  alt={answer.userName} 
                />
                <AvatarFallback>{answer.userName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-grow">
                <div className={`${isMobile ? 'text-sm' : 'text-xl'} font-bold truncate`}>{answer.userName}</div>
                <div className="flex gap-1 items-center">
                  {answer.answerIndex !== undefined && (
                    <span className={`${isMobile ? 'text-xs px-2 py-0.5' : 'text-base px-3 py-1'} font-bold bg-purple-100 rounded-full`}>
                      {String.fromCharCode(65 + answer.answerIndex)}
                    </span>
                  )}
                  <span className={`${isMobile ? 'text-xs' : 'text-base'} font-semibold text-gray-700`}>
                    {answer.responseTime}ms
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>
        {`
        .answer-card {
          display: flex;
          align-items: center;
          padding: ${isMobile ? '0.35rem' : '0.75rem'};
          border-radius: 0.5rem;
          gap: ${isMobile ? '0.4rem' : '0.75rem'};
          margin-bottom: ${isMobile ? '0.25rem' : '0.5rem'};
          animation: fade-in 0.3s ease-out forwards;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        `}
      </style>
    </div>
  );
};

export default AnswersPanel;
