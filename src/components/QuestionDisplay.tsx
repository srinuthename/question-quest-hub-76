
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
      <Card className="h-full flex items-center justify-center bg-gradient-to-br from-purple-600/10 to-green-600/10">
        <CardContent className="text-center py-20">
          <p className="text-2xl font-semibold text-muted-foreground">
            Waiting for the next question...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-purple-600/10 to-green-600/10 border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-400 to-purple-500 bg-clip-text text-transparent">
          {question.questionText}
        </CardTitle>
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
              <span className="text-2xl font-bold mr-2 bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
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
