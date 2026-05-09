
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { resetPassword } from "@/services/authService";

export default function ResetPasswordForm() {
  const router = useRouter();

  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!token || !newPassword || !confirmPassword) {
      alert("Tous les champs sont obligatoires");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas");
      return;
    }

    if (newPassword.length < 6) {
      alert("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    try {
      setLoading(true);

      await resetPassword(token, newPassword);

      alert("Mot de passe réinitialisé avec succès");

      router.push("/login");
    } catch (error: any) {
      alert(
        error?.response?.data?.message ||
          "Token invalide ou expiré"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">

      <input
        type="text"
        placeholder="Token reçu par email"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <input
        type="password"
        placeholder="Nouveau mot de passe"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <input
        type="password"
        placeholder="Confirmer le mot de passe"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleReset()}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <button
        onClick={handleReset}
        disabled={loading}
        className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
      >
        {loading ? "Réinitialisation..." : "Réinitialiser"}
      </button>

      <p
        onClick={() => router.push("/login")}
        className="text-center text-sm text-blue-600 hover:underline cursor-pointer"
      >
        Retour à la connexion
      </p>
    </div>
  );
}