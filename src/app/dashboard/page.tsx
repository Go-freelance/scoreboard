"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGameState } from "../../hooks/useGameState";
import { useWebSocket } from "../../hooks/useWebsocket";
import { TeamCard } from "../components/TeamCard";
import { GameControls } from "../components/GameControls";
import { ConnectionStatus } from "../components/ConnexionStatus";

export default function Dashboard() {
  const router = useRouter();
  const { sendUpdate, isConnected } = useWebSocket();
  const {
    state,
    updateTeamName,
    updateScore,
    setGameTimer,
    setShotClock,
    setPeriod,
  } = useGameState(sendUpdate);

  const handleLogout = async () => {
    const response = await fetch("/api/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (response.ok) {
      router.push("/");
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Basketball Scoreboard Manager</h1>
        <ConnectionStatus isConnected={isConnected} />
        <Button onClick={handleLogout} variant="outline">
          Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-3">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Game Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center text-4xl font-bold">
              <div>{state.teamA.name}</div>
              <div className="text-6xl">
                {state.teamA.score} - {state.teamB.score}
              </div>
              <div>{state.teamB.name}</div>
            </div>
          </CardContent>
        </Card>

        <TeamCard
          team={state.teamA}
          teamId="A"
          updateScore={updateScore}
          updateTeamName={updateTeamName}
        />
        <GameControls
          gameTimer={state.gameTimer}
          shotClock={state.shotClock}
          period={state.period}
          setGameTimer={setGameTimer}
          setShotClock={setShotClock}
          setPeriod={setPeriod}
          sendUpdate={sendUpdate}
        />
        <TeamCard
          team={state.teamB}
          teamId="B"
          updateScore={updateScore}
          updateTeamName={updateTeamName}
        />
      </div>
    </div>
  );
}
