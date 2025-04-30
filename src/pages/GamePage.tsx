
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import QuestionDisplay from "@/components/QuestionDisplay";
import AnswersPanel from "@/components/AnswersPanel";
import FastestAnswersPanel from "@/components/FastestAnswersPanel";
import LeaderboardPanel from "@/components/LeaderboardPanel";
import GameInfoHeader from "@/components/GameInfoHeader";
import { Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getSocket } from "@/services/socketService";
import { Socket } from "socket.io-client";

// Game state type
type GameState = 'waiting' | 'question' | 'reveal' | 'fastest' | 'leaderboard' | 'ended';

const GamePage = () => {
  const { id } = useParams<{ id: string }>();
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [quizGame, setQuizGame] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [fastestAnswers, setFastestAnswers] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<[string, number][]>([]);
  const [correctIndex, setCorrectIndex] = useState<number | null>(null);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(10);
  const [timeLeft, setTimeLeft] = useState<number>(20);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const socketRef = useRef<Socket | null>(null);
  
  // Flag to determine if question card should be visible
  const isQuestionVisible = gameState !== 'leaderboard' && gameState !== 'ended';
  
  useEffect(() => {
    // Fetch the actual game data
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
        setTotalQuestions(data.questions.length);
      } catch (err) {
        console.error('Error fetching game data:', err);
        
        // Fallback to mock data
        const mockGame = {
          _id: id,
          gameTitle: "Interactive Quiz Challenge",
          questions: Array(10).fill({}),
        };
        
        setQuizGame(mockGame);
        setTotalQuestions(mockGame.questions.length);
      }
    };
    
    fetchGameData();
    
    // Initialize socket connection
    socketRef.current = getSocket();
    
    // Set up socket event listeners
    socketRef.current.on('newQuestion', (question: any) => {
      console.log('Received new question:', question);
      setCurrentQuestion(question);
      setAnswers([]);  // Clear previous answers
      setFastestAnswers([]);
      setCorrectIndex(null);
      setQuestionIndex(prev => prev + 1);
      setGameState('question');
      resetTimer(20);  // Reset timer for new question
    });
    
    socketRef.current.on('newAnswers', (newAnswers: any[]) => {
      console.log('Received new answers:', newAnswers);
      // Replace answers instead of appending
      setAnswers(newAnswers.map(answer => ({
        ytProfilePicUrl: answer.ytProfilePicUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${answer.ytChannelId || 'default'}`,
        userName: answer.ytName || answer.ytChannelId,
        responseTime: answer.responseTime
      })));
    });
    
    socketRef.current.on('revealAnswer', (data: any) => {
      console.log('Received correct answer:', data);
      setCorrectIndex(data.correctChoiceIndex);
      setGameState('reveal');
      resetTimer(10);  // Reset timer for answer reveal phase
    });
    
    socketRef.current.on('fastestCorrectAnswers', (answers: any[]) => {
      console.log('Received fastest answers:', answers);
      setFastestAnswers(answers.map(answer => ({
        ytProfilePicUrl: answer.ytProfilePicUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${answer.ytChannelId || 'default'}`,
        userName: answer.ytName || answer.ytChannelId,
        responseTime: answer.responseTime
      })));
      setGameState('fastest');
    });
    
    socketRef.current.on('leaderboard', (scores: [string, number][]) => {
      console.log('Received leaderboard:', scores);
      setLeaderboard(scores);
      setGameState('leaderboard');
      resetTimer(10);  // Reset timer for leaderboard phase
    });
    
    socketRef.current.on('gameEnded', () => {
      console.log('Game ended');
      setGameState('ended');
    });
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Remove all socket event listeners
      if (socketRef.current) {
        socketRef.current.off('newQuestion');
        socketRef.current.off('newAnswers');
        socketRef.current.off('revealAnswer');
        socketRef.current.off('fastestCorrectAnswers');
        socketRef.current.off('leaderboard');
        socketRef.current.off('gameEnded');
      }
    };
  }, [id]);
  
  const startGame = () => {
    if (socketRef.current && id) {
      console.log('Emitting startGame event with gameId:', id);
      socketRef.current.emit('startGame', { gameId: id });
    }
  };
  
  const resetTimer = (seconds: number) => {
    setTimeLeft(seconds);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  // Calculate timer progress
  const timerProgress = `${Math.max(0, (timeLeft / (gameState === 'question' ? 20 : 10)) * 100)}%`;
  
  if (!quizGame) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-pulse text-2xl font-bold text-white">Loading Game...</div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-3 px-3">
      {gameState === 'waiting' ? (
        <div className="max-w-xl mx-auto mt-16">
          <div className="text-center space-y-6">
            <Card className="bg-gradient-to-r from-green-50 to-purple-50 p-6 shadow-lg">
              <h1 className="text-3xl font-bold">
                {quizGame.gameTitle}
              </h1>
              <p className="text-xl mt-3">Number of Questions: {totalQuestions}</p>
              <Button
                size="lg" 
                onClick={startGame}
                className="text-xl px-6 py-5 mt-5 bg-gradient-to-r from-green-400 to-purple-500 hover:from-green-500 hover:to-purple-600 shadow-lg hover:shadow-green-500/25 transition-all duration-300"
              >
                Start Game
                <Trophy className="ml-2 h-5 w-5" />
              </Button>
            </Card>
          </div>
        </div>
      ) : (
        <>
          <GameInfoHeader
            questionIndex={questionIndex}
            totalQuestions={totalQuestions}
            timeLeft={timeLeft}
            timerProgress={timerProgress}
            gameState={gameState}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 mt-3">
            {/* Question section - 7 columns on desktop */}
            <div className="md:col-span-7">
              <QuestionDisplay 
                question={currentQuestion} 
                correctIndex={correctIndex}
                gameState={gameState}
                visible={isQuestionVisible}
              />
            </div>
            
            {/* Right panel - 5 columns on desktop */}
            <div className="md:col-span-5">
              {gameState === 'question' && (
                <AnswersPanel answers={answers} />
              )}
              
              {(gameState === 'reveal' || gameState === 'fastest') && (
                <FastestAnswersPanel fastestAnswers={fastestAnswers} />
              )}
              
              {(gameState === 'leaderboard' || gameState === 'ended') && (
                <LeaderboardPanel 
                  leaderboard={leaderboard}
                  gameEnded={gameState === 'ended'}
                />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GamePage;
