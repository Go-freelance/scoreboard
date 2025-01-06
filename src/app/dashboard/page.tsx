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

export default function Dashboard() {
  const [teamA, setTeamA] = useState({ name: "Team A", score: 0 });
  const [teamB, setTeamB] = useState({ name: "Team B", score: 0 });
  const [gameTimer, setGameTimer] = useState("10:00");
  const [shotClock, setShotClock] = useState("24");
  const [period, setPeriod] = useState("1");
  const [ws, setWs] = useState<WebSocket | null>(null);

  const router = useRouter();
  const gameTimerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const shotClockIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const websocket = new WebSocket("ws://localhost:8080");
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
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Basketball Scoreboard Manager</h1>
        <Button onClick={handleLogout} variant="outline">
          Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Team A</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="teamAName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Team Name
                </label>
                <Input
                  id="teamAName"
                  value={teamA.name}
                  onChange={(e) => {
                    setTeamA({ ...teamA, name: e.target.value });
                    sendUpdate({ teamAName: e.target.value });
                  }}
                />
              </div>
              <div>
                <label
                  htmlFor="teamAScore"
                  className="block text-sm font-medium text-gray-700"
                >
                  Score
                </label>
                <Input id="teamAScore" value={teamA.score} readOnly />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Button onClick={() => updateScore("A", 1)}>+1</Button>
                <Button onClick={() => updateScore("A", 2)}>+2</Button>
                <Button onClick={() => updateScore("A", 3)}>+3</Button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="destructive"
                  onClick={() => updateScore("A", -1)}
                >
                  -1
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => updateScore("A", -2)}
                >
                  -2
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => updateScore("A", -3)}
                >
                  -3
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team B</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="teamBName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Team Name
                </label>
                <Input
                  id="teamBName"
                  value={teamB.name}
                  onChange={(e) => {
                    setTeamB({ ...teamB, name: e.target.value });
                    sendUpdate({ teamBName: e.target.value });
                  }}
                />
              </div>
              <div>
                <label
                  htmlFor="teamBScore"
                  className="block text-sm font-medium text-gray-700"
                >
                  Score
                </label>
                <Input id="teamBScore" value={teamB.score} readOnly />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Button onClick={() => updateScore("B", 1)}>+1</Button>
                <Button onClick={() => updateScore("B", 2)}>+2</Button>
                <Button onClick={() => updateScore("B", 3)}>+3</Button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="destructive"
                  onClick={() => updateScore("B", -1)}
                >
                  -1
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => updateScore("B", -2)}
                >
                  -2
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => updateScore("B", -3)}
                >
                  -3
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Game Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <label
                htmlFor="gameTimer"
                className="block text-sm font-medium text-gray-700"
              >
                Game Timer
              </label>
              <Input id="gameTimer" value={gameTimer} readOnly />
              <div className="grid grid-cols-3 gap-2 mt-2">
                <Button onClick={startGameTimer}>Start</Button>
                <Button
                  onClick={() => {
                    if (gameTimerIntervalRef.current)
                      clearInterval(gameTimerIntervalRef.current);
                  }}
                >
                  Stop
                </Button>
                <Button
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

            <div>
              <label
                htmlFor="shotClock"
                className="block text-sm font-medium text-gray-700"
              >
                Shot Clock
              </label>
              <Input id="shotClock" value={shotClock} readOnly />
              <div className="grid grid-cols-3 gap-2 mt-2">
                <Button onClick={startShotClock}>Start</Button>
                <Button
                  onClick={() => {
                    if (shotClockIntervalRef.current)
                      clearInterval(shotClockIntervalRef.current);
                  }}
                >
                  Stop
                </Button>
                <Button
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

            <div>
              <label
                htmlFor="period"
                className="block text-sm font-medium text-gray-700"
              >
                Game Period
              </label>
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
        </CardContent>
      </Card>
    </div>
  );
}
