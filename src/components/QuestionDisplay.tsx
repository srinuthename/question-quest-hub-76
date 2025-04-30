
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ScrollingText from "./ScrollingText";

interface QuestionDisplayProps {
  question: {
    questionText: string;
    choices: {
      choiceIndex: number;
      choiceText: string;
    }[];
  } | null;
  correctIndex: number | null;
  gameState: string;
  visible: boolean;
}

const QuestionDisplay = ({ question, correctIndex, gameState, visible }: QuestionDisplayProps) => {
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

  return (
    <Card className="bg-gradient-to-br from-purple-100/70 to-green-100/70 border-purple-200 shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold">
          {question.questionText}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <ScrollingText text="Type the option in answers to participate" />
        
        <div className="pt-1 space-y-2">
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
                <span className="text-xl font-bold mr-2">
                  {String.fromCharCode(65 + choice.choiceIndex)}
                </span>
                <span className="text-lg">{choice.choiceText}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionDisplay;
