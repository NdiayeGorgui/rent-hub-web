"use client";

import { useEffect, useState } from "react";
import { getAllPayments, refundAuctionFee, refundSimple } from "@/services/paymentService";

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState<"list" | "refund">("list");
  const [payments, setPayments] = useState<any[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAllPayments();
  }, [activeTab]);

  const loadAllPayments = async () => {
    try {
      const data = await getAllPayments();
      setPayments(data);
    } catch {
      alert("Impossible de charger les paiements");
    }
  };

  const handleRefundSimple = async () => {
  if (!selectedPayment) return;
  setLoading(true);
  try {
    await refundSimple(selectedPayment.paymentIntentId);
    alert("Remboursement effectué ✅");
    setSelectedPayment(null);
    loadAllPayments();
  } catch (err: any) {
    alert(err?.response?.data?.message || "Erreur lors du remboursement");
  } finally {
    setLoading(false);
  }
};

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      SUCCESS: "bg-green-100 text-green-700",
      FAILED: "bg-red-100 text-red-700",
      PENDING: "bg-yellow-100 text-yellow-700",
    };
    return (
      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${map[status] ?? "bg-gray-100 text-gray-500"}`}>
        {status}
      </span>
    );
  };

  const refundable = payments.filter(p => p.status === "SUCCESS" && p.paymentType === "AUCTION_FEE");

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">💳 Paiements</h1>
        <p className="text-gray-400 text-sm mt-1">Consultez vos paiements et effectuez des remboursements</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: "list", label: `📋 Tous les paiements (${payments.length})` },
          { key: "refund", label: `↩️ Remboursements (${refundable.length})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => { setActiveTab(key as any); setSelectedPayment(null); }}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === key
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-500 border border-gray-200 hover:border-blue-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Liste tous les paiements ── */}
      {activeTab === "list" && (
        <div className="flex flex-col gap-3">
          {payments.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">💳</p>
              <p>Aucun paiement trouvé</p>
            </div>
          ) : payments.map(p => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-gray-900">Paiement #{p.id}</p>
                  <p className="text-gray-400 text-sm">{p.userFullName || "Utilisateur inconnu"}</p>
                </div>
                {statusBadge(p.status)}
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <span className="text-green-600 font-bold text-base">{p.amount} $</span>
                <span className="bg-gray-50 px-2 py-0.5 rounded text-xs text-gray-500">
                  {p.paymentType ?? "—"}
                </span>
                <span className="text-gray-400 text-xs">
                  {new Date(p.createdAt).toLocaleDateString("fr-CA", {
                    year: "numeric", month: "short", day: "numeric"
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Remboursements ── */}
      {activeTab === "refund" && (
        <div>
          {!selectedPayment ? (
            <>
              {refundable.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <p className="text-4xl mb-3">✅</p>
                  <p className="font-medium">Aucun paiement à rembourser</p>
                  <p className="text-sm mt-1">Seuls les frais d'enchère payés (AUCTION_FEE) peuvent être remboursés.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {refundable.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPayment(p)}
                      className="bg-white rounded-2xl border border-gray-100 p-5 text-left hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer w-full"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-bold text-gray-900">Paiement #{p.id}</p>
                          <p className="text-gray-400 text-sm">{p.userFullName || "Utilisateur inconnu"}</p>
                        </div>
                        {statusBadge(p.status)}
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <span className="text-green-600 font-bold text-base">{p.amount} $</span>
                        <span className="text-gray-400 text-xs">
                          {new Date(p.createdAt).toLocaleDateString("fr-CA", {
                            year: "numeric", month: "short", day: "numeric"
                          })}
                        </span>
                        <span className="ml-auto text-blue-600 text-xs font-medium">
                          Cliquer pour rembourser →
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-md mx-auto">
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">↩️</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  Confirmer le remboursement
                </h2>
                <p className="text-gray-400 text-sm">Cette action est irréversible.</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-6 flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Paiement</span>
                  <span className="font-semibold">#{selectedPayment.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Utilisateur</span>
                  <span className="font-semibold">{selectedPayment.userFullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Montant</span>
                  <span className="font-bold text-green-600 text-base">{selectedPayment.amount} $</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Type</span>
                  <span>{selectedPayment.paymentType}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  onClick={handleRefundSimple}
                  disabled={loading}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-60 transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Remboursement...
                    </>
                  ) : "Rembourser"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}