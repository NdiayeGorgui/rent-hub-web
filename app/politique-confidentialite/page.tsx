"use client";

export default function PolitiquePage() {
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-16">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-gray-100 p-10">

        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Politique de confidentialité
        </h1>

        <div className="space-y-8 text-gray-600 leading-relaxed">

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Données collectées
            </h2>

            <p>
              Nous collectons certaines informations nécessaires au fonctionnement
              de la plateforme : nom, email, téléphone et données de connexion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Utilisation des données
            </h2>

            <p>
              Les données servent uniquement à améliorer l’expérience utilisateur,
              sécuriser la plateforme et traiter les transactions.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
}