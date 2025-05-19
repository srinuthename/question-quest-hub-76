
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useState } from "react";

interface FloatingAnswersPanelProps {
  answers: {
    ytChannelId: string;
    ytProfilePicUrl: string;
    userName: string;
    responseTime: number;
    answerIndex?: number;
  }[];
  visible: boolean;
}

const FloatingAnswersPanel = ({ answers, visible }: FloatingAnswersPanelProps) => {
  const [displayAnswers, setDisplayAnswers] = useState<any[]>([]);
  
  // Animation timing (in ms)
  const appearDelay = 500; // Half second between each answer appearing
  const floatDuration = parseInt(import.meta.env.VITE_FLOATING_ANSWER_DURATION || "8000");
  
  // Update display answers with animation delay
  useEffect(() => {
    if (!visible) return;
    
    // Process new answers one by one with delay
    const processAnswers = async () => {
      // Find new answers not yet in displayAnswers
      const newAnswers = answers.filter(
        (answer) => !displayAnswers.some(
          (displayAnswer) => displayAnswer.ytChannelId === answer.ytChannelId && 
                            displayAnswer.responseTime === answer.responseTime
        )
      );
      
      // Add each new answer with a delay
      for (let i = 0; i < newAnswers.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, appearDelay));
        setDisplayAnswers(prev => [newAnswers[i], ...prev]);
      }
    };
    
    processAnswers();
  }, [answers, visible]);
  
  if (!visible) return null;
  
  return (
    <div className="floating-answers-container">
      {displayAnswers.map((answer, index) => (
        <div 
          key={`${answer.ytChannelId}-${answer.responseTime}`}
          className="floating-answer animate-float-up"
          style={{ 
            animationDelay: `${index * 0.1}s`,
            opacity: Math.max(0.9 - (index * 0.06), 0.4), // Fade out older messages
            '--float-duration': `${floatDuration}ms`,
          } as React.CSSProperties}
        >
          <Avatar className="w-6 h-6">
            <AvatarImage 
              src={answer.ytProfilePicUrl} 
              alt={answer.userName} 
            />
            <AvatarFallback>{answer.userName.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="answer-username">{answer.userName}</span>
          {answer.answerIndex !== undefined && (
            <span className="answer-choice">
              {String.fromCharCode(65 + answer.answerIndex)}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default FloatingAnswersPanel;
