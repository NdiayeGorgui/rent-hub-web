"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  fetchMyRentals,
  fetchOwnerRentals,
  approveRental,
  cancelRental,
  RentalResponse,
} from "@/services/rentalService";
import { hasReviewedRental } from "@/services/reviewService";
import { fetchItemDetails } from "@/services/itemService";
import { fetchUserProfile } from "@/services/authService";
import Link from "next/link";

export default function RentalsPage() {
  const router = useRouter();

  const [mode, setMode] = useState<"renter" | "owner">("renter");
  const [rentals, setRentals] = useState<RentalResponse[]>([]);
  const [itemsMap, setItemsMap] = useState<Record<number, any>>({});
  const [usersMap, setUsersMap] = useState<Record<string, any>>({});
  const [reviewedMap, setReviewedMap] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = mode === "renter" ? await fetchMyRentals() : await fetchOwnerRentals();
      const filtered = data.filter((r) => r.status !== "CANCELLED");
      setRentals(filtered);

      const uniqueItemIds = [...new Set(filtered.map((r) => r.itemId))];
      const itemsResults = await Promise.all(
        uniqueItemIds.map(async (itemId) => {
          try { return [itemId, await fetchItemDetails(itemId)]; }
          catch { return [itemId, null]; }
        })
      );
      setItemsMap(Object.fromEntries(itemsResults));

      const renterIds = [...new Set(filtered.map((r) => (r as any).renterId).filter(Boolean))];
      const usersResults = await Promise.all(
        renterIds.map(async (userId) => {
          try { return [userId, await fetchUserProfile(userId)]; }
          catch { return [userId, null]; }
        })
      );
      setUsersMap(Object.fromEntries(usersResults));

      const reviewsResults = await Promise.all(
        filtered.map(async (rental) => {
          try { return [rental.id, await hasReviewedRental(rental.id)]; }
          catch { return [rental.id, false]; }
        })
      );
      setReviewedMap(Object.fromEntries(reviewsResults));
    } catch (e) {
      console.log("Error loading rentals", e);
    } finally {
      setLoading(false);
    }
  }, [mode]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleApprove = async (id: number) => {
    setActionLoadingId(id);
    try { await approveRental(id); await loadData(); }
    catch (e) { console.log(e); }
    finally { setActionLoadingId(null); }
  };

  const handleCancel = async (id: number) => {
    setActionLoadingId(id);
    try { await cancelRental(id); await loadData(); }
    catch (e) { console.log(e); }
    finally { setActionLoadingId(null); }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "CREATED":  return { label: "En attente", cls: "bg-amber-50 text-amber-700 border border-amber-200" };
      case "APPROVED": return { label: "Approuvée",  cls: "bg-green-50 text-green-700 border border-green-200" };
      case "ONGOING":  return { label: "En cours",   cls: "bg-blue-50 text-blue-700 border border-blue-200" };
      case "ENDED":    return { label: "Terminée",   cls: "bg-gray-100 text-gray-500 border border-gray-200" };
      default:         return { label: status,        cls: "bg-gray-100 text-gray-500 border border-gray-200" };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Locations</h1>
          <p className="text-gray-400 mt-1">Gérez vos locations en cours et passées</p>
        </div>

        {/* Toggle */}
        <div className="flex gap-3 mb-8">
          {[
            { key: "renter", label: "Mes locations", icon: "🏠" },
            { key: "owner",  label: "Items que je loue", icon: "📦" },
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setMode(key as any)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all ${
                mode === key
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
        ) : rentals.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
            <p className="text-5xl mb-4">📭</p>
            <p className="text-gray-500 font-medium">Aucune location trouvée</p>
            <p className="text-gray-400 text-sm mt-1">
              {mode === "renter" ? "Vous n'avez pas encore loué d'item" : "Aucun item loué pour le moment"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {rentals.map((rental) => {
              const itemDetails = itemsMap[rental.itemId];
              const renter = usersMap[(rental as any).renterId];
              const { label, cls } = getStatusConfig(rental.status);

              return (
                <div key={rental.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                  {/* Card header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-lg">
                        🏠
                      </div>
                      <div>
                        <h2 className="font-semibold text-gray-900">
                          {itemDetails?.title ?? "Chargement..."}
                        </h2>
                        <p className="text-xs text-gray-400">Location #{rental.id}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${cls}`}>
                      {label}
                    </span>
                  </div>

                  {/* Card body */}
                  <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
                        {mode === "owner" ? "Locataire" : "Propriétaire"}
                      </p>
                      {mode === "owner" ? (
                        <Link href={`/users/${renter?.userId}`}
                          className="text-blue-600 font-medium text-sm hover:underline">
                          @{renter?.username ?? "..."}
                        </Link>
                      ) : (
                        <p className="text-sm font-medium text-gray-800">
                          @{itemDetails?.publisher?.username ?? "..."}
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Total</p>
                      <p className="text-sm font-bold text-blue-600">{rental.totalPrice} $</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Début</p>
                      <p className="text-sm text-gray-700">{rental.startDate}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Fin</p>
                      <p className="text-sm text-gray-700">{rental.endDate}</p>
                    </div>
                  </div>

                  {/* Card footer */}
                  {(rental.status === "ENDED" && reviewedMap[rental.id] === false) ||
                   (mode === "owner" && rental.status === "CREATED") ? (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">

                      {rental.status === "ENDED" && reviewedMap[rental.id] === false && (
                        <button
                          onClick={() => router.push(`/review/create?rentalId=${rental.id}`)}
                          className="flex items-center gap-2 px-4 py-2 bg-amber-400 text-amber-900 rounded-lg text-sm font-semibold hover:bg-amber-500 transition-colors"
                        >
                          ⭐ Laisser un avis
                        </button>
                      )}

                      {mode === "owner" && rental.status === "CREATED" && (
                        <>
                          <button
                            onClick={() => handleApprove(rental.id)}
                            disabled={actionLoadingId === rental.id}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-60"
                          >
                            {actionLoadingId === rental.id ? (
                              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : "✅"} Approuver
                          </button>
                          <button
                            onClick={() => handleCancel(rental.id)}
                            disabled={actionLoadingId === rental.id}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-60"
                          >
                            {actionLoadingId === rental.id ? (
                              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : "❌"} Refuser
                          </button>
                        </>
                      )}
                    </div>
                  ) : null}

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}