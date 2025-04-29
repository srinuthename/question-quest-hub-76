
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AnswersPanelProps {
  answers: {
    ytProfilePicUrl: string;
    userName: string;
    responseTime: number;
  }[];
}

const AnswersPanel = ({ answers }: AnswersPanelProps) => {
  return (
    <Card className="h-full overflow-hidden flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold">Live Answers</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto space-y-2">
        {answers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Waiting for answers...
          </div>
        ) : (
          answers.map((answer, index) => (
            <div key={index} className="answer-card" style={{ animationDelay: `${index * 0.1}s` }}>
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
