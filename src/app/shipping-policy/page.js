export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white px-6 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-light mb-8">
          Shipping Policy
        </h1>

        <div className="space-y-6 text-white/70 leading-8">
          <p>
            Vedmantra primarily provides digital services and does not ship
            physical products.
          </p>

          <h2 className="text-xl text-white">
            Delivery of Digital Services
          </h2>

          <p>
            Astrology reports, kundali analysis, and matchmaking reports are
            delivered digitally through the platform, email, or customer
            account.
          </p>

          <h2 className="text-xl text-white">
            Delivery Timeline
          </h2>

          <p>
            Most digital reports are delivered instantly or within 24 hours
            depending on the service selected.
          </p>
        </div>
      </div>
    </div>
  );
}