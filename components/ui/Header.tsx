"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/components/contexts/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useMessages } from "../contexts/MessageContext";
import { useNotifications } from "../contexts/NotificationContext";

export default function Header() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const isAdmin = user?.roles?.includes("ROLE_ADMIN");
    const { unreadMessages } = useMessages();
    const { unreadCount } = useNotifications();
    const [menuOpen, setMenuOpen] = useState(false);
    const [platformOpen, setPlatformOpen] = useState(false);
    const [platformMenuOpen, setPlatformMenuOpen] = useState(false);

    const initials = user?.fullName
        ?.split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) ?? "?";

    const isActive = (href: string) =>
        pathname === href
            ? "bg-blue-50 text-blue-600 font-medium"
            : "text-gray-500 hover:bg-gray-100 hover:text-gray-900";

    const isActiveMobile = (href: string) =>
        pathname === href ? "text-blue-600" : "text-gray-400";

    const handleLogout = async () => {
        await logout();
        router.push("/login");
        setMenuOpen(false);
        setPlatformMenuOpen(false);
    };

    return (
        <>
            <header className="bg-white border-b border-gray-100 px-4 md:px-6 flex items-center justify-between h-[60px] sticky top-0 z-50">

                {/* ── Logo ── */}
                <Link href="/" className="flex items-center gap-2 flex-shrink-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isAdmin ? "bg-violet-600" : "bg-blue-600"}`}>
                        {isAdmin ? (
                            <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                            </svg>
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

                {/* ── Nav desktop ── */}
                <nav className="hidden md:flex items-center gap-0.5">
                    {!isAdmin ? (
                        <>
                            <Link href="/" className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${isActive("/")}`}>Accueil</Link>
                            <Link href="/my-items" className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${isActive("/my-items")}`}>Mes items</Link>
                            <Link href="/create" className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${isActive("/create")}`}>Poster</Link>
                            <Link href="/rentals" className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${isActive("/rentals")}`}>Locations</Link>
                            <Link href="/auctions" className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${isActive("/auctions")}`}>Enchères</Link>
                            <Link href="/disputes" className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${isActive("/disputes")}`}>Litiges</Link>
                            <Link href="/profile" className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${isActive("/profile")}`}>Profil</Link>

                            {/* Dropdown Plateforme desktop */}
                            <div className="relative">
                                <button
                                    onClick={() => setPlatformOpen(!platformOpen)}
                                    className={`text-sm px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${platformOpen ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"}`}
                                >
                                    Plateforme
                                    <svg className={`w-3.5 h-3.5 transition-transform ${platformOpen ? "rotate-180" : ""}`}
                                        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path d="M6 9l6 6 6-6" />
                                    </svg>
                                </button>
                                {platformOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setPlatformOpen(false)} />
                                        <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden py-2">
                                            <div className="px-3 py-1.5">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Gonifty</p>
                                            </div>
                                            {[
                                                { href: "/apropos", label: "À propos de Gonifty" },
                                                { href: "/publicite", label: "Régie publicitaire" },
                                                { href: "/contact", label: "Contactez-nous" },
                                            ].map(({ href, label }) => (
                                                <Link key={href} href={href} onClick={() => setPlatformOpen(false)}
                                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                                                    {label}
                                                </Link>
                                            ))}
                                            <div className="my-1.5 border-t border-gray-100" />
                                            <div className="px-3 py-1.5">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Communauté</p>
                                            </div>
                                            {[
                                                { href: "/loueur", label: "Devenir loueur" },
                                                { href: "/vendeur", label: "Devenir vendeur (Enchères)" },
                                                { href: "/avis", label: "Nos avis" },
                                                { href: "/newsletter", label: "Infolettre" },
                                            ].map(({ href, label }) => (
                                                <Link key={href} href={href} onClick={() => setPlatformOpen(false)}
                                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                                                    {label}
                                                </Link>
                                            ))}
                                            <div className="my-1.5 border-t border-gray-100" />
                                            <div className="px-3 py-1.5">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Légal</p>
                                            </div>
                                            {[
                                                { href: "/conditions-utilisation", label: "Conditions d'utilisation" },
                                                { href: "/politique-confidentialite", label: "Politique de confidentialité" },
                                                { href: "/cookies", label: "Cookies" },
                                            ].map(({ href, label }) => (
                                                <Link key={href} href={href} onClick={() => setPlatformOpen(false)}
                                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                                                    {label}
                                                </Link>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <Link href="/items" className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${isActive("/items")}`}>Produits</Link>
                            <Link href="/users" className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${isActive("/users")}`}>Utilisateurs</Link>
                            <Link href="/admin-disputes" className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${isActive("/admin-disputes")}`}>Litiges</Link>
                            <Link href="/payments" className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${isActive("/payments")}`}>Paiements</Link>
                            <Link href="/admin-faq" className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${isActive("/admin-faq")}`}>FAQ</Link>
                            <Link href="/admin-newsletter" className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${isActive("/admin-newsletter")}`}>Infolettre</Link>
                            <Link href="/dashboard" className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${isActive("/dashboard")}`}>Tableau de bord</Link>
                        </>
                    )}
                </nav>

                {/* ── Actions droite desktop ── */}
                <div className="hidden md:flex items-center gap-2">
                    {!isAdmin && (
                        <>
                            <Link href="/faq">
                                <button className="w-9 h-9 rounded-lg border border-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-blue-600 transition-colors cursor-pointer">
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                                        <path d="M12 17h.01" />
                                    </svg>
                                </button>
                            </Link>
                            <div className="w-px h-5 bg-gray-100 mx-1" />
                            <Link href="/messages/inbox">
                                <button className="w-9 h-9 rounded-lg border border-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors relative cursor-pointer">
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
                        <button className="w-9 h-9 rounded-lg border border-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors relative cursor-pointer">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
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
                        onClick={handleLogout}
                        className="text-[13px] px-3 py-1.5 rounded-lg border border-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors cursor-pointer"
                    >
                        Déconnexion
                    </button>
                </div>

                {/* ── Actions droite mobile ── */}
                <div className="flex md:hidden items-center gap-1">

                    {/* Centre d'aide */}
                    <Link href="/faq">
                        <button className="w-9 h-9 flex items-center justify-center text-gray-500 relative">
                            <svg
                                className="w-5 h-5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <circle cx="12" cy="12" r="10" />
                                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                                <path d="M12 17h.01" />
                            </svg>
                        </button>
                    </Link>

                    {/* Messages */}
                    <Link href="/messages/inbox">
                        <button className="w-9 h-9 flex items-center justify-center text-gray-500 relative">
                            <svg
                                className="w-5 h-5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>

                            {unreadMessages > 0 && (
                                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-medium">
                                    {unreadMessages > 9 ? "9+" : unreadMessages}
                                </span>
                            )}
                        </button>
                    </Link>

                    {/* Notifications */}
                    <Link href="/notifications">
                        <button className="w-9 h-9 flex items-center justify-center text-gray-500 relative">
                            <svg
                                className="w-5 h-5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </svg>

                            {unreadCount > 0 && (
                                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-medium">
                                    {unreadCount > 9 ? "9+" : unreadCount}
                                </span>
                            )}
                        </button>
                    </Link>

                    {/* Menu hamburger */}
                    <button
                        onClick={() =>
                            isAdmin
                                ? setMenuOpen(!menuOpen)
                                : setPlatformMenuOpen(!platformMenuOpen)
                        }
                        className="w-9 h-9 flex items-center justify-center text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <svg
                            className="w-5 h-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    </button>

                </div>

            </header>

            {/* ══════════════════════════════════════════
                DRAWER PLATEFORME — User seulement, haut
            ══════════════════════════════════════════ */}
            {platformMenuOpen && !isAdmin && (
                <div className="md:hidden fixed top-[60px] right-0 w-72 bg-white shadow-2xl z-50 rounded-bl-2xl border-l border-b border-gray-100"
                    style={{ maxHeight: "calc(100vh - 60px)", overflowY: "auto" }}>

                    {/* Header drawer */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                                <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                                </svg>
                            </div>
                            <span className="font-semibold text-sm text-gray-900">Plateforme</span>
                        </div>
                        <button
                            onClick={() => setPlatformMenuOpen(false)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-gray-500"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>

                    {/* Gonifty */}
                    <div className="px-4 pt-3 pb-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Gonifty</p>
                    </div>
                    {[

                        { href: "/disputes", label: "Litiges", icon: "⚖️" },
                        { href: "/contact", label: "Contactez-nous", icon: "📬" },
                    ].map(({ href, label, icon }) => (
                        <Link key={href} href={href} onClick={() => setPlatformMenuOpen(false)}
                            className={`flex items-center gap-3 px-5 py-3 text-sm transition-colors hover:bg-gray-50 ${pathname === href ? "text-blue-600 font-medium bg-blue-50" : "text-gray-700"}`}>
                            <span className="text-base">{icon}</span>{label}
                        </Link>
                    ))}

                    <div className="border-t border-gray-100 my-1" />

                    {/* Communauté */}
                    <div className="px-4 pt-2 pb-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Communauté</p>
                    </div>
                    {[
                        { href: "/loueur", label: "Devenir loueur", icon: "🏠" },
                        { href: "/vendeur", label: "Devenir vendeur", icon: "🔥" },
                        { href: "/avis", label: "Nos avis", icon: "⭐" },
                        { href: "/newsletter", label: "Infolettre", icon: "📧" },
                    ].map(({ href, label, icon }) => (
                        <Link key={href} href={href} onClick={() => setPlatformMenuOpen(false)}
                            className={`flex items-center gap-3 px-5 py-3 text-sm transition-colors hover:bg-gray-50 ${pathname === href ? "text-blue-600 font-medium bg-blue-50" : "text-gray-700"}`}>
                            <span className="text-base">{icon}</span>{label}
                        </Link>
                    ))}

                    <div className="border-t border-gray-100 my-1" />

                    <div className="border-t border-gray-100 my-1" />

                    <div className="px-4 pt-2 pb-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            Mon compte
                        </p>
                    </div>

                    <Link
                        href="/profile"
                        onClick={() => setPlatformMenuOpen(false)}
                        className={`flex items-center gap-3 px-5 py-3 text-sm transition-colors hover:bg-gray-50 ${pathname === "/profile"
                                ? "text-blue-600 font-medium bg-blue-50"
                                : "text-gray-700"
                            }`}
                    >
                        <span className="text-base">👤</span>
                        Profil
                    </Link>

                    <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-3 px-5 py-3 text-sm transition-colors hover:bg-gray-50 text-gray-700"
                    >
                        <span className="text-base">🚪</span>
                        Déconnexion
                    </button>
                </div>
            )}

            {/* ══════════════════════════════════════════
                DRAWER ADMIN — Admin seulement, haut
            ══════════════════════════════════════════ */}
            {menuOpen && isAdmin && (
                <div className="md:hidden fixed top-[60px] right-0 w-72 bg-white shadow-2xl z-50 rounded-bl-2xl border-l border-b border-gray-100"
                    style={{ maxHeight: "calc(100vh - 60px)", overflowY: "auto" }}>

                    {/* Header drawer admin */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center text-sm font-bold text-white">
                                {initials}
                            </div>
                            <div>
                                <p className="font-semibold text-sm text-gray-900">{user?.fullName}</p>
                                <p className="text-xs text-gray-400">Administrateur</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setMenuOpen(false)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-gray-500"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>

                    <div className="py-2">
                        {[
                            { href: "/items", label: "📦 Produits" },
                            { href: "/users", label: "👥 Utilisateurs" },
                            { href: "/admin-disputes", label: "⚖️ Litiges" },
                            { href: "/payments", label: "💳 Paiements" },
                            { href: "/admin-faq", label: "❓ FAQ" },
                            { href: "/admin-newsletter", label: "✉️ Infolettre" },
                            { href: "/dashboard", label: "📊 Tableau de bord" },
                        ].map(({ href, label }) => (
                            <Link key={href} href={href} onClick={() => setMenuOpen(false)}
                                className={`flex items-center gap-3 px-5 py-3 text-sm transition-colors hover:bg-gray-50 ${pathname === href ? "text-violet-600 font-medium bg-violet-50" : "text-gray-700"}`}>
                                {label}
                            </Link>
                        ))}

                        <div className="border-t border-gray-100 mt-2 pt-2">
                            <button onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-5 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors">
                                🚪 Déconnexion
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════
                BOTTOM NAV — User seulement
            ══════════════════════════════════════════ */}
            {!isAdmin && (
                <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40 flex items-center justify-around px-2 py-2">

                    {/* Accueil */}
                    <Link href="/" className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-colors ${isActiveMobile("/")}`}>
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                        </svg>
                        <span className="text-[10px] font-medium">Accueil</span>
                    </Link>

                    {/* Mes items */}
                    <Link href="/my-items" className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-colors ${isActiveMobile("/my-items")}`}>
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="7" width="20" height="14" rx="2" />
                            <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                        </svg>
                        <span className="text-[10px] font-medium">Mes items</span>
                    </Link>

                    {/* Poster */}
                    <Link href="/create" className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-colors ${isActiveMobile("/create")}`}>
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        <span className="text-[10px] font-medium">Poster</span>
                    </Link>

                    {/* Locations */}
                    <Link href="/rentals" className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-colors ${isActiveMobile("/rentals")}`}>
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 11l3 3L22 4" />
                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                        </svg>
                        <span className="text-[10px] font-medium">Locations</span>
                    </Link>

                    {/* Enchères */}
                    <Link
                        href="/auctions"
                        className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-colors ${isActiveMobile("/auctions")}`}
                    >
                        <svg
                            className="w-5 h-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M14 4l6 6-10 10H4v-6L14 4z" />
                            <path d="M13 5l6 6" />
                        </svg>

                        <span className="text-[10px] font-medium">
                            Enchères
                        </span>
                    </Link>
                </nav>
            )}


            {/* Spacer bottom nav mobile */}
            {!isAdmin && <div className="md:hidden h-16" />}
        </>
    );
}
