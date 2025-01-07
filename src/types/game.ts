export type Team = {
  name: string;
  score: number;
};

export type TeamId = "A" | "B";

export type GameState = {
  teamA: Team;
  teamB: Team;
  gameTimer: string;
  shotClock: string;
  period: string;
};

export type GameAction =
  | { type: "UPDATE_TEAM_NAME"; teamId: TeamId; name: string }
  | { type: "UPDATE_SCORE"; teamId: TeamId; points: number }
  | { type: "SET_GAME_TIMER"; time: string }
  | { type: "SET_SHOT_CLOCK"; time: string }
  | { type: "SET_PERIOD"; period: string };
