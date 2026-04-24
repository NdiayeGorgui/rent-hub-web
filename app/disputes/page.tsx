"use client";

import { useEffect, useState } from "react";
import {
  createDispute,
  createAuctionDispute,
  getMyDisputes,
} from "@/services/disputeService";
import { fetchMyRentals } from "@/services/rentalService";
import { fetchItemDetails } from "@/services/itemService";
import { getMyWonAuctions, getMyClosedAuctionsAsOwner } from "@/services/auctionService";

export default function DisputesPage() {
  const [activeTab, setActiveTab] = useState<"list" | "create">("list");
  const [disputes, setDisputes] = useState<any[]>([]);
  const [rentals, setRentals] = useState<any[]>([]);
  const [selectedRental, setSelectedRental] = useState<any>(null);
  const [itemsMap, setItemsMap] = useState<Record<number, any>>({});
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [disputeType, setDisputeType] = useState<"rental" | "auction">("rental");
  const [wonAuctions, setWonAuctions] = useState<any[]>([]);
  const [ownerAuctions, setOwnerAuctions] = useState<any[]>([]);
  const [selectedAuction, setSelectedAuction] = useState<any>(null);
  const [auctionRole, setAuctionRole] = useState<"winner" | "owner">("winner");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === "list") loadDisputes();
    if (activeTab === "create") loadRentals();
  }, [activeTab]);

  const loadDisputes = async () => {
    setLoading(true);
    try {
      const data = await getMyDisputes();
      setDisputes(data);
      const uniqueItemIds = [...new Set(data.map((d: any) => d.itemId))] as number[];
      const results = await Promise.all(
        uniqueItemIds.map(async (id) => {
          try { return [id, await fetchItemDetails(id)]; }
          catch { return [id, null]; }
        })
      );
      setItemsMap(Object.fromEntries(results));
    } finally { setLoading(false); }
  };

  const loadRentals = async () => {
    setLoading(true);
    try {
      const [rentalsData, disputesData] = await Promise.all([fetchMyRentals(), getMyDisputes()]);
      const disputedRentalIds = disputesData.filter((d: any) => d.rentalId).map((d: any) => d.rentalId);
      const disputedAuctionIds = disputesData.filter((d: any) => d.auctionId).map((d: any) => d.auctionId);

      const availableRentals = rentalsData.filter(
        (r: any) => r.status === "ENDED" && !disputedRentalIds.includes(r.id)
      );
      setRentals(availableRentals);

      let won: any[] = [], owned: any[] = [];
      try { won = (await getMyWonAuctions()).filter((a: any) => !disputedAuctionIds.includes(a.id)); } catch {}
      try { owned = (await getMyClosedAuctionsAsOwner()).filter((a: any) => !disputedAuctionIds.includes(a.id)); } catch {}
      setWonAuctions(won);
      setOwnerAuctions(owned);

      const allIds = [...new Set([
        ...availableRentals.map((r: any) => r.itemId),
        ...won.map((a: any) => a.itemId),
        ...owned.map((a: any) => a.itemId),
      ])] as number[];

      const results = await Promise.all(
        allIds.map(async (id) => {
          try { return [id, await fetchItemDetails(id)]; }
          catch { return [id, null]; }
        })
      );
      setItemsMap(Object.fromEntries(results));
    } finally { setLoading(false); }
  };

  const handleCreate = async () => {
    if (!selectedRental || !reason) { alert("Veuillez choisir une location et une raison"); return; }
    try {
      await createDispute({ rentalId: selectedRental.id, reason, description });
      alert("Litige créé ✅");
      setSelectedRental(null); setReason(""); setDescription("");
      setActiveTab("list");
    } catch { alert("Impossible de créer le litige"); }
  };

  const handleCreateAuctionDispute = async () => {
    if (!selectedAuction || !reason) { alert("La raison est obligatoire"); return; }
    try {
      await createAuctionDispute({
        auctionId: selectedAuction.id,
        reportedUserId: auctionRole === "winner" ? selectedAuction.ownerId : selectedAuction.winnerId,
        reason, description,
      });
      alert("Litige créé ✅");
      setSelectedAuction(null); setReason(""); setDescription("");
      setActiveTab("list");
    } catch { alert("Impossible de créer le litige"); }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "OPEN":      return { label: "Ouvert",      cls: "bg-orange-50 text-orange-700 border border-orange-200" };
      case "IN_REVIEW": return { label: "En révision", cls: "bg-blue-50 text-blue-700 border border-blue-200" };
      case "RESOLVED":  return { label: "Résolu",      cls: "bg-green-50 text-green-700 border border-green-200" };
      case "REJECTED":  return { label: "Rejeté",      cls: "bg-red-50 text-red-700 border border-red-200" };
      default:          return { label: status,         cls: "bg-gray-100 text-gray-500 border border-gray-200" };
    }
  };

  const currentAuctions = auctionRole === "winner" ? wonAuctions : ownerAuctions;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Litiges</h1>
          <p className="text-gray-400 mt-1">Gérez vos litiges de locations et d'enchères</p>
        </div>

        {/* Toggle principal */}
        <div className="flex gap-3 mb-8">
          {[
            { key: "list",   label: "Mes litiges",     icon: "⚖️" },
            { key: "create", label: "Créer un litige", icon: "➕" },
          ].map(({ key, label, icon }) => (
            <button key={key} onClick={() => setActiveTab(key as any)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === key
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-gray-500 border border-gray-200 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              <span>{icon}</span> {label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* ── LIST ── */}
        {activeTab === "list" && !loading && (
          disputes.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
              <p className="text-5xl mb-4">⚖️</p>
              <p className="text-gray-500 font-medium">Aucun litige</p>
              <p className="text-gray-400 text-sm mt-1">Vous n'avez aucun litige en cours</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {disputes.map((d) => {
                const { label, cls } = getStatusConfig(d.status);
                return (
                  <div key={d.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-lg">
                          {d.rentalId ? "📦" : "🔥"}
                        </div>
                        <div>
                          <h2 className="font-semibold text-gray-900">
                            {itemsMap[d.itemId]?.title ?? "Chargement..."}
                          </h2>
                          <p className="text-xs text-gray-400">
                            {d.rentalId ? `Location #${d.rentalId}` : `Enchère #${d.auctionId}`}
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${cls}`}>
                        {label}
                      </span>
                    </div>
                    <div className="px-6 py-4">
                      <p className="text-sm text-gray-600">{d.reason}</p>
                      {d.adminDecision && (
                        <div className="mt-3 bg-blue-50 rounded-lg px-4 py-2 text-sm text-blue-700 italic">
                          Décision admin : {d.adminDecision}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* ── CREATE ── */}
        {activeTab === "create" && !loading && (
          <div>
            {/* Toggle type */}
            <div className="flex gap-3 mb-6">
              {[
                { key: "rental",  label: "Location", icon: "📦" },
                { key: "auction", label: "Enchère",  icon: "🔥" },
              ].map(({ key, label, icon }) => (
                <button key={key}
                  onClick={() => {
                    setDisputeType(key as any);
                    setSelectedRental(null); setSelectedAuction(null);
                    setReason(""); setDescription("");
                  }}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all ${
                    disputeType === key
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-white text-gray-500 border border-gray-200 hover:border-blue-300 hover:text-blue-600"
                  }`}
                >
                  <span>{icon}</span> {label}
                </button>
              ))}
            </div>

            {/* ── Litige LOCATION ── */}
            {disputeType === "rental" && (
              !selectedRental ? (
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                    Sélectionnez une location terminée
                  </p>
                  {rentals.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                      <p className="text-gray-400">Aucune location terminée disponible</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {rentals.map((r) => (
                        <button key={r.id} onClick={() => setSelectedRental(r)}
                          className="text-left bg-white rounded-xl border border-gray-200 px-5 py-4 hover:border-blue-400 hover:shadow-sm transition-all">
                          <p className="font-semibold text-gray-900">{itemsMap[r.itemId]?.title ?? "Chargement..."}</p>
                          <p className="text-sm text-gray-400 mt-0.5">Location #{r.id}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">📦</div>
                    <div>
                      <p className="font-semibold text-gray-900">Location #{selectedRental.id}</p>
                      <p className="text-sm text-gray-400">{itemsMap[selectedRental.itemId]?.title}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Raison *</label>
                      <input value={reason} onChange={e => setReason(e.target.value)}
                        placeholder="Ex: Article non conforme à la description"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description <span className="text-gray-400 font-normal">(optionnel)</span></label>
                      <textarea value={description} onChange={e => setDescription(e.target.value)}
                        placeholder="Décrivez le problème en détail..."
                        rows={4}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button onClick={handleCreate}
                        className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
                        Envoyer le litige
                      </button>
                      <button onClick={() => setSelectedRental(null)}
                        className="px-5 py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">
                        Changer
                      </button>
                    </div>
                  </div>
                </div>
              )
            )}

            {/* ── Litige ENCHÈRE ── */}
            {disputeType === "auction" && (
              <div>
                {/* Toggle rôle */}
                <div className="flex gap-3 mb-6">
                  {[
                    { key: "winner", label: "J'ai gagné une enchère", icon: "🏆" },
                    { key: "owner",  label: "Je suis le vendeur",     icon: "📦" },
                  ].map(({ key, label, icon }) => (
                    <button key={key}
                      onClick={() => { setAuctionRole(key as any); setSelectedAuction(null); setReason(""); setDescription(""); }}
                      className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all ${
                        auctionRole === key
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-white text-gray-500 border border-gray-200 hover:border-blue-300 hover:text-blue-600"
                      }`}
                    >
                      <span>{icon}</span> {label}
                    </button>
                  ))}
                </div>

                {!selectedAuction ? (
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                      {auctionRole === "winner" ? "Sélectionnez une enchère gagnée" : "Sélectionnez une enchère vendue"}
                    </p>
                    {currentAuctions.length === 0 ? (
                      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                        <p className="text-gray-400">
                          {auctionRole === "winner" ? "Aucune enchère gagnée disponible" : "Aucune enchère vendue disponible"}
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {currentAuctions.map((a) => (
                          <button key={a.id} onClick={() => setSelectedAuction(a)}
                            className="text-left bg-white rounded-xl border border-gray-200 px-5 py-4 hover:border-blue-400 hover:shadow-sm transition-all">
                            <p className="font-semibold text-gray-900">{itemsMap[a.itemId]?.title ?? "Chargement..."}</p>
                            <p className="text-sm text-gray-400 mt-0.5">Enchère #{a.id} — {a.currentPrice} $</p>
                            <p className="text-sm text-red-400 mt-1">
                              {auctionRole === "winner" ? "⚠️ Le vendeur ne livre pas" : "⚠️ Le gagnant refuse de payer"}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
                      <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">🔥</div>
                      <div>
                        <p className="font-semibold text-gray-900">Enchère #{selectedAuction.id}</p>
                        <p className="text-sm text-gray-400">{itemsMap[selectedAuction.itemId]?.title}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Raison *</label>
                        <input value={reason} onChange={e => setReason(e.target.value)}
                          placeholder={auctionRole === "winner" ? "Ex: Le vendeur ne livre pas l'article" : "Ex: Le gagnant refuse de payer"}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description <span className="text-gray-400 font-normal">(optionnel)</span></label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)}
                          placeholder="Décrivez le problème en détail..."
                          rows={4}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button onClick={handleCreateAuctionDispute}
                          className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
                          Envoyer le litige
                        </button>
                        <button onClick={() => setSelectedAuction(null)}
                          className="px-5 py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">
                          Changer
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}