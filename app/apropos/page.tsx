export default function AProposPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 fill-white" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
          </div>
          <h1 className="text-4xl font-bold mb-4">À propos de Gonifty</h1>
          <p className="text-blue-100 text-lg leading-relaxed">
            La plateforme québécoise qui connecte les particuliers pour louer, enchérir et économiser ensemble.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">

        {/* Mission */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Notre mission</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            Gonifty est née d'une idée simple : pourquoi acheter quand on peut louer ? Au Québec, des milliers d'objets dorment dans nos sous-sols et garages alors qu'ils pourraient être utiles à nos voisins. Nous croyons en une économie du partage locale, durable et accessible à tous.
          </p>
        </div>

        {/* Valeurs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            {
              icon: "🤝",
              title: "Confiance",
              desc: "Chaque utilisateur est vérifié. Les avis et badges garantissent des échanges sereins.",
            },
            {
              icon: "♻️",
              title: "Durabilité",
              desc: "Louer plutôt qu'acheter, c'est consommer moins et mieux. Chaque location est un geste pour la planète.",
            },
            {
              icon: "🏡",
              title: "Communauté",
              desc: "Gonifty, c'est avant tout des gens qui s'entraident localement, quartier par quartier.",
            },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
              <div className="text-4xl mb-4">{icon}</div>
              <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="bg-blue-600 rounded-2xl p-8 mb-8 text-white">
          <h2 className="text-xl font-bold text-center mb-8">Gonifty en chiffres</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "5 800+", label: "Membres" },
              { value: "1 200+", label: "Items actifs" },
              { value: "340+", label: "Enchères lancées" },
              { value: "4.8 ⭐", label: "Note moyenne" },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-3xl font-bold mb-1">{value}</p>
                <p className="text-blue-200 text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Histoire */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Notre histoire</h2>
          <div className="flex flex-col gap-6">
            {[
              { year: "2023", title: "L'idée germe", desc: "Deux Montréalais frustrés d'acheter des outils pour un seul week-end décident de créer une plateforme d'échange local." },
              { year: "2024", title: "Lancement de Gonifty", desc: "La plateforme est lancée avec ses premières fonctionnalités : location et enchères entre particuliers." },
              { year: "2025", title: "Croissance", desc: "5 000+ membres, application mobile lancée, expansion vers toutes les villes du Québec." },
            ].map(({ year, title, desc }, i) => (
              <div key={year} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {year.slice(2)}
                  </div>
                  {i < 2 && <div className="w-0.5 bg-gray-200 flex-1 mt-2" />}
                </div>
                <div className="pb-6">
                  <p className="text-xs text-blue-600 font-semibold mb-1">{year}</p>
                  <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gray-50 rounded-2xl border border-gray-100 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Prêt à rejoindre la communauté ?</h2>
          <p className="text-gray-500 text-sm mb-6">Des milliers de Québécois économisent déjà grâce à Gonifty.</p>
          <div className="flex gap-3 justify-center">
            <a href="/register" className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
              Créer un compte
            </a>
            <a href="/contact" className="px-6 py-3 bg-white text-gray-700 rounded-xl text-sm font-semibold border border-gray-200 hover:bg-gray-50 transition-colors">
              Nous contacter
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
