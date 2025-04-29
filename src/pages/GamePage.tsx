
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import QuestionDisplay from "@/components/QuestionDisplay";
import AnswersPanel from "@/components/AnswersPanel";
import FastestAnswersPanel from "@/components/FastestAnswersPanel";
import LeaderboardPanel from "@/components/LeaderboardPanel";
import GameInfoHeader from "@/components/GameInfoHeader";
import { Trophy } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Mock socket.io client
let mockSocketEvents = {} as any;
const mockSocket = {
  on: (event: string, callback: Function) => {
    mockSocketEvents[event] = callback;
  },
  emit: (event: string, data: any) => {
    console.log("Socket emit:", event, data);
    
    // Simulate backend responses
    setTimeout(() => {
      if (event === 'startGame') {
        mockSocketEvents['newQuestion']({
          questionText: "What is the capital of France?",
          choices: [
            { choiceIndex: 0, choiceText: "London" },
            { choiceIndex: 1, choiceText: "Paris" },
            { choiceIndex: 2, choiceText: "Berlin" },
            { choiceIndex: 3, choiceText: "Madrid" }
          ]
        });
        
        // Simulate answers coming in
        simulateAnswers();
      }
    }, 1000);
  }
};

// Simulate answers coming in
function simulateAnswers() {
  const profilePics = [
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Bella",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Luna",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver"
  ];
  
  const userNames = ["Player123", "QuizMaster", "BrainiacGamer", "TriviaKing", "QuizWhiz"];
  
  let answerCount = 0;
  const answerInterval = setInterval(() => {
    if (answerCount < 10) {
      const answers = [];
      const randomCount = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < randomCount; i++) {
        const randomIndex = Math.floor(Math.random() * 5);
        answers.push({
          ytProfilePicUrl: profilePics[randomIndex],
          userName: userNames[randomIndex],
          responseTime: Math.floor(Math.random() * 5000) + 1000
        });
      }
      
      mockSocketEvents['newAnswers'](answers);
      answerCount++;
    } else {
      clearInterval(answerInterval);
      
      // Reveal correct answer
      setTimeout(() => {
        mockSocketEvents['revealAnswer']({
          correctChoiceIndex: 1, // Paris
          questionIndex: 0
        });
        
        // Show fastest answers
        setTimeout(() => {
          mockSocketEvents['fastestCorrectAnswers']([
            {
              ytProfilePicUrl: profilePics[0],
              userName: userNames[0],
              responseTime: 1200
            },
            {
              ytProfilePicUrl: profilePics[2],
              userName: userNames[2],
              responseTime: 1800
            },
            {
              ytProfilePicUrl: profilePics[4],
              userName: userNames[4],
              responseTime: 2300
            }
          ]);
          
          // Show leaderboard
          setTimeout(() => {
            const scores = {};
            for (let i = 0; i < 5; i++) {
              scores[userNames[i]] = Math.floor(Math.random() * 5000) + 1000;
            }
            mockSocketEvents['leaderboard'](Object.entries(scores));
            
            // Continue to next question or end game
            setTimeout(() => {
              if (Math.random() > 0.5) {
                mockSocketEvents['newQuestion']({
                  questionText: "Which planet is known as the Red Planet?",
                  choices: [
                    { choiceIndex: 0, choiceText: "Venus" },
                    { choiceIndex: 1, choiceText: "Earth" },
                    { choiceIndex: 2, choiceText: "Mars" },
                    { choiceIndex: 3, choiceText: "Jupiter" }
                  ]
                });
                simulateAnswers();
              } else {
                mockSocketEvents['gameEnded']();
              }
            }, 5000);
          }, 5000);
        }, 2000);
      }, 5000);
    }
  }, 1000);
}

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
  const [timeLeft, setTimeLeft] = useState<number>(120);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const socket = useRef(mockSocket);
  const { toast } = useToast();
  
  useEffect(() => {
    // Mock fetching game data
    const mockGame = {
      _id: id,
      gameTitle: "Interactive Quiz Challenge",
      questions: Array(10).fill({}),
    };
    
    setQuizGame(mockGame);
    setTotalQuestions(mockGame.questions.length);
    
    // Set up socket events
    socket.current.on('newQuestion', (question: any) => {
      setCurrentQuestion(question);
      setAnswers([]);
      setFastestAnswers([]);
      setCorrectIndex(null);
      setQuestionIndex(prev => prev + 1);
      setGameState('question');
      startTimer();
      
      toast({
        title: `Question ${questionIndex + 1}`,
        description: "New question loaded!",
      });
    });
    
    socket.current.on('newAnswers', (newAnswers: any[]) => {
      setAnswers(prev => [...prev, ...newAnswers]);
    });
    
    socket.current.on('revealAnswer', (data: any) => {
      setCorrectIndex(data.correctChoiceIndex);
      setGameState('reveal');
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    });
    
    socket.current.on('fastestCorrectAnswers', (answers: any[]) => {
      setFastestAnswers(answers);
      setGameState('fastest');
    });
    
    socket.current.on('leaderboard', (scores: [string, number][]) => {
      setLeaderboard(scores);
      setGameState('leaderboard');
    });
    
    socket.current.on('gameEnded', () => {
      setGameState('ended');
      
      toast({
        title: "Game Over!",
        description: "Thank you for playing!",
      });
    });
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [id]);
  
  const startGame = () => {
    socket.current.emit('startGame', { gameId: id });
  };
  
  const startTimer = () => {
    setTimeLeft(120);
    
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
  const timerProgress = `${(timeLeft / 120) * 100}%`;
  
  if (!quizGame) {
    return (
      <div className="min-h-screen flex items-center justify-center quiz-container">
        <div className="animate-pulse text-2xl font-bold">Loading Game...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen quiz-container">
      <div className="container mx-auto py-6 px-4">
        {gameState === 'waiting' ? (
          <div className="max-w-xl mx-auto mt-20">
            <div className="text-center space-y-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 bg-clip-text text-transparent">
                {quizGame.gameTitle}
              </h1>
              <p className="text-xl">Number of Questions: {totalQuestions}</p>
              <Button
                size="lg" 
                onClick={startGame}
                className="text-xl px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Start Game
                <Trophy className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        ) : (
          <>
            <GameInfoHeader
              questionIndex={questionIndex}
              totalQuestions={totalQuestions}
              timeLeft={timeLeft}
              timerProgress={timerProgress}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-6">
              {/* Question section - 7 columns on desktop */}
              <div className="md:col-span-7">
                <QuestionDisplay 
                  question={currentQuestion} 
                  correctIndex={correctIndex}
                  gameState={gameState}
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
    </div>
  );
};

export default GamePage;
