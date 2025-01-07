"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Clock, Activity, Users } from "lucide-react";

type Team = {
  name: string;
  score: number;
};

type TeamCardProps = {
  team: Team;
  teamId: "A" | "B";
  updateScore: (points: number) => void;
  sendUpdate: (data: { [key: string]: string | number }) => void;
  setTeam: React.Dispatch<React.SetStateAction<Team>>;
};

type GameControlsProps = {
  gameTimer: string;
  shotClock: string;
  period: string;
  startGameTimer: () => void;
  startShotClock: () => void;
  setPeriod: React.Dispatch<React.SetStateAction<string>>;
  sendUpdate: (data: { [key: string]: string | number }) => void;
  setGameTimer: React.Dispatch<React.SetStateAction<string>>;
  setShotClock: React.Dispatch<React.SetStateAction<string>>;
  gameTimerIntervalRef: React.RefObject<NodeJS.Timeout | null>;
  shotClockIntervalRef: React.RefObject<NodeJS.Timeout | null>;
};

export default function Dashboard() {
  const [teamA, setTeamA] = useState<Team>({ name: "Team A", score: 0 });
  const [teamB, setTeamB] = useState<Team>({ name: "Team B", score: 0 });
  const [gameTimer, setGameTimer] = useState("10:00");
  const [shotClock, setShotClock] = useState("24");
  const [period, setPeriod] = useState("1");
  const [ws, setWs] = useState<WebSocket | null>(null);

  const router = useRouter();
  const gameTimerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const shotClockIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const websocket = new WebSocket("wss://lotto-r7aq.onrender.com/");
    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, []);

  const sendUpdate = useCallback(
    (data: { [key: string]: string | number }) => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
      }
    },
    [ws]
  );

  const updateScore = useCallback(
    (team: "A" | "B", points: number) => {
      const updatedTeam =
        team === "A"
          ? { ...teamA, score: Math.max(0, teamA.score + points) }
          : { ...teamB, score: Math.max(0, teamB.score + points) };

      if (team === "A") {
        setTeamA(updatedTeam);
      } else {
        setTeamB(updatedTeam);
      }

      sendUpdate({ [`team${team}Score`]: updatedTeam.score });
    },
    [teamA, teamB, sendUpdate]
  );

  const startGameTimer = useCallback(() => {
    if (gameTimerIntervalRef.current)
      clearInterval(gameTimerIntervalRef.current);
    let [minutes, seconds] = gameTimer.split(":").map(Number);

    gameTimerIntervalRef.current = setInterval(() => {
      if (seconds === 0 && minutes === 0) {
        if (gameTimerIntervalRef.current)
          clearInterval(gameTimerIntervalRef.current);
        sendUpdate({ gameTimer: "00:00" });
        return;
      }

      if (seconds === 0) {
        minutes--;
        seconds = 59;
      } else {
        seconds--;
      }

      const newTime = `${String(minutes).padStart(2, "0")}:${String(
        seconds
      ).padStart(2, "0")}`;
      setGameTimer(newTime);
      sendUpdate({ gameTimer: newTime });
    }, 1000);
  }, [gameTimer, sendUpdate]);

  const startShotClock = useCallback(() => {
    if (shotClockIntervalRef.current)
      clearInterval(shotClockIntervalRef.current);
    let seconds = parseInt(shotClock);

    shotClockIntervalRef.current = setInterval(() => {
      if (seconds === 0) {
        if (shotClockIntervalRef.current)
          clearInterval(shotClockIntervalRef.current);
        sendUpdate({ shotClock: "00" });
        return;
      }

      seconds--;
      const newTime = String(seconds).padStart(2, "0");
      setShotClock(newTime);
      sendUpdate({ shotClock: newTime });
    }, 1000);
  }, [shotClock, sendUpdate]);

  useEffect(() => {
    return () => {
      if (gameTimerIntervalRef.current)
        clearInterval(gameTimerIntervalRef.current);
      if (shotClockIntervalRef.current)
        clearInterval(shotClockIntervalRef.current);
    };
  }, []);

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
              <div>{teamA.name}</div>
              <div className="text-6xl">
                {teamA.score} - {teamB.score}
              </div>
              <div>{teamB.name}</div>
            </div>
          </CardContent>
        </Card>

        <TeamCard
          team={teamA}
          teamId="A"
          updateScore={(points) => updateScore("A", points)}
          sendUpdate={sendUpdate}
          setTeam={setTeamA}
        />
        <GameControls
          gameTimer={gameTimer}
          shotClock={shotClock}
          period={period}
          startGameTimer={startGameTimer}
          startShotClock={startShotClock}
          setPeriod={setPeriod}
          sendUpdate={sendUpdate}
          setGameTimer={setGameTimer}
          setShotClock={setShotClock}
          gameTimerIntervalRef={gameTimerIntervalRef}
          shotClockIntervalRef={shotClockIntervalRef}
        />
        <TeamCard
          team={teamB}
          teamId="B"
          updateScore={(points) => updateScore("B", points)}
          sendUpdate={sendUpdate}
          setTeam={setTeamB}
        />
      </div>
    </div>
  );
}

function TeamCard({
  team,
  teamId,
  updateScore,
  sendUpdate,
  setTeam,
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
              onChange={(e) => {
                const newName = e.target.value;
                setTeam({ ...team, name: newName });
                sendUpdate({ [`team${teamId}Name`]: newName });
              }}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Button onClick={() => updateScore(1)}>+1</Button>
            <Button onClick={() => updateScore(2)}>+2</Button>
            <Button onClick={() => updateScore(3)}>+3</Button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" onClick={() => updateScore(-1)}>
              -1
            </Button>
            <Button variant="outline" onClick={() => updateScore(-2)}>
              -2
            </Button>
            <Button variant="outline" onClick={() => updateScore(-3)}>
              -3
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function GameControls({
  gameTimer,
  shotClock,
  period,
  startGameTimer,
  startShotClock,
  setPeriod,
  sendUpdate,
  setGameTimer,
  setShotClock,
  gameTimerIntervalRef,
  shotClockIntervalRef,
}: GameControlsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Game Controls</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <label
              htmlFor="gameTimer"
              className="block text-sm font-medium mb-2"
            >
              Game Timer
            </label>
            <div className="flex items-center space-x-2">
              <Clock className="text-gray-500" />
              <Input
                id="gameTimer"
                value={gameTimer}
                readOnly
                className="text-2xl font-bold text-center"
              />
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <Button onClick={startGameTimer}>Start</Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (gameTimerIntervalRef.current)
                    clearInterval(gameTimerIntervalRef.current);
                }}
              >
                Stop
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  if (gameTimerIntervalRef.current)
                    clearInterval(gameTimerIntervalRef.current);
                  setGameTimer("10:00");
                  sendUpdate({ gameTimer: "10:00" });
                }}
              >
                Reset
              </Button>
            </div>
          </div>

          <Separator />

          <div>
            <label
              htmlFor="shotClock"
              className="block text-sm font-medium mb-2"
            >
              Shot Clock
            </label>
            <div className="flex items-center space-x-2">
              <Activity className="text-gray-500" />
              <Input
                id="shotClock"
                value={shotClock}
                readOnly
                className="text-2xl font-bold text-center"
              />
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <Button onClick={startShotClock}>Start</Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (shotClockIntervalRef.current)
                    clearInterval(shotClockIntervalRef.current);
                }}
              >
                Stop
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  if (shotClockIntervalRef.current)
                    clearInterval(shotClockIntervalRef.current);
                  setShotClock("24");
                  sendUpdate({ shotClock: "24" });
                }}
              >
                Reset
              </Button>
            </div>
          </div>

          <Separator />

          <div>
            <label htmlFor="period" className="block text-sm font-medium mb-2">
              Game Period
            </label>
            <div className="flex items-center space-x-2">
              <Users className="text-gray-500" />
              <Select
                value={period}
                onValueChange={(value) => {
                  setPeriod(value);
                  sendUpdate({ period: value });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1st Quarter</SelectItem>
                  <SelectItem value="2">2nd Quarter</SelectItem>
                  <SelectItem value="3">3rd Quarter</SelectItem>
                  <SelectItem value="4">4th Quarter</SelectItem>
                  <SelectItem value="OT">Overtime</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
