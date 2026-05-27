import { BASE_URL } from "@/lib/baseURL";

type Props = {
  item: any;
};


export default function ItemCard({ item }: Props) {


  const getImage = () => {
    // ✅ cas normal
    if (item.imageUrls && item.imageUrls.length > 0) {
      const url = item.imageUrls[0];

      // si déjà URL complète
      if (url.startsWith("http")) return url;

      return `${BASE_URL}${url}`;
    }

    // ✅ fallback si backend renvoie imageUrl
    if (item.imageUrl) {
      return item.imageUrl.startsWith("http")
        ? item.imageUrl
        : `${BASE_URL}${item.imageUrl}`;
    }

    // ✅ fallback final
    return `${BASE_URL}/uploads/no-image.png`;
  };

  return (
<div className="bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden cursor-pointer flex flex-col h-full">
  
  {/* Image */}
  <div className="w-full bg-gray-100" style={{ aspectRatio: "4/3" }}>
    <img
      src={getImage()}
      className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
      onError={(e) => { (e.target as HTMLImageElement).src = "/no-image.png"; }}
    />
  </div>

  {/* Contenu — hauteur fixe */}
  <div className="p-4 flex flex-col" style={{ minHeight: "120px" }}>
    <div className="mb-2">
      <span className={`text-xs px-2 py-1 rounded text-white ${item.type === "AUCTION" ? "bg-red-500" : "bg-blue-500"}`}>
        {item.type === "AUCTION" ? "🔥 ENCHÈRE" : "📦 LOCATION"}
      </span>
    </div>

    <h2 className="font-bold text-lg leading-snug mb-1">{item.title}</h2>

    {/* Description — hauteur fixe 2 lignes toujours */}
    <p className="text-sm text-gray-500 line-clamp-2" style={{ minHeight: "40px" }}>
      {item.description}
    </p>

    {/* Prix en bas */}
    {item.pricePerDay && (
      <p className="text-[#FF385C] font-semibold text-sm mt-2">
        {item.pricePerDay} $ / jour
      </p>
    )}
  </div>
</div>
  );
}