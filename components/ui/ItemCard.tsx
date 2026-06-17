import { BASE_URL } from "@/lib/baseURL";
import { formatPrice } from "@/lib/formatPrice";

type Props = {
  item: any;
  auction?: any;
};

export default function ItemCard({
  item,
  auction,
}: Props) {
 console.log(item);
  const getImage = () => {
    if (item.imageUrls && item.imageUrls.length > 0) {
      const url = item.imageUrls[0];
      return url.startsWith("http")
        ? url
        : `${BASE_URL}${url}`;
    }

    if (item.imageUrl) {
      return item.imageUrl.startsWith("http")
        ? item.imageUrl
        : `${BASE_URL}${item.imageUrl}`;
    }

    return `${BASE_URL}/uploads/no-image.png`;
  };

  const displayedPrice =
    item.type === "AUCTION"
      ? auction?.startPrice ?? 0
      : item.pricePerDay;

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden cursor-pointer group">

      {/* IMAGE — plus petite */}
      <div className="relative w-full aspect-[3/2] overflow-hidden bg-gray-100">
        <img
          src={getImage()}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          onError={(e) => { (e.target as HTMLImageElement).src = "/no-image.png"; }}
        />

        {/* BADGE */}
        <div className="absolute top-1.5 left-1.5">
          <span className={`text-[9px] px-1.5 py-0.5 rounded-full text-white font-semibold ${item.type === "AUCTION" ? "bg-red-500" : "bg-blue-600"
            }`}>
            {item.type === "AUCTION" ? "🔥 ENCHÈRE" : "📦 LOCATION"}
          </span>
        </div>

        {/* PRIX */}
        <div className="absolute bottom-1.5 right-1.5 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
          💰 {formatPrice(displayedPrice)}{item.type === "RENTAL" && " / jour"}
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-1.5 flex flex-col gap-0.5">
        <h2 className="font-semibold text-[11px] line-clamp-2 leading-snug min-h-[28px]">
          {item.title}
        </h2>
        <p className="text-[10px] text-gray-500">📍 {item.city}, {item.postalCode && `, ${item.postalCode}`} </p>
        <p className="text-[10px] text-gray-400 font-semibold">👤 {item?.username}</p>
        <p className="text-[10px] text-gray-400 line-clamp-1">{item.description || " "}</p>
      </div>

    </div>
  );
}