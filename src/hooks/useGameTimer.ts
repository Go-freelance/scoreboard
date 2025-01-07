import { useRef, useCallback } from "react";

export function useGameTimer(
  initialTime: string,
  onTick: (time: string) => void,
  onFinish: () => void
) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    let [minutes, seconds] = initialTime.split(":").map(Number);

    // Si le temps initial ne contient pas de ":", considérez-le comme des secondes
    if (isNaN(seconds)) {
      seconds = Number(initialTime);
      minutes = 0;
    }

    intervalRef.current = setInterval(() => {
      if (seconds === 0 && minutes === 0) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        onFinish();
        return;
      }

      if (seconds === 0) {
        minutes--;
        seconds = 59;
      } else {
        seconds--;
      }

      const newTime =
        minutes > 0
          ? `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
              2,
              "0"
            )}`
          : String(seconds).padStart(2, "0");
      onTick(newTime);
    }, 1000);
  }, [initialTime, onTick, onFinish]);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  return { startTimer, stopTimer };
}
