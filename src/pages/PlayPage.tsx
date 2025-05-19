
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { socket } from "@/services/socketService";
import QuestionDisplay from "@/components/QuestionDisplay";
import AnswersPanel from "@/components/AnswersPanel";
import LeaderboardPanel from "@/components/LeaderboardPanel";
import FastestAnswersPanel from "@/components/FastestAnswersPanel";
import { motion } from "framer-motion";

// Get the timing values from .env
const QUESTION_TIMER = parseInt(import.meta.env.VITE_QUESTION_TIMER || '20') * 1000;
const REVEAL_ANSWER_TIMER = parseInt(import.meta.env.VITE_REVEAL_ANSWER_TIMER || '10') * 1000;
const LEADERBOARD_TIMER = parseInt(import.meta.env.VITE_LEADERBOARD_TIMER || '10') * 1000;

const PlayPage = () => {
  const [gameState, setGameState] = useState<'waiting' | 'question' | 'answer' | 'leaderboard'>('waiting');
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState<number | null>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [fastestAnswers, setFastestAnswers] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  
  // Timer references for cleanup
  const timerRefs = useRef<{
    questionTimer: NodeJS.Timeout | null,
    answerTimer: NodeJS.Timeout | null,
    leaderboardTimer: NodeJS.Timeout | null
  }>({
    questionTimer: null,
    answerTimer: null,
    leaderboardTimer: null
  });

  // Connect to socket and listen to events
  useEffect(() => {
    // Check if already connected
    if (socket.connected) {
      setIsConnected(true);
    }

    // Event handlers
    const onConnect = () => {
      console.log('Socket connected');
      setIsConnected(true);
    };

    const onDisconnect = () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    };

    const onNewQuestion = (question: any) => {
      console.log('New question received:', question);
      
      // Clear any existing timers
      clearAllTimers();
      
      // Reset state for new question
      setCurrentQuestion(question);
      setCorrectAnswerIndex(null);
      setAnswers([]);
      setFastestAnswers([]);
      setGameState('question');
      
      // Update question index if available
      if (question.questionIndex !== undefined) {
        setQuestionIndex(question.questionIndex);
      }
    };

    const onNewAnswers = (newAnswers: any[]) => {
      console.log('New answers received:', newAnswers);
      
      // Only add answers during question or answer state
      if (gameState === 'question' || gameState === 'answer') {
        setAnswers(prev => [...prev, ...newAnswers]);
      }
    };

    const onRevealAnswer = (data: any) => {
      console.log('Answer revealed:', data);
      setCorrectAnswerIndex(data.correctChoiceIndex);
      setGameState('answer');
    };

    const onFastestAnswers = (fastest: any[]) => {
      console.log('Fastest correct answers received:', fastest);
      setFastestAnswers(fastest);
    };

    const onLeaderboard = (scores: any[]) => {
      console.log('Leaderboard received:', scores);
      setLeaderboard(scores);
      setGameState('leaderboard');
    };

    const onGameEnded = () => {
      console.log('Game ended');
      clearAllTimers();
      setGameState('waiting');
      setCurrentQuestion(null);
      setCorrectAnswerIndex(null);
      setAnswers([]);
      setFastestAnswers([]);
      setLeaderboard([]);
    };

    // Register event listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('newQuestion', onNewQuestion);
    socket.on('newAnswers', onNewAnswers);
    socket.on('revealAnswer', onRevealAnswer);
    socket.on('fastestCorrectAnswers', onFastestAnswers);
    socket.on('leaderboard', onLeaderboard);
    socket.on('gameEnded', onGameEnded);

    // Cleanup function
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('newQuestion', onNewQuestion);
      socket.off('newAnswers', onNewAnswers);
      socket.off('revealAnswer', onRevealAnswer);
      socket.off('fastestCorrectAnswers', onFastestAnswers);
      socket.off('leaderboard', onLeaderboard);
      socket.off('gameEnded', onGameEnded);
      
      clearAllTimers();
    };
  }, [gameState]);

  // Helper function to clear all timers
  const clearAllTimers = () => {
    if (timerRefs.current.questionTimer) {
      clearTimeout(timerRefs.current.questionTimer);
      timerRefs.current.questionTimer = null;
    }
    if (timerRefs.current.answerTimer) {
      clearTimeout(timerRefs.current.answerTimer);
      timerRefs.current.answerTimer = null;
    }
    if (timerRefs.current.leaderboardTimer) {
      clearTimeout(timerRefs.current.leaderboardTimer);
      timerRefs.current.leaderboardTimer = null;
    }
  };

  // Rendering different sections based on game state
  const renderContent = () => {
    switch (gameState) {
      case 'waiting':
        return (
          <Card className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-none shadow-md">
            <CardContent className="flex items-center justify-center min-h-[300px]">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Waiting for quiz to start</h2>
                <p className="text-white/80">The quiz host will start the game soon...</p>
              </div>
            </CardContent>
          </Card>
        );
      
      case 'question':
        return (
          <>
            <QuestionDisplay 
              question={currentQuestion}
              correctIndex={null}
              gameState={gameState}
              visible={true}
              questionIndex={questionIndex + 1}
              totalQuestions={totalQuestions}
            />
            
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Live Answers</CardTitle>
              </CardHeader>
              <CardContent>
                <AnswersPanel answers={answers} />
              </CardContent>
            </Card>
          </>
        );
      
      case 'answer':
        return (
          <>
            <QuestionDisplay 
              question={currentQuestion}
              correctIndex={correctAnswerIndex}
              gameState={gameState}
              visible={true}
              questionIndex={questionIndex + 1}
              totalQuestions={totalQuestions}
            />
            
            <FastestAnswersPanel 
              fastestAnswers={fastestAnswers} 
              visible={true}
            />
          </>
        );
      
      case 'leaderboard':
        return (
          <LeaderboardPanel 
            leaderboard={leaderboard} 
            visible={true} 
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 gap-6"
      >
        <Card className="bg-white/10 shadow-xl backdrop-blur-sm border-none">
          <CardHeader>
            <CardTitle className="text-center text-white">
              {isConnected ? 'Live Quiz' : 'Connecting...'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {/* Main content area */}
            <div className="grid grid-cols-1 gap-6">
              {renderContent()}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PlayPage;
