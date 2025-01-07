import { useState, useEffect, useCallback } from "react";
import { WEBSOCKET_URL } from "../constants/game";

export function useWebSocket() {
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const websocket = new WebSocket(WEBSOCKET_URL);
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

  return { sendUpdate };
}
