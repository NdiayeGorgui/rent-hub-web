"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { handleWebPayment } from "@/services/stripeWeb";
import { createAuctionPayment } from "@/services/paymentService";

export default function AuctionFeePage() {
  const { itemId } = useParams();
  const router = useRouter();

  const [step, setStep] = useState<"home" | "payment">("home");
  const [loading, setLoading] = useState(false);

  const handleConfirmPayment = async () => {
    try {
      setLoading(true);

      const payment = await createAuctionPayment(Number(itemId));
      const clientSecret = payment.clientSecret;

      await handleWebPayment(clientSecret);

      alert("Paiement réussi ✅");

      router.push(`/my-items/${itemId}`);

    } catch (err: any) {
      console.error(err);
      alert("Erreur paiement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow">

      {step === "home" && (
        <>
          <h2 className="text-xl font-bold">Publier une enchère</h2>
          <p className="mt-2">Coût: 10$</p>

          <button
            onClick={() => setStep("payment")}
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
          >
            Continuer
          </button>
        </>
      )}

      {step === "payment" && (
        <>
          <button onClick={() => setStep("home")} className="text-blue-500 mb-3">
            ← Retour
          </button>

          <h2 className="text-xl font-bold">💳 Paiement</h2>

          <button
            onClick={handleConfirmPayment}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
          >
            {loading ? "Paiement..." : "Confirmer paiement"}
          </button>
        </>
      )}
    </div>
  );
}