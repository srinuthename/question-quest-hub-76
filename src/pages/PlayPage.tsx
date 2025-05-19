import { useState, useEffect, useRef } from "react";
import { socket } from "@/services/socketService";
import QuestionDisplay from "@/components/QuestionDisplay";
import AnswersPanel from "@/components/AnswersPanel";
import LeaderboardPanel from "@/components/LeaderboardPanel";
import FastestAnswersPanel from "@/components/FastestAnswersPanel";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  
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
          <div className="flex items-center justify-center h-full min-h-[80vh]">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-white mb-4">Waiting for quiz to start</h2>
              <p className="text-2xl text-white/90 font-semibold">The quiz host will start the game soon...</p>
            </div>
          </div>
        );
      
      case 'question':
        return (
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-3 gap-6'} h-full`}>
            <div className={`${isMobile ? 'col-span-1' : 'col-span-2'}`}>
              <QuestionDisplay 
                question={currentQuestion}
                correctIndex={null}
                gameState={gameState}
                visible={true}
                questionIndex={questionIndex + 1}
                totalQuestions={totalQuestions}
              />
            </div>
            
            <div className="h-full">
              <div className="text-3xl font-bold text-white mb-2">Live Answers</div>
              <AnswersPanel answers={answers} />
            </div>
          </div>
        );
      
      case 'answer':
        return (
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-3 gap-6'} h-full`}>
            <div className={`${isMobile ? 'col-span-1' : 'col-span-2'}`}>
              <QuestionDisplay 
                question={currentQuestion}
                correctIndex={correctAnswerIndex}
                gameState={gameState}
                visible={true}
                questionIndex={questionIndex + 1}
                totalQuestions={totalQuestions}
              />
            </div>
            
            <div className="h-full">
              <FastestAnswersPanel 
                fastestAnswers={fastestAnswers} 
                visible={true}
              />
            </div>
          </div>
        );
      
      case 'leaderboard':
        return (
          <div className="w-full h-full">
            <LeaderboardPanel 
              leaderboard={leaderboard} 
              visible={true} 
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-screen max-w-full p-0 m-0">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full h-full p-2"
      >
        {isConnected ? (
          renderContent()
        ) : (
          <div className="flex items-center justify-center h-full">
            <h2 className="text-3xl font-bold text-white">Connecting...</h2>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PlayPage;
