"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io as ClientIO, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: string[];
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  onlineUsers: [],
});

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const { data: session } = useSession();

  useEffect(() => {
    // Only connect if the user is authenticated
    if (!session?.user?.id) return;

    // Use empty string to connect to the same host
    const socketInstance = new (ClientIO as any)("", {
      path: "/socket.io",
    });

    socketInstance.on("connect", () => {
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
    });

    socketInstance.on("online-users", (users: string[]) => {
      setOnlineUsers(users);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [session?.user?.id]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
