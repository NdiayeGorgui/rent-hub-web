"use client";

import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { getUserConversations } from "@/services/messageService";
import { getCurrentUser } from "@/services/authService";
import { MessageContext } from "@/components/contexts/MessageContext";


export default function InboxPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { loadUnreadMessages } = useContext(MessageContext);

useEffect(() => {
  const load = async () => {
    try {
      await loadUnreadMessages();
      const user = await getCurrentUser();
      setCurrentUser(user);
      const data = await getUserConversations();
      console.log("CONVERSATIONS →", JSON.stringify(data, null, 2)); // ← ajoute ça
      setConversations(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };
  load();
}, []);

  const openChat = (conversation: any) => {
    const otherUserId = conversation.user1Id === currentUser?.userId
      ? conversation.user2Id
      : conversation.user1Id;
    const otherUsername = conversation.user1Id === currentUser?.userId
      ? conversation.user2Username
      : conversation.user1Username;

    const params = new URLSearchParams({
      conversationId: String(conversation.id),
      receiverId: String(otherUserId),
      itemId: String(conversation.itemId),
      receiverUsername: otherUsername,
    });

    router.push(`/messages/chat?${params.toString()}`);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>

      {conversations.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">💬</p>
          <p>Aucune conversation</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {conversations.map((conv, index) => {
            const isMe = conv.lastSenderId === currentUser?.userId;
            const otherUsername = conv.user1Id === currentUser?.userId
              ? conv.user2Username
              : conv.user1Username;

            return (
              <button
                key={conv.id}
                onClick={() => openChat(conv)}
                className={`w-full text-left px-5 py-4 hover:bg-gray-50 transition-colors flex items-center justify-between gap-3 ${
                  index !== 0 ? "border-t border-gray-50" : ""
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
                    {otherUsername?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 text-sm">{otherUsername}</p>
                    <p className="text-gray-400 text-xs truncate">
                      {isMe ? "Vous : " : ""}{conv.lastMessage}
                    </p>
                  </div>
                </div>

                {conv.unreadCount > 0 && (
                  <span className="flex-shrink-0 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {conv.unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}