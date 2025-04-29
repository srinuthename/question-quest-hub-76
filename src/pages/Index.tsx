
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

// Define the game type
interface QuizGame {
  _id: string;
  gameTitle: string;
  questions: any[];
}

const Index = () => {
  const [quizGames, setQuizGames] = useState<QuizGame[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    // In a real app, you'd fetch games from your API here
    // For our demo, we'll create mock data
    const mockGames = [
      {
        _id: "game1",
        gameTitle: "General Knowledge Quiz",
        questions: Array(10).fill({}),
      },
      {
        _id: "game2",
        gameTitle: "Science Fiction Trivia",
        questions: Array(15).fill({}),
      },
      {
        _id: "game3",
        gameTitle: "History Champions",
        questions: Array(12).fill({}),
      }
    ];
    
    setQuizGames(mockGames);
    setLoading(false);
  }, []);
  
  const handleSelectGame = (gameId: string) => {
    navigate(`/game/${gameId}`);
    toast({
      title: "Game selected!",
      description: "Loading quiz game...",
    });
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-2xl font-bold">Loading Games...</div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4 min-h-screen bg-gradient-to-br from-purple-50 to-green-50">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white shadow-md">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold">
              Question Quest Hub
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h2 className="text-2xl font-semibold mb-6 text-center">Select a Quiz Game</h2>
            <div className="grid gap-4">
              {quizGames.map((game) => (
                <Button
                  key={game._id}
                  variant="outline"
                  className="flex justify-between items-center h-16 text-left px-6 bg-gradient-to-r from-white to-purple-50 hover:from-green-50 hover:to-purple-100 transition-all duration-300"
                  onClick={() => handleSelectGame(game._id)}
                >
                  <div>
                    <span className="text-lg font-medium">{game.gameTitle}</span>
                    <p className="text-sm text-muted-foreground">
                      {game.questions.length} Questions
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5" />
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
