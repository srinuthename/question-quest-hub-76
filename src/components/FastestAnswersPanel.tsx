
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
      <CardHeader className={`${isMobile ? 'p-1' : 'pb-0 pt-3 px-4'}`}>
        <CardTitle className={`${isMobile ? 'text-lg' : 'text-2xl'} font-extrabold`}>Fastest Correct</CardTitle>
      </CardHeader>
      <CardContent className={`flex-grow overflow-y-auto ${isMobile ? 'space-y-1 px-1 pt-1' : 'space-y-2 px-3 pt-2'}`}>
        {fastestAnswers.length === 0 ? (
          <div className="text-center py-2 text-lg font-bold text-gray-500">
            No correct answers yet
          </div>
        ) : (
          fastestAnswers.map((answer, index) => (
            <div 
              key={index} 
              className="answer-card bg-gradient-to-r from-green-100/90 to-green-50/90 animate-fade-in" 
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Avatar className={`${isMobile ? 'w-6 h-6' : 'w-12 h-12'} border-2 border-green-200`}>
                <AvatarImage 
                  src={answer.ytProfilePicUrl} 
                  alt={answer.userName}
                />
                <AvatarFallback>{answer.userName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-grow">
                <div className={`${isMobile ? 'text-xs' : 'text-xl'} font-bold truncate`}>{answer.userName}</div>
                <div className="flex gap-1 items-center">
                  {answer.answerIndex !== undefined && (
                    <span className={`${isMobile ? 'text-xs px-1.5 py-0' : 'text-base px-3 py-1'} font-bold bg-green-200 rounded-full`}>
                      {String.fromCharCode(65 + answer.answerIndex)}
                    </span>
                  )}
                  <span className={`${isMobile ? 'text-xs' : 'text-base'} font-semibold text-gray-700`}>
                    {answer.responseTime}ms
                  </span>
                </div>
              </div>
              <Check className={`${isMobile ? 'h-4 w-4' : 'h-8 w-8'} text-green-500`} />
            </div>
          ))
        )}
      </CardContent>

      <style>
        {`
        .answer-card {
          display: flex;
          align-items: center;
          padding: ${isMobile ? '0.25rem' : '0.75rem'};
          border-radius: 0.5rem;
          gap: ${isMobile ? '0.3rem' : '0.75rem'};
          margin-bottom: ${isMobile ? '0.2rem' : '0.5rem'};
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
