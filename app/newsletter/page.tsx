"use client";

import { useState } from "react";
import { API } from "@/services/api";

export default function NewsletterPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  // null = inconnu, true = abonné, false = non abonné
  const [status, setStatus] = useState<boolean | null>(null);

  // ── Vérifie le statut quand l'email est valide ────────
  const checkStatus = async (value: string) => {
    if (!value.includes("@") || !value.includes(".")) return;
    setChecking(true);
    try {
      const res = await API.get(`/newsletter/status?email=${encodeURIComponent(value)}`);
      setStatus(res.data); // true = abonné, false = non abonné
    } catch {
      setStatus(null);
    } finally {
      setChecking(false);
    }
  };

  // ── Toggle abonnement / désabonnement ─────────────────
  const handleToggle = async () => {
    if (!email || !email.includes("@")) {
      setError("Veuillez entrer une adresse email valide");
      return;
    }
    setError("");
    setLoading(true);
    try {
      if (status === true) {
        // Désabonner
        await API.get(`/newsletter/unsubscribe?email=${encodeURIComponent(email)}`);
        setStatus(false);
      } else {
        // Abonner
        await API.post("/newsletter/subscribe", { email });
        setStatus(true);
      }
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  // ── Label et style du bouton ──────────────────────────
  const btnLabel = () => {
    if (loading) return "...";
    if (checking) return "Vérification...";
    if (status === true) return "Se désabonner";
    return "S'abonner";
  };

  const btnClass = () => {
    if (status === true) return "bg-red-500 text-white hover:bg-red-600";
    return "bg-white text-blue-600 hover:bg-blue-50";
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-60 h-60 bg-white rounded-full blur-3xl" />
        </div>
        <div className="max-w-2xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-white bg-opacity-20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Newsletter Gonifty
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Restez dans la boucle 📬
          </h1>
          <p className="text-blue-100 text-lg leading-relaxed mb-8">
            Recevez chaque semaine les meilleures annonces, conseils de location et actualités de la communauté Gonifty.
          </p>

          {/* Feedback statut */}
          {status === true && (
            <div className="bg-green-500 bg-opacity-20 border border-green-400 border-opacity-30 rounded-xl px-4 py-2 text-sm text-green-100 mb-4 max-w-md mx-auto">
              ✅ Cet email est déjà abonné à la newsletter
            </div>
          )}
          {status === false && email.includes("@") && (
            <div className="bg-white bg-opacity-10 border border-white border-opacity-20 rounded-xl px-4 py-2 text-sm text-blue-100 mb-4 max-w-md mx-auto">
              📧 Cet email n'est pas encore abonné
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                setStatus(null); // reset en attendant la vérif
                setError("");
                checkStatus(e.target.value);
              }}
              onKeyDown={e => e.key === "Enter" && handleToggle()}
              placeholder="votre@email.com"
              className="flex-1 px-5 py-3.5 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button
              onClick={handleToggle}
              disabled={loading || checking}
              className={`px-6 py-3.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-60 cursor-pointer whitespace-nowrap ${btnClass()}`}
            >
              {btnLabel()}
            </button>
          </div>

          {error && <p className="text-red-300 text-sm mt-3">{error}</p>}
          <p className="text-blue-200 text-xs mt-3">
            Gratuit · Désabonnement en un clic · Aucun spam
          </p>
        </div>
      </div>

      {/* Ce que vous recevez — inchangé */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ce que vous recevrez</h2>
          <p className="text-gray-500 text-sm">Une newsletter hebdomadaire, jamais plus.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-14">
          {[
            { icon: "🏆", title: "Meilleures annonces", desc: "Les items les plus populaires et les enchères à ne pas manquer cette semaine." },
            { icon: "💡", title: "Conseils & astuces", desc: "Comment louer efficacement, sécuriser vos échanges et maximiser vos revenus." },
            { icon: "🔔", title: "Nouveautés Gonifty", desc: "Les nouvelles fonctionnalités, améliorations et mises à jour de la plateforme." },
            { icon: "🎁", title: "Offres exclusives", desc: "Promotions réservées aux abonnés : réductions sur le Premium, événements spéciaux." },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl border border-gray-100 p-6 flex gap-4">
              <div className="text-3xl flex-shrink-0">{icon}</div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Témoignages */}
        <div className="mb-14">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Ils sont déjà abonnés</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { name: "Marie-Claude T.", city: "Montréal", text: "Grâce à la newsletter, j'ai trouvé une perceuse à louer pour mon projet de week-end en 5 minutes !" },
              { name: "François B.", city: "Québec", text: "Les conseils de location sont vraiment utiles. J'ai optimisé mes annonces et mes revenus ont doublé." },
              { name: "Isabelle R.", city: "Laval", text: "J'adore recevoir les nouvelles annonces chaque semaine. C'est devenu un rituel du lundi matin." },
            ].map(({ name, city, text }) => (
              <div key={name} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 fill-yellow-400" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-3">"{text}"</p>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{name}</p>
                  <p className="text-gray-400 text-xs">{city}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA final — même logique */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Prêt à rejoindre 5 800+ abonnés ?</h2>
          <p className="text-blue-100 text-sm mb-6">Entrez votre email et rejoignez la communauté dès maintenant.</p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
            <input
              type="email"
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                setStatus(null);
                setError("");
                checkStatus(e.target.value);
              }}
              placeholder="votre@email.com"
              className="flex-1 px-4 py-3 rounded-xl text-gray-900 text-sm focus:outline-none"
            />
            <button
              onClick={handleToggle}
              disabled={loading || checking}
              className={`px-6 py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-60 cursor-pointer ${btnClass()}`}
            >
              {btnLabel()}
            </button>
          </div>
          {error && <p className="text-red-200 text-sm mt-3">{error}</p>}
        </div>
      </div>
    </div>
  );
}