"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getMyNotifications } from "@/services/notificationService";

type NotificationContextType = {
  unreadCount: number;
  loadUnreadCount: () => Promise<void>;
};

export const NotificationContext = createContext<NotificationContextType>({
  unreadCount: 0,
  loadUnreadCount: async () => {},
});

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  const loadUnreadCount = async () => {
    try {
      const data = await getMyNotifications();
      const count = data.filter((n: any) => !n.read).length;
      setUnreadCount(count);
    } catch {
      console.log("Error loading unread count");
    }
  };

  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider value={{ unreadCount, loadUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);