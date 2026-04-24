"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getUnreadMessagesCount } from "@/services/messageService";

type MessageContextType = {
  unreadMessages: number;
  loadUnreadMessages: () => Promise<void>;
};

export const MessageContext = createContext<MessageContextType>({
  unreadMessages: 0,
  loadUnreadMessages: async () => {},
});

export const MessageProvider = ({ children }: { children: React.ReactNode }) => {
  const [unreadMessages, setUnreadMessages] = useState(0);

  const loadUnreadMessages = async () => {
    try {
      const count = await getUnreadMessagesCount();
      setUnreadMessages(count);
    } catch {
      console.log("Error loading unread messages");
    }
  };

  useEffect(() => {
    loadUnreadMessages();
    const interval = setInterval(loadUnreadMessages, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <MessageContext.Provider value={{ unreadMessages, loadUnreadMessages }}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessages = () => useContext(MessageContext);