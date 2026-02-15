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
<div className="grid grid-cols-3 gap-x-10 gap-y-10">
  {listings.map((listing) => (
    <div
      key={listing.id}
      className="rounded-xl border bg-white p-6 shadow-sm transition hover:shadow-lg
                 min-h-[320px] flex flex-col justify-between"
    >
      <div>
        <h2 className="mb-2 text-xl font-semibold">{listing.title}</h2>
        <p className="text-gray-600">{listing.price}</p>

        {/* placeholder description to make the card feel like a real listing */}
        <p className="mt-4 text-sm text-gray-500">
          Short description goes here. Packages can vary by scope and timeline.
        </p>
      </div>

      <button className="mt-6 w-full rounded bg-black px-4 py-3 text-white hover:bg-gray-800">
        View Details
      </button>
    </div>
  ))}
</div>
    </div>
  );
}