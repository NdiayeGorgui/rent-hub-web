type Props = {
  children: React.ReactNode;
  onClick: () => void;
  loading?: boolean;
};

export default function Button({ children, onClick, loading }: Props) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-[#FF385C] text-white p-3 rounded-xl font-semibold hover:opacity-90 transition"
    >
      {loading ? "Chargement..." : children}
    </button>
  );
}