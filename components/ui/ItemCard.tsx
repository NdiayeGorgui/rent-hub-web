import { BASE_URL } from "@/lib/baseURL";
import { formatPrice } from "@/lib/formatPrice";

type Props = {
  item: any;
  auction?: any;
};

export default function ItemCard({ item, auction }: Props) {

  const getImage = () => {
    if (item.imageUrls && item.imageUrls.length > 0) {
      const url = item.imageUrls[0];
      return url.startsWith("http") ? url : `${BASE_URL}${url}`;
    }
    if (item.imageUrl) {
      return item.imageUrl.startsWith("http") ? item.imageUrl : `${BASE_URL}${item.imageUrl}`;
    }
    return `${BASE_URL}/uploads/no-image.png`;
  };

  const displayedPrice =
  item.type === "AUCTION"
    ? auction?.startPrice ?? 0
    : item.pricePerDay;

  const initials = item?.publisher?.username
    ? item.publisher.username.slice(0, 1).toUpperCase()
    : item?.username?.slice(0, 1).toUpperCase() ?? "?";

  const username = item?.publisher?.username ?? item?.username ?? "—";

  const avatarColors: Record<number, { bg: string; text: string }> = {
    0: { bg: "#B5D4F4", text: "#185FA5" },
    1: { bg: "#9FE1CB", text: "#085041" },
    2: { bg: "#F5C4B3", text: "#993C1D" },
    3: { bg: "#C0DD97", text: "#27500A" },
    4: { bg: "#F4C0D1", text: "#993556" },
    5: { bg: "#FAC775", text: "#854F0B" },
  };
  const colorIdx = username.charCodeAt(0) % 6;
  const avatarColor = avatarColors[colorIdx];

  const popularityBadge = () => {
    const count = item.rentalsCount ?? 0;
    if (count > 10) return { label: "Populaire 🔥", bg: "#FAECE7", text: "#993C1D" };
    if (count > 5) return { label: "En demande", bg: "#FAEEDA", text: "#854F0B" };
    if (count > 0) return { label: "Déjà testé", bg: "#EAF3DE", text: "#3B6D11" };
    return { label: "Nouveau", bg: "#E6F1FB", text: "#185FA5" };
  };

  const getTimeLeft = (endDate: string) => {
    const diff = new Date(endDate).getTime() - Date.now();
    if (diff <= 0) return "terminée";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);

    if (days > 0) return `${days}j ${hours}h`; // clean
    if (hours > 0) return `${hours}h ${minutes}m`; // précis
    if (minutes > 0) return `${minutes}m`;

    return "< 1 min";
  };

  const pop = popularityBadge();

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden cursor-pointer group hover:-translate-y-0.5 hover:border-gray-200 transition-all duration-150">

      {/* ── Image ── */}
      <div className="relative w-full aspect-[4/3] bg-gray-50 overflow-hidden">
        <img
          src={getImage()}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { (e.target as HTMLImageElement).src = "/no-image.png"; }}
        />

        {/* Badge type */}
        <div className="absolute top-2 left-2">
          {item.type === "AUCTION" ? (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{ background: "#FCEBEB", color: "#A32D2D" }}>
              🔥 Enchère
            </span>
          ) : (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{ background: "#E6F1FB", color: "#185FA5" }}>
              📦 Location
            </span>
          )}
        </div>

        {/* Prix */}
        <div className="absolute bottom-2 right-2 bg-white border border-gray-200 rounded-lg text-[11px] font-medium px-2 py-0.5 text-gray-800">
          {formatPrice(displayedPrice)}{item.type === "RENTAL" && " / j"}
        </div>
      </div>

      {/* ── Contenu ── */}
      <div className="px-2.5 pt-2 pb-1.5">

        {/* Titre */}
        <h2 className="text-[12px] font-medium text-gray-900 leading-snug line-clamp-2 min-h-[32px] mb-1.5">
          {item.title}
        </h2>

        {/* Ville + adresse */}
        <p className="text-[10px] text-gray-400 flex items-center gap-1 mb-0.5 truncate">
          <svg className="w-2.5 h-2.5 flex-shrink-0 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
          {item.city}{item.postalCode ? `, ${item.postalCode}` : ""}
        </p>

        {/* Description */}
        <p className="text-[10px] text-gray-400 line-clamp-1 mb-2">
          {item.description || " "}
        </p>

        {/* Propriétaire */}
        <div className="flex items-center gap-1.5">
          <div
            className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-medium flex-shrink-0"
            style={{ background: avatarColor.bg, color: avatarColor.text }}
          >
            {initials}
          </div>
          <span
            className="text-[10px] px-2 py-0.5 rounded-full"
            style={{ background: "#f5f5f4", color: "#78716c" }}
          >
            {username}
          </span>
        </div>

      </div>

      {/* ── Barre bas ── */}
      <div
        className="flex items-center gap-2 px-2.5 py-1.5 border-t text-[10px]"
        style={{ background: "#fafaf9", borderColor: "#f0eeec" }}
      >
        {item.type === "AUCTION" && auction ? (
          <>
            <span className="text-gray-500 flex items-center gap-0.5">
              <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1v22M17 5H9a3 3 0 0 0 0 6h6a3 3 0 0 1 0 6H7" />
              </svg>
              {formatPrice(
                auction.currentPrice ??
                auction.startPrice ??
                0
              )}
            </span>

            <span className="text-gray-500 flex items-center gap-0.5">
              <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              {auction.participantsCount ?? 0}
            </span>

            <span className="text-gray-500 flex items-center gap-0.5">
              <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              {auction.views ?? 0}
            </span>

            <span className="text-gray-500 flex items-center gap-0.5">
              <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              {auction.watchers ?? 0}
            </span>

            <span
              className={`ml-auto flex items-center gap-0.5 ${auction.endDate &&
                  new Date(auction.endDate).getTime() < Date.now()
                  ? "text-red-500"
                  : "text-orange-600"
                }`}
            >
              <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>

              {getTimeLeft(auction.endDate)}
            </span>
          </>
        ) : (
          <>
            <span className="text-gray-400 flex items-center gap-1">
              <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              Disponible
            </span>
            <span
              className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full"
              style={{ background: pop.bg, color: pop.text }}
            >
              {pop.label}
            </span>
          </>
        )}
      </div>

    </div>
  );
}
