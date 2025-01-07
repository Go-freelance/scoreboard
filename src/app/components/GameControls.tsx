import { useGameTimer } from '../../hooks/useGameTimer';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Clock, Activity, Users } from 'lucide-react';

type GameControlsProps = {
  gameTimer: string;
  shotClock: string;
  period: string;
  setGameTimer: (time: string) => void;
  setShotClock: (time: string) => void;
  setPeriod: (period: string) => void;
  sendUpdate: (data: { [key: string]: string | number }) => void;
};

export function GameControls({
  gameTimer,
  shotClock,
  period,
  setGameTimer,
  setShotClock,
  setPeriod,
  sendUpdate,
}: GameControlsProps) {
  const { startTimer: startGameTimer, stopTimer: stopGameTimer } = useGameTimer(
    gameTimer,
    (time) => {
      setGameTimer(time);
      sendUpdate({ gameTimer: time });
    },
    () => sendUpdate({ gameTimer: "00:00" })
  );

  const { startTimer: startShotClock, stopTimer: stopShotClock } = useGameTimer(
    shotClock,
    (time) => {
      setShotClock(time);
      sendUpdate({ shotClock: time });
    },
    () => sendUpdate({ shotClock: "00" })
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Game Controls</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <label htmlFor="gameTimer" className="block text-sm font-medium mb-2">
              Game Timer
            </label>
            <div className="flex items-center space-x-2">
              <Clock className="text-gray-500" />
              <Input id="gameTimer" value={gameTimer} readOnly className="text-2xl font-bold text-center" />
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <Button onClick={startGameTimer}>Start</Button>
              <Button variant="outline" onClick={stopGameTimer}>Stop</Button>
              <Button
                variant="secondary"
                onClick={() => {
                  stopGameTimer();
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
            <label htmlFor="shotClock" className="block text-sm font-medium mb-2">
              Shot Clock
            </label>
            <div className="flex items-center space-x-2">
              <Activity className="text-gray-500" />
              <Input id="shotClock" value={shotClock} readOnly className="text-2xl font-bold text-center" />
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <Button onClick={startShotClock}>Start</Button>
              <Button variant="outline" onClick={stopShotClock}>Stop</Button>
              <Button
                variant="secondary"
                onClick={() => {
                  stopShotClock();
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

