
import { useState, useEffect, useRef } from "react";
import { socket } from "@/services/socketService";
import QuestionDisplay from "@/components/QuestionDisplay";
import AnswersPanel from "@/components/AnswersPanel";
import LeaderboardPanel from "@/components/LeaderboardPanel";
import FastestAnswersPanel from "@/components/FastestAnswersPanel";
import CountdownTimer from "@/components/CountdownTimer";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

// Get the timing values from .env
const QUESTION_TIMER = parseInt(import.meta.env.VITE_QUESTION_TIMER || '20');
const REVEAL_ANSWER_TIMER = parseInt(import.meta.env.VITE_REVEAL_ANSWER_TIMER || '10');
const LEADERBOARD_TIMER = parseInt(import.meta.env.VITE_LEADERBOARD_TIMER || '10');
const FINAL_STANDINGS_DURATION = parseInt(import.meta.env.VITE_FINAL_STANDINGS_DURATION || '1200');

const PlayPage = () => {
  const [gameState, setGameState] = useState<'waiting' | 'question' | 'answer' | 'leaderboard' | 'ended'>('waiting');
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState<number | null>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [fastestAnswers, setFastestAnswers] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(QUESTION_TIMER);
  const [gameEndTime, setGameEndTime] = useState<number | null>(null);
  const isMobile = useIsMobile();
  
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
      
      // Reset state for new question
      setCurrentQuestion(question);
      setCorrectAnswerIndex(null);
      setAnswers([]); // Clear all previous answers
      setFastestAnswers([]);
      setGameState('question');
      setTimerSeconds(QUESTION_TIMER);
      
      // Update question index if available
      if (question.questionIndex !== undefined) {
        setQuestionIndex(question.questionIndex);
      }

      // Show toast for new question
      toast.info("New question started!", {
        position: "top-center",
        duration: 2000,
      });
    };

    const onNewAnswers = (newAnswers: any[]) => {
      console.log('New answers received:', newAnswers);
      
      // Only add answers during question or answer state
      if (gameState === 'question' || gameState === 'answer') {
        // Prepend new answers instead of appending
        setAnswers(prev => [...newAnswers, ...prev]);
      }
    };

    const onRevealAnswer = (data: any) => {
      console.log('Answer revealed:', data);
      setCorrectAnswerIndex(data.correctChoiceIndex);
      setGameState('answer');
      setTimerSeconds(REVEAL_ANSWER_TIMER);
      
      // Clear the answers after revealing the correct answer
      setAnswers([]);

      // Show toast for answer reveal
      toast.success("Answer revealed!", {
        position: "top-center",
        duration: 2000,
      });
    };

    const onFastestAnswers = (fastest: any[]) => {
      console.log('Fastest correct answers received:', fastest);
      setFastestAnswers(fastest);
    };

    const onLeaderboard = (scores: any[]) => {
      console.log('Leaderboard received:', scores);
      setLeaderboard(scores);
      setGameState('leaderboard');
      setTimerSeconds(LEADERBOARD_TIMER);
    };

    const onGameEnded = () => {
      console.log('Game ended');
      setGameState('ended');
      setCurrentQuestion(null);
      setCorrectAnswerIndex(null);
      
      // Calculate when the final standings should disappear (20 minutes from now)
      const endTime = Date.now() + (FINAL_STANDINGS_DURATION * 1000);
      setGameEndTime(endTime);
      
      // Show toast for game end
      toast.info("Game has ended! Final standings displayed.", {
        position: "top-center",
        duration: 5000,
      });
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
    };
  }, [gameState]);

  // Check if final standings should still be displayed
  useEffect(() => {
    if (gameState === 'ended' && gameEndTime) {
      const intervalId = setInterval(() => {
        if (Date.now() > gameEndTime) {
          // Reset to waiting state after 20 minutes
          setGameState('waiting');
          setGameEndTime(null);
          clearInterval(intervalId);
        }
      }, 10000); // Check every 10 seconds
      
      return () => clearInterval(intervalId);
    }
  }, [gameState, gameEndTime]);

  // Timer completion handlers
  const handleTimerComplete = () => {
    // Auto-transition not implemented, waiting for server events
    console.log("Timer completed for state:", gameState);
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
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-1' : 'grid-cols-3 gap-6'} h-full`}>
            <div className={`${isMobile ? 'col-span-1' : 'col-span-2'}`}>
              <div className="mb-1">
                <CountdownTimer 
                  initialSeconds={QUESTION_TIMER}
                  onComplete={handleTimerComplete}
                  gameState={gameState}
                />
              </div>
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
              <div className={`${isMobile ? 'text-lg' : 'text-3xl'} font-bold text-white mb-1`}>Live Answers</div>
              <AnswersPanel answers={answers} />
            </div>
          </div>
        );
      
      case 'answer':
        return (
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-1' : 'grid-cols-3 gap-6'} h-full`}>
            <div className={`${isMobile ? 'col-span-1' : 'col-span-2'}`}>
              <div className="mb-1">
                <CountdownTimer 
                  initialSeconds={REVEAL_ANSWER_TIMER}
                  onComplete={handleTimerComplete}
                  gameState={gameState}
                />
              </div>
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
            <div className="mb-1">
              <CountdownTimer 
                initialSeconds={LEADERBOARD_TIMER}
                onComplete={handleTimerComplete}
                gameState={gameState}
              />
            </div>
            <LeaderboardPanel 
              leaderboard={leaderboard} 
              visible={true} 
            />
          </div>
        );

      case 'ended':
        return (
          <div className="w-full h-full">
            <LeaderboardPanel 
              leaderboard={leaderboard} 
              visible={true}
              gameEnded={true}
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
        className={`w-full h-full ${isMobile ? 'p-0.5' : 'p-1'}`}
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
