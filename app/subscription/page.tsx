"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { subscribeToPremium } from "@/services/paymentService";
import { fetchPremiumStatus, cancelSubscription } from "@/services/subscriptionService";
import { handleWebPayment } from "@/services/stripeWeb";

export default function SubscriptionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [status, setStatus] = useState<any>(null);
  const [step, setStep] = useState<"home" | "payment">("home");

  const loadStatus = async () => {
    try {
      const data = await fetchPremiumStatus();
      setStatus(data);
    } catch (e) {
      console.log(e);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => { loadStatus(); }, []);

  const handleConfirmPayment = async () => {
    try {
      setLoading(true);
      const payment = await subscribeToPremium(9.99);
      await handleWebPayment(payment.clientSecret);
      alert("Paiement effectué 🎉");
      await loadStatus();
      setStep("home");
    } catch (err: any) {
      alert(err?.message || "Paiement échoué");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Annuler votre abonnement Premium ?")) return;
    try {
      setLoading(true);
      await cancelSubscription();
      alert("Renouvellement annulé");
      await loadStatus();
    } catch {
      alert("Impossible d'annuler");
    } finally {
      setLoading(false);
    }
  };

  if (checking) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const isPremium = status?.premium;
  const isGrace = status?.gracePeriod;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">

        {/* ── Header card ── */}
        <div className={`rounded-2xl p-8 mb-4 text-center ${
          isPremium && !isGrace
            ? "bg-gradient-to-br from-yellow-400 to-yellow-500"
            : isGrace
            ? "bg-gradient-to-br from-orange-400 to-red-400"
            : "bg-gradient-to-br from-blue-600 to-blue-700"
        }`}>
          <div className="text-5xl mb-3">
            {isPremium && !isGrace ? "👑" : isGrace ? "⚠️" : "✨"}
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">
            {isPremium && !isGrace
              ? "Premium actif"
              : isGrace
              ? "Paiement échoué"
              : "Passer au Premium"}
          </h1>
          {isPremium && (
            <p className="text-white/80 text-sm">
              {isGrace ? "Actif jusqu'au" : "Expire le"} {new Date(status.endDate).toLocaleDateString("fr-CA")}
            </p>
          )}
        </div>

        {/* ── Content card ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

          {/* Premium actif */}
          {isPremium && !isGrace && step === "home" && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                {["Enchères illimitées", "Badge Premium visible", "Mise en avant de vos items", "Support prioritaire"].map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-green-500">✓</span> {f}
                  </div>
                ))}
              </div>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors mt-2"
              >
                {loading ? "Traitement..." : "Annuler l'abonnement"}
              </button>
            </div>
          )}

          {/* Grace period */}
          {isGrace && step === "home" && (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-gray-600">
                Votre dernier paiement a échoué. Mettez à jour votre moyen de paiement pour continuer à profiter du Premium.
              </p>
              <button
                onClick={() => setStep("payment")}
                className="w-full py-3 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Mettre à jour le paiement
              </button>
            </div>
          )}

          {/* Pas premium */}
          {!isPremium && step === "home" && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2 mb-2">
                {[
                  ["✨", "Plus de visibilité sur vos items"],
                  ["🔥", "Accès aux enchères"],
                  ["🏅", "Badge Premium sur votre profil"],
                  ["📈", "Mise en avant prioritaire"],
                ].map(([icon, label]) => (
                  <div key={label} className="flex items-center gap-3 text-sm text-gray-600">
                    <span>{icon}</span> {label}
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">9.99 $</p>
                <p className="text-sm text-blue-400 mt-0.5">pour 6 mois</p>
              </div>

              <button
                onClick={() => setStep("payment")}
                className="w-full py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                S'abonner maintenant
              </button>
            </div>
          )}

          {/* Paiement */}
          {step === "payment" && (
            <div className="flex flex-col gap-4">
              <button onClick={() => setStep("home")} className="text-blue-600 text-sm text-left">
                ← Retour
              </button>

              <div className="bg-gray-50 rounded-xl p-4 text-center mb-2">
                <p className="text-sm text-gray-500">Total à payer</p>
                <p className="text-2xl font-bold text-gray-900">9.99 $</p>
              </div>

              <p className="text-xs text-gray-400 text-center">
                🔒 Paiement sécurisé via Stripe
              </p>

              <button
                onClick={handleConfirmPayment}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Traitement...
                  </span>
                ) : "Confirmer le paiement"}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}