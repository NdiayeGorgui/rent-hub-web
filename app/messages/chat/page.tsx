"use client";

import { useEffect, useRef, useState, useContext } from "react";
import { useSearchParams } from "next/navigation";
import {
  sendMessage,
  getConversationMessages,
  markMessageAsRead,
} from "@/services/messageService";
import { getCurrentUser } from "@/services/authService";
import { MessageContext } from "@/components/contexts/MessageContext";


export default function ChatPage() {
  const searchParams = useSearchParams();

  const conversationId = searchParams.get("conversationId");
  const receiverId = searchParams.get("receiverId");
  const itemId = searchParams.get("itemId");
  const receiverUsername = searchParams.get("receiverUsername");

  const otherUsername = receiverUsername ?? "Utilisateur";
const item = itemId && itemId !== "" && itemId !== "null" && itemId !== "undefined"
  ? Number(itemId)
  : null;

  const [convId, setConvId] = useState<number | null>(
    conversationId ? Number(conversationId) : null
  );
  const convIdRef = useRef<number | null>(convId); // ✅ ref toujours à jour

  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [user, setUser] = useState<any>(null);
  const userRef = useRef<any>(null); // ✅ ref toujours à jour
  const bottomRef = useRef<HTMLDivElement>(null);
  const { loadUnreadMessages } = useContext(MessageContext);

  // ✅ Sync refs
  useEffect(() => { convIdRef.current = convId; }, [convId]);

  const loadMessages = async () => {
    if (!convIdRef.current) return;
    try {
      const data = await getConversationMessages(convIdRef.current);
      setMessages(data);
      for (const msg of data) {
        if (msg.receiverId === userRef.current?.userId && !msg.read) {
          await markMessageAsRead(msg.id);
        }
      }
      await loadUnreadMessages();
    } catch (err) {
      console.log("loadMessages error:", err);
    }
  };

  // ── Init ─────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const u = await getCurrentUser();
      setUser(u);
      userRef.current = u;
      if (convIdRef.current) {
        await loadMessages();
      }
    };
    init();

    // ── Refresh auto ─────────────────────────────────
    const interval = setInterval(() => {
      loadMessages();
    }, 5000);

    return () => clearInterval(interval);
  }, []); // ✅ un seul setInterval, utilise les refs

  // ── Scroll bas ───────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Envoi ────────────────────────────────────────────
const handleSend = async () => {
  if (!content.trim() || !receiverId) return;
  try {
    console.log("SEND →", { 
      receiverId, 
      itemId: item, 
      content,
      convIdRef: convIdRef.current 
    });

    const msg = await sendMessage({ receiverId, itemId: item, content });
    
    console.log("RESPONSE →", msg);

    setContent("");

    if (!convIdRef.current && msg?.conversationId) {
      convIdRef.current = msg.conversationId;
      setConvId(msg.conversationId);
    }

    setMessages(prev => [...prev, msg]);

  } catch (err) {
    console.log("Send error:", err);
  }
};

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-60px)]">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-sm">
          {otherUsername.charAt(0).toUpperCase()}
        </div>
        <p className="font-semibold text-gray-900 text-sm">{otherUsername}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 text-sm mt-10">
            Commencez la conversation 👋
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.senderId === user?.userId;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                isMe
                  ? "bg-blue-600 text-white rounded-br-sm"
                  : "bg-white text-gray-900 border border-gray-100 rounded-bl-sm"
              }`}>
                <p className={`text-xs font-medium mb-1 ${isMe ? "text-blue-200" : "text-gray-400"}`}>
                  {isMe ? "Vous" : otherUsername}
                </p>
                <p>{msg.content}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-100 px-6 py-4 flex gap-3 items-end">
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Votre message... (Entrée pour envoyer)"
          rows={1}
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors flex-shrink-0"
        >
          Envoyer
        </button>
      </div>

    </div>
  );
}