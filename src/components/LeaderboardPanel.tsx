
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";
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

  // Split other players into two columns for desktop view
  const leftColumnPlayers = otherPlayers.slice(0, Math.ceil(otherPlayers.length / 2));
  const rightColumnPlayers = otherPlayers.slice(Math.ceil(otherPlayers.length / 2));

  // Trophy colors for top 3
  const trophyColors = ["text-yellow-500", "text-gray-400", "text-amber-700"];
  
  return (
    <Card className="w-full h-full overflow-hidden flex flex-col glass-card shadow-xl">
      <CardHeader className={`${isMobile ? 'p-1 pb-0' : 'pb-0 pt-4'} bg-gradient-to-r from-[#051937] to-[#004d7a]`}>
        <div className="flex items-center justify-center">
          <Trophy className={`mr-1 ${isMobile ? 'h-4 w-4' : 'h-8 w-8'} text-yellow-500`} />
          <CardTitle className={`${isMobile ? 'text-lg' : 'text-3xl'} font-extrabold text-white drop-shadow-md`}>
            {gameEnded ? "Final Standings" : "Current Standings"}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className={`flex-grow overflow-y-auto ${isMobile ? 'p-1' : 'p-4'}`}>
        {leaderboard.length === 0 ? (
          <div className="text-center py-3 text-2xl font-bold text-white glass-card-dark p-4 rounded-lg">
            No scores yet...
          </div>
        ) : (
          <>
            {/* Top 3 Players with Trophies */}
            {topThree.length > 0 && (
              <div className={`flex flex-col ${isMobile ? 'gap-1 mb-1' : 'gap-3 mb-6'}`}>
                {topThree.map((entry, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center ${isMobile ? 'p-2' : 'p-3'} rounded-lg ${
                      index === 0 
                        ? 'bg-gradient-to-r from-yellow-100/90 to-yellow-200/90 border-2 border-yellow-300/80' 
                        : index === 1 
                          ? 'bg-gradient-to-r from-gray-100/90 to-gray-200/90 border-2 border-gray-300/80'
                          : 'bg-gradient-to-r from-amber-100/90 to-amber-200/90 border-2 border-amber-300/80'
                    } shadow-lg animate-fade-in`}
                    style={{ animationDelay: `${index * 0.15}s` }}
                  >
                    <div className="flex items-center flex-1">
                      <div className={`${isMobile ? 'mr-1' : 'mr-3'}`}>
                        <Trophy className={`${isMobile ? 'h-4 w-4' : 'h-8 w-8'} ${trophyColors[index]}`} />
                      </div>
                      <Avatar className={`${isMobile ? 'h-8 w-8 mr-1' : 'h-14 w-14 mr-2'} border-2 avatar-glow ${
                        index === 0 
                          ? 'border-yellow-400' 
                          : index === 1 
                            ? 'border-gray-400'
                            : 'border-amber-500'
                      }`}>
                        <AvatarImage src={entry.ytProfilePicUrl} alt={entry.userName} />
                        <AvatarFallback className={`${
                          index === 0 
                            ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' 
                            : index === 1 
                              ? 'bg-gradient-to-r from-gray-400 to-gray-500'
                              : 'bg-gradient-to-r from-amber-500 to-amber-600'
                        } text-white`}>{entry.userName.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 truncate">
                        <div className={`${isMobile ? 'text-s' : 'text-xl'} font-extrabold flex items-center`}>
                          {entry.userName}
                          {gameEnded && index === 0 && (
                            <Badge className={`${isMobile ? 'ml-2 px-3 py-1 ' : 'ml-4 px-6 py-2'} bg-gradient-to-r from-purple-500 to-pink-500 text-white animate-pulse border-none shadow-md`}>
                              Winner 🏆
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className={`${isMobile ? 'text-sm' : 'text-2xl'} font-extrabold`}>{entry.score}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Other players - Desktop gets 2 column layout */}
            <div className={`${!isMobile ? "grid grid-cols-2 gap-4" : "space-y-1"}`}>
              {isMobile ? (
                // Mobile view - single column
                otherPlayers.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gradient-to-r from-white/80 to-white/70 rounded-lg animate-fade-in border border-white/30 shadow-md" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-1 avatar-glow">
                        <AvatarImage src={entry.ytProfilePicUrl} alt={entry.userName} />
                        <AvatarFallback className="bg-gradient-to-r from-[#051937] to-[#004d7a] text-white">{entry.userName.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="w-4 h-4 rounded-full bg-gradient-to-r from-[#004d7a] to-[#008793] flex items-center justify-center mr-1 text-white">
                        <span className="text-sm font-bold">{index + 4}</span>
                      </div>
                      <span className="font-bold text-sm truncate max-w-[100px]">{entry.userName}</span>
                    </div>
                    <span className="font-extrabold text-sm">{entry.score}</span>
                  </div>
                ))
              ) : (
                // Desktop view - two columns
                <>
                  {/* Left column */}
                  <div className="space-y-2">
                    {leftColumnPlayers.map((entry, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-white/80 to-white/70 rounded-lg animate-fade-in border border-white/30 shadow-md" style={{ animationDelay: `${index * 0.1}s` }}>
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10 mr-2 avatar-glow">
                            <AvatarImage src={entry.ytProfilePicUrl} alt={entry.userName} />
                            <AvatarFallback className="bg-gradient-to-r from-[#051937] to-[#004d7a] text-white">{entry.userName.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#004d7a] to-[#008793] flex items-center justify-center mr-2 text-white">
                            <span className="text-sm font-bold">{index + 4}</span>
                          </div>
                          <span className="font-bold text-lg truncate">{entry.userName}</span>
                        </div>
                        <span className="font-extrabold text-xl">{entry.score}</span>
                      </div>
                    ))}
                  </div>

                  {/* Right column */}
                  <div className="space-y-2">
                    {rightColumnPlayers.map((entry, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-white/80 to-white/70 rounded-lg animate-fade-in border border-white/30 shadow-md" style={{ animationDelay: `${index * 0.1}s` }}>
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10 mr-2 avatar-glow">
                            <AvatarImage src={entry.ytProfilePicUrl} alt={entry.userName} />
                            <AvatarFallback className="bg-gradient-to-r from-[#051937] to-[#004d7a] text-white">{entry.userName.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#004d7a] to-[#008793] flex items-center justify-center mr-2 text-white">
                            <span className="text-sm font-bold">{index + leftColumnPlayers.length + 4}</span>
                          </div>
                          <span className="font-bold text-lg truncate">{entry.userName}</span>
                        </div>
                        <span className="font-extrabold text-xl">{entry.score}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default LeaderboardPanel;
