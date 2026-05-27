"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { fetchItemDetails } from "@/services/itemService";
import { createRental } from "@/services/rentalService";

import {
    getAuctionByItemId,
    isWatchingAuction,
    placeBid,
    watchAuction,
} from "@/services/auctionService";
import { getCurrentUser } from "@/services/authService";
import {
    getReviewsByItem,
    getReviewsByUser,
    getReviewsCountByItem,
    getAllReviewsForUser
} from "@/services/reviewService";

import { BASE_URL } from "@/lib/baseURL";

export default function ItemDetailPage() {
    const { id } = useParams();
    const router = useRouter();

    const [item, setItem] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isOwner, setIsOwner] = useState(false);
    const [auction, setAuction] = useState<any>(null);
    const [timeLeft, setTimeLeft] = useState("");
    const [isWatching, setIsWatching] = useState(false);

    const isAuctionFinished =
        item?.type === "AUCTION" &&
        (item?.status === "CANCELLED_AUCTION" || item?.active === false);


    // Reviews
    const [reviews, setReviews] = useState<any[]>([]);
    const [reviewsCount, setReviewsCount] = useState(0);
    const [userReviews, setUserReviews] = useState<any[]>([]);

    // Rental
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [rentLoading, setRentLoading] = useState(false);

    // Bid
    const [bidAmount, setBidAmount] = useState("");
    const [bidLoading, setBidLoading] = useState(false);

    // Auction creation
    const [startPrice, setStartPrice] = useState("");
    const [reservePrice, setReservePrice] = useState("");
    const [endDateAuction, setEndDateAuction] = useState("");
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [activeIndex, setActiveIndex] = useState(0);


    const [showAllUserReviews, setShowAllUserReviews] = useState(false);
    const [showAllItemReviews, setShowAllItemReviews] = useState(false);




    // ── Load ─────────────────────────────────────────────────
    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchItemDetails(Number(id));
                setItem(data);

                const user = await getCurrentUser();
                setCurrentUser(user);
                setIsOwner(user?.userId === data.publisher?.userId);

                if (data.type === "AUCTION") {
                    try {
                        const auctionData = await getAuctionByItemId(Number(id));
                        setAuction({
                            ...auctionData,
                            views: auctionData.views ?? 0,
                            watchers: auctionData.watchers ?? 0,
                            currentPrice: auctionData?.currentPrice ?? auctionData?.startPrice ?? null,
                        });
                        if (user?.userId) {
                            const watching = await isWatchingAuction(auctionData.id);
                            setIsWatching(watching);
                        }
                    } catch {
                        setAuction(null);
                    }
                }

                const [reviewsData, count, userReviewsData] = await Promise.all([
                    getReviewsByItem(Number(id)),
                    getReviewsCountByItem(Number(id)),
                    data.publisher?.userId ? getAllReviewsForUser(data.publisher.userId) : Promise.resolve([]),
                ]);
                setReviews(reviewsData);
                setReviewsCount(count);
                setUserReviews(userReviewsData);
            } catch (err) {
                console.log(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    // ── Countdown ─────────────────────────────────────────────
    useEffect(() => {
        if (!auction?.endDate) return;
        const interval = setInterval(() => {
            const diff = new Date(auction.endDate).getTime() - Date.now();
            if (diff <= 0) { setTimeLeft("Enchère terminée"); clearInterval(interval); return; }
            const d = Math.floor(diff / 86400000);
            const h = Math.floor((diff / 3600000) % 24);
            const m = Math.floor((diff / 60000) % 60);
            const s = Math.floor((diff / 1000) % 60);
            setTimeLeft(d > 0 ? `${d}j ${h}h ${m}m ${s}s` : h > 0 ? `${h}h ${m}m ${s}s` : m > 0 ? `${m}m ${s}s` : `${s}s`);
        }, 1000);
        return () => clearInterval(interval);
    }, [auction]);

    // ── Handlers ──────────────────────────────────────────────
    const handleRent = async () => {
        if (!startDate || !endDate) { alert("Veuillez entrer les dates"); return; }
        try {
            setRentLoading(true);
            await createRental({ itemId: Number(id), startDate, endDate });
            alert("Demande de location envoyée ✅");
            setStartDate(""); setEndDate("");
        } catch { alert("Impossible de créer la location"); }
        finally { setRentLoading(false); }
    };

    const handleBid = async () => {
        if (!bidAmount) { alert("Entrez un montant"); return; }
        if (!confirm("Placer une enchère constitue un engagement d'achat. Si vous gagnez et ne payez pas, votre compte pourra être suspendu.\n\nConfirmer ?")) return;
        try {
            setBidLoading(true);
            await placeBid(Number(auction.id), Number(bidAmount));
            const updated = await getAuctionByItemId(Number(id));
            setAuction(updated);
            alert("Enchère placée !");
            setBidAmount("");
        } catch (err: any) {
            alert(err?.response?.data?.message || "Impossible de placer l'enchère");
        } finally { setBidLoading(false); }
    };

    const handleWatch = async () => {
        try {
            const updated = await watchAuction(auction.id);
            setAuction(updated);
            setIsWatching(true);
            alert("⭐ Vous suivez maintenant cette enchère");
        } catch { alert("Impossible de suivre l'enchère"); }
    };

    // ── Render ────────────────────────────────────────────────
    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!item) return (
        <div className="min-h-screen flex items-center justify-center text-gray-400">
            Item introuvable
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto p-6 pb-16">

            {/* ── Auction header ── */}
            {item.type === "AUCTION" && auction && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 text-center">
                    <p className="text-sm text-gray-400 mb-1">💰 Prix actuel</p>
                    <p className="text-4xl font-bold text-blue-600 mb-2">
                        {auction.currentPrice ?? auction.startPrice} $
                    </p>
                    {auction.reserveReached ? (
                        <p className="text-green-600 font-medium text-sm mb-2">✅ Prix de réserve atteint</p>
                    ) : (
                        <p className="text-red-500 font-medium text-sm mb-2">⛔ Prix de réserve non atteint</p>
                    )}
                    <div className="flex justify-center gap-4 text-sm text-gray-500 mb-3">
                        <span>👀 {auction.views} vues</span>
                        <span>⭐ {auction.watchers} suivis</span>
                        <span>👥 {auction.participantsCount ?? 0} enchérisseur(s){(auction.participantsCount ?? 0) >= 5 && " 🔥"}</span>
                    </div>
                    <p className="text-red-500 font-semibold">⏳ {timeLeft}</p>
                </div>
            )}

            {/* ── Bannière enchère terminée / annulée ── */}
            {isAuctionFinished && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-center">
                    <p className="text-red-600 font-semibold text-sm">
                        {item.status === "CANCELLED_AUCTION" ? "❌ Enchère annulée" : "⛔ Enchère terminée — Les offres sont closes"}
                    </p>
                </div>
            )}
            {/* ── Rental header ── */}
            {item.type === "RENTAL" && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 text-center">

                    <p className="text-sm text-gray-400 mb-1">
                        📦 Prix de location
                    </p>

                    <div className="flex items-center justify-center gap-3 mt-2">
                        <span className="text-2xl font-bold text-blue-600">
                            {item.pricePerDay} $ / jour
                        </span>

                        {item.active ? (
                            <span className="bg-green-50 text-green-600 text-sm font-medium px-3 py-1 rounded-full">
                                ✅ Disponible
                            </span>
                        ) : (
                            <span className="bg-red-50 text-red-600 text-sm font-medium px-3 py-1 rounded-full">
                                ⛔ Indisponible
                            </span>
                        )}
                    </div>

                </div>
            )}
            {/* ── Suivre enchère (seulement si active) ── */}
            {item.type === "AUCTION" && auction && !isOwner && !isAuctionFinished && (
                <button
                    onClick={handleWatch}
                    disabled={isWatching}
                    className={`w-full py-2.5 rounded-xl text-sm font-medium mb-4 transition-colors ${isWatching
                        ? "bg-gray-200 text-gray-500 cursor-default"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                >
                    {isWatching ? "⭐ Enchère suivie" : "⭐ Suivre l'enchère"}
                </button>
            )}

            {/* ── Images ── */}
            <h1 className="text-2xl font-bold mb-4">{item.title}</h1>
            {/* ── Images ── */}
            <div className="flex flex-col gap-3 mb-4">
                {/* ── Images carousel ── */}
                {item.imageUrls?.length > 0 ? (
                    <div className="mb-6">
                        {/* Image principale */}
                        <div className="w-full bg-gray-100 rounded-2xl overflow-hidden" style={{ aspectRatio: "4/3" }}>
                            <img
                                src={item.imageUrls[activeIndex].startsWith("http")
                                    ? item.imageUrls[activeIndex]
                                    : `${BASE_URL}${item.imageUrls[activeIndex]}`}
                                className="w-full h-full object-contain"
                                onError={(e) => { (e.target as HTMLImageElement).src = "/no-image.png"; }}
                            />
                        </div>

                        {/* Miniatures — seulement si plusieurs images */}
                        {item.imageUrls.length > 1 && (
                            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                                {item.imageUrls.map((url: string, i: number) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveIndex(i)}
                                        className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${activeIndex === i ? "border-blue-600" : "border-transparent"
                                            }`}
                                    >
                                        <img
                                            src={url.startsWith("http") ? url : `${BASE_URL}${url}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Dots si beaucoup d'images */}
                        {item.imageUrls.length > 1 && (
                            <div className="flex justify-center gap-1.5 mt-3">
                                {item.imageUrls.map((_: any, i: number) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveIndex(i)}
                                        className={`h-1.5 rounded-full transition-all ${activeIndex === i ? "w-5 bg-blue-600" : "w-1.5 bg-gray-300"
                                            }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="w-full bg-gray-100 rounded-2xl flex items-center justify-center" style={{ aspectRatio: "4/3" }}>
                        <p className="text-gray-400 text-sm">Aucune image</p>
                    </div>
                )}
            </div>


            <p className="text-gray-600 mb-6">{item.description}</p>

            {/* ── Localisation ── */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
                <h3 className="font-semibold mb-1">📍 Localisation</h3>
                <p className="text-gray-700">{item.city}</p>
                <p className="text-gray-400 text-sm">{item.address}</p>
            </div>



            <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
                <h3 className="font-semibold mb-3">👤 Propriétaire</h3>

                {/* Infos user */}
                <p className="font-medium text-gray-900">{item.publisher?.fullName}</p>
                <p className="text-gray-400 text-sm">@{item.publisher?.username}</p>
                <p className="text-gray-400 text-sm">{item.publisher?.city}</p>
                <p className="text-gray-700">
                    {item.publisher?.averageRating
                        ? `${item.publisher.averageRating.toFixed(1)} ⭐ (${item.publisher.reviewsCount ?? 0} avis)`
                        : "Aucune note"}
                </p>
                {item.publisher?.badge && (
                    <p className="text-sm mt-1">🏅 {item.publisher.badge}</p>
                )}

                <Link
                    href={`/users/${item.publisher?.userId}`}
                    className="text-blue-600 text-sm font-medium mt-2 inline-block hover:underline"
                >
                    Voir le profil →
                </Link>

                {/* ───────────── Avis propriétaire ───────────── */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <h4 className="font-semibold text-sm mb-2">
                        ⭐ Avis sur ce propriétaire ({userReviews.length})
                    </h4>

                    {userReviews.length === 0 ? (
                        <p className="text-gray-400 text-sm">Aucun avis pour le moment</p>
                    ) : (
                        (showAllUserReviews ? userReviews : userReviews.slice(0, 3)).map((r) => (
                            <div key={r.id} className="border-t pt-2 mt-2 text-sm">
                                <p>⭐ {r.rating}</p>
                                <p className="text-gray-700">{r.comment}</p>
                                <p className="text-gray-400 text-xs">
                                    Par {r.reviewerUsername}
                                </p>
                            </div>
                        ))
                    )}
                    {userReviews.length > 3 && (
                        <button
                            onClick={() => setShowAllUserReviews(!showAllUserReviews)}
                            className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                        >
                            {showAllUserReviews ? "Voir moins" : "Voir plus"}
                        </button>
                    )}
                </div>

                {/* ───────────── Avis item ───────────── */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <h4 className="font-semibold text-sm mb-2">
                        ⭐ Avis sur cet article ({reviewsCount})
                    </h4>

                    {reviews.length === 0 ? (
                        <p className="text-gray-400 text-sm">Aucun avis pour le moment</p>
                    ) : (
                        (showAllItemReviews ? reviews : reviews.slice(0, 3)).map((r) => (
                            <div key={r.id} className="border-t pt-2 mt-2 text-sm">
                                <p>⭐ {r.rating}</p>
                                <p className="text-gray-700">{r.comment}</p>
                                <p className="text-gray-400 text-xs">
                                    Par {r.reviewerUsername}
                                </p>
                            </div>

                        ))
                    )}
                    {reviews.length > 3 && (
                        <button
                            onClick={() => setShowAllItemReviews(!showAllItemReviews)}
                            className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                        >
                            {showAllItemReviews ? "Voir moins" : "Voir plus"}
                        </button>
                    )}

                </div>
            </div>

            {/* ── Message propriétaire ── */}
            {!isOwner && (
                <button
                    onClick={() => router.push(`/messages/chat?receiverId=${item.publisher?.userId}&itemId=${id}`)}
                    className="w-full py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors mb-4 cursor-pointer"
                >
                    ✉️ Écrire au propriétaire
                </button>
            )}


            {/* ── Bid (non-owner, premium, enchère active) ── */}
            {item.type === "AUCTION" && !isOwner && !isAuctionFinished && currentUser?.premium && (
                <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
                    <h3 className="font-semibold mb-3">💰 Placer une enchère</h3>
                    <p className="text-sm text-gray-500 mb-2">
                        Prix actuel : {auction?.currentPrice ?? auction?.startPrice ?? "Pas encore d'enchère"} $
                    </p>
                    <input
                        type="number" placeholder="Votre offre" value={bidAmount}
                        onChange={e => setBidAmount(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={handleBid}
                        disabled={
                            bidLoading ||
                            !bidAmount ||
                            Number(bidAmount) <= (auction?.currentPrice ?? auction?.startPrice)
                        }
                        className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold 
               disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {bidLoading ? "Envoi..." : "Faire une offre"}
                    </button>
                </div>
            )}

            {item.type === "AUCTION" && !isOwner && !currentUser?.premium && !isAuctionFinished && (
                <p className="text-orange-500 text-sm mb-4">
                    ⭐ Vous devez être Premium pour participer aux enchères.
                </p>
            )}

            {/* ── Location (non-owner, item actif) ── */}
            {item.type === "RENTAL" && !isOwner && item.active !== false && (
                <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
                    <h3 className="font-semibold mb-3">📅 Louer cet item</h3>
                    <div className="flex flex-col gap-2">
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Date début</label>
                            <input
                                type="date"
                                value={startDate}
                                min={new Date().toISOString().split("T")[0]} // ← aujourd'hui minimum
                                onChange={e => {
                                    setStartDate(e.target.value);
                                    // Reset end date si elle devient invalide
                                    if (endDate && endDate <= e.target.value) {
                                        setEndDate("");
                                    }
                                }}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Date fin</label>
                            <input
                                type="date"
                                value={endDate}
                                min={
                                    startDate
                                        ? (() => {
                                            // Lendemain de la date de début
                                            const d = new Date(startDate);
                                            d.setDate(d.getDate() + 1);
                                            return d.toISOString().split("T")[0];
                                        })()
                                        : (() => {
                                            // Minimum demain si pas de date de début
                                            const d = new Date();
                                            d.setDate(d.getDate() + 1);
                                            return d.toISOString().split("T")[0];
                                        })()
                                }
                                onChange={e => setEndDate(e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <button
                            onClick={handleRent}
                            disabled={rentLoading || !startDate || !endDate}
                            className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 cursor-pointer mt-1"
                        >
                            {rentLoading ? "Envoi..." : "Louer maintenant"}
                        </button>
                    </div>
                </div>
            )}


            {/* ── Info enchère owner ── */}
            {item.type === "AUCTION" && isOwner && auction && (
                <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
                    <h3 className="font-semibold mb-2">📊 Votre enchère</h3>
                    <p className="text-sm text-gray-600">
                        Prix actuel : {auction?.currentPrice ?? auction?.startPrice} $
                    </p>
                    <p className="text-sm text-gray-400">Date de fin : {auction?.endDate}</p>
                </div>
            )}

        </div>
    );
}