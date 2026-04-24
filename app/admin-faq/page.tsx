"use client";

import { useEffect, useState } from "react";
import { getAllFaqs, createFaq, updateFaq, deleteFaq } from "@/services/faqService";

export default function AdminFaqPage() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ id: null as any, theme: "", question: "", answer: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadFaqs(); }, []);

  const loadFaqs = async () => {
    try {
      const data = await getAllFaqs();
      setFaqs(data);
    } finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!form.theme || !form.question || !form.answer) { alert("Tous les champs sont obligatoires"); return; }
    try {
      setSaving(true);
      if (form.id) { await updateFaq(form.id, form); }
      else { await createFaq(form); }
      setForm({ id: null, theme: "", question: "", answer: "" });
      loadFaqs();
    } catch { alert("Opération impossible"); }
    finally { setSaving(false); }
  };

  const handleEdit = (faq: any) => {
    setForm(faq);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cette FAQ ?")) return;
    await deleteFaq(id);
    loadFaqs();
  };

  const groupedFaqs = faqs.reduce((acc: any, faq: any) => {
    if (!acc[faq.theme]) acc[faq.theme] = [];
    acc[faq.theme].push(faq);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-10">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestion FAQ</h1>
          <p className="text-gray-400 mt-1">{faqs.length} question(s) au total</p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
          <h2 className="font-semibold text-gray-900 mb-4">
            {form.id ? "✏️ Modifier la FAQ" : "➕ Ajouter une FAQ"}
          </h2>
          <div className="flex flex-col gap-3">
            <input
              placeholder="Thème (ex: Paiement)"
              value={form.theme} onChange={e => setForm({ ...form, theme: e.target.value })}
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <input
              placeholder="Question"
              value={form.question} onChange={e => setForm({ ...form, question: e.target.value })}
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <textarea
              placeholder="Réponse"
              value={form.answer} onChange={e => setForm({ ...form, answer: e.target.value })}
              rows={3}
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <div className="flex gap-3">
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-3 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors disabled:opacity-60"
              >
                {saving ? "Enregistrement..." : form.id ? "✏️ Modifier" : "➕ Ajouter"}
              </button>
              {form.id && (
                <button onClick={() => setForm({ id: null, theme: "", question: "", answer: "" })}
                  className="px-5 py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200"
                >
                  Annuler
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Liste groupée par thème */}
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          Object.entries(groupedFaqs).map(([theme, items]: any) => (
            <div key={theme} className="mb-6">
              <p className="text-xs font-semibold text-violet-600 uppercase tracking-wide mb-3">
                {theme}
              </p>
              <div className="flex flex-col gap-3">
                {items.map((faq: any) => (
                  <div key={faq.id} className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm">{faq.question}</p>
                        <p className="text-gray-500 text-sm mt-1 leading-relaxed">{faq.answer}</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => handleEdit(faq)}
                          className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center hover:bg-amber-100 transition-colors text-sm"
                        >
                          ✏️
                        </button>
                        <button onClick={() => handleDelete(faq.id)}
                          className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors text-sm"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}