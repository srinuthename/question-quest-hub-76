
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check } from "lucide-react";

interface FastestAnswersPanelProps {
  fastestAnswers: {
    ytProfilePicUrl: string;
    userName: string;
    responseTime: number;
  }[];
}

const FastestAnswersPanel = ({ fastestAnswers }: FastestAnswersPanelProps) => {
  return (
    <Card className="h-full overflow-hidden flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold">Fastest Correct Answers</CardTitle>
        <CardDescription>The quickest players who got it right!</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto space-y-2">
        {fastestAnswers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No correct answers yet...
          </div>
        ) : (
          fastestAnswers.map((answer, index) => (
            <div 
              key={index} 
              className="answer-card bg-gradient-to-r from-green-500/20 to-green-400/10" 
              style={{ animationDelay: `${index * 0.1}s` }}
            >
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
              <Check className="h-5 w-5 text-green-500" />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default FastestAnswersPanel;
