
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useRef, useState } from "react";
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

const AnswersPanel = ({ answers }: AnswersPanelProps) => {
  const prevAnswersCountRef = useRef(0);
  const isMobile = useIsMobile();
  const [displayedAnswers, setDisplayedAnswers] = useState<any[]>([]);
  const queuedAnswersRef = useRef<any[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // This will track if the answers array was reset (new question)
    if (answers.length < prevAnswersCountRef.current) {
      console.log("Answers were reset for new question");
      setDisplayedAnswers([]);
      queuedAnswersRef.current = [];
      if (timerRef.current) clearInterval(timerRef.current);
    } else if (answers.length > prevAnswersCountRef.current) {
      // Add only new answers to the queue
      const newAnswers = answers.slice(prevAnswersCountRef.current);
      queuedAnswersRef.current = [...queuedAnswersRef.current, ...newAnswers];
      
      // Start the timer if not already running
      if (!timerRef.current) {
        timerRef.current = setInterval(() => {
          if (queuedAnswersRef.current.length > 0) {
            const nextAnswer = queuedAnswersRef.current.shift();
            setDisplayedAnswers(prev => [nextAnswer, ...prev]);
          } else if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
        }, 500); // Add one answer every half second
      }
    }
    
    prevAnswersCountRef.current = answers.length;
    
    // Cleanup
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [answers]);
  
  return (
    <Card className="h-full overflow-hidden flex flex-col bg-gradient-to-br from-purple-50 to-green-50 shadow-md">
      <CardHeader className="pb-0 pt-1.5 px-2">
        <CardTitle className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold`}>Live Answers</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto space-y-0.5 pt-1 px-2">
        {displayedAnswers.length === 0 ? (
          <div className="text-center py-2 text-muted-foreground text-sm">
            Waiting for answers...
          </div>
        ) : (
          displayedAnswers.map((answer, index) => (
            <div 
              key={index} 
              className="answer-card bg-white/80" 
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Avatar className="w-7.5 h-7.5">
                <AvatarImage 
                  src={answer.ytProfilePicUrl} 
                  alt={answer.userName} 
                />
                <AvatarFallback>{answer.userName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-grow">
                <div className="font-medium text-xs">{answer.userName}</div>
                <div className="flex gap-1 items-center">
                  {answer.answerIndex !== undefined && (
                    <span className="text-xs font-medium bg-purple-100 px-1 py-0.5 rounded-full">
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
      </CardContent>
    </Card>
  );
};

export default AnswersPanel;
