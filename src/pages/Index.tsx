
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Calendar, HelpCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

// Define the quiz game interface based on the provided schema
interface QuizGame {
  _id: string;
  gameTitle: string;
  questions: any[];
  createdAt: string;
  quizTopicsList?: string[];
  quizLanguage?: string;
  youtubeChannel?: string;
  gameMode?: 'automatic' | 'manual';
}

const Index = () => {
  const [quizGames, setQuizGames] = useState<QuizGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  useEffect(() => {
    const fetchQuizGames = async () => {
      try {
        setLoading(true);
        // Use environment variable for API URL if available, fallback to localhost
        const apiUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:50515";
        const response = await fetch(`${apiUrl}/api/quizgames`);
        
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        setQuizGames(data);
        console.log("Fetched quiz games:", data);
      } catch (err) {
        console.error("Error fetching quiz games:", err);
        setError("Failed to load quiz games. Using mock data instead.");
        
        // Fallback to mock data if fetch fails
        setQuizGames([
          {
            _id: "game1",
            gameTitle: "General Knowledge Quiz",
            questions: Array(10).fill({}),
            createdAt: new Date().toISOString(),
          },
          {
            _id: "game2",
            gameTitle: "Science Fiction Trivia",
            questions: Array(15).fill({}),
            createdAt: new Date().toISOString(),
          },
          {
            _id: "game3",
            gameTitle: "History Champions",
            questions: Array(12).fill({}),
            createdAt: new Date().toISOString(),
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuizGames();
  }, []);
  
  const handleSelectGame = (gameId: string) => {
    navigate(`/game/${gameId}`);
  };
  
  if (loading) {
    return (
      <div className="container mx-auto py-2 px-2">
        <div className={`${isMobile ? 'max-w-full' : 'max-w-4xl'} mx-auto`}>
          <Card className="bg-white shadow-md">
            <CardHeader className="text-center pb-2 pt-2">
              <CardTitle className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold`}>
                Question Quest Hub
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-semibold mb-2 text-center`}>Loading Quiz Games...</h2>
              <div className="grid gap-2">
                {[1, 2, 3].map((index) => (
                  <div key={index} className="h-14 rounded-md p-2 flex justify-between items-center">
                    <div className="space-y-1 w-full">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                    <Skeleton className="h-6 w-6 rounded-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-2 px-2">
      <div className={`${isMobile ? 'max-w-full' : 'max-w-4xl'} mx-auto`}>
        <Card className="bg-white/90 shadow-md backdrop-blur-sm">
          <CardHeader className="text-center pb-2 pt-2">
            <CardTitle className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold`}>
              Question Quest Hub
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            {error && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-2 mb-2 rounded">
                <p className="text-yellow-800 text-sm">{error}</p>
              </div>
            )}
            
            <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-semibold mb-2 text-center`}>Available Quiz Games</h2>
            <div className="grid gap-1.5">
              {quizGames.map((game) => (
                <Button
                  key={game._id}
                  variant="outline"
                  className="flex justify-between items-center h-auto min-h-12 text-left px-3 py-1.5 bg-gradient-to-r from-white to-blue-50 hover:from-purple-500 hover:to-indigo-600 hover:text-white transition-all duration-300"
                  onClick={() => handleSelectGame(game._id)}
                >
                  <div className="flex flex-col">
                    <span className={`${isMobile ? 'text-sm' : 'text-base'} font-medium`}>{game.gameTitle}</span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      <p className="text-xs text-muted-foreground flex items-center group-hover:text-white/80">
                        <HelpCircle className="h-3 w-3 mr-0.5" />
                        {game.questions.length} Questions
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center group-hover:text-white/80">
                        <Calendar className="h-3 w-3 mr-0.5" />
                        {format(new Date(game.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4" />
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
