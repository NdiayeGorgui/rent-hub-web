import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-2">🏠 RentHub</h1>
        <p className="text-center text-gray-400 text-sm mb-6">Créer un compte</p>
        <RegisterForm />
      </div>
    </div>
  );
}