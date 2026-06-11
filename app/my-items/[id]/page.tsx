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
  
    getAuctionByItemId,
    placeBid,
} from "@/services/auctionService";
import { getCurrentUser } from "@/services/authService";
import {
    getAllReviewsForUser,
    getReviewsByItem,
    getReviewsCountByItem,
} from "@/services/reviewService";
import { cancelAuctionPayment } from "@/services/paymentService";
import { handleWebPayment } from "@/services/stripeWeb";
import Link from "next/link";
import { BASE_URL } from "@/lib/baseURL";
import { formatPrice } from "@/lib/formatPrice";

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

    const isAuctionFinished =
        item?.type === "AUCTION" &&
        (item?.status === "CANCELLED_AUCTION" || item?.active === false);

     const isAuctionClosed =
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
    const [rentalStats, setRentalStats] = useState<any>(null);

    // Auction
   
    const [bidAmount, setBidAmount] = useState("");
    const [bidLoading, setBidLoading] = useState(false);

    // UI
    const [editMode, setEditMode] = useState(false);
    const [statsVisible, setStatsVisible] = useState(false);
    const [step, setStep] = useState<"view" | "payment">("view");
    const [deactivateLoading, setDeactivateLoading] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    // Edit fields
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editPrice, setEditPrice] = useState("");
    const [editCategoryId, setEditCategoryId] = useState("");
    const [editCity, setEditCity] = useState("");
    const [editAddress, setEditAddress] = useState("");
    const [editImages, setEditImages] = useState<File[]>([]);
    const [editImagePreviews, setEditImagePreviews] = useState<string[]>([]);
    const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);

    const [showAllUserReviews, setShowAllUserReviews] = useState(false);
    const [showAllItemReviews, setShowAllItemReviews] = useState(false);


   


   

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
                    } catch { }
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
                        ? getAllReviewsForUser(data.publisher.userId)
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

                setExistingImageUrls(data.imageUrls ?? []);
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
            // Nouvelles images
            editImages.forEach(img => formData.append("images", img));
            // Images existantes à garder
            formData.append("existingImages", JSON.stringify(existingImageUrls));

            await updateItem(Number(id), formData);
            const updated = await fetchItemDetails(Number(id));
            setItem(updated);
            // Resync
            setExistingImageUrls(updated.imageUrls ?? []);
            setEditImagePreviews(updated.imageUrls?.map((u: string) => BASE_URL + u) ?? []);
            setEditImages([]);
            alert("Item modifié ✅");
            setEditMode(false);
        } catch { alert("Modification impossible"); }
    };



    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        setEditImages(prev => [...prev, ...files]);
        setEditImagePreviews(prev => [
            ...prev,
            ...files.map(f => URL.createObjectURL(f)),
        ]);
    };

    const removeImage = (index: number) => {
        const totalExisting = existingImageUrls.length;
        if (index < totalExisting) {
            // Image existante — la retirer de la liste
            setExistingImageUrls(prev => prev.filter((_, i) => i !== index));
        } else {
            // Nouvelle image
            const newIndex = index - totalExisting;
            setEditImages(prev => prev.filter((_, i) => i !== newIndex));
        }
        setEditImagePreviews(prev => prev.filter((_, i) => i !== index));
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
                className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold cursor-pointer"
            >
                {loading ? "Traitement..." : "Confirmer le paiement"}
            </button>
            <button onClick={() => setStep("view")} className="w-full text-center mt-3 text-gray-500 cursor-pointer">
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

                    {!isAuctionFinished && (
                        <button onClick={() => setEditMode(!editMode)}
                            className="flex items-center gap-2 bg-white shadow px-4 py-2 rounded-xl font-semibold hover:bg-gray-50 cursor-pointer">
                            ✏️ Modifier
                        </button>
                    )}

                    {item.type === "AUCTION" && auction?.status === "OPEN" ? (
                        <button onClick={handleCloseAuction}
                            className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-xl font-semibold hover:bg-red-200 cursor-pointer">
                            ❌ Annuler l'enchère
                        </button>
                    ) : item.type === "RENTAL" && !isAuctionFinished ? (
                        <button onClick={handleDeactivate} disabled={deactivateLoading}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold cursor-pointer ${item.active ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                            {item.active ? "🚫 Désactiver" : "✅ Activer"}
                        </button>
                    ) : null}

                    <button onClick={() => setStatsVisible(!statsVisible)}
                        className="flex items-center gap-2 bg-white shadow px-4 py-2 rounded-xl font-semibold hover:bg-gray-50 cursor-pointer">
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
                            <p>💰 Prix initial : {formatPrice(auction.startPrice)} </p>
                            <p>📈 Prix actuel : {formatPrice(auction.currentPrice ?? auction.startPrice)} </p>
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
            {isOwner && editMode && !isAuctionFinished && (
                <div className="bg-white rounded-xl shadow p-4 mb-6">
                    <h3 className="font-bold mb-3">✏️ Modifier l'item</h3>
                    <div className="flex flex-col gap-3">
                        <input className="border rounded p-2" placeholder="Titre" value={editTitle} onChange={e => setEditTitle(e.target.value)} />
                        <textarea className="border rounded p-2" placeholder="Description" value={editDescription} onChange={e => setEditDescription(e.target.value)} />

                        <div>
                            <p className="text-sm font-semibold mb-1">Catégorie</p>
                            <div className="flex flex-wrap gap-2">
                                {categories.map(c => (
                                    <button key={c.id} onClick={() => setEditCategoryId(String(c.id))}
                                        className={`px-3 py-1 rounded-lg text-sm font-medium ${editCategoryId === String(c.id) ? "bg-blue-600 text-white" : "bg-gray-200 cursor-pointer"}`}>
                                        {c.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {item.type === "RENTAL" && (
                            <input className="border rounded p-2" placeholder="Prix / jour" value={editPrice} onChange={e => setEditPrice(e.target.value)} />
                        )}
                        <input className="border rounded p-2" placeholder="Ville" value={editCity} onChange={e => setEditCity(e.target.value)} />
                        <input className="border rounded p-2" placeholder="Adresse" value={editAddress} onChange={e => setEditAddress(e.target.value)} />

                        {/* ── Images ── */}
                        <div>
                            <p className="text-sm font-semibold mb-2">Images</p>

                            {/* Zone de drop stylée */}
                            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                                <svg className="w-7 h-7 text-gray-400 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.338-2.32 5.75 5.75 0 011.344 11.095" />
                                </svg>
                                <span className="text-sm text-gray-500">Ajouter des images</span>
                                <span className="text-xs text-gray-400 mt-0.5">
                                    {editImages.length > 0 ? `${editImages.length} nouveau(x) fichier(s)` : "PNG, JPG acceptés"}
                                </span>
                                <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                            </label>

                            {/* Aperçu images */}
                            {editImagePreviews.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {editImagePreviews.map((src, i) => (
                                        <div key={i} className="relative">
                                            <img src={src} className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                                            <button onClick={() => removeImage(i)}
                                                className="absolute -top-1 -right-1 bg-black bg-opacity-70 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 mt-2">
                            <button onClick={handleUpdate} className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold cursor-pointer">💾 Enregistrer</button>
                            <button onClick={() => setEditMode(false)} className="flex-1 bg-gray-500 text-white py-2 rounded-lg font-semibold cursor-pointer">Annuler</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Auction header ── */}
            {item.type === "AUCTION" && auction && (
                <div className="bg-white rounded-xl shadow p-6 mb-6 text-center">
                    <p className="text-gray-500">💰 Prix actuel</p>
                    <p className="text-4xl font-bold text-blue-600 my-2">
                        {formatPrice(auction.currentPrice ?? auction.startPrice)} 
                    </p>
                    <p className="text-red-600 font-semibold">⏳ Temps restant : {timeLeft}</p>
                </div>
            )}

            {/* ── Images ── */}
            <h1 className="text-2xl font-bold mb-4">{item.title}</h1>
            {/* ── Images ── */}
            <div className="w-full h-full object-contain transition-all duration-300">
                {item.imageUrls?.length > 0 ? (
                    <div className="relative">

                        {/* Image principale */}
                        <div
                            className="w-full bg-gray-100 rounded-xl overflow-hidden"
                            style={{ aspectRatio: "4/3" }}
                        >
                            <img
                                src={`${BASE_URL}${item.imageUrls[activeImageIndex]}`}
                                className="w-full h-full object-contain transition-opacity duration-300"
                                alt={`image ${activeImageIndex + 1}`}
                            />
                        </div>

                        {/* Flèche gauche */}
                        {item.imageUrls.length > 1 && (
                            <button
                                onClick={() => setActiveImageIndex(prev => Math.max(prev - 1, 0))}
                                disabled={activeImageIndex === 0}
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white bg-opacity-80 shadow flex items-center justify-center disabled:opacity-30 hover:bg-opacity-100 transition-all"
                            >
                                <svg
                                    className="w-4 h-4 text-gray-700"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                >
                                    <path d="M15 18l-6-6 6-6" />
                                </svg>
                            </button>
                        )}

                        {/* Flèche droite */}
                        {item.imageUrls.length > 1 && (
                            <button
                                onClick={() =>
                                    setActiveImageIndex(prev =>
                                        Math.min(prev + 1, item.imageUrls.length - 1)
                                    )
                                }
                                disabled={activeImageIndex === item.imageUrls.length - 1}
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white bg-opacity-80 shadow flex items-center justify-center disabled:opacity-30 hover:bg-opacity-100 transition-all"
                            >
                                <svg
                                    className="w-4 h-4 text-gray-700"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                >
                                    <path d="M9 18l6-6-6-6" />
                                </svg>
                            </button>
                        )}

                        {/* Dots */}
                        {item.imageUrls.length > 1 && (
                            <div className="flex justify-center gap-2 mt-3">
                                {item.imageUrls.map((_: string, i: number) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveImageIndex(i)}
                                        className={`h-1.5 rounded-full transition-all ${i === activeImageIndex
                                            ? "w-5 bg-blue-600"
                                            : "w-1.5 bg-gray-300"
                                            }`}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Miniatures */}
                        {item.imageUrls.length > 1 && (
                            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                                {item.imageUrls.map((url: string, i: number) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveImageIndex(i)}
                                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${i === activeImageIndex
                                            ? "border-blue-600"
                                            : "border-transparent opacity-60 hover:opacity-100"
                                            }`}
                                    >
                                        <img
                                            src={`${BASE_URL}${url}`}
                                            className="w-full h-full object-contain bg-gray-100"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}

                    </div>
                ) : (
                    <p className="text-gray-400">Aucune image</p>
                )}
            </div>

            {item.type === "RENTAL" && (
                <p className="text-xl font-semibold text-blue-600 mb-2">{formatPrice(item.pricePerDay)}  / jour</p>
            )}
            <p className="text-gray-700 mb-4">{item.description}</p>

            {/* ── Localisation ── */}
            <div className="bg-white rounded-xl shadow p-4 mb-4">
                <h3 className="font-bold mb-1">📍 Localisation</h3>
                <p>{item.city}</p>
                <p className="text-gray-500 text-sm">{item.address}</p>
            </div>

            {/* ── Propriétaire ── */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
                <h3 className="font-semibold mb-3">👤 Propriétaire</h3>

                {/* Infos user */}
                <p className="font-medium text-gray-900">{item.publisher?.fullName}</p>
                <p className="text-gray-400 text-sm">@{item.publisher?.username}</p>
                <p className="text-gray-400 text-sm">{item.publisher?.city}</p>

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
                    {/* ───────────── Note moyenne ───────────── */}
                    <div className="mt-3 text-sm">
                        <p className="font-medium text-gray-700">
                            ⭐ Note moyenne sur cet article :{" "}
                            <span className="text-blue-600 font-semibold">
                                {item.averageRating ?? "Aucune note"}
                            </span>
                        </p>
                    </div>
                </div>
            </div>



            {/* ── Bid (non-owner, premium, enchère ouverte) ── */}
            {item.type === "AUCTION" && !isOwner  && auction?.status === "OPEN" && !isAuctionFinished && currentUser?.premium && (
                <div className="bg-white rounded-xl shadow p-4 mb-4">
                    <h3 className="font-bold mb-3">💰 Placer une enchère</h3>
                    <p className="text-sm mb-2">
                        Prix actuel : {formatPrice(auction?.currentPrice ?? auction?.startPrice) ?? "Pas encore d'enchère"} 
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

         

            {/* ── Info enchère owner ── */}
            {item.type === "AUCTION" && isOwner && auction?.status === "OPEN" && (
                <div className="bg-white rounded-xl shadow p-4 mb-6">
                    <h3 className="font-bold mb-2">📊 Votre enchère</h3>
                    <p className="text-sm">Prix actuel : {formatPrice(auction?.currentPrice ?? auction?.startPrice)} </p>
                    <p className="text-sm text-gray-500">Date de fin : {auction?.endDate}</p>
                </div>
            )}

        </div>
    );
}