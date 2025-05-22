
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { socket, emitEvent } from "@/services/socketService";
import QuestionDisplay from "@/components/QuestionDisplay";
import AnswersPanel from "@/components/AnswersPanel";
import GameInfoHeader from "@/components/GameInfoHeader";
import { Check, Clock, Play, Eye, AlertTriangle, StopCircle } from "lucide-react";
import { toast } from "sonner";

// Get API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:50515';

const GamePage = () => {
  const { id } = useParams<{ id: string }>();
  const [gameData, setGameData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [gameActive, setGameActive] = useState<boolean>(false);
  const [lastStatusCheck, setLastStatusCheck] = useState<Date>(new Date());
  const [stoppingGame, setStoppingGame] = useState<boolean>(false);
  
  // Game status monitoring interval (1 minutes = 60000 ms)
  const STATUS_CHECK_INTERVAL = 60000;

  useEffect(() => {
    // Fetch game data
    const fetchGameData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/quizgames/${id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch game data: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.info("Fetched game data:", data);
        setGameData(data);
        
        // Check if game is already active
        if (data.isGameOpen) {
          setGameActive(true);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching game data:", error);
        setError("Failed to fetch game data. Please try again.");
        setLoading(false);
      }
    };

    if (id) {
      fetchGameData();
    }
    
    // Set up socket event listeners
    socket.on("gameEnded", handleGameEnded);
    
    // Clean up
    return () => {
      socket.off("gameEnded", handleGameEnded);
    };
  }, [id]);
  
  // Set up status monitoring
  useEffect(() => {
    const statusCheckInterval = setInterval(checkGameStatus, STATUS_CHECK_INTERVAL);
    
    // Clean up
    return () => {
      clearInterval(statusCheckInterval);
    };
  }, [gameData]);
  
  // Function to check game status
  const checkGameStatus = async () => {
    if (!id || !gameActive) return;
    
    try {
      const response = await fetch(`${API_URL}/api/quizgames/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to check game status: ${response.statusText}`);
      }
      
      const data = await response.json();
      setLastStatusCheck(new Date());
      
      // Update game state if it has changed
      if (data.isGameOpen !== gameActive) {
        setGameActive(data.isGameOpen);
        if (!data.isGameOpen) {
          toast.info("Game has ended", {
            description: "The game has been closed or completed."
          });
        }
      }
      
      // Update the game data
      setGameData(data);
    } catch (error) {
      console.error("Error checking game status:", error);
      toast.error("Failed to check game status");
    }
  };
  
  // Handler for game ended event
  const handleGameEnded = () => {
    setGameActive(false);
    toast.info("Game has ended", {
      description: "All questions have been answered."
    });
    // Refresh game data
    if (id) {
      checkGameStatus();
    }
  };
  
  // Handler for starting the game
  const handleStartGame = () => {
    if (!id) return;
    
    console.info("Emitting startGame event with gameId:", id);
    emitEvent("startGame", { gameId: id });
    toast.success("Game starting", {
      description: "The game will start shortly."
    });
    setGameActive(true);
  };

  const handleStopGame = () => {
    if (!id) return;
    
    console.info("Emitting stopGame event with gameId:", id);
    emitEvent("stopGame", { gameId: id });
    toast.success("Game stopping", {
      description: "The game will stop shortly."
    });
    setGameActive(false); 
  };
  
  // Handler for opening player view
  const handleOpenPlayerView = () => {
    if (!id) return;
    
    // Open player view in new window
    const playerWindowUrl = `/play`;
    window.open(playerWindowUrl, "_blank", "width=1024,height=768");
    toast.success("Player view opened in new window");
  };
  
  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <Card className="admin-card border-none shadow-xl bg-white">
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <Clock className="w-12 h-12 animate-pulse mx-auto mb-4 text-[#8B5CF6]" />
              <p className="text-xl text-gray-800">Loading game data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card className="admin-card border-none shadow-xl bg-white">
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
              <p className="text-xl text-gray-800 mb-4">{error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white transition-all shadow-lg"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <GameInfoHeader
        gameTitle={gameData?.gameTitle}
        gameStartedAt={gameData?.gameStartedAt}
        isGameOpen={gameData?.isGameOpen}
        questionIndex={gameData?.activeQuestionIndex}
        totalQuestions={gameData?.questions?.length}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        <div className="lg:col-span-2">
          <Card className="admin-card border-none shadow-xl bg-white mb-6">
            <CardHeader className="bg-gray-50 rounded-t-lg border-b">
              <CardTitle className="flex justify-between items-center">
                <span className="text-gray-800">Game Controls</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    Last checked: {new Date(lastStatusCheck).toLocaleTimeString()}
                  </span>
                  {gameActive ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                      <Check className="w-3 h-3 mr-1" /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                      Inactive
                    </span>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={handleStartGame} 
                  disabled={gameActive}
                  className="flex items-center gap-2 bg-[#8B5CF6] hover:bg-[#7C3AED] transition-all shadow-lg text-white"
                >
                  <Play size={18} />
                  {gameActive ? "Game Started" : "Start Game"}
                </Button>
                
                <Button
                  onClick={handleStopGame}
                  disabled={!gameActive || stoppingGame}
                  variant="destructive"
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 transition-all shadow-lg text-white"
                >
                  <StopCircle size={18} />
                  {stoppingGame ? "Stopping..." : "Stop Game"}
                </Button>
                
                <Button
                  onClick={handleOpenPlayerView}
                  className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 transition-all shadow-lg text-white"
                >
                  <Eye size={18} />
                  Open Player View                  
                </Button>
              </div>
              
              <div className="mt-4">
                <h3 className="font-medium text-gray-800 mb-2">Game Information</h3>
                <div className="bg-gray-50 rounded-md p-4 border border-gray-200 space-y-2">
                  <p><strong>Game Title:</strong> {gameData?.gameTitle}</p>
                  <p><strong>Total Questions:</strong> {gameData?.questions?.length}</p>
                  <p><strong>Current Question:</strong> {gameData?.activeQuestionIndex !== undefined ? gameData.activeQuestionIndex + 1 : "Not started"}</p>
                  <p><strong>Status:</strong> {gameData?.isGameOpen ? "Open" : "Closed"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GamePage;
