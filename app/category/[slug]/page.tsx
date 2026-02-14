export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Category: {slug}</h1>
      <p className="mt-4">Listings for this category will appear here.</p>
    </div>
  );
}