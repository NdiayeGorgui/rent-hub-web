"use client";

import { useState } from "react";
import { registerUser } from "@/services/authService";
import { useRouter } from "next/navigation";
import PasswordInput from "@/components/ui/PasswordInput";

export default function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    username: "", email: "", password: "",
    fullName: "", phone: "", city: "",
  });

  const handleRegister = async () => {
    if (!form.email || !form.password || !form.username) {
      alert("Veuillez remplir les champs obligatoires");
      return;
    }
    try {
      setLoading(true);
      await registerUser(form);
      alert("Compte créé avec succès ✅");
      router.push("/login");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Erreur inscription");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";

  return (
    <div className="w-full max-w-md space-y-3">

      <input type="text" placeholder="Nom d'utilisateur"
        value={form.username}
        onChange={e => setForm({ ...form, username: e.target.value })}
        className={inputClass}
      />

      <input type="email" placeholder="Email"
        value={form.email}
        onChange={e => setForm({ ...form, email: e.target.value })}
        className={inputClass}
      />

      {/* ← PasswordInput ici */}
      <PasswordInput
        placeholder="Mot de passe"
        value={form.password}
        onChange={e => setForm({ ...form, password: e.target.value })}
      />

      <input type="text" placeholder="Nom complet"
        value={form.fullName}
        onChange={e => setForm({ ...form, fullName: e.target.value })}
        className={inputClass}
      />

      <input type="tel" placeholder="Téléphone"
        value={form.phone}
        onChange={e => setForm({ ...form, phone: e.target.value })}
        className={inputClass}
      />

      <input type="text" placeholder="Ville"
        value={form.city}
        onChange={e => setForm({ ...form, city: e.target.value })}
        className={inputClass}
      />

      <button
        onClick={handleRegister}
        disabled={loading}
        className="w-full py-3 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-60 cursor-pointer"
      >
        {loading ? "Inscription..." : "S'inscrire"}
      </button>

      <p className="text-center text-sm text-blue-600 font-medium cursor-pointer hover:underline"
        onClick={() => router.push("/login")}>
        Déjà un compte ? Se connecter
      </p>

    </div>
  );
}