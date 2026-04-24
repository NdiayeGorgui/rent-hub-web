type Props = {
  item: any;
};

export default function ItemCard({ item }: Props) {
  const baseURL = "http://localhost:8080";

  const getImage = () => {
    // ✅ cas normal
    if (item.imageUrls && item.imageUrls.length > 0) {
      const url = item.imageUrls[0];

      // si déjà URL complète
      if (url.startsWith("http")) return url;

      return `${baseURL}${url}`;
    }

    // ✅ fallback si backend renvoie imageUrl
    if (item.imageUrl) {
      return item.imageUrl.startsWith("http")
        ? item.imageUrl
        : `${baseURL}${item.imageUrl}`;
    }

    // ✅ fallback final
    return "/no-image.png";
  };

  return (
    <div className="bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden cursor-pointer">
      
      {/* ✅ image toujours affichée */}
   <div className="w-full h-48 overflow-hidden bg-gray-100">
  <img
    src={getImage()}
    className="w-full h-full object-cover object-center transition-transform duration-300 hover:scale-105"
    onError={(e) => {
      (e.target as HTMLImageElement).src = "/no-image.png";
    }}
  />
</div>

      <div className="p-4">
        <div className="mb-2">
          <span
            className={`text-xs px-2 py-1 rounded text-white ${
              item.type === "AUCTION" ? "bg-red-500" : "bg-blue-500"
            }`}
          >
            {item.type === "AUCTION" ? "🔥 ENCHÈRE" : "📦 LOCATION"}
          </span>
        </div>

        <h2 className="font-bold text-lg">{item.title}</h2>

        <p className="text-sm text-gray-500 line-clamp-2">
          {item.description}
        </p>

        {item.pricePerDay && (
          <p className="mt-2 text-[#FF385C] font-semibold">
            {item.pricePerDay} $ / jour
          </p>
        )}
      </div>
    </div>
  );
}