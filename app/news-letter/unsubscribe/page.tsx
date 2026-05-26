"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { API } from "@/services/api";

export default function NewsletterUnsubscribePage() {

  const searchParams = useSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {

    const emailParam = searchParams.get("email");

    if (!emailParam) {
      setLoading(false);
      setError(true);
      return;
    }

    setEmail(emailParam);

    const unsubscribe = async () => {

      try {

        await API.get(
          `/news-letter/unsubscribe?email=${encodeURIComponent(emailParam)}`
        );

        setSuccess(true);

      } catch (e) {

        console.log(e);

        setError(true);

      } finally {

        setLoading(false);
      }
    };

    unsubscribe();

  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-6 py-12">

      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-10 text-center text-white">

          <div className="text-5xl mb-4">
            {loading ? "⏳" : success ? "📭" : "❌"}
          </div>

          <h1 className="text-3xl font-extrabold mb-2">
            {loading
              ? "Désabonnement..."
              : success
                ? "Vous êtes désabonné"
                : "Une erreur est survenue"}
          </h1>

          <p className="text-blue-100 text-sm leading-relaxed">
            {loading
              ? "Veuillez patienter quelques secondes."
              : success
                ? "Votre demande a bien été prise en compte."
                : "Impossible de traiter votre demande."}
          </p>
        </div>

        {/* Content */}
        <div className="px-8 py-10 text-center">

          {loading && (
            <div className="flex flex-col items-center">

              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-5" />

              <p className="text-gray-500 text-sm">
                Désabonnement de la newsletter Gonifty...
              </p>
            </div>
          )}

          {!loading && success && (
            <>

              <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4 text-left mb-6">

                <p className="text-sm text-green-800 font-semibold mb-1">
                  ✅ Désabonnement confirmé
                </p>

                <p className="text-sm text-green-700 leading-relaxed break-all">
                  {email}
                </p>
              </div>

              <p className="text-gray-600 text-sm leading-relaxed mb-8">
                Vous ne recevrez plus les newsletters, promotions
                et actualités Gonifty.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">

                <button
                  onClick={() => router.push("/news-letter")}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl font-semibold text-sm transition-colors"
                >
                  Se réabonner
                </button>

                <button
                  onClick={() => router.push("/")}
                  className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 py-3 rounded-2xl font-semibold text-sm transition-colors"
                >
                  Retour à l'accueil
                </button>

              </div>
            </>
          )}

          {!loading && error && (
            <>

              <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-left mb-6">

                <p className="text-sm text-red-800 font-semibold mb-1">
                  ❌ Erreur
                </p>

                <p className="text-sm text-red-700 leading-relaxed">
                  Le lien de désabonnement est invalide ou expiré.
                </p>
              </div>

              <button
                onClick={() => router.push("/")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl font-semibold text-sm transition-colors"
              >
                Retour à l'accueil
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
}