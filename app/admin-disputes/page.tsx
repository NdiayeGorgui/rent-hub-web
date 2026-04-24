"use client";

import { useEffect, useState } from "react";
import { getAllDisputesAdmin, resolveDisputeAdmin } from "@/services/adminDisputeService";
import { fetchItemDetails } from "@/services/itemService";

export default function AdminDisputesPage() {
  const [activeTab, setActiveTab] = useState<"list" | "resolve">("list");
  const [disputes, setDisputes] = useState<any[]>([]);
  const [selectedDispute, setSelectedDispute] = useState<any>(null);
  const [decision, setDecision] = useState<"RESOLVED" | "REJECTED" | null>(null);
  const [adminComment, setAdminComment] = useState("");
  const [itemsMap, setItemsMap] = useState<Record<number, any>>({});
  const [action, setAction] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDisputes(); }, []);

  const loadDisputes = async () => {
    try {
      const data = await getAllDisputesAdmin();
      setDisputes(data);
      const uniqueItemIds = [...new Set(data.map((d: any) => d.itemId))] as number[];
      const results = await Promise.all(
        uniqueItemIds.map(async (id) => {
          try { return [id, await fetchItemDetails(id)]; }
          catch { return [id, null]; }
        })
      );
      setItemsMap(Object.fromEntries(results));
    } catch { alert("Impossible de charger les litiges"); }
    finally { setLoading(false); }
  };

  const handleResolve = async () => {
    if (!selectedDispute || !decision) { alert("Veuillez choisir une décision"); return; }
    if (!adminComment.trim()) { alert("Veuillez écrire un commentaire"); return; }
    if (decision === "RESOLVED" && !action) { alert("Veuillez choisir une action"); return; }
    try {
      await resolveDisputeAdmin(selectedDispute.id, decision, adminComment, action ?? "NONE");
      alert("Litige traité !");
      setSelectedDispute(null); setAdminComment(""); setDecision(null); setAction(null);
      setActiveTab("list");
      loadDisputes();
    } catch { alert("Impossible de résoudre le litige"); }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "OPEN":      return { label: "Ouvert",      cls: "bg-orange-50 text-orange-700 border border-orange-200" };
      case "IN_REVIEW": return { label: "En révision", cls: "bg-blue-50 text-blue-700 border border-blue-200" };
      case "RESOLVED":  return { label: "Résolu",      cls: "bg-green-50 text-green-700 border border-green-200" };
      case "REJECTED":  return { label: "Rejeté",      cls: "bg-red-50 text-red-700 border border-red-200" };
      default:          return { label: status,         cls: "bg-gray-100 text-gray-500" };
    }
  };

  const openDisputes = disputes.filter(d => d.status === "OPEN" || d.status === "IN_REVIEW");
  const isAuctionDispute = selectedDispute?.auctionId != null;
  const isValid = decision && (decision === "REJECTED" || action) && adminComment.trim();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-10">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Litiges</h1>
          <p className="text-gray-400 mt-1">{openDisputes.length} litige(s) en attente de traitement</p>
        </div>

        <div className="flex gap-3 mb-8">
          {[
            { key: "list",    label: "Tous les litiges", icon: "⚖️" },
            { key: "resolve", label: "Résoudre",         icon: "✅" },
          ].map(({ key, label, icon }) => (
            <button key={key}
              onClick={() => { setActiveTab(key as any); setSelectedDispute(null); }}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === key
                  ? "bg-violet-600 text-white shadow-sm"
                  : "bg-white text-gray-500 border border-gray-200 hover:border-violet-300 hover:text-violet-600"
              }`}
            >
              <span>{icon}</span> {label}
            </button>
          ))}
        </div>

        {/* ── LIST ── */}
        {activeTab === "list" && (
          disputes.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
              <p className="text-5xl mb-4">⚖️</p>
              <p className="text-gray-500 font-medium">Aucun litige</p>
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
                          <h2 className="font-semibold text-gray-900">{itemsMap[d.itemId]?.title ?? "Chargement..."}</h2>
                          <p className="text-xs text-gray-400">
                            {d.rentalId ? `Location #${d.rentalId}` : `Enchère #${d.auctionId}`}
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${cls}`}>{label}</span>
                    </div>
                    <div className="px-6 py-4">
                      <p className="text-sm text-gray-600">{d.reason}</p>
                      {d.adminDecision && (
                        <div className="mt-3 bg-blue-50 rounded-lg px-4 py-2 text-sm text-blue-700 italic">
                          Décision : {d.adminDecision}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* ── RESOLVE ── */}
        {activeTab === "resolve" && (
          !selectedDispute ? (
            <div>
              <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
                Sélectionnez un litige à traiter
              </p>
              {openDisputes.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                  <p className="text-gray-400">Aucun litige à résoudre</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {openDisputes.map((d) => (
                    <button key={d.id}
                      onClick={() => { setSelectedDispute(d); setDecision(null); setAction(null); setAdminComment(""); }}
                      className="text-left bg-white rounded-xl border border-gray-200 px-5 py-4 hover:border-violet-400 hover:shadow-sm transition-all"
                    >
                      <p className="font-semibold text-gray-900">{itemsMap[d.itemId]?.title ?? "Chargement..."}</p>
                      <p className="text-sm text-gray-400 mt-0.5">
                        {d.rentalId ? `📦 Location #${d.rentalId}` : `🔥 Enchère #${d.auctionId}`}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">{d.reason}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

              {/* Header */}
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-lg">
                  {selectedDispute.rentalId ? "📦" : "🔥"}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Litige #{selectedDispute.id}</p>
                  <p className="text-sm text-gray-400">{itemsMap[selectedDispute.itemId]?.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {selectedDispute.rentalId ? `Location #${selectedDispute.rentalId}` : `Enchère #${selectedDispute.auctionId}`}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl px-4 py-3 mb-6 text-sm text-gray-600">
                <span className="font-medium">Raison :</span> {selectedDispute.reason}
              </div>

              {/* Décision */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Décision</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setDecision("RESOLVED"); setAction(null); }}
                    className={`flex-1 py-3 rounded-xl text-sm font-semibold border-2 transition-all ${
                      decision === "RESOLVED"
                        ? "bg-green-500 text-white border-green-500"
                        : "bg-white text-gray-500 border-gray-200 hover:border-green-400"
                    }`}
                  >
                    ✅ Approuver
                  </button>
                  <button
                    onClick={() => { setDecision("REJECTED"); setAction(null); }}
                    className={`flex-1 py-3 rounded-xl text-sm font-semibold border-2 transition-all ${
                      decision === "REJECTED"
                        ? "bg-red-500 text-white border-red-500"
                        : "bg-white text-gray-500 border-gray-200 hover:border-red-400"
                    }`}
                  >
                    ❌ Rejeter
                  </button>
                </div>
              </div>

              {/* Actions */}
              {decision === "RESOLVED" && (
                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Action</p>
                  <div className="flex flex-col gap-2">
                    {[
                      { key: "NONE",             label: "Aucune action" },
                      { key: "SUSPEND_USER",      label: "🔴 Suspendre l'utilisateur" },
                      { key: "DEACTIVATE_ITEM",   label: "🚫 Désactiver l'item" },
                      ...(isAuctionDispute ? [{ key: "REFUND_AUCTION_FEE", label: "💸 Rembourser le owner + pénalité winner" }] : []),
                    ].map(({ key, label }) => (
                      <button key={key} onClick={() => setAction(key)}
                        className={`text-left px-4 py-3 rounded-xl text-sm font-medium border-2 transition-all ${
                          action === key
                            ? "bg-violet-50 border-violet-500 text-violet-700"
                            : "bg-white border-gray-200 text-gray-600 hover:border-violet-300"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Résumé */}
              {decision && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 mb-6 text-sm">
                  <p className="text-gray-700">Décision : <span className="font-bold">{decision}</span></p>
                  {action && <p className="text-gray-700 mt-0.5">Action : <span className="font-bold">{action}</span></p>}
                </div>
              )}

              {/* Commentaire */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Commentaire admin <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={adminComment} onChange={e => setAdminComment(e.target.value)}
                  placeholder="Expliquez votre décision..."
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div className="flex gap-3">
                <button onClick={handleResolve} disabled={!isValid}
                  className="flex-1 py-3 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ✔ Valider la décision
                </button>
                <button onClick={() => setSelectedDispute(null)}
                  className="px-5 py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200"
                >
                  Changer
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}