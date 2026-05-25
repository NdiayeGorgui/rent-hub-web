"use client";

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-16">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-gray-100 p-10">

        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Politique relative aux cookies
        </h1>

        <div className="space-y-8 text-gray-600 leading-relaxed">

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Que sont les cookies ?
            </h2>

            <p>
              Les cookies sont de petits fichiers stockés sur votre appareil
              pour améliorer votre expérience de navigation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Utilisation
            </h2>

            <p>
              Gonifty utilise des cookies pour maintenir votre session,
              améliorer les performances et analyser l’utilisation du site.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
}