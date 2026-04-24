"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthContext";
import { usePathname } from "next/navigation";
import { useMessages } from "../contexts/MessageContext";
import { useNotifications } from "../contexts/NotificationContext";

export default function Header() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const isAdmin = user?.roles?.includes("ROLE_ADMIN");
    const { unreadMessages } = useMessages();
    const { unreadCount } = useNotifications();

    const initials = user?.fullName
        ?.split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) ?? "?";

    const isActive = (href: string) =>
        pathname === href ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900";

    return (
        <header className="bg-white border-b border-gray-100 px-6 flex items-center justify-between h-[60px] sticky top-0 z-50">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isAdmin ? "bg-violet-600" : "bg-blue-600"}`}>
                    {isAdmin ? (
                        <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" /></svg>
                    ) : (
                        <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>
                    )}
                </div>
                <span className="text-[17px] font-medium text-gray-900">
                    Rent<span className={isAdmin ? "text-violet-600" : "text-blue-600"}>Hub</span>
                </span>
                {isAdmin && (
                    <span className="text-[11px] bg-violet-50 text-violet-700 px-2 py-0.5 rounded font-medium ml-1">
                        Admin
                    </span>
                )}
            </Link>

            {/* Nav */}
            <nav className="flex items-center gap-0.5">
                {!isAdmin ? (
                    <>
                        <Link href="/" className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${isActive("/")}`}>Accueil</Link>
                        <Link href="/my-items" className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${isActive("/my-items")}`}>Mes items</Link>
                        <Link href="/create" className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${isActive("/create")}`}>Poster</Link>
                        <Link href="/rentals" className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${isActive("/rentals")}`}>Locations</Link>
                        <Link href="/disputes" className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${isActive("/disputes")}`}>Litiges</Link>
                        <Link href="/profile" className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${isActive("/profile")}`}>Profil</Link>
                    </>
                ) : (
                    <>
                        <Link href="/items" className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${isActive("/items")}`}>Produits</Link>
                        <Link href="/users" className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${isActive("/users")}`}>Utilisateurs</Link>
                        <Link href="/admin-disputes" className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${isActive("/admin-disputes")}`}>Litiges</Link>
                        <Link href="/admin-faq" className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${isActive("/admin-faq")}`}>FAQ</Link>
                        <Link href="/dashboard" className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${isActive("/dashboard")}`}>Dashboard</Link>
                    </>
                )}
            </nav>

            {/* Actions droite */}
            <div className="flex items-center gap-2">
                {!isAdmin && (
                    <>
                        <Link href="/subscription">
                            <button className="flex items-center gap-1.5 text-[13px] font-medium px-3 py-1.5 rounded-lg bg-yellow-50 text-yellow-800 border border-yellow-200 hover:bg-yellow-100 transition-colors">
                                <svg className="w-3.5 h-3.5 fill-yellow-600" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                                Premium
                            </button>
                        </Link>
                         {/* ← Ajoute ici */}
    <Link href="/faq">
      <button className="w-9 h-9 rounded-lg border border-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-blue-600 transition-colors">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <path d="M12 17h.01"/>
        </svg>
      </button>
    </Link>
                        <div className="w-px h-5 bg-gray-100 mx-1" />
                        <Link href="/messages/inbox">
                            <button className="w-9 h-9 rounded-lg border border-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors relative">
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                </svg>
                                {unreadMessages > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white text-[9px] text-white flex items-center justify-center font-medium">
                                        {unreadMessages > 99 ? "99+" : unreadMessages}
                                    </span>
                                )}
                            </button>
                        </Link>
                    </>
                )}

               <Link href="/notifications">
  <button className="w-9 h-9 rounded-lg border border-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors relative">
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
    {unreadCount > 0 && (
      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white text-[9px] text-white flex items-center justify-center font-medium">
        {unreadCount > 99 ? "99+" : unreadCount}
      </span>
    )}
  </button>
</Link>
                <div className="w-px h-5 bg-gray-100 mx-1" />

                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-medium text-white ${isAdmin ? "bg-violet-600" : "bg-blue-600"}`}>
                    {initials}
                </div>

                <button
                    onClick={logout}
                    className="text-[13px] px-3 py-1.5 rounded-lg border border-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                >
                    Déconnexion
                </button>
            </div>
        </header>
    );
}