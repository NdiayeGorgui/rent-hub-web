"use client";

import { useState } from "react";
import { loginUser, forgotPassword } from "@/services/authService";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthContext";

type Step = "login" | "forgot" | "forgot_sent";

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();

  const [step, setStep] = useState<Step>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const res = await loginUser({ email, password });
      await login(res.token);
      router.push("/");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Identifiants incorrects");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async () => {
    if (!forgotEmail) { alert("Entrez votre email"); return; }
    try {
      setLoading(true);
      await forgotPassword(forgotEmail);
      setStep("forgot_sent");
    } catch {
      alert("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  // ── Login ──────────────────────────────────────────
  if (step === "login") return (
    <div className="w-full max-w-md space-y-3">
      <input
        type="email" placeholder="Email" value={email}
        onChange={e => setEmail(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="password" placeholder="Mot de passe" value={password}
        onChange={e => setPassword(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <button
        onClick={handleLogin} disabled={loading}
        className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
      >
        {loading ? "Connexion..." : "Se connecter"}
      </button>

      <p
        onClick={() => setStep("forgot")}
        className="text-center text-sm text-gray-400 hover:text-blue-600 cursor-pointer transition-colors"
      >
        Mot de passe oublié ?
      </p>

      <p
        onClick={() => router.push("/register")}
        className="text-center text-sm text-blue-600 font-medium cursor-pointer hover:underline"
      >
        Créer un compte
      </p>
    </div>
  );

  // ── Forgot ─────────────────────────────────────────
  if (step === "forgot") return (
    <div className="w-full max-w-md space-y-3">
      <button onClick={() => setStep("login")} className="text-blue-600 text-sm">
        ← Retour
      </button>

      <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700 mb-2">
        Entrez votre email — vous recevrez un token de réinitialisation.
      </div>

      <input
        type="email" placeholder="Votre email" value={forgotEmail}
        onChange={e => setForgotEmail(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <button
        onClick={handleForgot} disabled={loading}
        className="w-full py-3 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-60"
      >
        {loading ? "Envoi..." : "Envoyer le token"}
      </button>
    </div>
  );

  // ── Forgot sent ────────────────────────────────────
  if (step === "forgot_sent") return (
    <div className="w-full max-w-md space-y-4 text-center">
      <div className="text-4xl">📧</div>
      <h2 className="text-lg font-semibold text-gray-900">Email envoyé</h2>
      <p className="text-sm text-gray-500">
        Si cet email existe, vous recevrez un token de réinitialisation.
      </p>

      <button
        onClick={() => router.push("/reset-password")}
        className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
      >
        Réinitialiser mon mot de passe
      </button>

      <p onClick={() => setStep("login")}
        className="text-sm text-gray-400 hover:text-blue-600 cursor-pointer">
        Retour à la connexion
      </p>
    </div>
  );
}