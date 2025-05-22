
import React from 'react';
import { useIsMobile } from "@/hooks/use-mobile";

interface QuestionDisplayProps {
  question: any;
  correctIndex: number | null;
  gameState: string;
  visible: boolean;
  questionIndex: number;
  totalQuestions: number;
  answers?: any[];
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
  
  if (!visible || !question) return null;
  
  const isShowingAnswer = correctIndex !== null;
  
  const getChoiceClasses = (index: number) => {
    let baseClasses = isMobile ? 'choice-btn-mobile' : 'choice-btn';
    
    if (isShowingAnswer) {
      if (index === correctIndex) {
        return `${baseClasses} correct`;
      } else {
        return `${baseClasses} incorrect`;
      }
    }
    
    return baseClasses;
  };

  // Count answers for each option
  const answerCounts = answers.reduce((counts: number[], answer) => {
    const choiceIndex = answer.choiceIndex;
    if (choiceIndex >= 0 && choiceIndex < 4) {
      counts[choiceIndex] = (counts[choiceIndex] || 0) + 1;
    }
    return counts;
  }, [0, 0, 0, 0]);
  
  return (
    <div className="glass-card p-4 rounded-lg shadow-lg h-full flex flex-col">
      <div className="mb-2 text-center">
        <div className="inline-block bg-white/20 rounded-full px-4 py-1 text-sm font-bold text-white">
          Question {questionIndex} of {totalQuestions}
        </div>
      </div>
      
      <div className={`mb-4 text-center ${isMobile ? 'px-2' : 'px-6'}`}>
        <h2 className={`${isMobile ? 'text-base' : 'text-2xl'} font-bold text-white`}>
          {question.question}
        </h2>
      </div>

      <div className="flex-grow">
        <div className="grid grid-cols-1 gap-2">
          {['A', 'B', 'C', 'D'].map((letter, index) => (
            <button
              key={index}
              className={getChoiceClasses(index)}
              disabled={isShowingAnswer}
            >
              <span className={`${isMobile ? 'w-5 h-5' : 'w-8 h-8'} rounded-full flex items-center justify-center bg-white/30 mr-2`}>
                {letter}
              </span>
              <span className="flex-grow text-left">
                {question.choices[index]}
              </span>
              {isShowingAnswer && (
                <span className={`${isMobile ? 'ml-1 text-xs' : 'ml-2'} opacity-80 font-normal`}>
                  {answerCounts[index] > 0 ? `${answerCounts[index]} ${answerCounts[index] === 1 ? 'answer' : 'answers'}` : '0 answers'}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuestionDisplay;
