
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useRef } from "react";

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
  
  useEffect(() => {
    // This will track if the answers array was reset (new question)
    if (answers.length < prevAnswersCountRef.current) {
      console.log("Answers were reset for new question");
    }
    prevAnswersCountRef.current = answers.length;
  }, [answers]);
  
  return (
    <div className="h-full overflow-y-auto space-y-0.5">
      {answers.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          Waiting for answers...
        </div>
      ) : (
        answers.map((answer, index) => (
          <div key={index} className="answer-card bg-white/80" style={{ animationDelay: `${index * 0.1}s` }}>
            <Avatar className="w-7 h-7">
              <AvatarImage 
                src={answer.ytProfilePicUrl} 
                alt={answer.userName} 
              />
              <AvatarFallback>{answer.userName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-grow">
              <div className="font-medium text-sm">{answer.userName}</div>
              <div className="flex gap-1 items-center">
                {answer.answerIndex !== undefined && (
                  <span className="text-xs font-medium bg-purple-100 px-1.5 py-0.5 rounded-full">
                    {String.fromCharCode(65 + answer.answerIndex)}
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  {answer.responseTime}ms
                </span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AnswersPanel;
