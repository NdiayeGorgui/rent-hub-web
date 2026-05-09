"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getUnreadMessagesCount } from "@/services/messageService";
import { useAuth } from "@/components/contexts/AuthContext";

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
  const { user } = useAuth(); // ← ajoute ça

  const loadUnreadMessages = async () => {
    try {
      const count = await getUnreadMessagesCount();
      setUnreadMessages(count);
    } catch {
      console.log("Error loading unread messages");
    }
  };

  useEffect(() => {
    if (!user) return; // ← ne charge pas si pas connecté
    loadUnreadMessages();
    const interval = setInterval(loadUnreadMessages, 10000);
    return () => clearInterval(interval);
  }, [user]); // ← relance quand user change

  return (
    <MessageContext.Provider value={{ unreadMessages, loadUnreadMessages }}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessages = () => useContext(MessageContext);