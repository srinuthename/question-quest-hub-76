
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
    <div className="h-full overflow-y-auto bg-white/20 rounded-lg p-2">
      {answers.length === 0 ? (
        <div className="text-center py-8 text-white font-bold text-xl">
          Waiting for answers...
        </div>
      ) : (
        <div className="space-y-2">
          {answers.map((answer, index) => (
            <div 
              key={index} 
              className="answer-card bg-white/80" 
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Avatar className={`${isMobile ? 'w-9 h-9' : 'w-12 h-12'}`}>
                <AvatarImage 
                  src={answer.ytProfilePicUrl} 
                  alt={answer.userName} 
                />
                <AvatarFallback>{answer.userName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-grow">
                <div className={`${isMobile ? 'text-base' : 'text-xl'} font-bold`}>{answer.userName}</div>
                <div className="flex gap-2 items-center">
                  {answer.answerIndex !== undefined && (
                    <span className={`${isMobile ? 'text-sm' : 'text-base'} font-bold bg-purple-100 px-3 py-1 rounded-full`}>
                      {String.fromCharCode(65 + answer.answerIndex)}
                    </span>
                  )}
                  <span className={`${isMobile ? 'text-sm' : 'text-base'} font-semibold text-gray-700`}>
                    {answer.responseTime}ms
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnswersPanel;
