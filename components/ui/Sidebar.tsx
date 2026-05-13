"use client";

import { useAuth } from "@/components/contexts/AuthContext";
import { useEffect, useState } from "react";
import { fetchPremiumStatus } from "@/services/subscriptionService";
import { fetchPublicStats, PublicStats } from "@/services/statService";

export function SidebarLeft() {
    const [stats, setStats] = useState<PublicStats | null>(null);

    useEffect(() => {
        fetchPublicStats().then(setStats);
    }, []);
    return (
        <aside className="hidden xl:flex flex-col gap-4 w-64 flex-shrink-0 sticky top-6 self-start h-fit">

            {/* RentHub */}
            <div className="bg-white border border-gray-100 rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                    </div>
                    <div>
                        <p className="font-semibold text-sm text-gray-900">Gonifty</p>
                        <p className="text-xs text-gray-400">Louez. Enchérissez. Gagnez.</p>
                    </div>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                    La plateforme de location et d'enchères entre particuliers au Québec.
                </p>
            </div>

            {/* Plateforme stats */}
            <div className="bg-white border border-gray-100 rounded-2xl p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Plateforme
                </p>

                {!stats ? (
                    <p className="text-xs text-gray-400">Chargement...</p>
                ) : (
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            {
                                value: `${stats.activeItems}+`,
                                label: "Items actifs",
                            },
                            {
                                value: `${stats.openAuctions}+`,
                                label: "Enchères en cours",
                            },
                            {
                                value: `${stats.totalMembers}+`,
                                label: "Membres",
                            },
                            {
                                value: `${stats.averageRating.toFixed(1)} ⭐`,
                                label: "Note moyenne",
                            },
                        ].map(({ value, label }) => (
                            <div key={label} className="bg-gray-50 rounded-xl p-3">
                                <p className="text-base font-semibold text-gray-900">{value}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Comment ça marche */}
            <div className="bg-white border border-gray-100 rounded-2xl p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Comment ça marche</p>
                <div className="flex flex-col gap-3">
                    {[
                        {
                            icon: (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
                                </svg>
                            ),
                            bg: "bg-blue-50",
                            title: "Publiez votre item",
                            desc: "Photos, description, prix — en moins de 2 minutes.",
                        },
                        {
                            icon: (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                            ),
                            bg: "bg-green-50",
                            title: "Approuvez les demandes",
                            desc: "Vous choisissez qui loue votre bien.",
                        },
                        {
                            icon: (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ca8a04" strokeWidth="2">
                                    <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                </svg>
                            ),
                            bg: "bg-yellow-50",
                            title: "Recevez votre argent",
                            desc: "Paiement sécurisé via Stripe.",
                        },
                    ].map(({ icon, bg, title, desc }) => (
                        <div key={title} className="flex gap-3 items-start">
                            <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                                {icon}
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-800">{title}</p>
                                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </aside>
    );
}
import Link from "next/link";

export function SidebarRight() {
    const { user } = useAuth();
    const [status, setStatus] = useState<any>(null);

    useEffect(() => {
        if (user) {
            fetchPremiumStatus().then(setStatus).catch(() => { });
        }
    }, [user]);

    const isPremium = status?.premium;
    const endDate = status?.endDate;

    const formattedDate =
        endDate && !isNaN(new Date(endDate).getTime())
            ? new Date(endDate).toLocaleDateString("fr-CA")
            : null;

    return (
        <aside className="hidden xl:flex flex-col gap-4 w-64 flex-shrink-0 sticky top-6 self-start h-fit">

            {/* Premium CTA */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="#2563eb">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <p className="text-sm font-semibold text-blue-800">Compte Premium</p>
                </div>

                <p className="text-xs text-blue-700 leading-relaxed mb-3">
                    Participez aux enchères, plus de visibilité et un badge Premium sur votre profil.
                </p>

                {/* PAS CONNECTÉ → rien */}
                {user && (
                    isPremium ? (
                        <Link href="/subscription">

                            <div className="text-center bg-yellow-100 text-yellow-800 text-xs font-semibold py-2.5 rounded-xl cursor-pointer hover:bg-yellow-200 transition-colors">
                                👑 Premium actif<br />
                                {formattedDate && <>Expire le {formattedDate}</>}
                            </div>
                        </Link>
                    ) : (
                        <Link href="/subscription">
                            <div className="block text-center bg-blue-600 text-white text-xs font-semibold py-2.5 rounded-xl hover:bg-blue-700 transition-colors cursor-pointer">
                                Passer Premium — 9,99 $ / 6 mois
                            </div>
                        </Link>
                    )
                )}
            </div>

            {/* Conseils sécurité */}
            <div className="bg-white border border-gray-100 rounded-2xl p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Conseils sécurité</p>
                <div className="flex flex-col gap-2.5">
                    {[
                        "Rencontrez toujours en lieu public pour l'échange.",
                        "Ne payez jamais en dehors de la plateforme.",
                        "Vérifiez le profil et les avis avant de louer.",
                        "Signalez tout comportement suspect via les litiges.",
                    ].map((tip) => (
                        <div key={tip} className="flex gap-2.5 items-start">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                            <p className="text-xs text-gray-500 leading-relaxed">{tip}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Communication */}
            <div className="bg-white border border-gray-100 rounded-2xl p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Communications</p>
                <div className="flex flex-col gap-2.5">
                    {[
                        "Échangez directement avec le locataire ou loueur a travers le chat",
                        "Envoyez ou recevez des images via le chat.",
                        "Vérifiez vos notifications pour des informations a temps réél.",
                        "Lisez le centre d'aides pour plus d'informations.",
                    ].map((tip) => (
                        <div key={tip} className="flex gap-2.5 items-start">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                            <p className="text-xs text-gray-500 leading-relaxed">{tip}</p>
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    );

}
