"use client";

import { useEffect, useState } from "react";
import {  getAllFaqs, sendFaqFeedback } from "@/services/faqService";


function FaqItem({ item }: { item: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);

  const handleFeedback = async (helpful: boolean) => {
    try {
      await sendFaqFeedback(item.id, helpful);
      setFeedback(helpful ? "up" : "down");
    } catch {
      console.log("feedback error");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-gray-900 pr-4">{item.question}</span>
        <span className={`flex-shrink-0 w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 transition-transform ${isOpen ? "rotate-180" : ""}`}>
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </span>
      </button>

      {isOpen && (
        <div className="px-6 pb-5 border-t border-gray-50">
          <p className="text-gray-600 text-sm leading-relaxed pt-4">{item.answer}</p>

          <div className="flex items-center gap-3 mt-4">
            <span className="text-sm text-gray-400">Utile ?</span>
            <button
              onClick={() => handleFeedback(true)}
              disabled={feedback !== null}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                feedback === "up"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-600"
              } disabled:cursor-default`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
                <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
              </svg>
              Oui
            </button>
            <button
              onClick={() => handleFeedback(false)}
              disabled={feedback !== null}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                feedback === "down"
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-600"
              } disabled:cursor-default`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/>
                <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
              </svg>
              Non
            </button>
            {feedback && (
              <span className="text-xs text-gray-400 ml-1">
                {feedback === "up" ? "Merci pour votre retour !" : "Nous allons améliorer cette réponse."}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function FaqPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAllFaqs();
        setItems(data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = items.filter(
    (item) =>
      item.question.toLowerCase().includes(search.toLowerCase()) ||
      item.answer.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 fill-white" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Centre d'aide</h1>
          <p className="text-gray-400 mt-2">Trouvez rapidement une réponse à vos questions</p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Rechercher une question..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Liste */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-gray-500 font-medium">Aucun résultat</p>
            <p className="text-gray-400 text-sm mt-1">Essayez avec d'autres mots-clés</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((item) => (
              <FaqItem key={item.id} item={item} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}