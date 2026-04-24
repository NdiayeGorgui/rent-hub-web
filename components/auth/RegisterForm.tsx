"use client";

import { useState } from "react";
import { registerUser } from "@/services/authService";
import { useRouter } from "next/navigation";

const fields = [
  { key: "username", label: "Nom d'utilisateur", type: "text" },
  { key: "email", label: "Email", type: "email" },
  { key: "password", label: "Mot de passe", type: "password" },
  { key: "fullName", label: "Nom complet", type: "text" },
  { key: "phone", label: "Téléphone", type: "tel" },
  { key: "city", label: "Ville", type: "text" },
];

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

  return (
    <div className="w-full max-w-md space-y-3">
      {fields.map(({ key, label, type }) => (
        <input
          key={key}
          type={type}
          placeholder={label}
          value={(form as any)[key]}
          onChange={e => setForm({ ...form, [key]: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      ))}

      <button
        onClick={handleRegister}
        disabled={loading}
        className="w-full py-3 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-60"
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