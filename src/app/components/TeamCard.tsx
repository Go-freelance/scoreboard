import { Team, TeamId } from "../../types/game";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type TeamCardProps = {
  team: Team;
  teamId: TeamId;
  updateScore: (teamId: TeamId, points: number) => void;
  updateTeamName: (teamId: TeamId, name: string) => void;
};

export function TeamCard({
  team,
  teamId,
  updateScore,
  updateTeamName,
}: TeamCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{team.name}</span>
          <Badge variant="secondary" className="text-xl">
            {team.score}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label
              htmlFor={`team${teamId}Name`}
              className="block text-sm font-medium"
            >
              Team Name
            </label>
            <Input
              id={`team${teamId}Name`}
              value={team.name}
              onChange={(e) => updateTeamName(teamId, e.target.value)}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Button onClick={() => updateScore(teamId, 1)}>+1</Button>
            <Button onClick={() => updateScore(teamId, 2)}>+2</Button>
            <Button onClick={() => updateScore(teamId, 3)}>+3</Button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" onClick={() => updateScore(teamId, -1)}>
              -1
            </Button>
            <Button variant="outline" onClick={() => updateScore(teamId, -2)}>
              -2
            </Button>
            <Button variant="outline" onClick={() => updateScore(teamId, -3)}>
              -3
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
