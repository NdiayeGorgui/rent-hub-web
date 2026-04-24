type Props = {
  item: any;
};

export default function ItemCard({ item }: Props) {
  const baseURL = "http://localhost:8080";

  return (
    <div className="bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden cursor-pointer">
      
      {item.imageUrls?.length > 0 && (
        <img
          src={`${baseURL}${item.imageUrls[0]}`}
          className="w-full h-48 object-cover"
        />
      )}

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