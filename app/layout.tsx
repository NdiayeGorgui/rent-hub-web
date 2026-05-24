"use client";

import Header from "@/components/ui/Header";
import "./globals.css";
import { AuthProvider, useAuth } from "@/components/contexts/AuthContext";
import { MessageProvider } from "@/components/contexts/MessageContext";
import { NotificationProvider } from "@/components/contexts/NotificationContext";
import { SidebarLeft, SidebarRight } from "@/components/ui/Sidebar";
import Footer from "@/components/ui/Footer";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      {user && <Header />}
      <div className="flex gap-6 max-w-7xl mx-auto px-4 py-6">
        <SidebarLeft />
        <main className="flex-1 min-w-0">{children}</main>
        <SidebarRight />
      </div>
      <Footer /> 
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