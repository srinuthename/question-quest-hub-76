
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useRef } from "react";

interface AnswersPanelProps {
  answers: {
    ytProfilePicUrl: string;
    userName: string;
    responseTime: number;
  }[];
}

const AnswersPanel = ({ answers }: AnswersPanelProps) => {
  const prevAnswersCountRef = useRef(0);
  
  useEffect(() => {
    // This will track if the answers array was reset (new question)
    if (answers.length < prevAnswersCountRef.current) {
      console.log("Answers were reset for new question");
    }
    prevAnswersCountRef.current = answers.length;
  }, [answers]);
  
  return (
    <Card className="h-full overflow-hidden flex flex-col bg-gradient-to-br from-purple-50 to-green-50 shadow-md">
      <CardHeader className="pb-1">
        <CardTitle className="text-xl font-semibold">Live Answers</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto space-y-1 pt-1">
        {answers.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            Waiting for answers...
          </div>
        ) : (
          answers.map((answer, index) => (
            <div key={index} className="answer-card bg-white/80" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="avatar-sm">
                <img 
                  src={answer.ytProfilePicUrl} 
                  alt={answer.userName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default';
                  }}
                />
              </div>
              <div className="flex-grow">
                <div className="font-medium">{answer.userName}</div>
                <div className="text-xs text-muted-foreground">
                  Response time: {answer.responseTime}ms
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
