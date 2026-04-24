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
} from "@/services/reviewService";

const BASE_URL = "http://localhost:8080";

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
          data.publisher?.userId ? getReviewsByUser(data.publisher.userId) : Promise.resolve([]),
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
            <span>
              👥 {auction.participantsCount ?? 0} enchérisseur(s)
              {(auction.participantsCount ?? 0) >= 5 && " 🔥"}
            </span>
          </div>

          <p className="text-red-500 font-semibold">⏳ {timeLeft}</p>
        </div>
      )}

      {/* ── Suivre enchère ── */}
      {item.type === "AUCTION" && auction && !isOwner && (
        <button
          onClick={handleWatch}
          disabled={isWatching}
          className={`w-full py-2.5 rounded-xl text-sm font-medium mb-4 transition-colors ${
            isWatching
              ? "bg-gray-200 text-gray-500 cursor-default"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {isWatching ? "⭐ Enchère suivie" : "⭐ Suivre l'enchère"}
        </button>
      )}

      {/* ── Images ── */}
      <h1 className="text-2xl font-bold mb-4">{item.title}</h1>
      <div className="flex flex-col gap-3 mb-4">
        {item.imageUrls?.length > 0
          ? item.imageUrls.map((url: string, i: number) => (
              <img key={i} src={`${BASE_URL}${url}`} className="w-full h-56 object-cover rounded-xl" />
            ))
          : <p className="text-gray-400">Aucune image</p>}
      </div>

      {item.type === "RENTAL" && (
        <p className="text-xl font-semibold text-blue-600 mb-2">{item.pricePerDay} $ / jour</p>
      )}
      <p className="text-gray-600 mb-6">{item.description}</p>

      {/* ── Localisation ── */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
        <h3 className="font-semibold mb-1">📍 Localisation</h3>
        <p className="text-gray-700">{item.city}</p>
        <p className="text-gray-400 text-sm">{item.address}</p>
      </div>

      {/* ── Note moyenne ── */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
        <h3 className="font-semibold mb-1">⭐ Note moyenne</h3>
        <p className="text-gray-700">{item.averageRating ?? "Aucune note"}</p>
      </div>

      {/* ── Propriétaire ── */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
        <h3 className="font-semibold mb-2">👤 Propriétaire</h3>
        <p className="font-medium text-gray-900">{item.publisher?.fullName}</p>
        <p className="text-gray-400 text-sm">@{item.publisher?.username}</p>
        <p className="text-gray-400 text-sm">{item.publisher?.city}</p>
        {item.publisher?.badge && (
          <p className="text-sm mt-1">🏅 {item.publisher.badge}</p>
        )}
        <Link href={`/users/${item.publisher?.userId}`}
          className="text-blue-600 text-sm font-medium mt-2 inline-block hover:underline">
          Voir le profil →
        </Link>
      </div>

      {/* ── Message propriétaire ── */}
      {!isOwner && (
        <button
       onClick={() => router.push(`/messages/chat?receiverId=${item.publisher?.userId}&itemId=${id}`)}
          className="w-full py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors mb-4"
        >
          ✉️ Écrire au propriétaire
        </button>
      )}

      {/* ── Avis propriétaire ── */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
        <h3 className="font-semibold mb-3">⭐ Avis sur ce propriétaire ({userReviews.length})</h3>
        {userReviews.length === 0 ? (
          <p className="text-gray-400 text-sm">Aucun avis pour le moment</p>
        ) : userReviews.map(r => (
          <div key={r.id} className="border-t pt-2 mt-2 text-sm">
            <p>⭐ {r.rating}</p>
            <p className="text-gray-700">{r.comment}</p>
            <p className="text-gray-400 text-xs">Par {r.reviewerUsername}</p>
          </div>
        ))}
      </div>

      {/* ── Avis article ── */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
        <h3 className="font-semibold mb-3">⭐ Avis sur cet article ({reviewsCount})</h3>
        {reviews.length === 0 ? (
          <p className="text-gray-400 text-sm">Aucun avis pour le moment</p>
        ) : reviews.map(r => (
          <div key={r.id} className="border-t pt-2 mt-2 text-sm">
            <p>⭐ {r.rating}</p>
            <p className="text-gray-700">{r.comment}</p>
            <p className="text-gray-400 text-xs">Par {r.reviewerUsername}</p>
          </div>
        ))}
      </div>

      {/* ── Bid (non-owner, premium, enchère active) ── */}
      {item.type === "AUCTION" && !isOwner && item.active !== false && currentUser?.premium && (
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
          <button onClick={handleBid} disabled={bidLoading}
            className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60">
            {bidLoading ? "Envoi..." : "Faire une offre"}
          </button>
        </div>
      )}

      {item.type === "AUCTION" && !isOwner && !currentUser?.premium && (
        <p className="text-orange-500 text-sm mb-4">
          ⭐ Vous devez être Premium pour participer aux enchères.
        </p>
      )}

      {/* ── Location (non-owner) ── */}
      {item.type === "RENTAL" && !isOwner && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
          <h3 className="font-semibold mb-3">📅 Louer cet item</h3>
          <div className="flex flex-col gap-2">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Date début</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Date fin</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button onClick={handleRent} disabled={rentLoading}
              className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors mt-1 disabled:opacity-60">
              {rentLoading ? "Envoi..." : "Louer maintenant"}
            </button>
          </div>
        </div>
      )}

      {/* ── Publier enchère (owner, pas encore d'enchère) ── */}
      {item.type === "AUCTION" && isOwner && !auction && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
          <h3 className="font-semibold mb-3">🔥 Publier l'enchère</h3>
          <div className="flex flex-col gap-2">
            <input type="number" placeholder="Prix initial" value={startPrice}
              onChange={e => setStartPrice(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="number" placeholder="Prix de réserve (secret)" value={reservePrice}
              onChange={e => setReservePrice(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Date de fin</label>
              <input type="datetime-local" value={endDateAuction}
                onChange={e => setEndDateAuction(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
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