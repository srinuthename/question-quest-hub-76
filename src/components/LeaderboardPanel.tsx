import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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

  return (
    <div className="flex justify-center w-full"> {/* Container to center the card */}
      <Card className="w-full max-w-4xl h-full overflow-hidden flex flex-col bg-gradient-to-br from-purple-50 to-green-50 shadow-md">
        <CardHeader className="pb-1">
          <div className="flex items-center">
            <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
            <CardTitle className="text-xl font-semibold">
              {gameEnded ? "Final Leaderboard" : "Current Standings"}
            </CardTitle>
          </div>
          {gameEnded && (
            <CardDescription>Congratulations to all our players!</CardDescription>
          )}
        </CardHeader>
        <CardContent className="flex-grow overflow-y-auto pt-1">
          {leaderboard.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No scores yet...
            </div>
          ) : (
            <>
              {/* Top 3 Podium */}
              {topThree.length > 0 && (
                <div className="podium mb-4">
                  {topThree.map((entry, index) => (
                    <div key={index} className="podium-place">
                      <div className="podium-avatar">
                        <img
                          src={entry.ytProfilePicUrl}
                          alt={`Player ${entry.userName}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="podium-stand" />
                      <div className="podium-name">{entry.userName}</div>
                      <div className="podium-score">{entry.score}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Other players - Desktop gets 2 column layout */}
              <div className={`${!isMobile ? "grid grid-cols-2 gap-2" : "space-y-1"}`}>
                {isMobile ? (
                  // Mobile view - single column
                  otherPlayers.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white/70 rounded-lg animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full overflow-hidden mr-2">
                          <img
                            src={entry.ytProfilePicUrl}
                            alt={`Player ${entry.userName}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="w-4 h-4 rounded-full bg-muted-foreground/20 flex items-center justify-center mr-2">
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
                    <div className="space-y-1">
                      {leftColumnPlayers.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-white/70 rounded-lg animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                          <div className="flex items-center">
                            <div className="w-6 h-6 rounded-full overflow-hidden mr-2">
                              <img
                                src={entry.ytProfilePicUrl}
                                alt={`Player ${entry.userName}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="w-4 h-4 rounded-full bg-muted-foreground/20 flex items-center justify-center mr-2">
                              <span className="text-xs font-medium">{index + 4}</span>
                            </div>
                            <span className="font-medium">{entry.userName}</span>
                          </div>
                          <span className="font-bold">{entry.score}</span>
                        </div>
                      ))}
                    </div>

                    {/* Right column */}
                    <div className="space-y-1">
                      {rightColumnPlayers.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-white/70 rounded-lg animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                          <div className="flex items-center">
                            <div className="w-6 h-6 rounded-full overflow-hidden mr-2">
                              <img
                                src={entry.ytProfilePicUrl}
                                alt={`Player ${entry.userName}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="w-4 h-4 rounded-full bg-muted-foreground/20 flex items-center justify-center mr-2">
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
