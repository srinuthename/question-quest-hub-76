
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  return (
    <Card className="bg-gradient-to-br from-purple-100/70 to-green-100/70 border-purple-200 shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold">
          {questionWithNumber}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">

        {question.questionImageUrl ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex justify-center">
              <img
                src={question.questionImageUrl}
                alt="Question"
                className="w-full max-w-xs rounded-lg shadow-md"
              />
            </div>
            <div className="space-y-2">
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
          </div>
        ) : (
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
        )}
      </CardContent>
    </Card>
  );
};

export default QuestionDisplay;
