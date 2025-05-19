
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

// Define timing variables (in milliseconds)
const DISPLAY_SWITCH_INTERVAL = 4000; // Time to switch between image and options (4 seconds)
const DISPLAY_TRANSITION_DURATION = 500; // Duration of the fade transition (0.5 seconds)

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
}

const QuestionDisplay = ({ question, correctIndex, gameState, visible, questionIndex, totalQuestions }: QuestionDisplayProps) => {
  const isMobile = useIsMobile();
  const [showImage, setShowImage] = useState<boolean>(true);
  
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
      <Card className="h-full flex items-center justify-center bg-gradient-to-br from-purple-200/50 to-green-200/50 shadow-md">
        <CardContent className="text-center py-16">
          <p className="text-2xl font-semibold text-muted-foreground">
            Waiting for the next question...
          </p>
        </CardContent>
      </Card>
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
      return 'bg-green-100 border-green-500 text-green-800';
    } else {
      return 'bg-red-50 border-red-300 text-red-800 opacity-60';
    }
  };

  return (
    <Card className="bg-gradient-to-br from-purple-100/70 to-green-100/70 border-purple-200 shadow-md">
      <CardHeader className="pb-1">
        <CardTitle className="text-xl font-bold">
          {questionWithNumber}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 px-4 pt-0 pb-4">
        {question.questionImageUrl ? (
          isMobile ? (
            // Mobile layout with alternating content
            <div className="grid grid-cols-1 gap-3">
              {/* Image section with fade transition */}
              <div 
                className={`transition-opacity duration-${DISPLAY_TRANSITION_DURATION} ease-in-out ${showImage ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}
                style={{
                  transitionDuration: `${DISPLAY_TRANSITION_DURATION}ms`
                }}
              >
                <div className="flex justify-center">
                  <img
                    src={question.questionImageUrl}
                    alt="Question"
                    className="w-full max-w-xs rounded-lg shadow-md"
                  />
                </div>
              </div>
              
              {/* Options section with fade transition */}
              <div 
                className={`transition-opacity duration-${DISPLAY_TRANSITION_DURATION} ease-in-out ${!showImage ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}
                style={{
                  transitionDuration: `${DISPLAY_TRANSITION_DURATION}ms`
                }}
              >
                {question.choices.map((choice) => (
                  <div
                    key={choice.choiceIndex}
                    className={`choice-btn ${getChoiceClass(choice.choiceIndex)} ${gameState === 'question' ? 'cursor-pointer' : ''}`}
                  >
                    <div className="flex items-center">
                      <span className={`text-xl font-bold mr-2 ${correctIndex === choice.choiceIndex ? 'text-green-700' : ''}`}>
                        {String.fromCharCode(65 + choice.choiceIndex)}
                      </span>
                      <span className="text-lg">{choice.choiceText}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Desktop layout with side-by-side content
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex justify-center">
                <img
                  src={question.questionImageUrl}
                  alt="Question"
                  className="w-full max-w-xs rounded-lg shadow-md"
                />
              </div>
              <div className="space-y-1">
                {question.choices.map((choice) => (
                  <div
                    key={choice.choiceIndex}
                    className={`choice-btn ${getChoiceClass(choice.choiceIndex)} ${gameState === 'question' ? 'cursor-pointer' : ''}`}
                  >
                    <div className="flex items-center">
                      <span className={`text-xl font-bold mr-2 ${correctIndex === choice.choiceIndex ? 'text-green-700' : ''}`}>
                        {String.fromCharCode(65 + choice.choiceIndex)}
                      </span>
                      <span className="text-lg">{choice.choiceText}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        ) : (
          // No image layout
          <div className="pt-1 space-y-1">
            {question.choices.map((choice) => (
              <div
                key={choice.choiceIndex}
                className={`choice-btn ${getChoiceClass(choice.choiceIndex)} ${gameState === 'question' ? 'cursor-pointer' : ''}`}
              >
                <div className="flex items-center">
                  <span className={`text-xl font-bold mr-2 ${correctIndex === choice.choiceIndex ? 'text-green-700' : ''}`}>
                    {String.fromCharCode(65 + choice.choiceIndex)}
                  </span>
                  <span className="text-lg">{choice.choiceText}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuestionDisplay;
