"use client";

import { useEffect, useState } from "react";
import { fetchMyProfile } from "@/services/profileService";

import { getMyPayments, payPenalty } from "@/services/paymentService";
import { handleWebPayment } from "@/services/stripeWeb";

export default function ProfilePage() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
   
    const [payments, setPayments] = useState<any[]>([]);
    const [pendingPenalty, setPendingPenalty] = useState<any>(null);
    const [penaltyStep, setPenaltyStep] = useState<"idle" | "payment">("idle");
    const [payingPenalty, setPayingPenalty] = useState(false);

    const formatDate = (d: string) => {
        if (!d) return "-";
        return new Date(d).toLocaleDateString("fr-CA");
    };

    const loadProfile = async () => {
        try {
            const data = await fetchMyProfile();
            setProfile(data);


            const myPayments = await getMyPayments();
            setPayments(myPayments);
            const penalty = myPayments.find(
                (p: any) => p.paymentType === "AUCTION_PENALTY" && p.status === "PENDING"
            );
            setPendingPenalty(penalty ?? null);

           
            
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadProfile(); }, []);

    const handleConfirmPenaltyPayment = async () => {
        try {
            setPayingPenalty(true);
            const payment = await payPenalty();
            await handleWebPayment(payment.clientSecret);
            alert("✅ Pénalité payée. Votre compte sera réactivé sous peu.");
            const updated = await getMyPayments();
            setPayments(updated);
            setPendingPenalty(null);
            setPenaltyStep("idle");
        } catch (err: any) {
            alert(err?.message ?? "Paiement échoué");
        } finally {
            setPayingPenalty(false);
        }
    };

    const getPaymentTypeConfig = (type: string) => {
        switch (type) {
            case "SUBSCRIPTION":
                return {
                    icon: "⭐",
                    label: "Abonnement Premium"
                };

            case "AUCTION_FEE":
                return {
                    icon: "🔥",
                    label: "Frais d'enchère"
                };

            case "AUCTION_REFUND":
                return {
                    icon: "💳",
                    label: "Remboursement enchère"
                };

                 case "AUCTION_CANCELLATION_FEE":
                return {
                    icon: "💳",
                    label: "Frais d'annulation enchère"
                };

            case "SUBSCRIPTION_RENEWAL":
                return {
                    icon: "🔄",
                    label: "Renouvellement abonnement"
                };

            case "AUCTION_PENALTY":
                return {
                    icon: "⚠️",
                    label: "Pénalité enchère"
                };

            default:
                return {
                    icon: "💳",
                    label: type
                };
        }
    };

    const getPaymentStatusLabel = (status: string) => {
        switch (status) {
            case "SUCCESS":
                return "Payé";

            case "PENDING":
                return "En attente";

            case "FAILED":
                return "Échoué";

            case "EXPIRED":
                return "Expiré";

            default:
                return status;
        }
    };
    const getPaymentStatusStyle = (status: string) => {
        switch (status) {
            case "SUCCESS": return "text-green-600";
            case "PENDING": return "text-orange-500";
            case "FAILED": return "text-red-500";
            case "EXPIRED": return "text-gray-400";
            default: return "text-gray-500";
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!profile) return (
        <div className="min-h-screen flex items-center justify-center text-gray-400">
            Impossible de charger le profil
        </div>
    );

    // ── Écran paiement pénalité ──
    if (penaltyStep === "payment") return (
        <div className="max-w-md mx-auto p-6 mt-10">
            <button onClick={() => setPenaltyStep("idle")} className="text-blue-600 text-sm mb-4">
                ← Retour
            </button>
            <h2 className="text-2xl font-bold mb-6">💳 Paiement de la pénalité</h2>

            <div className="bg-white rounded-xl border border-orange-300 p-6 text-center mb-6">
                <p className="text-sm text-gray-400 mb-1">Montant à payer</p>
                <p className="text-4xl font-bold text-red-500">{pendingPenalty?.amount ?? 50} $</p>
                <p className="text-xs text-gray-400 mt-2">Pénalité suite à refus de paiement après enchère gagnée</p>
            </div>

            <p className="text-xs text-gray-400 text-center mb-4">🔒 Paiement sécurisé via Stripe</p>

            <button
                onClick={handleConfirmPenaltyPayment}
                disabled={payingPenalty}
                className="w-full py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors disabled:opacity-60"
            >
                {payingPenalty ? (
                    <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Traitement...
                    </span>
                ) : `Confirmer le paiement de ${pendingPenalty?.amount ?? 50} $`}
            </button>
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto p-6 pb-16">

            {/* Identité */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
                        {profile.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{profile.fullName}</h1>
                        <p className="text-gray-400 text-sm">@{profile.username}</p>
                        <p className="text-gray-400 text-sm">{profile.city}</p>
                    </div>
                </div>
                {profile.premium && (
                    <span className="inline-block mt-3 bg-yellow-50 text-yellow-700 text-xs font-medium px-3 py-1 rounded-full">
                        ⭐ Compte Premium
                    </span>
                )}
            </div>

            {/* Alerte pénalité */}
            {pendingPenalty && (
                <div className="bg-orange-50 border-2 border-orange-400 rounded-2xl p-5 mb-4">
                    <h3 className="font-bold text-orange-700 mb-2">⚠️ Pénalité en attente</h3>
                    <p className="text-sm text-gray-600 mb-1">
                        Suite à un refus de paiement après enchère gagnée, une pénalité de{" "}
                        <span className="font-bold">{pendingPenalty.amount} $</span> est due.
                    </p>
                    {pendingPenalty.penaltyDeadline && (
                        <p className="text-sm text-orange-600 font-medium mb-1">
                            ⏰ À payer avant le : {formatDate(pendingPenalty.penaltyDeadline)}
                        </p>
                    )}
                    <p className="text-xs text-red-500 italic mb-3">
                        Sans paiement dans les délais, votre compte sera suspendu.
                    </p>
                    <button
                        onClick={() => setPenaltyStep("payment")}
                        className="w-full py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 cursor-pointer"
                    >
                        💳 Payer {pendingPenalty.amount} $ maintenant
                    </button>
                </div>
            )}

            {/* Réputation */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
                <h2 className="font-bold text-gray-900 mb-3">Réputation</h2>
                <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xl font-bold text-blue-600">{Number(profile.averageRating || 0).toFixed(2)}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Note moyenne</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xl font-bold text-blue-600">{profile.reviewsCount ?? 0}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Avis</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xl font-bold text-blue-600">{profile.badge ?? "—"}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Badge</p>
                    </div>
                </div>
            </div>

            {/* Items publiés */}
           

            {/* Paiements */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
                <h2 className="font-bold text-gray-900 mb-3">💳 Mes paiements</h2>
                {payments.length === 0 ? (
                    <p className="text-gray-400 text-sm">Aucun paiement</p>
                ) : (
                    <div className="flex flex-col gap-3">
                        {payments.map((p) => (
                            <div key={p.id} className="border-b border-gray-50 pb-3 last:border-0">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-800">
                                        {getPaymentTypeConfig(p.paymentType).icon}{" "}
                                        {getPaymentTypeConfig(p.paymentType).label}
                                    </p>
                                    <span className={`text-xs font-bold ${getPaymentStatusStyle(p.status)}`}>
                                        {getPaymentStatusLabel(p.status)}
                                    </span>
                                </div>
                                <p className="text-blue-600 font-semibold text-sm">{p.amount} $</p>
                                <p className="text-xs text-gray-400">
                                    {getPaymentTypeConfig(p.paymentType).label} — {formatDate(p.createdAt)}
                                </p>
                                {p.paymentType === "AUCTION_PENALTY" && p.status === "PENDING" && (
                                    <button
                                        onClick={() => setPenaltyStep("payment")}
                                        className="mt-2 px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 cursor-pointer"
                                    >
                                        💳 Payer maintenant
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}