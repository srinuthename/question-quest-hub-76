
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
    <Card className="h-full overflow-hidden flex flex-col bg-gradient-to-br from-green-50 to-purple-50 shadow-md">
      <CardHeader className="pb-0 pt-3 px-4">
        <CardTitle className="text-2xl font-extrabold">Fastest Correct Answers</CardTitle>
        <CardDescription className="text-lg font-semibold">The quickest players who got it right!</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto space-y-2 px-3 pt-2">
        {fastestAnswers.length === 0 ? (
          <div className="text-center py-8 text-xl font-bold text-gray-500">
            No correct answers yet...
          </div>
        ) : (
          fastestAnswers.map((answer, index) => (
            <div 
              key={index} 
              className="answer-card bg-gradient-to-r from-green-100/90 to-green-50/90 py-2 animate-fade-in" 
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Avatar className={`${isMobile ? 'w-9 h-9' : 'w-12 h-12'} border-2 border-green-200`}>
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
                    <span className={`${isMobile ? 'text-sm' : 'text-base'} font-bold bg-green-200 px-3 py-1 rounded-full`}>
                      {String.fromCharCode(65 + answer.answerIndex)}
                    </span>
                  )}
                  <span className={`${isMobile ? 'text-sm' : 'text-base'} font-semibold text-gray-700`}>
                    {answer.responseTime}ms
                  </span>
                </div>
              </div>
              <Check className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} text-green-500`} />
            </div>
          ))
        )}
      </CardContent>

      <style>
        {`
        .answer-card {
          display: flex;
          align-items: center;
          padding: ${isMobile ? '0.5rem' : '0.75rem'};
          border-radius: 0.5rem;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
          animation: fade-in 0.3s ease-out forwards;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        `}
      </style>
    </Card>
  );
};

export default FastestAnswersPanel;
