
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trophy } from "lucide-react";

interface LeaderboardPanelProps {
  leaderboard: [string, number][];
  gameEnded: boolean;
}

const LeaderboardPanel = ({ leaderboard, gameEnded }: LeaderboardPanelProps) => {
  // Get top 3 players for the podium
  const topThree = leaderboard.slice(0, 3);
  
  // Get the rest of the players
  const otherPlayers = leaderboard.slice(3);
  
  return (
    <Card className="h-full overflow-hidden flex flex-col bg-gradient-to-br from-purple-50 to-green-50 shadow-md">
      <CardHeader className="pb-2">
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
      <CardContent className="flex-grow overflow-y-auto">
        {leaderboard.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No scores yet...
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {topThree.length > 0 && (
              <div className="podium mb-6">
                {topThree.map(([name, score], index) => (
                  <div key={index} className="podium-place">
                    <div className="podium-avatar">
                      <span className="text-xs font-bold">
                        {index + 1}
                      </span>
                    </div>
                    <div className="podium-stand" />
                    <div className="podium-name">{name}</div>
                    <div className="podium-score">{score}</div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Other players */}
            <div className="space-y-2">
              {otherPlayers.map(([name, score], index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/70 rounded-lg animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-muted-foreground/20 flex items-center justify-center mr-3">
                      <span className="text-xs font-medium">{index + 4}</span>
                    </div>
                    <span className="font-medium">{name}</span>
                  </div>
                  <span className="font-bold">{score}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default LeaderboardPanel;
