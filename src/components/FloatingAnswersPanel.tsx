
import React, { useEffect, useState } from 'react';

// Get the floating answer duration from environment variables
const FLOATING_ANSWER_DURATION = parseInt(import.meta.env.VITE_FLOATING_ANSWER_DURATION || '8000');

interface FloatingAnswersProps {
  answers: any[];
  visible: boolean;
}

const FloatingAnswersPanel: React.FC<FloatingAnswersProps> = ({ answers, visible }) => {
  const [displayAnswers, setDisplayAnswers] = useState<any[]>([]);

  // Process new answers as they come in
  useEffect(() => {
    if (!visible || !answers.length) return;

    // Add any new answers with unique IDs
    const newAnswers = answers.filter(answer => 
      !displayAnswers.some(existing => existing._id === answer._id)
    );

    if (newAnswers.length > 0) {
      // Add new answers with animation duration
      const answersWithAnimation = newAnswers.map(answer => ({
        ...answer,
        animationId: Math.random().toString(36).substring(2, 9),
        floatDuration: FLOATING_ANSWER_DURATION
      }));

      setDisplayAnswers(prev => [...prev, ...answersWithAnimation]);
    }

    // Cleanup old answers after their animation completes
    const cleanupInterval = setInterval(() => {
      setDisplayAnswers(prev => 
        prev.filter(answer => 
          Date.now() - new Date(answer.addedAt || Date.now()).getTime() < FLOATING_ANSWER_DURATION
        )
      );
    }, 1000);

    return () => clearInterval(cleanupInterval);
  }, [answers, visible]);

  if (!visible) return null;

  return (
    <div className="floating-answers-container">
      {displayAnswers.map(answer => (
        <div
          key={answer.animationId}
          className="floating-answer animate-float-up"
          style={{
            '--float-duration': `${answer.floatDuration}ms`
          } as React.CSSProperties}
        >
          <span className="answer-username">{answer.userName}</span>
          <span 
            className={`answer-choice ${
              answer.choiceIndex === answer.correctChoiceIndex ? 'bg-green-600' : 'bg-blue-600'
            }`}
          >
            {String.fromCharCode(65 + answer.choiceIndex)}
          </span>
        </div>
      ))}
    </div>
  );
};

export default FloatingAnswersPanel;
