import { useReducer, useCallback } from "react";
import { GameState, GameAction, TeamId } from "../types/game";
import {
  INITIAL_GAME_TIMER,
  INITIAL_SHOT_CLOCK,
  INITIAL_PERIOD,
} from "../constants/game";

const initialState: GameState = {
  teamA: { name: "Team A", score: 0 },
  teamB: { name: "Team B", score: 0 },
  gameTimer: INITIAL_GAME_TIMER,
  shotClock: INITIAL_SHOT_CLOCK,
  period: INITIAL_PERIOD,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "UPDATE_TEAM_NAME":
      return {
        ...state,
        [action.teamId === "A" ? "teamA" : "teamB"]: {
          ...state[action.teamId === "A" ? "teamA" : "teamB"],
          name: action.name,
        },
      };
    case "UPDATE_SCORE":
      const team = action.teamId === "A" ? "teamA" : "teamB";
      return {
        ...state,
        [team]: {
          ...state[team],
          score: Math.max(0, state[team].score + action.points),
        },
      };
    case "SET_GAME_TIMER":
      return { ...state, gameTimer: action.time };
    case "SET_SHOT_CLOCK":
      return { ...state, shotClock: action.time };
    case "SET_PERIOD":
      return { ...state, period: action.period };
    default:
      return state;
  }
}

export function useGameState(
  sendUpdate: (data: { [key: string]: string | number }) => void
) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const updateTeamName = useCallback(
    (teamId: TeamId, name: string) => {
      dispatch({ type: "UPDATE_TEAM_NAME", teamId, name });
      sendUpdate({ [`team${teamId}Name`]: name });
    },
    [sendUpdate]
  );

  const updateScore = useCallback(
    (teamId: TeamId, points: number) => {
      dispatch({ type: "UPDATE_SCORE", teamId, points });
      const newScore = state[teamId === "A" ? "teamA" : "teamB"].score + points;
      sendUpdate({ [`team${teamId}Score`]: newScore });
    },
    [sendUpdate, state]
  );

  const setGameTimer = useCallback((time: string) => {
    dispatch({ type: "SET_GAME_TIMER", time });
  }, []);

  const setShotClock = useCallback((time: string) => {
    dispatch({ type: "SET_SHOT_CLOCK", time });
  }, []);

  const setPeriod = useCallback((period: string) => {
    dispatch({ type: "SET_PERIOD", period });
  }, []);

  return {
    state,
    updateTeamName,
    updateScore,
    setGameTimer,
    setShotClock,
    setPeriod,
  };
}
