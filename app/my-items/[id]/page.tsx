"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  fetchItemDetails,
  activateItem,
  deactivateItem,
  updateItem,
} from "@/services/itemService";
import {
  createRental,
  getRentalStatsByItem,
} from "@/services/rentalService";
import {
  createAuction,
  getAuctionByItemId,
  placeBid,
} from "@/services/auctionService";
import { getCurrentUser } from "@/services/authService";
import {
  getReviewsByItem,
  getReviewsByUser,
  getReviewsCountByItem,
} from "@/services/reviewService";
import { cancelAuctionPayment } from "@/services/paymentService";
import { handleWebPayment } from "@/services/stripeWeb";

const categories = [
  { id: 1, name: "Électronique" },
  { id: 2, name: "Électroménager" },
  { id: 3, name: "Événements" },
  { id: 4, name: "Véhicules" },
  { id: 5, name: "Bébé & Enfants" },
  { id: 6, name: "Sport & Loisirs" },
  { id: 7, name: "Maison & Meubles" },
  { id: 8, name: "Mode & Vêtements" },
  { id: 9, name: "Outils & Bricolage" },
  { id: 10, name: "Autres" },
];

export default function ItemDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [auction, setAuction] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState("");

  // Reviews
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [userReviews, setUserReviews] = useState<any[]>([]);

  // Rental
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [rentLoading, setRentLoading] = useState(false);
  const [rentalStats, setRentalStats] = useState<any>(null);

  // Auction
  const [startPrice, setStartPrice] = useState("");
  const [reservePrice, setReservePrice] = useState("");
  const [endDateAuction, setEndDateAuction] = useState("");
  const [auctionLoading, setAuctionLoading] = useState(false);
  const [bidAmount, setBidAmount] = useState("");
  const [bidLoading, setBidLoading] = useState(false);

  // UI
  const [editMode, setEditMode] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [step, setStep] = useState<"view" | "payment">("view");
  const [deactivateLoading, setDeactivateLoading] = useState(false);

  // Edit fields
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editImages, setEditImages] = useState<File[]>([]);
  const [editImagePreviews, setEditImagePreviews] = useState<string[]>([]);

  const BASE_URL = "http://localhost:8080";

  const isAuctionEnded =
    item?.type === "AUCTION" &&
    item?.active === false &&
    item?.status !== "CANCELLED_AUCTION";

  const isAuctionClosed =
    item?.type === "AUCTION" &&
    (item?.status === "CANCELLED_AUCTION" || item?.active === false);

  // ─── Load ────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchItemDetails(Number(id));
        setItem(data);

        if (data.type === "RENTAL") {
          try {
            const stats = await getRentalStatsByItem(Number(id));
            setRentalStats(stats);
          } catch {}
        }

        const user = await getCurrentUser();
        setCurrentUser(user);
        setIsOwner(user?.userId === data.publisher?.userId);

        if (data.type === "AUCTION") {
          try {
            const auctionData = await getAuctionByItemId(Number(id));
            setAuction(auctionData ?? null);
          } catch {
            setAuction(null);
          }
        }

        const [reviewsData, count, userReviewsData] = await Promise.all([
          getReviewsByItem(Number(id)),
          getReviewsCountByItem(Number(id)),
          data.publisher?.userId
            ? getReviewsByUser(data.publisher.userId)
            : Promise.resolve([]),
        ]);
        setReviews(reviewsData);
        setReviewsCount(count);
        setUserReviews(userReviewsData);

        // Sync edit fields
        setEditTitle(data.title ?? "");
        setEditDescription(data.description ?? "");
        setEditPrice(data.pricePerDay?.toString() ?? "");
        setEditCategoryId(data.categoryId?.toString() ?? "");
        setEditCity(data.city ?? "");
        setEditAddress(data.address ?? "");
        setEditImagePreviews(
          data.imageUrls?.map((u: string) => BASE_URL + u) ?? []
        );
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  // ─── Countdown ───────────────────────────────────────────
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

  // ─── Handlers ────────────────────────────────────────────
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

  const handleDeactivate = async () => {
    const action = item.active ? "désactiver" : "activer";
    if (!confirm(`Voulez-vous vraiment ${action} cet item ?`)) return;
    try {
      setDeactivateLoading(true);
      if (item.active) {
        await deactivateItem(Number(id));
        setItem({ ...item, active: false, status: "INACTIVE" });
      } else {
        await activateItem(Number(id));
        setItem({ ...item, active: true, status: "ACTIVE" });
      }
    } catch { alert("Impossible de modifier le statut"); }
    finally { setDeactivateLoading(false); }
  };

  const handleCloseAuction = () => {
    if (confirm("⚠️ Cette action coûte 50$. Continuer ?")) setStep("payment");
  };

  const handleConfirmCancel = async () => {
    try {
      setLoading(true);
      const res = await cancelAuctionPayment({
        auctionId: auction.id,
        itemId: auction.itemId,
        userId: currentUser.userId,
        amount: 50,
      });
      await handleWebPayment(res.clientSecret);
      alert("Paiement effectué !");
      router.push("/my-items");
    } catch (err: any) {
      alert(err?.message || "Paiement échoué");
    } finally { setLoading(false); }
  };

  const handleUpdate = async () => {
    try {
      const formData = new FormData();
      formData.append("data", JSON.stringify({
        title: editTitle, description: editDescription,
        categoryId: Number(editCategoryId), city: editCity,
        address: editAddress, type: item.type,
        pricePerDay: item.type === "RENTAL" ? Number(editPrice) : null,
      }));
      editImages.forEach((img) => formData.append("images", img));
      await updateItem(Number(id), formData);
      const updated = await fetchItemDetails(Number(id));
      setItem(updated);
      alert("Item modifié ✅");
      setEditMode(false);
    } catch { alert("Modification impossible"); }
  };

  const handleCreateAuction = async () => {
    if (!startPrice || !endDateAuction) { alert("Veuillez entrer le prix et la date"); return; }
    if (!confirm("⚠️ L'annulation entraînera des frais de 50$. Continuer ?")) return;
    try {
      setAuctionLoading(true);
      await createAuction({
        itemId: Number(id), startPrice: Number(startPrice),
        reservePrice: Number(reservePrice) || Number(startPrice),
        endDate: endDateAuction,
      });
      alert("Enchère créée !");
      router.push("/my-items");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Erreur création");
    } finally { setAuctionLoading(false); }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setEditImages((prev) => [...prev, ...files]);
    setEditImagePreviews((prev) => [
      ...prev,
      ...files.map((f) => URL.createObjectURL(f)),
    ]);
  };

  const removeImage = (index: number) => {
    setEditImages((prev) => prev.filter((_, i) => i !== index));
    setEditImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // ─── Render ──────────────────────────────────────────────
  if (loading) return <div className="text-center mt-10">Chargement...</div>;
  if (!item) return <div className="text-center mt-10">Item introuvable</div>;

  if (step === "payment") return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow mt-10">
      <h2 className="text-xl font-bold mb-4">💳 Annulation sécurisée</h2>
      <p className="mb-6 text-gray-600">🔒 Paiement de 50$ pour annuler l'enchère</p>
      <button
        onClick={handleConfirmCancel}
        className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold"
      >
        {loading ? "Traitement..." : "Confirmer le paiement"}
      </button>
      <button onClick={() => setStep("view")} className="w-full text-center mt-3 text-gray-500">
        Annuler
      </button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-6">

      {/* Status banner */}
      {isAuctionClosed && (
        <div className="bg-red-100 text-red-700 font-bold p-3 rounded-lg mb-4">
          {item.status === "CANCELLED_AUCTION" ? "❌ Enchère annulée" : "⛔ Enchère terminée"}
        </div>
      )}

      {/* ── Owner management bar ── */}
      {isOwner && (
        <div className="flex flex-wrap gap-3 mb-6">

          {!isAuctionEnded && (
            <button onClick={() => setEditMode(!editMode)}
              className="flex items-center gap-2 bg-white shadow px-4 py-2 rounded-xl font-semibold hover:bg-gray-50">
              ✏️ Modifier
            </button>
          )}

          {item.type === "AUCTION" && auction?.status === "OPEN" ? (
            <button onClick={handleCloseAuction}
              className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-xl font-semibold hover:bg-red-200">
              ❌ Annuler l'enchère
            </button>
          ) : item.type === "RENTAL" && !isAuctionEnded ? (
            <button onClick={handleDeactivate} disabled={deactivateLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold ${item.active ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
              {item.active ? "🚫 Désactiver" : "✅ Activer"}
            </button>
          ) : null}

          <button onClick={() => setStatsVisible(!statsVisible)}
            className="flex items-center gap-2 bg-white shadow px-4 py-2 rounded-xl font-semibold hover:bg-gray-50">
            📊 Statistiques
          </button>
        </div>
      )}

      {/* ── Stats panel ── */}
      {isOwner && statsVisible && (
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <h3 className="font-bold mb-3">📊 Statistiques</h3>
          {item.type === "AUCTION" && auction ? (
            <div className="flex flex-col gap-1 text-sm">
              <p>👀 Vues : {auction.views ?? 0}</p>
              <p>⭐ Suivis : {auction.watchers ?? 0}</p>
              <p>👥 {auction.participantsCount ?? 0} enchérisseur(s)</p>
              <p>💰 Prix initial : {auction.startPrice} $</p>
              <p>📈 Prix actuel : {auction.currentPrice ?? auction.startPrice} $</p>
              <p className={auction.reserveReached ? "text-green-600" : "text-red-600"}>
                {auction.reserveReached ? "✅ Prix de réserve atteint" : "⛔ Prix de réserve non atteint"}
              </p>
            </div>
          ) : item.type === "RENTAL" && rentalStats ? (
            <div className="flex flex-col gap-1 text-sm">
              <p>📦 {rentalStats.rentalsCount} locations</p>
              <p>💰 {rentalStats.totalRevenue} $ générés</p>
              <p>📅 {rentalStats.totalDaysRented} jours loués</p>
              {rentalStats.rentalsCount > 5 && <p className="text-green-600">🔥 Très demandé</p>}
            </div>
          ) : <p className="text-sm text-gray-500">Aucune statistique disponible</p>}
        </div>
      )}

      {/* ── Edit form ── */}
      {isOwner && editMode && (
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <h3 className="font-bold mb-3">✏️ Modifier l'item</h3>
          <div className="flex flex-col gap-3">
            <input className="input border rounded p-2" placeholder="Titre" value={editTitle} onChange={e => setEditTitle(e.target.value)} />
            <textarea className="input border rounded p-2" placeholder="Description" value={editDescription} onChange={e => setEditDescription(e.target.value)} />

            <div>
              <p className="text-sm font-semibold mb-1">Catégorie</p>
              <div className="flex flex-wrap gap-2">
                {categories.map(c => (
                  <button key={c.id} onClick={() => setEditCategoryId(String(c.id))}
                    className={`px-3 py-1 rounded-lg text-sm font-medium ${editCategoryId === String(c.id) ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {item.type === "RENTAL" && (
              <input className="input border rounded p-2" placeholder="Prix / jour" value={editPrice} onChange={e => setEditPrice(e.target.value)} />
            )}
            <input className="input border rounded p-2" placeholder="Ville" value={editCity} onChange={e => setEditCity(e.target.value)} />
            <input className="input border rounded p-2" placeholder="Adresse" value={editAddress} onChange={e => setEditAddress(e.target.value)} />

            <div>
              <p className="text-sm font-semibold mb-1">Images</p>
              <input type="file" multiple accept="image/*" onChange={handleImageChange} />
              <div className="flex flex-wrap gap-2 mt-2">
                {editImagePreviews.map((src, i) => (
                  <div key={i} className="relative">
                    <img src={src} className="w-20 h-20 object-cover rounded-lg" />
                    <button onClick={() => removeImage(i)}
                      className="absolute -top-1 -right-1 bg-black bg-opacity-70 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button onClick={handleUpdate} className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold">💾 Enregistrer</button>
              <button onClick={() => setEditMode(false)} className="flex-1 bg-gray-500 text-white py-2 rounded-lg font-semibold">Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Auction header ── */}
      {item.type === "AUCTION" && auction && (
        <div className="bg-white rounded-xl shadow p-6 mb-6 text-center">
          <p className="text-gray-500">💰 Prix actuel</p>
          <p className="text-4xl font-bold text-blue-600 my-2">
            {auction.currentPrice ?? auction.startPrice} $
          </p>
          <p className="text-red-600 font-semibold">⏳ Temps restant : {timeLeft}</p>
        </div>
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
      <p className="text-gray-700 mb-4">{item.description}</p>

      {/* ── Localisation ── */}
      <div className="bg-white rounded-xl shadow p-4 mb-4">
        <h3 className="font-bold mb-1">📍 Localisation</h3>
        <p>{item.city}</p>
        <p className="text-gray-500 text-sm">{item.address}</p>
      </div>

      {/* ── Propriétaire ── */}
      <div className="bg-white rounded-xl shadow p-4 mb-4">
        <h3 className="font-bold mb-2">👤 Propriétaire</h3>
        <p className="font-semibold">{item.publisher?.fullName}</p>
        <p className="text-gray-500 text-sm">@{item.publisher?.username}</p>
        <p className="text-gray-500 text-sm">{item.publisher?.city}</p>
        <a href={`/users/${item.publisher?.userId}`} className="text-blue-600 text-sm font-semibold mt-1 inline-block">
          Voir le profil →
        </a>
        <p className="mt-2 text-sm">⭐ Note moyenne : {item.averageRating ?? "Aucune note"}</p>
      </div>

      {/* ── Avis propriétaire ── */}
      <div className="bg-white rounded-xl shadow p-4 mb-4">
        <h3 className="font-bold mb-2">⭐ Avis sur ce propriétaire ({userReviews.length})</h3>
        {userReviews.length === 0 ? (
          <p className="text-gray-400 text-sm">Aucun avis pour le moment</p>
        ) : userReviews.map(r => (
          <div key={r.id} className="border-t pt-2 mt-2 text-sm">
            <p>⭐ {r.rating}</p>
            <p>{r.comment}</p>
            <p className="text-gray-400 text-xs">Par {r.reviewerUsername}</p>
          </div>
        ))}
      </div>

      {/* ── Avis article ── */}
      <div className="bg-white rounded-xl shadow p-4 mb-4">
        <h3 className="font-bold mb-2">⭐ Avis sur cet article ({reviewsCount})</h3>
        {reviews.length === 0 ? (
          <p className="text-gray-400 text-sm">Aucun avis pour le moment</p>
        ) : reviews.map(r => (
          <div key={r.id} className="border-t pt-2 mt-2 text-sm">
            <p>⭐ {r.rating}</p>
            <p>{r.comment}</p>
            <p className="text-gray-400 text-xs">Par {r.reviewerUsername}</p>
          </div>
        ))}
      </div>

      {/* ── Bid (non-owner, premium, enchère ouverte) ── */}
      {item.type === "AUCTION" && !isOwner && !isAuctionEnded && currentUser?.premium && (
        <div className="bg-white rounded-xl shadow p-4 mb-4">
          <h3 className="font-bold mb-3">💰 Placer une enchère</h3>
          <p className="text-sm mb-2">
            Prix actuel : {auction?.currentPrice ?? auction?.startPrice ?? "Pas encore d'enchère"} $
          </p>
          <input
            type="number" placeholder="Votre offre" value={bidAmount}
            onChange={e => setBidAmount(e.target.value)}
            className="border rounded p-2 w-full mb-3"
          />
          <button onClick={handleBid} disabled={bidLoading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold">
            {bidLoading ? "Envoi..." : "Faire une offre"}
          </button>
        </div>
      )}

      {item.type === "AUCTION" && !isOwner && !currentUser?.premium && (
        <p className="text-orange-500 mb-4">⭐ Vous devez être Premium pour participer aux enchères.</p>
      )}

      {/* ── Location (non-owner) ── */}
      {item.type === "RENTAL" && !isOwner && (
        <div className="bg-white rounded-xl shadow p-4 mb-4">
          <h3 className="font-bold mb-3">📅 Louer cet item</h3>
          <div className="flex flex-col gap-2">
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border rounded p-2" />
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border rounded p-2" />
            <button onClick={handleRent} disabled={rentLoading}
              className="bg-blue-600 text-white py-2 rounded-lg font-semibold mt-1">
              {rentLoading ? "Envoi..." : "Louer maintenant"}
            </button>
          </div>
        </div>
      )}

      {/* ── Publier enchère (owner, pas encore d'enchère) ── */}
      {item.type === "AUCTION" && isOwner && !auction && !isAuctionEnded && (
        <div className="bg-white rounded-xl shadow p-4 mb-4">
          <h3 className="font-bold mb-3">🔥 Publier l'enchère</h3>
          <div className="flex flex-col gap-2">
            <input type="number" placeholder="Prix initial" value={startPrice} onChange={e => setStartPrice(e.target.value)} className="border rounded p-2" />
            <input type="number" placeholder="Prix de réserve" value={reservePrice} onChange={e => setReservePrice(e.target.value)} className="border rounded p-2" />
            <input type="datetime-local" value={endDateAuction} onChange={e => setEndDateAuction(e.target.value)} className="border rounded p-2" />
            <button onClick={handleCreateAuction} disabled={auctionLoading}
              className="bg-red-600 text-white py-2 rounded-lg font-semibold mt-1">
              {auctionLoading ? "Publication..." : "Publier l'enchère"}
            </button>
          </div>
        </div>
      )}

      {/* ── Info enchère owner ── */}
      {item.type === "AUCTION" && isOwner && auction?.status === "OPEN" && (
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <h3 className="font-bold mb-2">📊 Votre enchère</h3>
          <p className="text-sm">Prix actuel : {auction?.currentPrice ?? auction?.startPrice} $</p>
          <p className="text-sm text-gray-500">Date de fin : {auction?.endDate}</p>
        </div>
      )}

    </div>
  );
}