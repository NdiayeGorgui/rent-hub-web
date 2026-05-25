"use client";

import { useState, useEffect } from "react";
import { API } from "@/services/api";

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingSubs, setLoadingSubs] = useState(true);
  const [sent, setSent] = useState(false);
  const [activeTab, setActiveTab] = useState<"compose" | "subscribers">("compose");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadSubscribers();
  }, []);

  const loadSubscribers = async () => {
    setLoadingSubs(true);
    try {
      const res = await API.get("/newsletter/subscribers");
      setSubscribers(res.data);
    } catch {
      console.log("Erreur chargement abonnés");
    } finally {
      setLoadingSubs(false);
    }
  };

  const handleSend = async () => {
    if (!subject || !body) {
      alert("Sujet et contenu obligatoires");
      return;
    }
    if (!confirm(`Envoyer cette newsletter à ${subscribers.length} abonnés ?`)) return;

    setLoading(true);
    try {
      await API.post("/newsletter/send", { subject, body });
      setSent(true);
      setSubject("");
      setBody("");
    } catch {
      alert("Erreur lors de l'envoi");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (email: string) => {
    if (!confirm(`Désabonner ${email} ?`)) return;
    try {
      await API.get(`/newsletter/unsubscribe?email=${encodeURIComponent(email)}`);
      setSubscribers(prev => prev.filter(e => e !== email));
    } catch {
      alert("Erreur lors du désabonnement");
    }
  };

  const filtered = subscribers.filter(e =>
    e.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">📧 Newsletter</h1>
        <p className="text-gray-400 text-sm mt-1">
          Gérez vos abonnés et envoyez des newsletters
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-3xl font-bold text-blue-600">{subscribers.length}</p>
          <p className="text-gray-500 text-sm mt-1">Abonnés actifs</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-3xl font-bold text-green-600">100%</p>
          <p className="text-gray-500 text-sm mt-1">Double opt-in</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-3xl font-bold text-purple-600">SMTP</p>
          <p className="text-gray-500 text-sm mt-1">Envoi sécurisé</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: "compose", label: "✏️ Rédiger une newsletter" },
          { key: "subscribers", label: `👥 Abonnés (${subscribers.length})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === key
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-500 border border-gray-200 hover:border-blue-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Composer ── */}
      {activeTab === "compose" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          {sent && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 mb-4 flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              Newsletter envoyée avec succès à {subscribers.length} abonnés !
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Sujet *
              </label>
              <input
                type="text"
                value={subject}
                onChange={e => { setSubject(e.target.value); setSent(false); }}
                placeholder="Ex: Nouveautés Gonifty — Semaine du 20 mai"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-600">Contenu *</label>
                <span className="text-xs text-gray-400">{body.length} caractères</span>
              </div>
              <textarea
                value={body}
                onChange={e => { setBody(e.target.value); setSent(false); }}
                placeholder={`Bonjour,\n\nVoici les actualités de cette semaine sur Gonifty...\n\nBonne location !\nL'équipe Gonifty`}
                rows={14}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono"
              />
            </div>

            {/* Aperçu destinataires */}
            <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between text-sm">
              <span className="text-gray-500">
                📨 Sera envoyée à <strong className="text-gray-900">{subscribers.length} abonnés</strong>
              </span>
              <span className="text-xs text-gray-400">
                Un lien de désabonnement sera ajouté automatiquement
              </span>
            </div>

            <button
              onClick={handleSend}
              disabled={loading || subscribers.length === 0}
              className="w-full py-3.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                `📤 Envoyer à ${subscribers.length} abonnés`
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── Abonnés ── */}
      {activeTab === "subscribers" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher un email..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={loadSubscribers}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              🔄 Actualiser
            </button>
          </div>

          {loadingSubs ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-gray-500 text-sm font-medium">Aucun abonné trouvé</p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-gray-50">
              {filtered.map((email, i) => (
                <div key={i} className="flex items-center justify-between py-3 group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold flex-shrink-0">
                      {email[0].toUpperCase()}
                    </div>
                    <span className="text-sm text-gray-800">{email}</span>
                  </div>
                  <button
                    onClick={() => handleRemove(email)}
                    className="opacity-0 group-hover:opacity-100 text-xs text-red-500 hover:text-red-700 transition-all px-3 py-1.5 rounded-lg hover:bg-red-50 cursor-pointer"
                  >
                    Désabonner
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Export CSV */}
          {subscribers.length > 0 && (
            <div className="mt-5 pt-4 border-t border-gray-100">
              <button
                onClick={() => {
                  const csv = "email\n" + subscribers.join("\n");
                  const blob = new Blob([csv], { type: "text/csv" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "gonifty-subscribers.csv";
                  a.click();
                }}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Exporter la liste CSV ({subscribers.length} emails)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}