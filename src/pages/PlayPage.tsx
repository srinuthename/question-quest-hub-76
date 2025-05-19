
import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import QuestionDisplay from "@/components/QuestionDisplay";
import AnswersPanel from "@/components/AnswersPanel";
import FastestAnswersPanel from "@/components/FastestAnswersPanel";
import LeaderboardPanel from "@/components/LeaderboardPanel";
import GameInfoHeader from "@/components/GameInfoHeader";
import FloatingAnswersPanel from "@/components/FloatingAnswersPanel";
import { getSocket } from "@/services/socketService";
import { Socket } from "socket.io-client";

// Game state type
type GameState = 'waiting' | 'question' | 'reveal' | 'fastest' | 'leaderboard' | 'ended';

// Get timer values from environment variables
const QUESTION_TIMER = parseInt(import.meta.env.VITE_QUESTION_TIMER || "20");
const REVEAL_ANSWER_TIMER = parseInt(import.meta.env.VITE_REVEAL_ANSWER_TIMER || "10");
const LEADERBOARD_TIMER = parseInt(import.meta.env.VITE_LEADERBOARD_TIMER || "10");

const PlayPage = () => {
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [fastestAnswers, setFastestAnswers] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [correctIndex, setCorrectIndex] = useState<number | null>(null);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(10);
  const [timeLeft, setTimeLeft] = useState<number>(QUESTION_TIMER);
  const [gameTitle, setGameTitle] = useState<string>("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Flag to determine if question card should be visible
  const isQuestionVisible = gameState !== 'leaderboard' && gameState !== 'ended';
  
  // Flag to determine if floating answers should be visible
  const showFloatingAnswers = gameState === 'question';

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = getSocket();

    // Set up socket event listeners
    socketRef.current.on('gameStarted', (gameData: any) => {
      console.log('Game started:', gameData);
      setGameTitle(gameData.gameTitle || "Live Quiz Game");
      setTotalQuestions(gameData.questions?.length || 10);
      setQuestionIndex(0); // Reset question index
      setGameState('waiting');
    });

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
        socketRef.current.off('gameStarted');
        socketRef.current.off('newQuestion');
        socketRef.current.off('newAnswers');
        socketRef.current.off('revealAnswer');
        socketRef.current.off('fastestCorrectAnswers');
        socketRef.current.off('leaderboard');
        socketRef.current.off('gameEnded');
      }
    };
  }, []);

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

  return (
    <div className="container mx-auto py-3 px-3">
      {gameState === 'waiting' ? (
        <div className="max-w-xl mx-auto mt-16">
          <div className="text-center space-y-6">
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 p-6 shadow-lg">
              <h1 className="text-3xl font-bold">
                {gameTitle || "Waiting for a game to start..."}
              </h1>
              <p className="text-xl mt-5 animate-pulse">
                Please wait for the game host to start the game
              </p>
            </Card>
          </div>
        </div>
      ) : (
        <>
          {/* Floating answers that appear regardless of game state */}
          <FloatingAnswersPanel 
            answers={answers} 
            visible={showFloatingAnswers} 
          />
          
          {(gameState === 'leaderboard' || gameState === 'ended') ? (
            <div className="flex justify-center w-full mt-4">
              <LeaderboardPanel
                leaderboard={leaderboard}
                gameEnded={gameState === 'ended'}
              />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 mt-3">
                {/* Question section - 8 columns on desktop */}
                <div className="md:col-span-8">
                  {/* Timer bar */}
                  <div className="mb-2">
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

                {/* Right panel - 4 columns on desktop */}
                <div className="md:col-span-4">
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

export default PlayPage;
