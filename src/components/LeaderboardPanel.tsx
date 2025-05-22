
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Award, Sparkles, PartyPopper, Star, Medal } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface LeaderboardEntry {
  ytChannelId: string;
  score: number;
  ytProfilePicUrl: string;
  userName: string;
}

interface LeaderboardPanelProps {
  leaderboard?: LeaderboardEntry[];
  visible?: boolean;
  gameEnded?: boolean;
}

const LeaderboardPanel = ({
  leaderboard = [],
  visible = true,
  gameEnded = false
}: LeaderboardPanelProps) => {
  const isMobile = useIsMobile();

  if (!visible) return null;

  // Get top 3 players for the podium
  const topThree = leaderboard.slice(0, 3);

  // Get the rest of the players
  const otherPlayers = leaderboard.slice(3);

  // Split other players into left and right columns alternately
  const leftColumnPlayers = [];
  const rightColumnPlayers = [];

  otherPlayers.forEach((entry, index) => {
    if (index % 2 === 0) {
      leftColumnPlayers.push(entry);
    } else {
      rightColumnPlayers.push(entry);
    }
  });

  // Trophy colors for top 3
  const trophyColors = ["text-yellow-500", "text-gray-400", "text-amber-700"];
  
  // Enhanced badge gradients for top players
  const badgeGradients = [
    "from-yellow-400 to-yellow-600",
    "from-slate-300 to-slate-500",
    "from-amber-600 to-amber-800"
  ];

  return (
    <Card className="w-full h-full overflow-hidden flex flex-col glass-card shadow-xl relative">
      {gameEnded && (
        <>
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-10">
            <div className="absolute top-0 left-1/4 animate-bounce delay-300 opacity-70">
              <Trophy className="h-16 w-16 text-yellow-500" />
            </div>
            <div className="absolute top-12 right-1/4 animate-bounce delay-500 opacity-70">
              <Star className="h-10 w-10 text-amber-400" />
            </div>
            <div className="absolute top-40 left-1/3 animate-bounce delay-700 opacity-70">
              <Medal className="h-12 w-12 text-orange-500" />
            </div>
            <div className="absolute top-10 left-2/3 animate-bounce delay-100 opacity-70">
              <Award className="h-14 w-14 text-pink-500" />
            </div>
          </div>
        </>
      )}
      
      <CardHeader className={`${isMobile ? 'p-1 pb-0' : 'pb-0 pt-4'} bg-gradient-to-r from-[#D946EF] to-[#8B5CF6] relative overflow-hidden`}>
        <div className="flex items-center justify-center relative z-10">
          <Trophy className={`mr-1 ${isMobile ? 'h-4 w-4' : 'h-8 w-8'} text-yellow-500 animate-pulse`} />
          <CardTitle className={`${isMobile ? 'text-lg' : 'text-3xl'} font-extrabold text-white drop-shadow-md`}>
            {gameEnded ? "Final Standings" : "Current Standings"}
          </CardTitle>
          {gameEnded && <PartyPopper className={`ml-2 ${isMobile ? 'h-4 w-4' : 'h-6 w-6'} text-yellow-400 animate-bounce`} />}
        </div>
        {/* Decorative elements for header */}
        <div className="absolute -top-10 -left-10 w-16 h-16 bg-white/20 rounded-full blur-xl"></div>
        <div className="absolute -bottom-5 -right-5 w-20 h-20 bg-white/20 rounded-full blur-xl"></div>
      </CardHeader>
      
      <CardContent className={`flex-grow overflow-y-auto ${isMobile ? 'p-1' : 'p-4'} relative`}>
        {leaderboard.length === 0 ? (
          <div className="text-center py-3 text-2xl font-bold text-white glass-card-dark p-4 rounded-lg">
            No scores yet...
          </div>
        ) : (
          <>
            {/* Top 3 Players with Trophies */}
            {topThree.length > 0 && (
              <div className={`flex flex-col ${isMobile ? 'gap-1 mb-1' : 'gap-2 mb-1'}`}>
                {topThree.map((entry, index) => (
                  <div
                    key={index}
                    className={`flex items-center ${isMobile ? 'p-2' : 'p-3'} rounded-lg shadow-lg animate-fade-in bg-gradient-to-r ${
                      index === 0
                        ? 'from-yellow-500/30 to-amber-300/30 border-l-4 border-yellow-400'
                        : index === 1
                          ? 'from-slate-400/30 to-slate-300/30 border-l-4 border-slate-400'
                          : 'from-amber-700/30 to-amber-500/30 border-l-4 border-amber-600'
                    } `}
                    style={{ animationDelay: `${index * 0.15}s` }}
                  >
                    <div className="flex items-center flex-1">
                      <div className={`${isMobile ? 'mr-1' : 'mr-3'} relative`}>
                        <Trophy className={`${isMobile ? 'h-5 w-5' : 'h-8 w-8'} ${trophyColors[index]} ${index === 0 ? 'animate-pulse' : ''}`} />
                        {index === 0 && (
                          <span className="absolute -top-1 -right-1">
                            <Sparkles className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-yellow-400`} />
                          </span>
                        )}
                      </div>
                      <Avatar className={`${isMobile ? 'h-8 w-8 mr-1' : 'h-14 w-14 mr-2'} border-2 avatar-glow ${
                        index === 0
                          ? 'border-yellow-400 ring-2 ring-yellow-200 ring-offset-1'
                          : index === 1
                            ? 'border-gray-400'
                            : 'border-amber-500'
                      }`}>
                        <AvatarImage src={entry.ytProfilePicUrl} alt={entry.userName} />
                        <AvatarFallback className={`text-white ${
                          index === 0
                            ? 'bg-gradient-to-br from-yellow-500 to-amber-600'
                            : index === 1
                              ? 'bg-gradient-to-br from-slate-400 to-slate-600'
                              : 'bg-gradient-to-br from-amber-600 to-amber-800'
                        }`}>{entry.userName.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 truncate">
                        <div className={`${isMobile ? 'text-s' : 'text-xl'} font-extrabold flex items-center text-white`}>
                          {entry.userName}
                          {gameEnded && index === 0 && (
                            <Badge className={`${isMobile ? 'ml-2 px-2 py-0.5' : 'ml-4 px-3 py-1'} bg-gradient-to-r from-[#F97316] to-[#D946EF] text-white animate-pulse border-none shadow-md`}>
                              Champion 🏆
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className={`${isMobile ? 'text-sm' : 'text-2xl'} font-extrabold text-white bg-gradient-to-r ${badgeGradients[index]} bg-clip-text`}>
                      <span className="px-3 py-1 bg-white/30 rounded-full shadow-inner">{entry.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Other players - Desktop gets 2 column layout */}
            <div className={`${!isMobile ? "grid grid-cols-2 gap-2" : "space-y-1"}`}>
              {isMobile ? (
                // Mobile view - single column
                otherPlayers.map((entry, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-2 bg-white/80 rounded-lg animate-fade-in border-l-2 border-[#8B5CF6] shadow-md" 
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-1 avatar-glow">
                        <AvatarImage src={entry.ytProfilePicUrl} alt={entry.userName} />
                        <AvatarFallback className="bg-[#0089ba] text-white">{entry.userName.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="w-4 h-4 rounded-full bg-gradient-to-r from-[#008e9b] to-[#0EA5E9] flex items-center justify-center mr-1 text-white">
                        <span className="text-sm font-bold">{index + 4}</span>
                      </div>
                      <span className="font-bold text-sm truncate max-w-[100px] text-white">{entry.userName}</span>
                    </div>
                    <span className="font-extrabold text-sm text-white">{entry.score}</span>
                  </div>
                ))
              ) : (
                // Desktop view - two columns
                <>
                  {/* Left column */}
                  <div className="space-y-1">
                    {leftColumnPlayers.map((entry, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between p-2 bg-gradient-to-r from-white/80 to-purple-100/30 rounded-lg animate-fade-in border-l-2 border-[#8B5CF6] hover:shadow-lg transition-shadow" 
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10 mr-2 avatar-glow">
                            <AvatarImage src={entry.ytProfilePicUrl} alt={entry.userName} />
                            <AvatarFallback className="bg-gradient-to-br from-[#0089ba] to-[#0EA5E9] text-white">{entry.userName.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#008e9b] to-[#0EA5E9] flex items-center justify-center mr-2 text-white shadow-md">
                            <span className="text-sm font-bold">{index * 2 + 4}</span>
                          </div>
                          <span className="font-bold text-lg truncate text-white">{entry.userName}</span>
                        </div>
                        <span className="font-extrabold text-xl text-white bg-white/70 px-3 py-0.5 rounded-full">{entry.score}</span>
                      </div>
                    ))}
                  </div>

                  {/* Right column */}
                  <div className="space-y-1">
                    {rightColumnPlayers.map((entry, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between p-2 bg-gradient-to-r from-white/80 to-blue-100/30 rounded-lg animate-fade-in border-l-2 border-[#0EA5E9] hover:shadow-lg transition-shadow" 
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10 mr-2 avatar-glow">
                            <AvatarImage src={entry.ytProfilePicUrl} alt={entry.userName} />
                            <AvatarFallback className="bg-gradient-to-br from-[#0089ba] to-[#0EA5E9] text-white">{entry.userName.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#D946EF] to-[#F97316] flex items-center justify-center mr-2 text-white shadow-md">
                            <span className="text-sm font-bold">{index * 2 + 5}</span>
                          </div>
                          <span className="font-bold text-lg truncate text-white">{entry.userName}</span>
                        </div>
                        <span className="font-extrabold text-xl text-white bg-white/70 px-3 py-0.5 rounded-full">{entry.score}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </>
        )}
        
        {/* Add decorative elements at the bottom */}
        {gameEnded && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex justify-center mt-4">
            <PartyPopper className={`${isMobile ? 'h-5 w-5' : 'h-8 w-8'} text-yellow-400 animate-bounce mr-2`} />
            <Trophy className={`${isMobile ? 'h-5 w-5' : 'h-8 w-8'} text-yellow-500 animate-pulse mx-2`} />
            <PartyPopper className={`${isMobile ? 'h-5 w-5' : 'h-8 w-8'} text-yellow-400 animate-bounce ml-2`} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LeaderboardPanel;
