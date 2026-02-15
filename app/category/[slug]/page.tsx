type Props = {
  params: { slug?: string };
};

function titleFromSlug(slug?: string) {
  if (!slug) return "Category";
  return slug.replace(/-/g, " ");
}

export default function CategoryPage({ params }: Props) {
  const categoryTitle = titleFromSlug(params?.slug);

  const listings = [
    { id: 1, title: "Premium Package", price: "$1200" },
    { id: 2, title: "Standard Package", price: "$800" },
    { id: 3, title: "Basic Package", price: "$500" },
    { id: 4, title: "Enterprise Plan", price: "$2500" },
    { id: 5, title: "Starter Plan", price: "$300" },
    { id: 6, title: "Campaign Bundle", price: "$1500" },
  ];

  return (
    <div className="w-full p-8">
      <h1 className="mb-8 text-3xl font-bold capitalize">
        {categoryTitle}
      </h1>

      {/* 3 column grid with bigger gaps */}
<div
  className="
    w-full
    grid
    grid-cols-1
    md:grid-cols-2
    xl:grid-cols-3
    gap-8
    justify-items-center
  "
>
  {listings.map((listing) => (
    <div
      key={listing.id}
      className="
        w-full
        max-w-[300px]
        aspect-[3/4]
        rounded-xl
        border
        bg-white
        p-6
        shadow-md
        hover:shadow-xl
        transition
        flex
        flex-col
        justify-between
      "
    >
      <div>
        <h2 className="text-lg font-semibold mb-2">
          {listing.title}
        </h2>
        <p className="text-gray-600">
          {listing.price}
        </p>
      </div>

      <button className="w-full rounded bg-black px-4 py-2 text-white hover:bg-gray-800">
        View Details
      </button>
    </div>
  ))}
</div>
    </div>
  );
}