"use client";

import Link from "next/link";

export default function VendeurPage() {

  const steps = [
    {
      number: "1",
      title: "Publiez votre objet aux enchères",
      desc: "Ajoutez des photos, un prix de départ et une durée d’enchère.",
    },
    {
      number: "2",
      title: "Recevez des offres en temps réel",
      desc: "Les utilisateurs enchérissent directement sur votre objet.",
    },
    {
      number: "3",
      title: "Vendez au meilleur prix",
      desc: "L’enchère permet souvent d’obtenir un prix supérieur à une vente classique.",
    },
    {
      number: "4",
      title: "Recevez votre paiement",
      desc: "Une fois l’enchère terminée, vous recevez votre paiement de manière sécurisée.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HERO */}
      <div className="bg-gradient-to-br from-orange-600 to-red-500 text-white py-20 px-6">

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center">

          <div>

            <div className="inline-block bg-white/10 px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-5">
              Devenir vendeur aux enchères
            </div>

            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              Vendez vos objets au meilleur prix
            </h1>

            <p className="text-orange-100 text-lg leading-relaxed mb-8">
              Créez des enchères modernes et laissez les acheteurs faire monter les prix.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">

              <Link
                href="/create"
                className="bg-white text-orange-600 font-semibold px-6 py-3 rounded-2xl hover:bg-orange-50 transition-colors text-center"
              >
                Créer une enchère
              </Link>

              <Link
                href="/register"
                className="border border-white/30 text-white px-6 py-3 rounded-2xl hover:bg-white/10 transition-colors text-center"
              >
                Créer un compte
              </Link>

            </div>

          </div>

          <div className="bg-white/10 rounded-3xl p-8 backdrop-blur border border-white/10">

            <div className="space-y-5">

              <div>
                <p className="text-4xl font-bold">🔥</p>
                <p className="text-orange-100 mt-2">
                  Les enchères créent de la compétition entre acheteurs.
                </p>
              </div>

              <div>
                <p className="text-4xl font-bold">⚡</p>
                <p className="text-orange-100 mt-2">
                  Vente rapide grâce aux offres en temps réel.
                </p>
              </div>

              <div>
                <p className="text-4xl font-bold">💰</p>
                <p className="text-orange-100 mt-2">
                  Obtenez souvent un prix plus élevé qu’une vente classique.
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* CONTENU */}
      <div className="max-w-6xl mx-auto px-6 py-20">

        {/* Avantages */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">

          <div className="bg-white rounded-3xl border border-gray-100 p-8">
            <div className="text-5xl mb-5">📈</div>

            <h3 className="font-bold text-xl text-gray-900 mb-3">
              Meilleur prix
            </h3>

            <p className="text-gray-500 leading-relaxed">
              Les utilisateurs enchérissent et augmentent progressivement le prix.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-8">
            <div className="text-5xl mb-5">👀</div>

            <h3 className="font-bold text-xl text-gray-900 mb-3">
              Forte visibilité
            </h3>

            <p className="text-gray-500 leading-relaxed">
              Les enchères attirent plus de visiteurs et plus d’interactions.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-8">
            <div className="text-5xl mb-5">🛡️</div>

            <h3 className="font-bold text-xl text-gray-900 mb-3">
              Paiements sécurisés
            </h3>

            <p className="text-gray-500 leading-relaxed">
              Les transactions sont protégées et suivies sur la plateforme.
            </p>
          </div>

        </div>

        {/* ETAPES */}
        <div className="mb-20">

          <h2 className="text-4xl font-bold text-center text-gray-900 mb-14">
            Comment vendre aux enchères ?
          </h2>

          <div className="space-y-6">

            {steps.map((step) => (
              <div
                key={step.number}
                className="bg-white rounded-3xl border border-gray-100 p-8 flex gap-6"
              >
                <div className="w-14 h-14 rounded-2xl bg-orange-600 text-white flex items-center justify-center text-2xl font-bold flex-shrink-0">
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

        {/* PREMIUM */}
        <div className="mb-20">

          <div className="bg-white rounded-[32px] border border-orange-100 overflow-hidden shadow-sm">

            <div className="grid lg:grid-cols-2">

              {/* LEFT */}
              <div className="p-10 lg:p-14">

                <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                  ⭐ Abonnement Premium
                </div>

                <h2 className="text-4xl font-bold text-gray-900 mb-5 leading-tight">
                  Passez au niveau supérieur avec Gonifty Premium
                </h2>

                <p className="text-gray-500 leading-relaxed text-lg mb-8">
                  Boostez la visibilité de vos enchères, attirez plus d’acheteurs et augmentez vos revenus grâce aux fonctionnalités Premium.
                </p>

                <div className="space-y-4 mb-10">

                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-2xl flex-shrink-0">
                      🚀
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">
                        Mise en avant des enchères
                      </h3>

                      <p className="text-gray-500 text-sm leading-relaxed">
                        Vos annonces apparaissent avant les autres dans les résultats.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-2xl flex-shrink-0">
                      🔥
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">
                        Badge vendeur Premium
                      </h3>

                      <p className="text-gray-500 text-sm leading-relaxed">
                        Inspirez confiance avec un profil vendeur vérifié et prioritaire.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-2xl flex-shrink-0">
                      📈
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">
                        Plus de visibilité = plus d'offres
                      </h3>

                      <p className="text-gray-500 text-sm leading-relaxed">
                        Les vendeurs Premium obtiennent davantage de vues et plus d’enchérisseurs actifs.
                      </p>
                    </div>
                  </div>

                </div>

                <div className="flex flex-col sm:flex-row gap-4">

                  <Link
                    href="/subscription"
                    className="bg-orange-600 hover:bg-orange-700 transition-colors text-white font-semibold px-6 py-3 rounded-2xl text-center"
                  >
                    S'abonner au Premium
                  </Link>

                  <Link
                    href="/create"
                    className="border border-gray-200 hover:border-orange-200 hover:bg-orange-50 transition-colors text-gray-800 px-6 py-3 rounded-2xl text-center"
                  >
                    Créer une enchère
                  </Link>

                </div>

              </div>

              {/* RIGHT */}
              <div className="bg-gradient-to-br from-orange-500 to-red-500 p-10 lg:p-14 text-white flex flex-col justify-center">

                <div className="space-y-8">

                  <div>
                    <p className="text-5xl font-bold mb-2">
                      +300%
                    </p>

                    <p className="text-orange-100">
                      de visibilité moyenne sur les enchères Premium
                    </p>
                  </div>

                  <div>
                    <p className="text-5xl font-bold mb-2">
                      ⚡
                    </p>

                    <p className="text-orange-100">
                      Mise en avant immédiate dans l’application et sur le web
                    </p>
                  </div>

                  <div>
                    <p className="text-5xl font-bold mb-2">
                      🛡️
                    </p>

                    <p className="text-orange-100">
                      Support prioritaire pour les vendeurs Premium
                    </p>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-12 text-center text-white">

          <h2 className="text-4xl font-bold mb-4">
            Lancez votre première enchère
          </h2>

          <p className="text-orange-100 max-w-2xl mx-auto mb-8">
            Publiez votre objet pour seulement 10$ et commencez à recevoir des offres.
          </p>

          <Link
            href="/create"
            className="inline-block bg-white text-orange-600 font-bold px-8 py-4 rounded-2xl hover:bg-orange-50 transition-colors"
          >
            Créer une enchère
          </Link>

        </div>

      </div>
    </div>
  );
}