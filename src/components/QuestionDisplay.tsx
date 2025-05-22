
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Define timing variables from environment variables
const DISPLAY_SWITCH_INTERVAL = parseInt(import.meta.env.VITE_DISPLAY_SWITCH_INTERVAL || '5000'); // Time to switch between image and options (changed to 5 seconds)
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
  const [storedAnswers, setStoredAnswers] = useState<typeof answers>([]);

  // Group answers by choice index
  const answersByChoice = (gameState === 'answer' ? storedAnswers : answers).reduce((acc, answer) => {
    if (answer.answerIndex !== undefined) {
      if (!acc[answer.answerIndex]) {
        acc[answer.answerIndex] = [];
      }
      acc[answer.answerIndex].push(answer);
    }
    return acc;
  }, {} as Record<number, typeof answers>);

  // Store answers when transitioning to answer reveal state
  useEffect(() => {
    if (gameState === 'answer' && answers.length > 0) {
      setStoredAnswers(answers);
    }
  }, [gameState, answers]);

  // Timer to switch between image and options on mobile
  useEffect(() => {
    // Only activate the alternating display if we're on mobile and have an image
    if (isMobile && question?.questionImageUrl && (gameState === 'question')) {
      const interval = setInterval(() => {
        setShowImage(prev => !prev);
      }, DISPLAY_SWITCH_INTERVAL);

      return () => clearInterval(interval);
    }

    // If not mobile or no image, always show both
    if (!isMobile || !question?.questionImageUrl) {
      setShowImage(true);
    }
    
    // In mobile view when answer is revealed, don't show the image
    if (isMobile && gameState === 'answer') {
      setShowImage(false);
    }
  }, [isMobile, question, gameState]);

  if (!visible) {
    return null;
  }

  if (!question) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-3xl font-bold text-white">
          Waiting for the next question...
        </p>
      </div>
    );
  }

  const questionWithNumber = questionIndex && totalQuestions
    ? `Q. ${questionIndex}/${totalQuestions}) ${question.questionText}`
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

  // In mobile view for answer state, just show the options with correct answer highlighted
  if (isMobile && gameState === 'answer') {
    return (
      <div className="h-full rounded-lg shadow-md glass-card">
        <div className="p-4 h-full">
          <h2 className="text-xl sm:text-2xl font-extrabold mb-4 text-white drop-shadow-md">
            {questionWithNumber}
          </h2>

          <div className="grid grid-cols-1 gap-4">
            {question.choices.map((choice) => (
              <div
                key={choice.choiceIndex}
                className={`choice-container ${getChoiceClass(choice.choiceIndex)}`}
                style={{ display: choice.choiceIndex === correctIndex ? 'flex' : 'none' }}
              >
                <div className={`choice-btn flex items-center ${getChoiceClass(choice.choiceIndex)}`}>
                  <span className="text-3xl font-extrabold mr-3 text-white">
                    {String.fromCharCode(65 + choice.choiceIndex)}
                  </span>
                  <span className="text-xl font-bold text-white">{choice.choiceText}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full rounded-lg shadow-md glass-card">
      <div className="p-4 h-full">
        <h2 className={`${isMobile ? 'text-lg sm:text-xl' : 'text-3xl sm:text-4xl'} font-extrabold mb-4 text-white drop-shadow-md`}>
          {questionWithNumber}
        </h2>

        {isMobile ? (
          // Mobile layout with alternating view
          <div className="h-[calc(100%-5rem)]">
            {showImage && question.questionImageUrl ? (
              // Image view
              <div className="flex flex-col h-full justify-center transition-all duration-500">
                <img
                  src={question.questionImageUrl}
                  alt="Question"
                  className="w-full h-auto max-h-full object-contain rounded-lg shadow-lg"
                />
              </div>
            ) : (
              // Options view - now stacked in a single column
              <div className="grid grid-cols-1 gap-3 h-full transition-all duration-500">
                {question.choices.map((choice) => (
                  <div
                    key={choice.choiceIndex}
                    className={`choice-container ${getChoiceClass(choice.choiceIndex)}`}
                  >
                    <div className={`choice-btn flex items-center ${getChoiceClass(choice.choiceIndex)}`}>
                      <span className="text-2xl font-extrabold mr-2 text-white">
                        {String.fromCharCode(65 + choice.choiceIndex)}
                      </span>
                      <span className="text-lg font-bold text-white">{choice.choiceText}</span>
                    </div>
                    
                    {/* User avatars for this choice - no usernames displayed */}
                    <div className="avatars-container mt-1">
                      {answersByChoice[choice.choiceIndex] && answersByChoice[choice.choiceIndex].length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {answersByChoice[choice.choiceIndex].map((answer, idx) => (
                            <Avatar 
                              key={`${answer.ytChannelId}-${idx}`} 
                              className="w-6 h-6 border-2 border-white/30"
                            >
                              <AvatarImage 
                                src={answer.ytProfilePicUrl} 
                                alt={answer.userName} 
                              />
                              <AvatarFallback>{answer.userName.charAt(0)}</AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-white/50 italic">No answers yet</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Desktop layout
          <div className={`grid ${gameState === 'answer' ? 'grid-cols-2' : 'grid-cols-3'} gap-6 h-[calc(100%-5rem)]`}>
            {/* Image section - takes 1/3 of the width in question state, not shown in answer state */}
            {question.questionImageUrl && (gameState !== 'answer' || !isMobile) && (
              <div className="flex flex-col">
                <img
                  src={question.questionImageUrl}
                  alt="Question"
                  className="w-full h-auto object-contain rounded-lg shadow-lg mb-4"
                />
              </div>
            )}

            {/* Options section - modify to take full width and span all columns when no image */}
            <div className={`${gameState === 'answer' ? 'grid grid-cols-1 gap-4' : 'grid grid-cols-2 gap-4'} 
                          ${question.questionImageUrl && gameState !== 'answer' 
                            ? 'col-span-2' 
                            : (!question.questionImageUrl && gameState !== 'answer' ? 'col-span-3' : 'col-span-1')}`}>
              {question.choices.map((choice) => (
                <div
                  key={choice.choiceIndex}
                  className={`choice-container ${getChoiceClass(choice.choiceIndex)}`}
                  style={{
                    display: gameState === 'answer' && choice.choiceIndex !== correctIndex ? 'none' : 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div className={`choice-btn flex items-center ${getChoiceClass(choice.choiceIndex)}`}>
                    <span className="text-3xl font-extrabold mr-3 text-white">
                      {String.fromCharCode(65 + choice.choiceIndex)}
                    </span>
                    <span className="text-xl font-bold text-white">{choice.choiceText}</span>
                  </div>
                  
                  {/* User avatars for this choice - no usernames displayed */}
                  <div className="avatars-container mt-2">
                    {answersByChoice[choice.choiceIndex] && answersByChoice[choice.choiceIndex].length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {answersByChoice[choice.choiceIndex].map((answer, idx) => (
                          <Avatar 
                            key={`${answer.ytChannelId}-${idx}`} 
                            className="w-8 h-8 border-2 border-white/30 avatar-glow"
                          >
                            <AvatarImage 
                              src={answer.ytProfilePicUrl} 
                              alt={answer.userName} 
                            />
                            <AvatarFallback>{answer.userName.charAt(0)}</AvatarFallback>
                          </Avatar>
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
        )}
      </div>
    </div>
  );
};

export default QuestionDisplay;
