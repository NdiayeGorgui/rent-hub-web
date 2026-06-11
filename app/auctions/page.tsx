"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    getMyLaunchedAuctions,
    getMyParticipatingAuctions,
    placeBid,
} from "@/services/auctionService";

import Link from "next/link";
import { BASE_URL } from "@/lib/baseURL";
import { formatPrice } from "@/lib/formatPrice";

export default function AuctionsPage() {
    const router = useRouter();
    const [mode, setMode] = useState<"launched" | "participating">("launched");
    const [auctions, setAuctions] = useState<any[]>([]);

    const [loading, setLoading] = useState(false);
    const [bidAmounts, setBidAmounts] = useState<Record<number, string>>({});
    const [bidLoadingId, setBidLoadingId] = useState<number | null>(null);
    const [now, setNow] = useState(new Date());

    // ── Countdown live ────────────────────────────────────
    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    const getTimeLeft = (endDate: string) => {
        const diff = new Date(endDate).getTime() - now.getTime();
        if (diff <= 0) return "Terminée";
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff / 3600000) % 24);
        const m = Math.floor((diff / 60000) % 60);
        const s = Math.floor((diff / 1000) % 60);
        if (d > 0) return `${d}j ${h}h ${m}m`;
        if (h > 0) return `${h}h ${m}m ${s}s`;
        if (m > 0) return `${m}m ${s}s`;
        return `${s}s`;
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "OPEN": return { label: "En cours", cls: "bg-green-50 text-green-700 border border-green-200" };
            case "CLOSED": return { label: "Terminée", cls: "bg-gray-100 text-gray-500 border border-gray-200" };
            case "CANCELLED_AUCTION": return { label: "Annulée", cls: "bg-red-50 text-red-600 border border-red-200" };
            case "CANCELLED":
                return {
                    label: "Annulée",
                    cls: "bg-red-50 text-red-600 border border-red-200"
                };
            case "RESERVE_NOT_MET": return { label: "Réserve non atteinte", cls: "bg-orange-50 text-orange-600 border border-orange-200" };
            default: return { label: status, cls: "bg-gray-100 text-gray-500 border border-gray-200" };
        }
    };

    // ── Load data ─────────────────────────────────────────
    const loadData = useCallback(async () => {

        setLoading(true);

        try {

            const data =
                mode === "launched"
                    ? await getMyLaunchedAuctions()
                    : await getMyParticipatingAuctions();

            setAuctions(data);

        } catch (e) {

            console.log("Error loading auctions", e);

        } finally {

            setLoading(false);

        }

    }, [mode]);

    useEffect(() => { loadData(); }, [loadData]);

    // ── Bid ───────────────────────────────────────────────
    const handleBid = async (auctionId: number) => {
        const amount = Number(bidAmounts[auctionId]);
        if (!amount) return;
        setBidLoadingId(auctionId);
        try {
            await placeBid(auctionId, amount);
            setBidAmounts(prev => ({ ...prev, [auctionId]: "" }));
            await loadData();
        } catch (e: any) {
            alert(e?.message || "Erreur lors de l'enchère");
        } finally {
            setBidLoadingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-6 py-10">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Enchères</h1>
                    <p className="text-gray-400 mt-1">Gérez vos enchères en cours et passées</p>
                </div>

                {/* Toggle */}
                <div className="flex gap-3 mb-8">
                    {[
                        { key: "launched", label: "Mes enchères", icon: "🔥" },
                        { key: "participating", label: "J'enchéris sur", icon: "💰" },
                    ].map(({ key, label, icon }) => (
                        <button
                            key={key}
                            onClick={() => setMode(key as any)}
                            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${mode === key
                                ? "bg-blue-600 text-white shadow-sm"
                                : "bg-white text-gray-500 border border-gray-200 hover:border-blue-300 hover:text-blue-600"
                                }`}
                        >
                            <span>{icon}</span> {label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center py-32">
                        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : auctions.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                        <p className="text-5xl mb-4">📭</p>
                        <p className="text-gray-500 font-medium">Aucune enchère trouvée</p>
                        <p className="text-gray-400 text-sm mt-1">
                            {mode === "launched"
                                ? "Vous n'avez pas encore lancé d'enchère"
                                : "Vous ne participez à aucune enchère"}
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {auctions.map((auction) => {

                            const { label, cls } = getStatusConfig(auction.status);
                            const isOpen = auction.status === "OPEN";
                            const timeLeft = auction.endDate ? getTimeLeft(auction.endDate) : "—";

                            return (
                                <div key={auction.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                                    {/* Header */}
                                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-lg">
                                                {auction.itemImages?.length > 0 ? (
                                                    <img
                                                        src={
                                                            auction.itemImages?.length
                                                                ? `${BASE_URL}${auction.itemImages[0]}`
                                                                : "/placeholder.png"
                                                        }
                                                        alt={auction.itemImages ?? "Item"}
                                                        className="w-full h-full object-contain rounded-xl"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        🔥
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h2 className="font-semibold text-gray-900">
                                                    {auction.itemTitle ?? "Item"}
                                                </h2>
                                                <p className="text-xs text-gray-400">Enchère #{auction.id}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {isOpen && (
                                                <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${timeLeft === "Terminée"
                                                    ? "bg-gray-100 text-gray-500"
                                                    : "bg-red-50 text-red-600"
                                                    }`}>
                                                    ⏳ {timeLeft}
                                                </span>
                                            )}
                                            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${cls}`}>
                                                {label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Body */}
                                    <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">

                                        {/* Prix */}
                                        <div>
                                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
                                                Prix actuel
                                            </p>
                                            <p className="text-sm font-bold text-blue-600">
                                                {formatPrice(auction.currentPrice ?? auction.startPrice)} 
                                            </p>
                                        </div>

                                        {/* Prix départ */}
                                        <div>
                                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
                                                Prix départ
                                            </p>
                                            <p className="text-sm font-medium text-gray-700">{formatPrice(auction.startPrice)} </p>
                                        </div>

                                        {/* Participants */}
                                        <div>
                                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
                                                Enchérisseurs
                                            </p>
                                            <p className="text-sm font-medium text-gray-700">
                                                👥 {auction.participantsCount ?? 0}
                                                {(auction.participantsCount ?? 0) >= 5 && (
                                                    <span className="ml-1 text-red-500">🔥</span>
                                                )}
                                            </p>
                                        </div>

                                        {/* Stats vues / suivis */}
                                        <div>
                                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
                                                Intérêt
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                👀 {auction.views ?? 0} · ⭐ {auction.watchers ?? 0}
                                            </p>
                                        </div>

                                        {/* Réserve */}
                                        <div>
                                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
                                                Réserve
                                            </p>
                                            <p className={`text-sm font-medium ${auction.reserveReached ? "text-green-600" : "text-orange-500"}`}>
                                                {auction.reserveReached ? "✅ Atteinte" : "⛔ Non atteinte"}
                                            </p>
                                        </div>

                                        {/* Owner (mode participating) */}
                                        {mode === "participating" && (
                                            <div>
                                                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
                                                    Propriétaire
                                                </p>
                                                <Link
                                                    href={`/users/${auction.ownerId}`}
                                                    className="text-blue-600 font-medium text-sm hover:underline"
                                                >
                                                    @{auction.ownerUsername ?? "Unknown"}
                                                </Link>
                                            </div>
                                        )}

                                        {/* Winner (si terminée et mode launched) */}
                                        {mode === "launched" &&
                                            auction.winnerId &&
                                            auction.status === "CLOSED" && (
                                                <div>
                                                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
                                                        Gagnant
                                                    </p>

                                                    <Link
                                                        href={`/users/${auction.winnerId}`}
                                                        className="text-sm font-medium text-green-600 hover:underline"
                                                    >
                                                        🏆 @{auction.winnerUsername ?? "Unknown"}
                                                    </Link>
                                                </div>
                                            )}
                                    </div>

                                    {/* Footer — actions */}
                                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-3 items-center">

                                        {/* Voir l'item */}
                                        <Link
                                            href={`/items/${auction.itemId}`}
                                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:border-blue-300 hover:text-blue-600 transition-colors"
                                        >
                                            🔍 Voir l'item
                                        </Link>

                                        {/* Enchérir (mode participating + open) */}
                                        {mode === "participating" && isOpen && (
                                            <div className="flex items-center gap-2 ml-auto">
                                                <input
                                                    type="number"
                                                    placeholder={`> ${auction.currentPrice ?? auction.startPrice} $`}
                                                    value={bidAmounts[auction.id] ?? ""}
                                                    onChange={e => setBidAmounts(prev => ({ ...prev, [auction.id]: e.target.value }))}
                                                    className="w-36 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                                <button
                                                    onClick={() => handleBid(auction.id)}
                                                    disabled={
                                                        bidLoadingId === auction.id ||
                                                        !bidAmounts[auction.id] ||
                                                        Number(bidAmounts[auction.id]) <= (auction.currentPrice ?? auction.startPrice)
                                                    }
                                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                                >
                                                    {bidLoadingId === auction.id ? (
                                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    ) : "💰"} Enchérir
                                                </button>
                                            </div>
                                        )}

                                        {/* Message propriétaire (mode participating) */}
                                        {mode === "participating" && (
                                            <button
                                                onClick={() => router.push(`/messages/chat?receiverId=${auction.ownerId}&itemId=${auction.itemId}&receiverUsername=${auction.ownerUsername ?? ""}`)}
                                                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-semibold hover:bg-emerald-600 transition-colors cursor-pointer"
                                            >
                                                ✉️ Contacter
                                            </button>
                                        )}

                                        {/* Contacter le gagnant (mode launched, enchère terminée avec gagnant) */}
                                        {mode === "launched" && auction.winnerId && auction.status === "CLOSED" && (
                                            <button
                                                onClick={() => router.push(
                                                    `/messages/chat?receiverId=${auction.winnerId}&itemId=${auction.itemId}&receiverUsername=${auction.winnerUsername ?? ""}`
                                                )}
                                                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-semibold hover:bg-emerald-600 transition-colors cursor-pointer"
                                            >
                                                ✉️ Contacter le gagnant
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}