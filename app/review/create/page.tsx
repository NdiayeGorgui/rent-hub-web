"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createReview } from "@/services/reviewService";

export default function CreateReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rentalId = searchParams.get("rentalId");

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!rentalId) { alert("ID de location manquant"); return; }
    if (rating < 1 || rating > 5) { alert("La note doit être entre 1 et 5"); return; }
    if (!confirm("Soumettre votre avis ? Cette action est irréversible.")) return;

    try {
      setLoading(true);
      await createReview({ rentalId: Number(rentalId), rating, comment });
      alert("Avis soumis ✅");
      router.replace("/rentals");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Erreur lors de la soumission");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">

        <h1 className="text-2xl font-bold mb-1">Laisser un avis</h1>
        <p className="text-sm text-gray-400 mb-6">Location #{rentalId}</p>

        {/* Étoiles */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="text-3xl transition-transform hover:scale-110"
              >
                <span className={star <= rating ? "text-yellow-400" : "text-gray-200"}>
                  ★
                </span>
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-400 mt-1">{rating} / 5</p>
        </div>

        {/* Commentaire */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Commentaire</label>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Décrivez votre expérience..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Envoi...
            </span>
          ) : "Soumettre l'avis"}
        </button>

        <button
          onClick={() => router.back()}
          className="w-full mt-3 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Annuler
        </button>

      </div>
    </div>
  );
}