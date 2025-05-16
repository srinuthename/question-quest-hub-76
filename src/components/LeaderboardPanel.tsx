
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface LeaderboardEntry {
  ytChannelId: string;
  score: number;
  ytProfilePicUrl: string;
  userName: string;
}

interface LeaderboardPanelProps {
  leaderboard: LeaderboardEntry[];
  gameEnded: boolean;
}

const LeaderboardPanel = ({ leaderboard, gameEnded }: LeaderboardPanelProps) => {
  const isMobile = useIsMobile();

  // Get top 3 players for the podium
  const topThree = leaderboard.slice(0, 3);

  // Get the rest of the players
  const otherPlayers = leaderboard.slice(3);

  // Trophy colors for top 3
  const trophyColors = ["text-yellow-500", "text-gray-400", "text-amber-700"];
  
  return (
    <div className="flex justify-center w-full"> {/* Container to center the card */}
      <Card className={`w-full ${isMobile ? 'max-w-full' : 'max-w-4xl'} h-full overflow-hidden flex flex-col bg-gradient-to-br from-purple-50 to-green-50 shadow-md`}>
        <CardHeader className="pb-0 pt-2">
          <div className="flex items-center justify-center">
            <Trophy className="mr-1 h-4 w-4 text-yellow-500" />
            <CardTitle className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold`}>
              {gameEnded ? "Final Leaderboard" : "Current Standings"}
            </CardTitle>
          </div>
          {gameEnded && (
            <CardDescription className="text-center text-xs">Congratulations to all our players!</CardDescription>
          )}
        </CardHeader>
        <CardContent className="flex-grow overflow-y-auto pt-1 px-2">
          {leaderboard.length === 0 ? (
            <div className="text-center py-2 text-muted-foreground text-sm">
              No scores yet...
            </div>
          ) : (
            <>
              {/* Top 3 Players with Trophies */}
              {topThree.length > 0 && (
                <div className="flex flex-col gap-0.5 mb-2">
                  {topThree.map((entry, index) => (
                    <div 
                      key={index} 
                      className={`flex items-center p-1.5 rounded-lg ${
                        index === 0 
                          ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 border border-yellow-300' 
                          : index === 1 
                            ? 'bg-gradient-to-r from-gray-100 to-gray-200 border border-gray-300'
                            : 'bg-gradient-to-r from-amber-100 to-amber-200 border border-amber-300'
                      } shadow-sm animate-fade-in`}
                      style={{ animationDelay: `${index * 0.15}s` }}
                    >
                      <div className="flex items-center flex-1">
                        <div className="mr-1.5">
                          <Trophy className={`h-4 w-4 ${trophyColors[index]}`} />
                        </div>
                        <Avatar className="h-7.5 w-7.5 border border-white mr-1.5 shadow-sm">
                          <AvatarImage src={entry.ytProfilePicUrl} alt={entry.userName} />
                          <AvatarFallback>{entry.userName.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-semibold text-xs flex items-center">
                            {entry.userName}
                            {gameEnded && index === 0 && (
                              <span className="ml-1 text-xs font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white animate-pulse">
                                Winner
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="font-bold text-sm">{entry.score}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Other players - Only show single column on mobile */}
              <div className="space-y-0.5">
                {otherPlayers.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-1 bg-white/70 rounded-lg animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-1">
                        <AvatarImage src={entry.ytProfilePicUrl} alt={entry.userName} />
                        <AvatarFallback>{entry.userName.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="w-3.5 h-3.5 rounded-full bg-muted-foreground/20 flex items-center justify-center mr-1">
                        <span className="text-xs font-medium">{index + 4}</span>
                      </div>
                      <span className="font-medium text-xs">{entry.userName}</span>
                    </div>
                    <span className="font-bold text-xs">{entry.score}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaderboardPanel;
