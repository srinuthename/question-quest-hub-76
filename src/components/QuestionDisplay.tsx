
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
}

const QuestionDisplay = ({ question, correctIndex, gameState }: QuestionDisplayProps) => {
  if (!question) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent className="text-center py-20">
          <p className="text-2xl font-semibold text-muted-foreground">
            Waiting for the next question...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{question.questionText}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
              <span className="text-2xl font-bold mr-2">
                {String.fromCharCode(65 + choice.choiceIndex)}
              </span>
              <span className="text-lg">{choice.choiceText}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default QuestionDisplay;
