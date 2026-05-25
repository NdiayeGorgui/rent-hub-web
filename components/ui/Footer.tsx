"use client";

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white mt-16">

            {/* CTA Download */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-12 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-2xl font-bold mb-2">
                        Téléchargez l'application
                    </h2>
                    <p className="text-blue-100 text-sm mb-8">
                        Réalisez vos premières économies dès aujourd'hui — location et enchères dans votre poche.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">

                        {/* App Store */}
                        <a
                            href="https://apps.apple.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 bg-black text-white px-6 py-3 rounded-2xl hover:bg-gray-900 transition-colors w-full sm:w-auto justify-center"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                            </svg>
                            <div className="text-left">
                                <p className="text-xs text-gray-400 leading-none">Disponible sur</p>
                                <p className="text-base font-semibold leading-tight">App Store</p>
                            </div>
                        </a>

                        {/* Google Play */}
                        <a
                            href="https://play.google.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 bg-black text-white px-6 py-3 rounded-2xl hover:bg-gray-900 transition-colors w-full sm:w-auto justify-center"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M3.18 23.76c.3.17.64.24.99.2L15.84 12 12 8.16 3.18 23.76z" fill="#EA4335" />
                                <path d="M20.96 10.04l-2.96-1.7L14.56 12l3.44 3.44 3-1.72c.85-.49.85-1.69 0-2.18v.5z" fill="#FBBC04" />
                                <path d="M4.17.24C3.82.2 3.48.27 3.18.44L15.84 12l3.84-3.84L4.17.24z" fill="#4285F4" />
                                <path d="M3.18.44C2.46.85 2 1.62 2 2.53v18.94c0 .91.46 1.68 1.18 2.09L15.84 12 3.18.44z" fill="#34A853" />
                            </svg>
                            <div className="text-left">
                                <p className="text-xs text-gray-400 leading-none">Disponible sur</p>
                                <p className="text-base font-semibold leading-tight">Google Play</p>
                            </div>
                        </a>

                    </div>
                </div>
            </div>

            {/* Footer links */}
            <div className="max-w-7xl mx-auto px-6 py-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">

                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                    <polyline points="9 22 9 12 15 12 15 22" />
                                </svg>
                            </div>
                            <span className="font-bold text-lg">Gonifty</span>
                        </div>

                        <p className="text-gray-400 text-sm leading-relaxed mb-5">
                            La plateforme de location et d'enchères entre particuliers au Québec.
                        </p>

                        <ul className="space-y-2 text-sm text-gray-400">
                            <li>
                                <a href="/faq" className="hover:text-white transition-colors">
                                    Centre d'aide
                                </a>
                            </li>

                            <li>
                                <a href="/apropos" className="hover:text-white transition-colors">
                                    À propos de Gonifty
                                </a>
                            </li>

                            <li>
                                <a href="/contact" className="hover:text-white transition-colors">
                                    Contact
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Plateforme */}
                    <div>
                        <h4 className="font-semibold text-sm mb-4 text-gray-300">Plateforme</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><a href="/rentals" className="hover:text-white transition-colors">Accueil</a></li>
                            <li><a href="/rentals" className="hover:text-white transition-colors">Locations</a></li>
                            <li><a href="/auctions" className="hover:text-white transition-colors">Enchères</a></li>
                            <li><a href="/disputes" className="hover:text-white transition-colors">Litiges</a></li>
                        </ul>
                    </div>

                    {/* Compte */}
                    <div>
                        <h4 className="font-semibold text-sm mb-4 text-gray-300">Compte</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><a href="/login" className="hover:text-white transition-colors">Connexion</a></li>
                            <li><a href="/register" className="hover:text-white transition-colors">Inscription</a></li>
                            <li><a href="/subscription" className="hover:text-white transition-colors">Premium</a></li>
                            <li><a href="/profile" className="hover:text-white transition-colors">Mon profil</a></li>
                        </ul>
                    </div>

                    {/* Légal */}
                    <div>
                        <h4 className="font-semibold text-sm mb-4 text-gray-300">Légal</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><a href="#" className="hover:text-white transition-colors">Conditions d'utilisation</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Politique de confidentialité</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
                        </ul>
                    </div>

                </div>

                {/* Bottom */}
                <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-gray-500">
                    <p>© {new Date().getFullYear()} Gonifty. Tous droits réservés.</p>
                    <p>Fait avec ❤️ au Québec 🍁</p>
                </div>
            </div>

        </footer>
    );
}
