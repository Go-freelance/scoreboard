"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  const [teamA, setTeamA] = useState({ name: 'Team A', score: 0 });
  const [teamB, setTeamB] = useState({ name: 'Team B', score: 0 });
  const [gameTimer, setGameTimer] = useState('10:00');
  const [shotClock, setShotClock] = useState('24');
  const [period, setPeriod] = useState('1');
  const [ws, setWs] = useState<WebSocket | null>(null);

  const gameTimerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const shotClockIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const websocket = new WebSocket('ws://localhost:8080');
    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, []);

  const sendUpdate = useCallback((data: { [key: string]: string | number }) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }, [ws]);

  const updateScore = (team: 'A' | 'B', points: number) => {
    const updatedTeam = team === 'A' ? 
      { ...teamA, score: Math.max(0, teamA.score + points) } :
      { ...teamB, score: Math.max(0, teamB.score + points) };
    
    if (team === 'A') {
      setTeamA(updatedTeam);
    } else {
      setTeamB(updatedTeam);
    }

    sendUpdate({ [`team${team}Score`]: updatedTeam.score });
  };

  const startGameTimer = useCallback(() => {
    if (gameTimerIntervalRef.current) clearInterval(gameTimerIntervalRef.current);
    let [minutes, seconds] = gameTimer.split(':').map(Number);

    gameTimerIntervalRef.current = setInterval(() => {
      if (seconds === 0 && minutes === 0) {
        if (gameTimerIntervalRef.current) clearInterval(gameTimerIntervalRef.current);
        sendUpdate({ gameTimer: '00:00' });
        return;
      }

      if (seconds === 0) {
        minutes--;
        seconds = 59;
      } else {
        seconds--;
      }

      const newTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      setGameTimer(newTime);
      sendUpdate({ gameTimer: newTime });
    }, 1000);
  }, [gameTimer, sendUpdate]);

  const startShotClock = useCallback(() => {
    if (shotClockIntervalRef.current) clearInterval(shotClockIntervalRef.current);
    let seconds = parseInt(shotClock);

    shotClockIntervalRef.current = setInterval(() => {
      if (seconds === 0) {
        if (shotClockIntervalRef.current) clearInterval(shotClockIntervalRef.current);
        sendUpdate({ shotClock: '00' });
        return;
      }

      seconds--;
      const newTime = String(seconds).padStart(2, '0');
      setShotClock(newTime);
      sendUpdate({ shotClock: newTime });
    }, 1000);
  }, [shotClock, sendUpdate]);

  useEffect(() => {
    return () => {
      if (gameTimerIntervalRef.current) clearInterval(gameTimerIntervalRef.current);
      if (shotClockIntervalRef.current) clearInterval(shotClockIntervalRef.current);
    };
  }, []);

  return (
    <div className="container">
      <h1>Basketball Scoreboard Manager</h1>

      <div className="score-controls">
        <Card className="team-controls">
          <CardHeader>
            <CardTitle>Team A</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="form-group">
              <label htmlFor="teamAName">Team Name</label>
              <Input 
                type="text" 
                id="teamAName" 
                value={teamA.name}
                onChange={(e) => {
                  setTeamA({ ...teamA, name: e.target.value });
                  sendUpdate({ teamAName: e.target.value });
                }}
              />
            </div>
            <div className="form-group">
              <label htmlFor="teamAScore">Score</label>
              <Input type="number" id="teamAScore" value={teamA.score} readOnly />
            </div>
            <div className="score-row">
              <Button onClick={() => updateScore('A', 1)}>+1</Button>
              <Button onClick={() => updateScore('A', 2)}>+2</Button>
              <Button onClick={() => updateScore('A', 3)}>+3</Button>
            </div>
            <div className="score-row">
              <Button variant="destructive" onClick={() => updateScore('A', -1)}>-1</Button>
              <Button variant="destructive" onClick={() => updateScore('A', -2)}>-2</Button>
              <Button variant="destructive" onClick={() => updateScore('A', -3)}>-3</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="team-controls">
          <CardHeader>
            <CardTitle>Team B</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="form-group">
              <label htmlFor="teamBName">Team Name</label>
              <Input 
                type="text" 
                id="teamBName" 
                value={teamB.name}
                onChange={(e) => {
                  setTeamB({ ...teamB, name: e.target.value });
                  sendUpdate({ teamBName: e.target.value });
                }}
              />
            </div>
            <div className="form-group">
              <label htmlFor="teamBScore">Score</label>
              <Input type="number" id="teamBScore" value={teamB.score} readOnly />
            </div>
            <div className="score-row">
              <Button onClick={() => updateScore('B', 1)}>+1</Button>
              <Button onClick={() => updateScore('B', 2)}>+2</Button>
              <Button onClick={() => updateScore('B', 3)}>+3</Button>
            </div>
            <div className="score-row">
              <Button variant="destructive" onClick={() => updateScore('B', -1)}>-1</Button>
              <Button variant="destructive" onClick={() => updateScore('B', -2)}>-2</Button>
              <Button variant="destructive" onClick={() => updateScore('B', -3)}>-3</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="mt-6">
          <div className="form-group">
            <label htmlFor="gameTimer">Game Timer</label>
            <Input type="text" id="gameTimer" value={gameTimer} readOnly />
          </div>

          <div className="timer-controls">
            <Button onClick={startGameTimer}>Start</Button>
            <Button onClick={() => {
              if (gameTimerIntervalRef.current) clearInterval(gameTimerIntervalRef.current);
            }}>Stop</Button>
            <Button onClick={() => {
              if (gameTimerIntervalRef.current) clearInterval(gameTimerIntervalRef.current);
              setGameTimer('10:00');
              sendUpdate({ gameTimer: '10:00' });
            }}>Reset</Button>
          </div>

          <div className="form-group mt-4">
            <label htmlFor="shotClock">Shot Clock</label>
            <Input type="text" id="shotClock" value={shotClock} readOnly />
          </div>

          <div className="timer-controls">
            <Button onClick={startShotClock}>Start</Button>
            <Button onClick={() => {
              if (shotClockIntervalRef.current) clearInterval(shotClockIntervalRef.current);
            }}>Stop</Button>
            <Button onClick={() => {
              clearInterval(shotClockIntervalRef.current!);
              setShotClock('24');
              sendUpdate({ shotClock: '24' });
            }}>Reset</Button>
          </div>

          <div className="form-group mt-4">
            <label htmlFor="period">Game Period</label>
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
        </CardContent>
      </Card>
    </div>
  );
}

