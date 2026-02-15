export default function Home() {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold">Browse Listings</h1>
      <p className="mt-2 text-gray-600">
        Choose a category on the left to see listings.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-xl border p-4">
          <div className="font-semibold">Featured Vendors</div>
          <p className="mt-2 text-sm text-gray-600">
            We’ll highlight top vendors here later.
          </p>
        </div>

        <div className="rounded-xl border p-4">
          <div className="font-semibold">How it works</div>
          <p className="mt-2 text-sm text-gray-600">
            Browse → choose a listing → place an order.
          </p>
        </div>

        <div className="rounded-xl border p-4">
          <div className="font-semibold">Vendor onboarding</div>
          <p className="mt-2 text-sm text-gray-600">
            Vendors submit listings. You review before they go live.
          </p>
        </div>
      </div>
    </div>
  );
}