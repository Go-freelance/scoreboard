import { renderHook, act } from "@testing-library/react";
import { useGameState } from "../../../hooks/useGameState";
import { INITIAL_GAME_TIMER, INITIAL_SHOT_CLOCK, INITIAL_PERIOD } from "../../../constants/game";

describe("useGameState", () => {
  let mockSendUpdate: jest.Mock;

  beforeEach(() => {
    mockSendUpdate = jest.fn();
  });

  it("initialise correctement l'état", () => {
    const { result } = renderHook(() => useGameState(mockSendUpdate));

    expect(result.current.state).toEqual({
      teamA: { name: "Team A", score: 0 },
      teamB: { name: "Team B", score: 0 },
      gameTimer: INITIAL_GAME_TIMER,
      shotClock: INITIAL_SHOT_CLOCK,
      period: INITIAL_PERIOD,
    });
  });

  it("met à jour le nom de l'équipe et appelle sendUpdate", () => {
    const { result } = renderHook(() => useGameState(mockSendUpdate));

    act(() => {
      result.current.updateTeamName("A", "New Team A");
    });

    expect(result.current.state.teamA.name).toBe("New Team A");
    expect(mockSendUpdate).toHaveBeenCalledWith({ teamAName: "New Team A" });
  });

  it("met à jour le score de l'équipe et appelle sendUpdate", () => {
    const { result } = renderHook(() => useGameState(mockSendUpdate));

    act(() => {
      result.current.updateScore("A", 5);
    });

    expect(result.current.state.teamA.score).toBe(5);
    expect(mockSendUpdate).toHaveBeenCalledWith({ teamAScore: 5 });

    act(() => {
      result.current.updateScore("A", -3);
    });

    expect(result.current.state.teamA.score).toBe(2);
    expect(mockSendUpdate).toHaveBeenCalledWith({ teamAScore: 2 });
  });

  it("ne permet pas un score négatif", () => {
    const { result } = renderHook(() => useGameState(mockSendUpdate));

    act(() => {
      result.current.updateScore("A", -5);
    });

    expect(result.current.state.teamA.score).toBe(0);
    expect(mockSendUpdate).toHaveBeenCalledWith({ teamAScore: 0 });
  });

  it("met à jour le timer du jeu", () => {
    const { result } = renderHook(() => useGameState(mockSendUpdate));

    act(() => {
      result.current.setGameTimer("10:00");
    });

    expect(result.current.state.gameTimer).toBe("10:00");
  });

  it("met à jour l'horloge des tirs", () => {
    const { result } = renderHook(() => useGameState(mockSendUpdate));

    act(() => {
      result.current.setShotClock("24");
    });

    expect(result.current.state.shotClock).toBe("24");
  });

  it("met à jour la période", () => {
    const { result } = renderHook(() => useGameState(mockSendUpdate));

    act(() => {
      result.current.setPeriod("2");
    });

    expect(result.current.state.period).toBe("2");
  });
});
