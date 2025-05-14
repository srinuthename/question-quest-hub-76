
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Check } from "lucide-react";

interface FastestAnswersPanelProps {
  fastestAnswers: {
    ytProfilePicUrl: string;
    ytChannelId: string;
    userName: string;
    responseTime: number;
    answerIndex?: number;
  }[];
}

const FastestAnswersPanel = ({ fastestAnswers }: FastestAnswersPanelProps) => {
  return (
    <Card className="h-full overflow-hidden flex flex-col bg-gradient-to-br from-green-50 to-purple-50 shadow-md">
      <CardHeader className="pb-0 pt-3 px-4">
        <CardTitle className="text-xl font-semibold">Fastest Correct Answers</CardTitle>
        <CardDescription className="text-sm">The quickest players who got it right!</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto space-y-0.5 px-3 pt-1">
        {fastestAnswers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No correct answers yet...
          </div>
        ) : (
          fastestAnswers.map((answer, index) => (
            <div 
              key={index} 
              className="answer-card bg-gradient-to-r from-green-100/70 to-green-50/70" 
              style={{ animationDelay: `${index * 0.1}s` }}
            >
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
                    <span className="text-xs font-medium bg-green-100 px-1.5 py-0.5 rounded-full">
                      {String.fromCharCode(65 + answer.answerIndex)}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {answer.responseTime}ms
                  </span>
                </div>
              </div>
              <Check className="h-4 w-4 text-green-500" />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default FastestAnswersPanel;
