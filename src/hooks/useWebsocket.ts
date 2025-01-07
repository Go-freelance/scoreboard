import { useState, useEffect, useCallback } from "react";
import { WEBSOCKET_URL } from "../constants/game";

export function useWebSocket() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const initializeWebSocket = useCallback(() => {
    const websocket = new WebSocket(WEBSOCKET_URL);

    websocket.onopen = () => setIsConnected(true);
    
    websocket.onclose = () => {
      setIsConnected(false);
      setTimeout(() => initializeWebSocket(), 1000);
    };

    setWs(websocket);
  }, []);

  useEffect(() => {
    initializeWebSocket();
  }, [initializeWebSocket]);

  const sendUpdate = useCallback(
    (data: { [key: string]: string | number }) => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
      }
    },
    [ws]
  );

  return { sendUpdate, isConnected };
}
