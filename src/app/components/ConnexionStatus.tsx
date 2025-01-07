import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff } from "lucide-react";

type ConnectionStatusProps = {
  isConnected: boolean;
};

export function ConnectionStatus({ isConnected }: ConnectionStatusProps) {
  return (
    <Badge
      variant={isConnected ? "default" : "destructive"}
      className= {`flex items-center gap-2 text-sm font-medium py-1 px-3 rounded-full transition-all duration-300 ease-in-out ${isConnected ? "bg-green-500" : "bg-red-500"}`}
    >
      {isConnected ? (
        <>
          <Wifi size={16} />
          Connected
        </>
      ) : (
        <>
          <WifiOff size={16} />
          Disconnected
        </>
      )}
    </Badge>
  );
}
