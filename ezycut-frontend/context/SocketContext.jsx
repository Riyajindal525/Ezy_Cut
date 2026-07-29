import { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import useAuthStore from "../src/store/auth.store";
import toast from "../src/utils/toast";

const SocketContext = createContext(null);

// 👇 adjust if your backend runs on a different port/URL in dev
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export const SocketProvider = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  const socketRef = useRef(null);

  useEffect(() => {
    // No user logged in yet — don't connect
    if (!user?.id && !user?._id) return;

    const userId = user._id || user.id;

    const socket = io(SOCKET_URL, {
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join", userId);
    });

    // 👇 This is the global popup — fires no matter which page the user is on
    socket.on("notification", (data) => {
      const isPositive =
        data.title?.toLowerCase().includes("confirm") ||
        data.title?.toLowerCase().includes("success");
      const isNegative =
        data.title?.toLowerCase().includes("cancel") ||
        data.title?.toLowerCase().includes("declin") ||
        data.title?.toLowerCase().includes("no show");

      if (isNegative) {
        toast.error(data.title, { description: data.message });
      } else if (isPositive) {
        toast.success(data.title, { description: data.message });
      } else {
        toast.info(data.title, { description: data.message });
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);