
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface QuestionDisplayProps {
  question: {
    questionText: string;
    questionImageUrl?: string; // Make questionImageUrl optional
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
  const [showImage, setShowImage] = useState(true);
  
  // Set up alternating view for mobile when there's an image
  useEffect(() => {
    if (!isMobile || !question?.questionImageUrl) return;
    
    // Reset to show image first when question changes
    setShowImage(true);
    
    // Set up interval to alternate between image and options
    const intervalId = setInterval(() => {
      setShowImage(prev => !prev);
    }, 4000);
    
    return () => clearInterval(intervalId);
  }, [isMobile, question]);
  
  if (!visible) {
    return null;
  }

  if (!question) {
    return (
      <Card className="h-full flex items-center justify-center bg-gradient-to-br from-purple-200/50 to-green-200/50 shadow-md">
        <CardContent className="text-center py-8">
          <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-semibold text-muted-foreground`}>
            Waiting for the next question...
          </p>
        </CardContent>
      </Card>
    );
  }

  const questionWithNumber = questionIndex && totalQuestions 
    ? `${questionIndex}/${totalQuestions} ${question.questionText}`
    : question.questionText;

  const renderChoices = () => (
    <div className="pt-0.5 space-y-0.5">
      {question.choices.map((choice) => (
        <div
          key={choice.choiceIndex}
          className={`choice-btn ${
            correctIndex !== null
              ? correctIndex === choice.choiceIndex
                ? "correct"
                : "incorrect"
              : ""
          } ${gameState === 'question' ? 'cursor-pointer' : ''}`}
        >
          <div className="flex items-center">
            <span className={`${isMobile ? 'text-base' : 'text-xl'} font-bold mr-1.5`}>
              {String.fromCharCode(65 + choice.choiceIndex)}
            </span>
            <span className={`${isMobile ? 'text-sm' : 'text-lg'}`}>
              {choice.choiceText}
            </span>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Card className="bg-gradient-to-br from-purple-100/70 to-green-100/70 border-purple-200 shadow-md">
      <CardHeader className="pb-0.5 pt-1.5 px-2">
        <CardTitle className={`${isMobile ? 'text-base' : 'text-xl'} font-bold`}>
          {questionWithNumber}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-0.5 px-2 pt-0 pb-2">
        {question.questionImageUrl && isMobile ? (
          <AnimatePresence mode="wait">
            {showImage ? (
              <motion.div 
                key="image"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5 }}
                className="flex justify-center"
              >
                <img
                  src={question.questionImageUrl}
                  alt="Question"
                  className="w-full max-w-xs rounded-lg shadow-sm"
                />
              </motion.div>
            ) : (
              <motion.div 
                key="choices"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5 }}
              >
                {renderChoices()}
              </motion.div>
            )}
          </AnimatePresence>
        ) : question.questionImageUrl ? (
          <div className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-2'} gap-2`}>
            <div className="flex justify-center">
              <img
                src={question.questionImageUrl}
                alt="Question"
                className="w-full max-w-xs rounded-lg shadow-sm"
              />
            </div>
            <div className="space-y-0.5">
              {renderChoices()}
            </div>
          </div>
        ) : (
          renderChoices()
        )}
      </CardContent>
    </Card>
  );
};

export default QuestionDisplay;
