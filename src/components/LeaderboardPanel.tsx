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

  // Split other players into two columns for desktop view
  const leftColumnPlayers = otherPlayers.slice(0, Math.ceil(otherPlayers.length / 2));
  const rightColumnPlayers = otherPlayers.slice(Math.ceil(otherPlayers.length / 2));

  // Trophy colors for top 3
  const trophyColors = ["text-yellow-500", "text-gray-400", "text-amber-700"];
  
  return (
    <div className="flex justify-center w-full"> {/* Container to center the card */}
      <Card className="w-full max-w-4xl h-full overflow-hidden flex flex-col bg-gradient-to-br from-purple-50 to-green-50 shadow-md">
        <CardHeader className="pb-0 pt-4">
          <div className="flex items-center justify-center">
            <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
            <CardTitle className="text-xl font-semibold">
              {gameEnded ? "Final Leaderboard" : "Current Standings"}
            </CardTitle>
          </div>
          {gameEnded && (
            <CardDescription className="text-center">Congratulations to all our players!</CardDescription>
          )}
        </CardHeader>
        <CardContent className="flex-grow overflow-y-auto pt-1 px-4">
          {leaderboard.length === 0 ? (
            <div className="text-center py-3 text-muted-foreground">
              No scores yet...
            </div>
          ) : (
            <>
              {/* Top 3 Players with Trophies */}
              {topThree.length > 0 && (
                <div className="flex flex-col gap-1 mb-3">
                  {topThree.map((entry, index) => (
                    <div 
                      key={index} 
                      className={`flex items-center p-2 rounded-lg ${
                        index === 0 
                          ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 border border-yellow-300' 
                          : index === 1 
                            ? 'bg-gradient-to-r from-gray-100 to-gray-200 border border-gray-300'
                            : 'bg-gradient-to-r from-amber-100 to-amber-200 border border-amber-300'
                      } shadow-sm animate-fade-in`}
                      style={{ animationDelay: `${index * 0.15}s` }}
                    >
                      <div className="flex items-center flex-1">
                        <div className="mr-3">
                          <Trophy className={`h-5 w-5 ${trophyColors[index]}`} />
                        </div>
                        <Avatar className="h-8 w-8 border-2 border-white mr-2 shadow-sm">
                          <AvatarImage src={entry.ytProfilePicUrl} alt={entry.userName} />
                          <AvatarFallback>{entry.userName.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-semibold flex items-center">
                            {entry.userName}
                            {gameEnded && index === 0 && (
                              <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white animate-pulse">
                                Winner
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="font-bold text-lg">{entry.score}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Other players - Desktop gets 2 column layout */}
              <div className={`${!isMobile ? "grid grid-cols-2 gap-1" : "space-y-0.5"}`}>
                {isMobile ? (
                  // Mobile view - single column
                  otherPlayers.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-1.5 bg-white/70 rounded-lg animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className="flex items-center">
                        <Avatar className="h-6 w-6 mr-1.5">
                          <AvatarImage src={entry.ytProfilePicUrl} alt={entry.userName} />
                          <AvatarFallback>{entry.userName.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="w-4 h-4 rounded-full bg-muted-foreground/20 flex items-center justify-center mr-1.5">
                          <span className="text-xs font-medium">{index + 4}</span>
                        </div>
                        <span className="font-medium">{entry.userName}</span>
                      </div>
                      <span className="font-bold">{entry.score}</span>
                    </div>
                  ))
                ) : (
                  // Desktop view - two columns
                  <>
                    {/* Left column */}
                    <div className="space-y-0.5">
                      {leftColumnPlayers.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between p-1.5 bg-white/70 rounded-lg animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                          <div className="flex items-center">
                            <Avatar className="h-6 w-6 mr-1.5">
                              <AvatarImage src={entry.ytProfilePicUrl} alt={entry.userName} />
                              <AvatarFallback>{entry.userName.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="w-4 h-4 rounded-full bg-muted-foreground/20 flex items-center justify-center mr-1.5">
                              <span className="text-xs font-medium">{index + 4}</span>
                            </div>
                            <span className="font-medium">{entry.userName}</span>
                          </div>
                          <span className="font-bold">{entry.score}</span>
                        </div>
                      ))}
                    </div>

                    {/* Right column */}
                    <div className="space-y-0.5">
                      {rightColumnPlayers.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between p-1.5 bg-white/70 rounded-lg animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                          <div className="flex items-center">
                            <Avatar className="h-6 w-6 mr-1.5">
                              <AvatarImage src={entry.ytProfilePicUrl} alt={entry.userName} />
                              <AvatarFallback>{entry.userName.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="w-4 h-4 rounded-full bg-muted-foreground/20 flex items-center justify-center mr-1.5">
                              <span className="text-xs font-medium">{index + leftColumnPlayers.length + 4}</span>
                            </div>
                            <span className="font-medium">{entry.userName}</span>
                          </div>
                          <span className="font-bold">{entry.score}</span>
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
    </div>
  );
};

export default LeaderboardPanel;
