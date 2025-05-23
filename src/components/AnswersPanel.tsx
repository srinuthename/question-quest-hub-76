
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
    <div className="h-full overflow-hidden flex flex-col shadow-md rounded-lg glass-card">
      <div className={`${isMobile ? 'p-1' : 'pb-0 pt-3 px-4'}`}>
        <h3 className={`${isMobile ? 'text-sm' : 'text-2xl'} font-extrabold text-white drop-shadow-md`}>Live Answers</h3>
      </div>
      <div className={`flex-grow overflow-y-auto ${isMobile ? 'px-1 pt-1' : 'px-3 pt-2'}`}>
        {answers.length === 0 ? (
          <div className="text-center py-2 text-white font-bold text-sm glass-card-dark rounded-md p-2">
            Waiting for answers...
          </div>
        ) : (
          <div className={`space-y-${isMobile ? '0.5' : '2'}`}>
            {answers.map((answer, index) => (
              <div
                key={index}
                className="answer-card animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <Avatar className={`${isMobile ? 'w-6 h-6' : 'w-12 h-12'} border border-slate-600`}>
                  <AvatarImage
                    src={answer.ytProfilePicUrl}
                    alt={answer.userName}
                  />
                  <AvatarFallback className="bg-slate-700 text-white">{answer.userName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                  <div className={`${isMobile ? 'text-xs' : 'text-xl'} font-bold truncate text-white`}>{answer.userName}</div>
                  <div className="flex gap-1 items-center">
                    {answer.answerIndex !== undefined && (
                      <span className={`${isMobile ? 'text-xs px-1 py-0' : 'text-base px-3 py-1'} font-bold bg-slate-700 text-white rounded-full shadow-sm`}>
                        {String.fromCharCode(65 + answer.answerIndex)}
                      </span>
                    )}
                    <span className={`${isMobile ? 'text-xs' : 'text-base'} font-semibold text-white`}>
                      {answer.responseTime}ms
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnswersPanel;
