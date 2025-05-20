
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Define timing variables from environment variables
const DISPLAY_SWITCH_INTERVAL = parseInt(import.meta.env.VITE_DISPLAY_SWITCH_INTERVAL || '3000'); // Time to switch between image and options
const DISPLAY_TRANSITION_DURATION = parseInt(import.meta.env.VITE_DISPLAY_TRANSITION_DURATION || '500'); // Duration of the fade transition

interface QuestionDisplayProps {
  question: {
    questionText: string;
    questionImageUrl?: string;
    choices: {
      choiceIndex: number;
      choiceText: string;
    }[];
  } | null;
  correctIndex: number | null;
  gameState: string;
  visible: boolean;
  questionIndex?: number;
  totalQuestions?: number;
  answers?: {
    ytChannelId: string;
    ytProfilePicUrl: string;
    userName: string;
    responseTime: number;
    answerIndex?: number;
  }[];
}

const QuestionDisplay = ({ 
  question, 
  correctIndex, 
  gameState, 
  visible, 
  questionIndex, 
  totalQuestions,
  answers = []
}: QuestionDisplayProps) => {
  const isMobile = useIsMobile();
  const [showImage, setShowImage] = useState<boolean>(true);

  // Group answers by choice index
  const answersByChoice = answers.reduce((acc, answer) => {
    if (answer.answerIndex !== undefined) {
      if (!acc[answer.answerIndex]) {
        acc[answer.answerIndex] = [];
      }
      acc[answer.answerIndex].push(answer);
    }
    return acc;
  }, {} as Record<number, typeof answers>);

  // Timer to switch between image and options on mobile
  useEffect(() => {
    // Only activate the alternating display if we're on mobile and have an image
    if (isMobile && question?.questionImageUrl && gameState === 'question') {
      const interval = setInterval(() => {
        setShowImage(prev => !prev);
      }, DISPLAY_SWITCH_INTERVAL);

      return () => clearInterval(interval);
    }

    // If not mobile or no image, always show both
    if (!isMobile || !question?.questionImageUrl) {
      setShowImage(true);
    }
  }, [isMobile, question, gameState]);

  if (!visible) {
    return null;
  }

  if (!question) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-3xl font-bold text-white/80">
          Waiting for the next question...
        </p>
      </div>
    );
  }

  const questionWithNumber = questionIndex && totalQuestions
    ? `${questionIndex}/${totalQuestions} ${question.questionText}`
    : question.questionText;

  // Helper function to determine choice class
  const getChoiceClass = (choiceIndex: number) => {
    if (correctIndex === null || gameState === 'question') {
      return '';
    }

    if (choiceIndex === correctIndex) {
      return 'correct';
    } else {
      return 'incorrect';
    }
  };

  return (
    <div className="h-full rounded-lg shadow-md glass-card">
      <div className="p-4 h-full">
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-white drop-shadow-md">
          {questionWithNumber}
        </h2>

        <div className="grid grid-cols-3 gap-6 h-[calc(100%-5rem)]">
          {/* Image section - takes 1/3 of the width */}
          {question.questionImageUrl && (
            <div className="flex flex-col">
              <img
                src={question.questionImageUrl}
                alt="Question"
                className="w-full h-auto object-contain rounded-lg shadow-lg mb-4"
              />
            </div>
          )}

          {/* Options section - takes 2/3 of the width if image exists, otherwise full width */}
          <div className={`grid grid-cols-2 gap-4 ${question.questionImageUrl ? 'col-span-2' : 'col-span-3'}`}>
            {question.choices.map((choice) => (
              <div
                key={choice.choiceIndex}
                className={`choice-container ${getChoiceClass(choice.choiceIndex)}`}
              >
                <div className={`choice-btn flex items-center ${getChoiceClass(choice.choiceIndex)}`}>
                  <span className="text-3xl font-extrabold mr-3 text-white">
                    {String.fromCharCode(65 + choice.choiceIndex)}
                  </span>
                  <span className="text-xl font-bold text-white">{choice.choiceText}</span>
                </div>
                
                {/* User avatars for this choice */}
                <div className="avatars-container mt-2">
                  {answersByChoice[choice.choiceIndex] && answersByChoice[choice.choiceIndex].length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {answersByChoice[choice.choiceIndex].map((answer, idx) => (
                        <div key={`${answer.ytChannelId}-${idx}`} className="avatar-tooltip">
                          <Avatar className="w-8 h-8 border-2 border-white/30">
                            <AvatarImage 
                              src={answer.ytProfilePicUrl} 
                              alt={answer.userName} 
                            />
                            <AvatarFallback>{answer.userName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="tooltip-text">{answer.userName}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-white/50 italic">No answers yet</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Replace the style jsx tag with regular CSS classes that are already in App.css */}
    </div>
  );
};

export default QuestionDisplay;
