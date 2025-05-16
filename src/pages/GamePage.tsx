
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
import { useIsMobile } from "@/hooks/use-mobile";

// Game state type
type GameState = 'waiting' | 'question' | 'reveal' | 'fastest' | 'leaderboard' | 'ended';

// Get timer values from environment variables
const QUESTION_TIMER = parseInt(import.meta.env.VITE_QUESTION_TIMER || "20");
const REVEAL_ANSWER_TIMER = parseInt(import.meta.env.VITE_REVEAL_ANSWER_TIMER || "10");
const LEADERBOARD_TIMER = parseInt(import.meta.env.VITE_LEADERBOARD_TIMER || "10");

const GamePage = () => {
  const { id } = useParams<{ id: string }>();
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [quizGame, setQuizGame] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [fastestAnswers, setFastestAnswers] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [correctIndex, setCorrectIndex] = useState<number | null>(null);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(10);
  const [timeLeft, setTimeLeft] = useState<number>(QUESTION_TIMER);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const isMobile = useIsMobile();

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
      resetTimer(QUESTION_TIMER);  // Reset timer for new question
    });

    socketRef.current.on('newAnswers', (newAnswers: any[]) => {
      console.log('Received new answers:', newAnswers);
      // Replace answers instead of appending
      setAnswers(newAnswers.map(answer => ({
        ytProfilePicUrl: answer.ytProfilePicUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${answer.ytChannelId || 'default'}`,
        userName: answer.userName || answer.ytChannelId,
        responseTime: answer.responseTime,
        answerIndex: answer.answerIndex
      })));
    });

    socketRef.current.on('revealAnswer', (data: any) => {
      console.log('Received correct answer:', data);
      setCorrectIndex(data.correctChoiceIndex);
      setGameState('reveal');
      resetTimer(REVEAL_ANSWER_TIMER);  // Reset timer for answer reveal phase
    });

    socketRef.current.on('fastestCorrectAnswers', (answers: any[]) => {
      console.log('Received fastest answers:', answers);
      setFastestAnswers(answers.map(answer => ({
        ytProfilePicUrl: answer.ytProfilePicUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${answer.ytChannelId || 'default'}`,
        userName: answer.userName || answer.ytChannelId,
        responseTime: answer.responseTime,
        answerIndex: answer.answerIndex
      })));
      setGameState('fastest');
    });

    socketRef.current.on('leaderboard', (scores: any[]) => {
      console.log('Received leaderboard:', scores);
      setLeaderboard(scores.map(score => ({
        ytChannelId: score.ytChannelId,
        score: score.score,
        ytProfilePicUrl: score.ytProfilePicUrl,
        userName: score.userName
      })));
      setGameState('leaderboard');
      resetTimer(LEADERBOARD_TIMER);  // Reset timer for leaderboard phase
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
  const timerProgress = `${Math.max(0, (timeLeft / 
    (gameState === 'question' ? QUESTION_TIMER : 
     gameState === 'leaderboard' ? LEADERBOARD_TIMER : REVEAL_ANSWER_TIMER)) * 100)}%`;

  if (!quizGame) {
    return (
      <div className="flex items-center justify-center p-2">
        <div className="animate-pulse text-xl font-bold text-white">Loading Game...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-1 px-2">
      {gameState === 'waiting' ? (
        <div className={`${isMobile ? 'max-w-full mt-8' : 'max-w-xl mt-16'} mx-auto`}>
          <div className="text-center space-y-4">
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 p-4 shadow-lg">
              <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold`}>
                {quizGame.gameTitle}
              </h1>
              <p className={`${isMobile ? 'text-lg' : 'text-xl'} mt-2`}>Number of Questions: {totalQuestions}</p>
              <Button
                size={isMobile ? "default" : "lg"}
                onClick={startGame}
                className={`${isMobile ? 'text-lg px-4 py-3 mt-3' : 'text-xl px-6 py-5 mt-5'} bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 shadow-lg hover:shadow-purple-500/25 transition-all duration-300`}
              >
                Start Game
                <Trophy className={`ml-2 ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
              </Button>
            </Card>
          </div>
        </div>
      ) : (
        <>
          {(gameState === 'leaderboard' || gameState === 'ended') ? (
            <div className="flex justify-center w-full mt-2">
              <LeaderboardPanel
                leaderboard={leaderboard}
                gameEnded={gameState === 'ended'}
              />
            </div>
          ) : (
            <>
              <div className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-12'} gap-1 mt-1`}>
                {/* Question section */}
                <div className={isMobile ? "" : "md:col-span-8"}>
                  {/* Timer bar */}
                  <div className="mb-1">
                    <GameInfoHeader
                      timeLeft={timeLeft}
                      timerProgress={timerProgress}
                      gameState={gameState}
                    />
                  </div>
                  
                  {/* Question display */}
                  <QuestionDisplay
                    question={currentQuestion}
                    correctIndex={correctIndex}
                    gameState={gameState}
                    visible={isQuestionVisible}
                    questionIndex={questionIndex}
                    totalQuestions={totalQuestions}
                  />
                </div>

                {/* Right panel */}
                <div className={isMobile ? "mt-1" : "md:col-span-4"}>
                  {gameState === 'question' && (
                    <AnswersPanel answers={answers} />
                  )}

                  {(gameState === 'reveal' || gameState === 'fastest') && (
                    <FastestAnswersPanel fastestAnswers={fastestAnswers} />
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default GamePage;
