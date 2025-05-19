
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Play, ArrowLeft, Check, Clock } from "lucide-react";
import { getSocket } from "@/services/socketService";
import { Socket } from "socket.io-client";
import { toast } from "sonner";

const GamePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quizGame, setQuizGame] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [lastStatusCheck, setLastStatusCheck] = useState<Date | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const statusCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Fetch the game data
    const fetchGameData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:50515";
        const response = await fetch(`${apiUrl}/api/quizgames/${id}`);

        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Fetched game data:', data);
        setQuizGame(data);
        
        // Set gameStarted state based on fetched game data
        if (data.status === 'active' || data.isActive) {
          setGameStarted(true);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching game data:', err);

        // Fallback to mock data
        const mockGame = {
          _id: id,
          gameTitle: "Interactive Quiz Challenge",
          questions: Array(10).fill({}),
        };

        setQuizGame(mockGame);
        setLoading(false);
      }
    };

    fetchGameData();

    // Initialize socket connection
    socketRef.current = getSocket();

    // Listen for game status updates
    socketRef.current.on('gameStarted', (gameData) => {
      setGameStarted(true);
      toast.success("Game started successfully!");
      
      // Update game data if available
      if (gameData) {
        setQuizGame(prevGame => ({...prevGame, ...gameData}));
      }
    });

    socketRef.current.on('gameEnded', () => {
      setGameStarted(false);
      toast.info("Game has ended");
      
      // Refresh game data
      fetchGameData();
    });

    // Set up periodic status checks
    statusCheckIntervalRef.current = setInterval(() => {
      checkGameStatus();
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => {
      // Remove socket event listeners
      if (socketRef.current) {
        socketRef.current.off('gameStarted');
        socketRef.current.off('gameEnded');
      }
      
      // Clear status check interval
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current);
      }
    };
  }, [id]);

  const checkGameStatus = async () => {
    try {
      const apiUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:50515";
      const response = await fetch(`${apiUrl}/api/quizgames/${id}`);
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update game data
      setQuizGame(data);
      
      // Update game status
      const isActive = data.status === 'active' || data.isActive;
      if (isActive !== gameStarted) {
        setGameStarted(isActive);
        if (isActive) {
          toast.success("Game is active");
        } else {
          toast.info("Game has ended");
        }
      }
      
      setLastStatusCheck(new Date());
    } catch (err) {
      console.error('Error checking game status:', err);
    }
  };

  const startGame = () => {
    if (socketRef.current && id) {
      console.log('Emitting startGame event with gameId:', id);
      socketRef.current.emit('startGame', { gameId: id });
    }
  };

  const endGame = () => {
    if (socketRef.current && id) {
      console.log('Emitting endGame event with gameId:', id);
      socketRef.current.emit('endGame', { gameId: id });
      setGameStarted(false);
    }
  };

  const goBack = () => {
    navigate('/');
  };

  const goToPlayView = () => {
    // Get the current origin (domain)
    const origin = window.location.origin;
    // Open play view in new window
    window.open(`${origin}/play`, '_blank', 'width=1024,height=768');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-pulse text-2xl font-bold text-white">Loading Game Details...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 px-3">
      <Button variant="outline" onClick={goBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Games
      </Button>
      
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold">{quizGame.gameTitle}</CardTitle>
              {gameStarted ? (
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                  <Check className="mr-1 h-3 w-3" /> Game Active
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300">
                  <Clock className="mr-1 h-3 w-3" /> Game Inactive
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Questions:</span>
                <span>{quizGame.questions?.length || 0}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium">Game ID:</span>
                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{quizGame._id}</span>
              </div>
              
              {quizGame.youtubeChannel && (
                <div className="flex justify-between items-center">
                  <span className="font-medium">YouTube Channel:</span>
                  <span>{quizGame.youtubeChannel}</span>
                </div>
              )}
              
              {lastStatusCheck && (
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">Last Status Check:</span>
                  <span className="text-gray-600">
                    {lastStatusCheck.toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              {!gameStarted ? (
                <Button 
                  onClick={startGame} 
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  <Trophy className="mr-2 h-5 w-5" />
                  Start Game
                </Button>
              ) : (
                <Button 
                  onClick={endGame}
                  variant="destructive"
                  className="flex-1"
                >
                  End Game
                </Button>
              )}
              
              <Button 
                onClick={goToPlayView} 
                variant="outline" 
                className="flex-1 border-blue-300 hover:bg-blue-50"
              >
                <Play className="mr-2 h-5 w-5" />
                Open Player Screen
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GamePage;
