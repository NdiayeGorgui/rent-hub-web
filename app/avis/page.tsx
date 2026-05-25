"use client";

import Link from "next/link";

export default function AvisPage() {

  const reviews = [
    {
      name: "Hélène",
      city: "Montréal",
      date: "14/07/2026",
      item: "Perceuse",
      text:
        "Excellente première expérience sur Gonifty. J’ai trouvé rapidement l’outil qu’il me fallait près de chez moi. Le loueur était ponctuel et très sympathique.",
    },
    {
      name: "Patrick",
      city: "Québec",
      date: "08/06/2026",
      item: "Nettoyeur haute pression",
      text:
        "Plateforme très simple à utiliser. Les échanges sont rapides et le paiement sécurisé rassure énormément. Je recommande sans hésiter.",
    },
    {
      name: "Nathalie",
      city: "Laval",
      date: "11/06/2026",
      item: "Échafaudage",
      text:
        "Très belle expérience de location entre particuliers. Le matériel était impeccable et l’organisation parfaite.",
    },
  ];

  const transactions = [
    {
      item: "Scie circulaire",
      city: "Montréal",
      date: "28/11/2026",
      text:
        "Transaction parfaite, outil puissant et très propre. Communication fluide et récupération rapide.",
    },
    {
      item: "Shampouineuse",
      city: "Longueuil",
      date: "12/12/2026",
      text:
        "Très satisfait de la location. Le propriétaire a pris le temps d’expliquer le fonctionnement et tout s’est bien déroulé.",
    },
    {
      item: "Remorque",
      city: "Québec",
      date: "03/01/2026",
      text:
        "Location rapide et pratique. J’ai économisé énormément par rapport à une location professionnelle classique.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HERO */}
      <div className="bg-gradient-to-br from-blue-700 to-indigo-700 text-white py-20 px-6">

        <div className="max-w-5xl mx-auto text-center">

          <div className="inline-block bg-white/10 px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-5">
            Avis & expériences
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Leurs succès, leurs histoires
          </h1>

          <p className="text-blue-100 text-lg max-w-3xl mx-auto leading-relaxed mb-10">
            Découvrez les retours des utilisateurs Gonifty partout au Québec.
            Loueurs, vendeurs et locataires partagent leurs expériences.
          </p>

          {/* Rating */}
          <div className="bg-white/10 backdrop-blur border border-white/10 rounded-3xl p-8 max-w-xl mx-auto">

            <div className="flex justify-center mb-4 text-yellow-300 text-3xl">
              ★★★★★
            </div>

            <div className="text-5xl font-bold mb-2">
              4,9<span className="text-2xl">/5</span>
            </div>

            <p className="text-blue-100">
              Basé sur +378 avis de nos utilisateurs
            </p>

          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">

            <Link
              href="/contact"
              className="bg-white text-blue-700 font-semibold px-6 py-3 rounded-2xl hover:bg-blue-50 transition-colors"
            >
              Laisser un avis
            </Link>

            <Link
              href="/contact"
              className="border border-white/30 px-6 py-3 rounded-2xl hover:bg-white/10 transition-colors"
            >
              Déclarer une mauvaise expérience
            </Link>

          </div>

        </div>

      </div>

      {/* CONTENU */}
      <div className="max-w-6xl mx-auto px-6 py-20">

        {/* Avis principaux */}
        <div className="mb-24">

          <div className="text-center mb-14">

            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Loueurs et locataires s’expriment
            </h2>

            <p className="text-gray-500 max-w-2xl mx-auto">
              Des milliers d’utilisateurs utilisent Gonifty pour louer,
              partager ou vendre leurs objets.
            </p>

          </div>

          <div className="grid md:grid-cols-3 gap-6">

            {reviews.map((review, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl border border-gray-100 p-8"
              >

                <div className="flex items-center gap-4 mb-5">

                  <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
                    {review.name.charAt(0)}
                  </div>

                  <div>
                    <p className="font-bold text-gray-900">
                      {review.name}
                    </p>

                    <p className="text-sm text-gray-500">
                      {review.city} • {review.date}
                    </p>
                  </div>

                </div>

                <div className="flex text-yellow-400 mb-4">
                  ★★★★★
                </div>

                <div className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                  {review.item}
                </div>

                <p className="text-gray-600 leading-relaxed">
                  {review.text}
                </p>

                <div className="mt-5 text-green-600 text-sm font-medium">
                  ✓ Identité vérifiée
                </div>

              </div>
            ))}

          </div>

        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24">

          <div className="bg-white rounded-3xl border border-gray-100 p-8 text-center">
            <p className="text-4xl font-bold text-blue-600 mb-2">
              15K+
            </p>
            <p className="text-gray-500 text-sm">
              Avis positifs
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-8 text-center">
            <p className="text-4xl font-bold text-blue-600 mb-2">
              4.9★
            </p>
            <p className="text-gray-500 text-sm">
              Satisfaction moyenne
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-8 text-center">
            <p className="text-4xl font-bold text-blue-600 mb-2">
              98%
            </p>
            <p className="text-gray-500 text-sm">
              Transactions réussies
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-8 text-center">
            <p className="text-4xl font-bold text-blue-600 mb-2">
              24h
            </p>
            <p className="text-gray-500 text-sm">
              Temps moyen de réponse
            </p>
          </div>

        </div>

        {/* Avis transactions */}
        <div className="mb-24">

          <div className="text-center mb-14">

            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Ils donnent leur avis sur leurs transactions
            </h2>

            <p className="text-gray-500">
              Des expériences réelles vécues partout au Québec.
            </p>

          </div>

          <div className="space-y-6">

            {transactions.map((transaction, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl border border-gray-100 p-8"
              >

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">

                  <div>
                    <h3 className="font-bold text-xl text-gray-900">
                      {transaction.item}
                    </h3>

                    <p className="text-gray-500 text-sm">
                      {transaction.city} • {transaction.date}
                    </p>
                  </div>

                  <div className="text-yellow-400 text-xl">
                    ★★★★★
                  </div>

                </div>

                <p className="text-gray-600 leading-relaxed">
                  {transaction.text}
                </p>

              </div>
            ))}

          </div>

        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-12 text-center text-white">

          <h2 className="text-4xl font-bold mb-4">
            Partagez votre expérience Gonifty
          </h2>

          <p className="text-blue-100 max-w-2xl mx-auto mb-8">
            Votre avis aide la communauté à louer et vendre en toute confiance.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">

            <Link
              href="/contact"
              className="bg-white text-blue-700 font-bold px-8 py-4 rounded-2xl hover:bg-blue-50 transition-colors"
            >
              Déposer un avis
            </Link>

            <Link
              href="/contact"
              className="border border-white/30 px-8 py-4 rounded-2xl hover:bg-white/10 transition-colors"
            >
              Contacter le support
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}