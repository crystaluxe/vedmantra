export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white px-6 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-light mb-8">
          Refund Policy
        </h1>

        <div className="space-y-6 text-white/70 leading-8">
          <p>
            Due to the nature of digital astrology consultations and reports,
            refunds are generally not applicable once a service has been
            delivered.
          </p>

          <h2 className="text-xl text-white">Eligible Refund Cases</h2>

          <ul className="list-disc pl-6">
            <li>Duplicate payment made by customer</li>
            <li>Technical failure preventing service delivery</li>
            <li>Order not fulfilled by Vedmantra</li>
          </ul>

          <h2 className="text-xl text-white">Refund Processing</h2>

          <p>
            Approved refunds will be processed within 7–10 business days to
            the original payment method.
          </p>

          <h2 className="text-xl text-white">Non-Refundable Services</h2>

          <p>
            Completed astrology consultations, generated kundali reports, and
            compatibility reports are non-refundable.
          </p>
        </div>
      </div>
    </div>
  );
}