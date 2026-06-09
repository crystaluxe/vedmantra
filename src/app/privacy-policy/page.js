export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white px-6 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-light mb-8">
          Privacy Policy
        </h1>

        <div className="space-y-6 text-white/70 leading-8">
          <p>
            Vedmantra values your privacy and is committed to protecting your
            personal information.
          </p>

          <h2 className="text-xl text-white">Information We Collect</h2>

          <ul className="list-disc pl-6">
            <li>Name</li>
            <li>Phone Number</li>
            <li>Email Address</li>
            <li>Birth Details for Astrology Services</li>
            <li>Payment Information</li>
          </ul>

          <h2 className="text-xl text-white">How We Use Information</h2>

          <ul className="list-disc pl-6">
            <li>To provide astrology services</li>
            <li>To improve customer experience</li>
            <li>To process payments</li>
            <li>To communicate updates and offers</li>
          </ul>

          <h2 className="text-xl text-white">Data Security</h2>

          <p>
            We implement appropriate security measures to safeguard your
            personal information.
          </p>

          <h2 className="text-xl text-white">Third Party Services</h2>

          <p>
            We may use trusted third-party providers for payments, analytics,
            and communications.
          </p>
        </div>
      </div>
    </div>
  );
}