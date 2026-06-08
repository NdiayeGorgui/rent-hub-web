"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { createAuction } from "@/services/auctionService";
import { handleWebPayment } from "@/services/stripeWeb";
import { createAuctionPayment } from "@/services/paymentService";

export default function AuctionFeePage() {
    const router = useRouter();
    const params = useSearchParams();

    const itemId = Number(params.get("itemId"));
    const startPrice = Number(params.get("startPrice"));
    const reservePrice = Number(params.get("reservePrice"));
    const auctionEndDate = params.get("auctionEndDate") ?? "";

    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<"confirm" | "processing">("confirm");

    const handlePay = async () => {
        try {
            setLoading(true);
            setStep("processing");

            // ← 1. Crée le paiement Stripe
            const { clientSecret } = await createAuctionPayment(itemId);

            // ← 2. Stripe confirme le paiement
            await handleWebPayment(clientSecret);

            // ← 3. Crée l'enchère (item est maintenant en DRAFT après paiement via Kafka)
            // Petit délai pour laisser le consumer Kafka traiter
            await new Promise(resolve => setTimeout(resolve, 2000));

            await createAuction({
                itemId,
                startPrice,
                reservePrice: reservePrice || startPrice,
                endDate: auctionEndDate,
            });

            alert("✅ Enchère créée avec succès !");
            router.push("/my-items");

        } catch (err: any) {
            alert(err?.message ?? "Erreur lors du paiement");
            setStep("confirm");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 mt-10">

            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🔥</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Activer votre enchère</h1>
                <p className="text-gray-400 text-sm mt-2">
                    Un frais unique de 10$ est requis pour publier votre enchère
                </p>
            </div>

            {/* Récap enchère */}
            <div className="bg-gray-50 rounded-2xl p-5 mb-6 flex flex-col gap-3">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Item</span>
                    <span className="font-semibold">#{itemId}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Prix de départ</span>
                    <span className="font-semibold text-blue-600">{startPrice} $</span>
                </div>
                {reservePrice > 0 && reservePrice !== startPrice && (
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Prix de réserve</span>
                        <span className="font-semibold">{reservePrice} $</span>
                    </div>
                )}
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Date de fin</span>
                    <span className="font-semibold">
                        {new Date(auctionEndDate).toLocaleDateString("fr-CA", {
                            day: "numeric", month: "short",
                            hour: "2-digit", minute: "2-digit"
                        })}
                    </span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                    <span className="font-semibold text-gray-700">Frais de publication</span>
                    <span className="font-bold text-lg text-gray-900">10 $</span>
                </div>
            </div>

            <p className="text-xs text-gray-400 text-center mb-6">
                🔒 Paiement sécurisé via Stripe — Remboursable si annulation
            </p>

            <button
                onClick={handlePay}
                disabled={loading}
                className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold text-base transition-colors disabled:opacity-60 flex items-center justify-center gap-3"
            >
                {loading ? (
                    <>
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {step === "processing" ? "Création de l'enchère..." : "Paiement..."}
                    </>
                ) : "💳 Payer 10$ et publier l'enchère"}
            </button>

            <button
                onClick={() => router.back()}
                disabled={loading}
                className="w-full mt-3 py-3 text-gray-500 text-sm hover:text-gray-700 transition-colors disabled:opacity-40"
            >
                ← Retour
            </button>
        </div>
    );
}