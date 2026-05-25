"use client";

import { useState } from "react";
import { API } from "@/services/api";

export default function PublicitePage() {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", website: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.message) {
      setError("Veuillez remplir tous les champs obligatoires");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await API.post("/messages/contact", {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        subject: "Publicité",
        message: `Site web: ${form.website || "Non renseigné"}\n\n${form.message}`,
      });
      setSuccess(true);
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
            Partenaires & Publicité
          </div>
          <h1 className="text-4xl font-bold mb-4">Développez votre visibilité</h1>
          <p className="text-gray-300 text-lg leading-relaxed">
            Régies publicitaires & partenaires — atteignez plus d'un million de visiteurs annuels.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-14">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
          {[
            { value: "1M+", label: "Visiteurs / an" },
            { value: "5 800+", label: "Membres actifs" },
            { value: "#1", label: "Google Québec" },
            { value: "4.8★", label: "Note moyenne" },
          ].map(({ value, label }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
              <p className="text-2xl font-bold text-blue-600 mb-1">{value}</p>
              <p className="text-gray-500 text-xs">{label}</p>
            </div>
          ))}
        </div>

        {/* Solutions */}
        <div className="mb-14">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Nos solutions</h2>
          <p className="text-gray-500 text-sm mb-8">
            Gonifty est positionné en page une de Google sur de nombreuses requêtes liées à la location entre particuliers au Québec. Profitez de notre audience qualifiée pour développer votre visibilité.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: "📝",
                title: "Articles sponsorisés",
                desc: "Publiez du contenu de marque auprès de notre audience engagée. Rédaction possible par notre équipe.",
                badge: "Populaire",
              },
              {
                icon: "🔗",
                title: "Liens partenaires",
                desc: "Des liens permanents vers votre site depuis nos pages les mieux référencées sur Google.",
                badge: "SEO",
              },
              {
                icon: "🤝",
                title: "Partenariats",
                desc: "Collaborations sur mesure : échanges d'articles, co-marketing, présence dans notre newsletter.",
                badge: null,
              },
            ].map(({ icon, title, desc, badge }) => (
              <div key={title} className="bg-white rounded-2xl border border-gray-100 p-6 relative">
                {badge && (
                  <span className="absolute top-4 right-4 text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                    {badge}
                  </span>
                )}
                <div className="text-3xl mb-4">{icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Formulaire */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Travaillons ensemble</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              N'hésitez pas à nous contacter pour discuter de vos projets de publication d'articles sponsorisés, d'échanges de liens ou de partenariats.
            </p>
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
              <p className="text-blue-700 text-xs leading-relaxed">
                📧 Réponse garantie sous <strong>48h ouvrables</strong> pour toute demande publicitaire.
              </p>
            </div>
          </div>

          <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
            {success ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-7 h-7 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Demande envoyée !</h3>
                <p className="text-gray-500 text-sm">Nous vous répondrons dans les 48h.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Prénom *</label>
                    <input type="text" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })}
                      placeholder="Jean" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Nom *</label>
                    <input type="text" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })}
                      placeholder="Tremblay" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Email *</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="jean@example.com" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Votre site web <span className="text-gray-400 font-normal">(optionnel)</span></label>
                  <input type="url" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })}
                    placeholder="https://votresite.com" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Message *</label>
                  <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                    placeholder="Décrivez votre projet publicitaire..." rows={4}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                </div>
                {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>}
                <button onClick={handleSubmit} disabled={loading}
                  className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 disabled:opacity-60 transition-colors cursor-pointer">
                  {loading ? "Envoi..." : "Envoyer ma demande"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
