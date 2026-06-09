export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white px-6 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-light mb-8">
          Terms & Conditions
        </h1>

        <div className="space-y-6 text-white/70 leading-8">
          <p>
            By accessing or using Vedmantra, you agree to comply with and be
            bound by these Terms & Conditions.
          </p>

          <h2 className="text-xl text-white">Services</h2>
          <p>
            Vedmantra provides astrology consultations, kundali generation,
            matchmaking services, spiritual guidance, and related digital
            offerings.
          </p>

          <h2 className="text-xl text-white">User Responsibility</h2>
          <p>
            Users must provide accurate information while using our services.
            Vedmantra shall not be liable for inaccurate results arising from
            incorrect information provided by users.
          </p>

          <h2 className="text-xl text-white">Disclaimer</h2>
          <p>
            Astrology is a spiritual and advisory service. Predictions,
            consultations, and recommendations are based on traditional
            astrological principles and should not be considered medical,
            legal, or financial advice.
          </p>

          <h2 className="text-xl text-white">Modification</h2>
          <p>
            Vedmantra reserves the right to modify these terms at any time
            without prior notice.
          </p>
        </div>
      </div>
    </div>
  );
}