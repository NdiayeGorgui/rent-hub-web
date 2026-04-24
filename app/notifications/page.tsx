"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/services/notificationService";
import { useNotifications } from "@/components/contexts/NotificationContext";
import { formatNotificationDate } from "@/lib/formatDate";

const getTypeConfig = (type: string) => {
  switch (type) {
    case "RENTAL_REQUEST":    return { icon: "📦", label: "Demande de location" };
    case "RENTAL_APPROVED":   return { icon: "✅", label: "Location approuvée" };
    case "RENTAL_CANCELLED":  return { icon: "❌", label: "Location annulée" };
    case "NEW_BID":           return { icon: "🔥", label: "Nouvelle enchère" };
    case "AUCTION_WON":       return { icon: "🏆", label: "Enchère gagnée" };
    case "AUCTION_ENDED":     return { icon: "⏰", label: "Enchère terminée" };
    case "NEW_MESSAGE":       return { icon: "💬", label: "Nouveau message" };
    case "NEW_REVIEW":        return { icon: "⭐", label: "Nouvel avis" };
    case "PAYMENT_SUCCESS":   return { icon: "💳", label: "Paiement réussi" };
    case "DISPUTE_OPENED":    return { icon: "⚖️", label: "Litige ouvert" };
    case "DISPUTE_RESOLVED":  return { icon: "✅", label: "Litige résolu" };
    default:                  return { icon: "🔔", label: type };
  }
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { loadUnreadCount } = useNotifications();

  const loadNotifications = useCallback(async () => {
    try {
      const data = await getMyNotifications();
      setNotifications(data);
    } catch (err) {
      console.log("Error loading notifications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  // Refresh toutes les 60s
  useEffect(() => {
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      await loadUnreadCount();
    } catch (err) {
      console.log("Error marking as read:", err);
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      await loadUnreadCount();
    } catch (err) {
      console.log("Error marking all:", err);
    }
  };

  const unread = notifications.filter(n => !n.read);
  const read = notifications.filter(n => n.read);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-400 mt-1">
              {unread.length > 0 ? `${unread.length} non lue(s)` : "Tout est à jour"}
            </p>
          </div>
          {unread.length > 0 && (
            <button
              onClick={handleMarkAll}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              ✓ Tout marquer comme lu
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
            <p className="text-5xl mb-4">🔔</p>
            <p className="text-gray-500 font-medium">Aucune notification</p>
            <p className="text-gray-400 text-sm mt-1">Vous êtes à jour !</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">

            {/* Non lues */}
            {unread.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Non lues
                </p>
                <div className="flex flex-col gap-2">
                  {unread.map((notif) => {
                    const { icon, label } = getTypeConfig(notif.type);
                    return (
                      <button
                        key={notif.id}
                        onClick={() => handleMarkAsRead(notif.id)}
                        className="text-left bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 hover:bg-blue-100 transition-colors relative group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-lg shadow-sm flex-shrink-0">
                            {icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 leading-snug">
                              {notif.message}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-xs text-blue-500 font-medium">{label}</span>
                              <span className="text-gray-300">·</span>
                              <span className="text-xs text-gray-400">
                                {notif.createdAt ? formatNotificationDate(notif.createdAt) : ""}
                              </span>
                            </div>
                          </div>
                          <div className="w-2.5 h-2.5 rounded-full bg-blue-600 flex-shrink-0 mt-1" />
                        </div>
                        <span className="absolute right-4 bottom-3 text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          Marquer comme lu
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Lues */}
            {read.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Lues
                </p>
                <div className="flex flex-col gap-2">
                  {read.map((notif) => {
                    const { icon, label } = getTypeConfig(notif.type);
                    return (
                      <div
                        key={notif.id}
                        className="bg-white border border-gray-100 rounded-2xl px-5 py-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-lg flex-shrink-0 opacity-60">
                            {icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-500 leading-snug">
                              {notif.message}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-xs text-gray-400">{label}</span>
                              <span className="text-gray-300">·</span>
                              <span className="text-xs text-gray-400">
                                {notif.createdAt ? formatNotificationDate(notif.createdAt) : ""}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}