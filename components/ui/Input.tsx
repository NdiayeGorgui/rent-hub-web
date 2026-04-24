type Props = {
  placeholder: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
};

export default function Input({ placeholder, type = "text", value, onChange }: Props) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF385C]"
    />
  );
}