
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

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
    <div className={`${isMobile ? 'h-[50vh] mb-2 overflow-hidden' : 'h-full'} rounded-lg shadow-md glass-card`}>
      <div className={`${isMobile ? 'p-2' : 'p-4'} h-full`}>
        <h2 className={`${isMobile ? 'text-2xl' : 'text-3xl sm:text-4xl'} font-extrabold mb-1 text-white drop-shadow-md`}>
          {questionWithNumber}
        </h2>

        {question.questionImageUrl ? (
          isMobile ? (
            // Mobile layout with alternating content in a fixed height container
            <div className="grid grid-cols-1 gap-1 h-[calc(100%-2rem)]">
              {/* Image section with fade transition */}
              <div
                className={`transition-opacity duration-${DISPLAY_TRANSITION_DURATION} ease-in-out ${showImage ? 'opacity-100 h-full' : 'opacity-0 h-0 overflow-hidden'}`}
                style={{
                  transitionDuration: `${DISPLAY_TRANSITION_DURATION}ms`,
                  height: showImage ? '100%' : '0'
                }}
              >
                <div className="flex h-full">
                  <img
                    src={question.questionImageUrl}
                    alt="Question"
                    className="w-full h-full object-contain rounded-lg shadow-lg"
                  />
                </div>
              </div>

              {/* Options section with fade transition */}
              <div
                className={`transition-opacity duration-${DISPLAY_TRANSITION_DURATION} ease-in-out ${!showImage ? 'opacity-100 h-full' : 'opacity-0 h-0 overflow-hidden'}`}
                style={{
                  transitionDuration: `${DISPLAY_TRANSITION_DURATION}ms`,
                  height: !showImage ? '100%' : '0'
                }}
              >
                {question.choices.map((choice) => (
                  <div
                    key={choice.choiceIndex}
                    className={`choice-btn-mobile ${getChoiceClass(choice.choiceIndex)}`}
                  >
                    <div className="flex items-center">
                      <span className="text-lg font-extrabold mr-2 text-white">
                        {String.fromCharCode(65 + choice.choiceIndex)}
                      </span>
                      <span className="text-xl font-bold text-white">{choice.choiceText}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Desktop layout with side-by-side content
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
              <div className="flex">
                <img
                  src={question.questionImageUrl}
                  alt="Question"
                  className="w-full max-h-[60vh] object-contain rounded-lg shadow-lg"
                />
              </div>
              <div className="flex flex-col space-y-4">
                {question.choices.map((choice) => (
                  <div
                    key={choice.choiceIndex}
                    className={`choice-btn ${getChoiceClass(choice.choiceIndex)}`}
                  >
                    <div className="flex items-center">
                      <span className="text-3xl font-extrabold mr-3 text-white">
                        {String.fromCharCode(65 + choice.choiceIndex)}
                      </span>
                      <span className="text-2xl font-bold text-white">{choice.choiceText}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        ) : (
          // No image layout
          <div className={`${isMobile ? 'space-y-1 pt-1 h-[calc(100%-2rem)]' : 'space-y-4 pt-2'}`}>
            {question.choices.map((choice) => (
              <div
                key={choice.choiceIndex}
                className={`${isMobile ? 'choice-btn-mobile' : 'choice-btn'} ${getChoiceClass(choice.choiceIndex)}`}
              >
                <div className="flex items-center">
                  <span className={`${isMobile ? 'text-lg mr-2' : 'text-3xl mr-3'} font-extrabold text-white`}>
                    {String.fromCharCode(65 + choice.choiceIndex)}
                  </span>
                  <span className={`${isMobile ? 'text-sm' : 'text-2xl'} font-bold text-white`}>{choice.choiceText}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionDisplay;
