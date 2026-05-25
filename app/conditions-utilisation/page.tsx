"use client";

export default function ConditionsPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-16">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-gray-100 p-10">

        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Conditions d'utilisation
        </h1>

        <div className="space-y-8 text-gray-600 leading-relaxed">

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Utilisation de la plateforme
            </h2>
            <p>
              Gonifty permet aux utilisateurs de louer, vendre et enchérir
              entre particuliers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Responsabilités
            </h2>
            <p>
              Les utilisateurs sont responsables des objets publiés,
              des descriptions et des transactions effectuées.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Interdictions
            </h2>
            <p>
              Il est interdit de publier du contenu illégal,
              frauduleux ou trompeur.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
}