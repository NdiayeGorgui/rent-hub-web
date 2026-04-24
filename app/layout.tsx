"use client";

import Header from "@/components/ui/Header";
import "./globals.css";
import { AuthProvider, useAuth } from "@/components/auth/AuthContext";
import { MessageProvider } from "@/components/contexts/MessageContext";
import { NotificationProvider } from "@/components/contexts/NotificationContext";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      {user && <Header />}
      <main className="p-4">{children}</main>
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>
          <MessageProvider>
            <NotificationProvider>
              <LayoutContent>{children}</LayoutContent>
            </NotificationProvider>
          </MessageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}