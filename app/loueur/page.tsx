"use client";

import Link from "next/link";

export default function LoueurPage() {

  const steps = [
    {
      number: "1",
      title: "Donnez de la valeur à ce que vous possédez déjà",
      desc: "Vos objets inutilisés peuvent devenir une vraie source de revenus. Outils, véhicules, équipements, appareils électroniques…",
    },
    {
      number: "2",
      title: "Publiez une annonce en quelques clics",
      desc: "Ajoutez des photos, fixez votre prix et vos disponibilités. Votre annonce est immédiatement visible.",
    },
    {
      number: "3",
      title: "Acceptez les demandes autour de chez vous",
      desc: "Discutez avec les locataires, choisissez vos disponibilités et gardez le contrôle.",
    },
    {
      number: "4",
      title: "Recevez vos revenus en toute sécurité",
      desc: "Une fois la location terminée, votre paiement est transféré directement.",
    },
  ];

  const stats = [
    { value: "$1000+", label: "revenus possibles / mois" },
    { value: "10k+", label: "objets publiés" },
    { value: "5k+", label: "utilisateurs actifs" },
    { value: "4.8★", label: "note moyenne" },
  ];

  const rentable = [
    "🛠️ Outils de bricolage",
    "🚗 Véhicules",
    "🎥 Caméras & drones",
    "🏕️ Équipements de camping",
    "🎉 Équipements événementiels",
    "🧹 Nettoyeurs haute pression",
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HERO */}
      <div className="bg-gradient-to-br from-blue-700 to-blue-500 text-white py-20 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center">

          <div>
            <div className="inline-block bg-white/10 px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-5">
              Devenir loueur
            </div>

            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              Gagnez de l'argent avec ce que vous possédez déjà
            </h1>

            <p className="text-blue-100 text-lg leading-relaxed mb-8">
              Louez vos objets inutilisés sur Gonifty et générez un revenu complémentaire simplement.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/create"
                className="bg-white text-blue-700 font-semibold px-6 py-3 rounded-2xl hover:bg-blue-50 transition-colors text-center"
              >
                Déposer une annonce
              </Link>

              <Link
                href="/register"
                className="border border-white/30 text-white px-6 py-3 rounded-2xl hover:bg-white/10 transition-colors text-center"
              >
                Créer un compte
              </Link>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-3xl p-8 border border-white/10">
            <div className="grid grid-cols-2 gap-6">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="text-4xl font-bold">{s.value}</p>
                  <p className="text-blue-100 text-sm mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* AVANTAGES */}
      <div className="max-w-6xl mx-auto px-6 py-20">

        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Louer sur Gonifty, c’est simple
          </h2>

          <p className="text-gray-500 max-w-2xl mx-auto">
            Transformez les objets qui dorment chez vous en revenus supplémentaires.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-20">

          <div className="bg-white rounded-3xl border border-gray-100 p-8">
            <div className="text-5xl mb-5">💸</div>

            <h3 className="font-bold text-xl text-gray-900 mb-3">
              Revenus complémentaires
            </h3>

            <p className="text-gray-500 leading-relaxed">
              Certains utilisateurs génèrent plusieurs centaines de dollars par mois grâce à leurs locations.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-8">
            <div className="text-5xl mb-5">⚡</div>

            <h3 className="font-bold text-xl text-gray-900 mb-3">
              Publication ultra rapide
            </h3>

            <p className="text-gray-500 leading-relaxed">
              Prenez quelques photos, ajoutez un tarif et votre annonce est en ligne.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-8">
            <div className="text-5xl mb-5">🆓</div>

            <h3 className="font-bold text-xl text-gray-900 mb-3">
              Publication gratuite
            </h3>

            <p className="text-gray-500 leading-relaxed">
              Créez votre compte et commencez à louer gratuitement sur Gonifty.
            </p>
          </div>

        </div>

        {/* COMMENT CA MARCHE */}
        <div className="mb-20">

          <h2 className="text-4xl font-bold text-center text-gray-900 mb-14">
            Comment ça marche ?
          </h2>

          <div className="space-y-6">

            {steps.map((step) => (
              <div
                key={step.number}
                className="bg-white rounded-3xl border border-gray-100 p-8 flex gap-6"
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl font-bold flex-shrink-0">
                  {step.number}
                </div>

                <div>
                  <h3 className="font-bold text-xl text-gray-900 mb-2">
                    {step.title}
                  </h3>

                  <p className="text-gray-500 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}

          </div>

        </div>

        {/* RENTABLE */}
        <div className="bg-white rounded-3xl border border-gray-100 p-10 mb-20">

          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Les catégories les plus rentables
          </h2>

          <p className="text-gray-500 mb-8">
            Certains objets se louent chaque semaine et génèrent des revenus réguliers.
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            {rentable.map((r) => (
              <div
                key={r}
                className="bg-gray-50 rounded-2xl px-5 py-4 border border-gray-100 font-medium text-gray-700"
              >
                {r}
              </div>
            ))}
          </div>

        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-12 text-center text-white">

          <h2 className="text-4xl font-bold mb-4">
            Commencez aujourd’hui
          </h2>

          <p className="text-blue-100 max-w-2xl mx-auto mb-8">
            Publiez votre première annonce gratuitement et commencez à générer des revenus.
          </p>

          <Link
            href="/create"
            className="inline-block bg-white text-blue-700 font-bold px-8 py-4 rounded-2xl hover:bg-blue-50 transition-colors"
          >
            Déposer ma première annonce
          </Link>

        </div>

      </div>
    </div>
  );
}